use crate::commands::platform::{PlatformImpl, WindowActivityCapture};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(serde::Serialize, specta::Type)]
pub struct WindowActivitySnapshot {
    timestamp: u32,
    application_name: String,
    window_title: String,
    idle_time_seconds: u32,
    screenshot_paths: Vec<String>,
}

#[tauri::command]
#[specta::specta]
pub fn capture_window_activity(app: tauri::AppHandle) -> WindowActivitySnapshot {
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs() as u32)
        .unwrap_or(0);

    let app_info = PlatformImpl::get_active_application();
    let application_name = app_info.app_name;
    let window_title = app_info.window_title;

    let idle_time_seconds = PlatformImpl::get_idle_time_seconds();
    let screenshot_paths = PlatformImpl::capture_screenshots(&app, timestamp);

    WindowActivitySnapshot {
        timestamp,
        application_name,
        window_title,
        idle_time_seconds,
        screenshot_paths,
    }
}
