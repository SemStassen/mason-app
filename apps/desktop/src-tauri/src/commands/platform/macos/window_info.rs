use objc2::{msg_send, rc::Retained};
use objc2_app_kit::{NSRunningApplication, NSWorkspace};
use objc2_core_foundation::{CFArray, CFDictionary, CFNumber, CFString, CFType};
use objc2_core_graphics::{kCGNullWindowID, CGWindowListCopyWindowInfo, CGWindowListOption};
use objc2_foundation::NSString;

use crate::commands::platform::ApplicationInfo;

pub fn get_active_application() -> ApplicationInfo {
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

    ApplicationInfo {
        app_name: application_name,
        window_title,
    }
}
