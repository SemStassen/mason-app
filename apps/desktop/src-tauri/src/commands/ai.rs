mod inference;
use inference::generate_text_from_image;

#[tauri::command]
#[specta::specta]
pub async fn call_ai(
    image_path: Option<String>,
    instruction: Option<String>,
) -> Result<String, String> {
    tauri::async_runtime::spawn_blocking(move || {
        generate_text_from_image(
            &image_path.unwrap_or_default(),
            &instruction.unwrap_or_default(),
        )
    })?
    .await
    .map_err(|e| format!("Inference failed: {:?}", e))?
}
