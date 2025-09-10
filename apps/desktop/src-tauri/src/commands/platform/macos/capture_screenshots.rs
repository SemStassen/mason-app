use block2::StackBlock;
use objc2::AnyThread;
use objc2_core_graphics::CGImage;
use objc2_ui_kit::UIImage;
use objc2_foundation::{NSArray, NSError, NSString, NSFileHandle, NSURL};
use objc2_screen_capture_kit::{
    SCContentFilter, SCScreenshotManager, SCShareableContent, SCStreamConfiguration,
};
use std::{fs, path::PathBuf};
use std::sync::{Arc, Mutex, mpsc};
use tauri::Manager;

/// Capture screenshots using ScreenCaptureKit API.
/// This captures actual screen content, not the display buffer (which may show screensaver).
/// Returns absolute file paths for successfully captured screenshots.
pub fn capture_all_display_screenshots(app: &tauri::AppHandle, timestamp: u32) -> Vec<String> {
    // Resolve app-local data screenshots directory in a platform-appropriate place
    let base_dir: PathBuf = app
        .path()
        .resolve("screenshots", tauri::path::BaseDirectory::AppLocalData)
        .unwrap_or_else(|_| std::env::temp_dir().join("screenshots"));

    // Ensure directory exists
    let _ = fs::create_dir_all(&base_dir);

    let mut paths: Vec<String> = Vec::new();

    // Use ScreenCaptureKit to capture the screen
    match capture_screen_with_sck(&base_dir, timestamp) {
        Ok(screenshot_paths) => {
            paths.extend(screenshot_paths);
        }
        Err(e) => {
            eprintln!(
                "ScreenCaptureKit failed: {}, falling back to screencapture",
                e
            );
        }
    }

    paths
}

/// Capture screen using ScreenCaptureKit API
/// docs: https://developer.apple.com/documentation/screencapturekit
fn capture_screen_with_sck(base_dir: &PathBuf, timestamp: u32) -> Result<Vec<String>, String> {
    let (tx, rx) = mpsc::channel();
    let successful_paths = Arc::new(Mutex::new(Vec::new()));

    unsafe {
        SCShareableContent::getShareableContentExcludingDesktopWindows_onScreenWindowsOnly_completionHandler(
            false, 
            true,  
            &StackBlock::new({
                let base_dir = base_dir.clone();
                let paths = Arc::clone(&successful_paths);
                let sender = tx.clone();
                
                move |shareable_content: *mut SCShareableContent, error: *mut NSError| {
                    if !error.is_null() {
                        eprintln!("Failed to get shareable content");
                        let _ = sender.send(Vec::new());
                        return;
                    }
                    
                    let displays: Vec<_> = (&*shareable_content).displays().iter().collect();
                    if displays.is_empty() {
                        let _ = sender.send(Vec::new());
                        return;
                    }
                    
                    let remaining = Arc::new(Mutex::new(displays.len()));
                    
                    for (idx, display) in displays.iter().enumerate() {
                        let filter = SCContentFilter::initWithDisplay_excludingWindows(
                            SCContentFilter::alloc(), 
                            display.as_ref(), 
                            &NSArray::new()
                        );
                        
                        let screenshot_path = base_dir.join(format!("{}_{}_mason.jpg", timestamp, idx));
                        
                        SCScreenshotManager::captureImageWithFilter_configuration_completionHandler(
                            &filter,
                            &SCStreamConfiguration::new(),
                            Some(&StackBlock::new({
                                let paths = Arc::clone(&paths);
                                let remaining = Arc::clone(&remaining);
                                let sender = sender.clone();
                                
                                move |image: *mut CGImage, error: *mut NSError| {
                                    // Try to save screenshot
                                    if error.is_null() && !image.is_null() {
                                        if let Some(jpeg_data) = UIImage::jpeg_representation(&UIImage::imageWithCGImage(&*image), 0.5) {
                                            let file_url = NSURL::fileURLWithPath(&NSString::from_str(&screenshot_path.to_string_lossy()));
                                            if let Ok(handle) = NSFileHandle::fileHandleForWritingToURL_error(&file_url) {
                                                if handle.writeData_error(&jpeg_data).is_ok() && handle.closeAndReturnError().is_ok() {
                                                    if let Ok(mut p) = paths.lock() {
                                                        p.push(screenshot_path.to_string_lossy().to_string());
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    
                                    // Check if done
                                    if let Ok(mut count) = remaining.lock() {
                                        *count -= 1;
                                        if *count == 0 {
                                            let result = paths.lock().map(|p| p.clone()).unwrap_or_default();
                                            let _ = sender.send(result);
                                        }
                                    }
                                }
                            }))
                        );
                    }
                }
            })
        );
    }

    // Wait for completion and return paths
    rx.recv().map_err(|_| "Screenshot capture failed".to_string())
}

