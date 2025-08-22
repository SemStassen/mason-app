use objc2::msg_send;
use objc2::rc::Retained;
use objc2_app_kit::{NSRunningApplication, NSWorkspace};
use objc2_core_foundation::{CFArray, CFDictionary, CFNumber, CFString, CFType};
use objc2_core_graphics::{
    kCGNullWindowID, CGEventSource, CGEventSourceStateID, CGEventType, CGWindowListCopyWindowInfo,
    CGWindowListOption,
};
use objc2_foundation::NSString;
use std::time::{SystemTime, UNIX_EPOCH};

fn get_idle_time_seconds() -> u32 {
    let secs = unsafe {
        CGEventSource::seconds_since_last_event_type(
            CGEventSourceStateID::CombinedSessionState,
            CGEventType::Null, // see note below
        )
    };
    if secs.is_finite() && secs >= 0.0 {
        secs as u32
    } else {
        0
    }
}

/// Struct that represents a single snapshot of the user's current activity
#[derive(serde::Serialize, specta::Type)]
pub struct WindowActivitySnapshot {
    /// Unix timestamp (seconds since 1970-01-01 UTC)
    timestamp: u32,
    /// Name of the active application (e.g., "Slack", "Google Chrome")
    application_name: String,
    /// Title of the frontmost window (e.g., "Inbox — Gmail")
    window_title: String,
    /// Number of seconds since last user input (keyboard/mouse)
    idle_time_seconds: u32,
}

#[tauri::command]
#[specta::specta]
pub fn capture_window_activity() -> WindowActivitySnapshot {
    // 1. Capture current timestamp
    let timestamp: u32 = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
        .try_into()
        .unwrap_or(u32::MAX);

    // 2. Get the frontmost application
    let workspace = unsafe { NSWorkspace::sharedWorkspace() };
    let active_app: Option<Retained<NSRunningApplication>> =
        unsafe { msg_send![&*workspace, frontmostApplication] };

    // Application name
    let application_name = match active_app.as_ref() {
        Some(app) => {
            let name: Option<Retained<NSString>> = unsafe { msg_send![&*app, localizedName] };
            match name {
                Some(n) => {
                    let s = n.to_string();
                    if s.is_empty() {
                        "Unknown".to_string()
                    } else {
                        s
                    }
                }
                None => "Unknown".to_string(),
            }
        }
        None => "Unknown".to_string(),
    };

    // Application process ID (needed to match correct window)
    let pid = active_app
        .as_ref()
        .map(|app| unsafe { msg_send![&*app, processIdentifier] })
        .unwrap_or(0);

    // 3. Get the title of the window belonging to this PID
    let window_list_info = unsafe {
        CGWindowListCopyWindowInfo(
            CGWindowListOption::OptionOnScreenOnly | CGWindowListOption::ExcludeDesktopElements,
            kCGNullWindowID,
        )
    };

    let window_title = {
        match window_list_info {
            Some(array) => {
                // Re-type the array to the actual element type returned by CGWindowListCopyWindowInfo
                let raw = array.as_ref();
                let dicts: &CFArray<CFDictionary<CFString, CFType>> = unsafe {
                    &*(raw as *const CFArray as *const CFArray<CFDictionary<CFString, CFType>>)
                };

                dicts
                    .iter()
                    .filter_map(
                        |dret: objc2_core_foundation::CFRetained<
                            CFDictionary<CFString, CFType>,
                        >| {
                            let d: &CFDictionary<CFString, CFType> = dret.as_ref();

                            let key_pid = CFString::from_static_str("kCGWindowOwnerPID");
                            let key_name = CFString::from_static_str("kCGWindowName");

                            let owner_pid = d
                                .get(&key_pid)
                                .and_then(|v| v.downcast::<CFNumber>().ok())
                                .and_then(|n| n.as_i64());

                            let window_name = d
                                .get(&key_name)
                                .and_then(|v| v.downcast::<CFString>().ok())
                                .map(|s| s.to_string());

                            match (owner_pid, window_name) {
                                (Some(owner), Some(name)) if owner == pid as i64 => {
                                    Some(name.to_string())
                                }
                                _ => None,
                            }
                        },
                    )
                    .next()
                    .unwrap_or_default()
            }
            None => String::new(),
        }
    };

    // 4. Get idle time in seconds
    let idle_time_seconds: u32 = get_idle_time_seconds();

    // 5. Return everything as JSON to the TS side
    WindowActivitySnapshot {
        timestamp,
        application_name,
        window_title,
        idle_time_seconds,
    }
}
