use anyhow::Result;
use image::ImageReader;
use ndarray::{Array2, Array3, Array4, Axis};
use ort::{session::Session, value::Value};
use tokenizers::Tokenizer;

const PATH_VISION_MODEL: &str = "assets/models/onnx/vision_encoder_fp16.onnx";
const PATH_TEXT_MODEL: &str = "assets/models/onnx/embed_tokens_fp16.onnx";
const PATH_DECODER_MODEL: &str = "assets/models/onnx/decoder_model_merged_fp16.onnx";
const PATH_TOKENIZER: &str = "assets/models/tokenizer.json";

const START_TOKEN_ID: i64 = 0;
const EOS_TOKEN_ID: i64 = 2;
const MAX_LENGTH: usize = 50;

pub fn call_ai(image_path: Option<&str>, instruction: Option<&str>) -> Result<String> {
    ort::init()
        .with_name("mason")
        .with_execution_providers({
            #[cfg(target_os = "macos")]
            {
                use ort::execution_providers::CoreMLExecutionProvider;

                [CoreMLExecutionProvider::default().build()]
            }
        })
        .commit()?;

    let mut vision_model = Session::builder()?
        .with_optimization_level(ort::session::builder::GraphOptimizationLevel::Level3)?
        .commit_from_file(PATH_VISION_MODEL)?;

    let mut text_model = Session::builder()?.commit_from_file(PATH_TEXT_MODEL)?;

    let mut decoder_model = Session::builder()?
        .with_optimization_level(ort::session::builder::GraphOptimizationLevel::Level3)?
        .commit_from_file(PATH_DECODER_MODEL)?;

    let tokenizer = Tokenizer::from_file(PATH_TOKENIZER)
        .map_err(|e| anyhow::anyhow!("Failed to load tokenizer: {}", e))?;

    // --------------------------
    // 1️⃣ Image -> visual embeddings
    // --------------------------
    let visual_embeddings = if let Some(path) = image_path {
        let img = image::open(path)?
            .resize_exact(224, 224, image::imageops::FilterType::Triangle)
            .to_rgb8();
        let img_tensor = image_to_tensor(&img)?;
        let outputs = vision_model.run(ort::inputs![Value::from_array(img_tensor)?])?;
        extract_array3(&outputs[0])?
    } else {
        Array3::zeros((1, 1, 1))
    };

    // --------------------------
    // 3️⃣ Process text
    // --------------------------
    let input_text = instruction.unwrap_or("");
    let encoding = tokenizer
        .encode(input_text, true)
        .map_err(|e| anyhow::anyhow!("Failed to encode text: {}", e))?;
    let input_ids: Vec<i64> = encoding.get_ids().iter().map(|&id| id as i64).collect();
    let input_tensor = Array2::from_shape_vec((1, input_ids.len()), input_ids.clone())?;
    let outputs = text_model.run(ort::inputs![Value::from_array(input_tensor)?])?;
    let text_embeddings = extract_array3(&outputs[0])?;

    // --------------------------
    // 4️⃣ Merge embeddings (with modality axis)
    // --------------------------
    let encoder_output = merge_embeddings(&text_embeddings, &visual_embeddings);

    // --------------------------
    // 5️⃣ Autoregressive decoding
    // --------------------------
    let mut generated_ids = vec![START_TOKEN_ID];

    for _ in 0..MAX_LENGTH {
        let decoder_input =
            Array2::from_shape_vec((1, generated_ids.len()), generated_ids.clone())?;
        let outputs = decoder_model.run(ort::inputs![
            Value::from_array(decoder_input)?,
            Value::from_array(encoder_output.clone())?
        ])?;

        let logits = extract_array3(&outputs[0])?;
        let next_token = argmax_last_token(&logits);
        if next_token == EOS_TOKEN_ID {
            break;
        }
        generated_ids.push(next_token);
    }
    let generated_ids_u32: Vec<u32> = generated_ids.iter().map(|&id| id as u32).collect();
    let generated_ids_slice: &[u32] = &generated_ids_u32;

    let output_text = tokenizer.decode(
        generated_ids_slice
            .iter()
            .map(|&id| id as u32)
            .collect::<Vec<_>>(),
        true,
    )?;
    Ok(output_text)
}

// --------------------------
// Helpers
// --------------------------
fn image_to_tensor(img: &image::RgbImage) -> Result<Array4<f32>> {
    let (w, h) = img.dimensions();
    let mut arr = Array4::<f32>::zeros((1, 3, h as usize, w as usize));
    for (x, y, pixel) in img.enumerate_pixels() {
        arr[[0, 0, y as usize, x as usize]] = (pixel[0] as f32 / 255.0 - 0.485) / 0.229;
        arr[[0, 1, y as usize, x as usize]] = (pixel[1] as f32 / 255.0 - 0.456) / 0.224;
        arr[[0, 2, y as usize, x as usize]] = (pixel[2] as f32 / 255.0 - 0.406) / 0.225;
    }
    Ok(arr)
}

fn extract_array3(value: &Value) -> Result<Array3<f32>> {
    let (_, data) = value.try_extract_tensor::<f32>()?;
    let shape = value.try_extract_tensor::<f32>()?.0;
    Ok(Array3::from_shape_vec(
        (shape[0] as usize, shape[1] as usize, shape[2] as usize),
        data.to_vec(),
    )?)
}

fn merge_embeddings(text: &Array3<f32>, visual: &Array3<f32>) -> Array3<f32> {
    // axis=1 = sequence length axis
    let mut merged = text.clone();
    merged.append(Axis(1), visual.view()).unwrap();
    merged
}

fn argmax_last_token(logits: &Array3<f32>) -> i64 {
    let last = logits.slice(ndarray::s![0, -1, ..]);
    last.iter()
        .enumerate()
        .max_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap())
        .unwrap()
        .0 as i64
}
