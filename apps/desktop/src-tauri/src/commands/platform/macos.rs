pub mod capture_screenshots;
pub mod idle_time;
pub mod window_info;

use crate::commands::platform::{ApplicationInfo, WindowActivityCapture};

pub struct MacOSCapture;

impl WindowActivityCapture for MacOSCapture {
    fn get_idle_time_seconds() -> u32 {
        idle_time::get_idle_time_seconds()
    }

    fn get_active_application() -> ApplicationInfo {
        window_info::get_active_application()
    }

    fn capture_screenshots(app: &tauri::AppHandle, timestamp: u32) -> Vec<String> {
        capture_screenshots::capture_all_display_screenshots(app, timestamp)
    }
}
