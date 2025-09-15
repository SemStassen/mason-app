#[derive(Debug, Clone)]
pub struct ApplicationInfo {
    pub app_name: String,
    pub window_title: String,
}

pub trait WindowActivityCapture {
    fn get_idle_time_seconds() -> u32;
    fn get_active_application() -> ApplicationInfo;
    fn capture_screenshots(app: &tauri::AppHandle, timestamp: u32) -> Vec<String>;
}

#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "macos")]
pub use macos::MacOSCapture as PlatformImpl;

#[cfg(target_os = "windows")]
mod windows;
#[cfg(target_os = "windows")]
pub use windows::WindowsCapture as PlatformImpl;

#[cfg(target_os = "linux")]
mod linux;
#[cfg(target_os = "linux")]
pub use linux::LinuxCapture as PlatformImpl;
