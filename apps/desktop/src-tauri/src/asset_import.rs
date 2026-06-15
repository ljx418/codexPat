use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{
    collections::{BTreeMap, BTreeSet},
    collections::hash_map::DefaultHasher,
    fs,
    hash::{Hash, Hasher},
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, Manager};

const CORE_ACTIONS: [&str; 8] = [
    "idle",
    "thinking",
    "running",
    "success",
    "warning",
    "error",
    "need_input",
    "sleeping",
];
const MAX_PACK_BYTES: u64 = 50 * 1024 * 1024;
const MAX_ASSET_BYTES: u64 = 25 * 1024 * 1024;
const MAX_GLTF_MESHES: usize = 32;
const MAX_GLTF_MATERIALS: usize = 64;
const MAX_GLTF_TEXTURES: usize = 64;
const MAX_GLTF_ANIMATIONS: usize = 32;
const MAX_GLTF_ANIMATION_SECONDS: f64 = 60.0;
const GLB_JSON_CHUNK: u32 = 0x4e4f_534a;
const PNG_SIGNATURE: &[u8; 8] = b"\x89PNG\r\n\x1a\n";
const MAX_SPRITE_FRAMES_PER_ACTION: usize = 48;
const DEFAULT_ANIMATED_SPRITE_FPS: u8 = 12;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PersonalizedAssetPackView {
    pub(crate) pack_id: String,
    pub(crate) display_name: String,
    pub(crate) renderer_kind: String,
    pub(crate) copied_asset_ids: Vec<String>,
    pub(crate) manifest_hash: String,
    pub(crate) created_at: String,
    pub(crate) active_instances: Vec<String>,
    pub(crate) validation_status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PersonalizedAssetImportResult {
    pub(crate) pack_id: String,
    pub(crate) display_name: String,
    pub(crate) renderer_kind: String,
    pub(crate) copied_asset_ids: Vec<String>,
    pub(crate) manifest_hash: String,
    pub(crate) app_managed_storage: bool,
    pub(crate) validation_status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PersonalizedAssetActivationResult {
    pub(crate) pack_id: String,
    pub(crate) instance_id: String,
    pub(crate) renderer_kind: String,
    pub(crate) validation_status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct AnimatedSpriteAssemblyResult {
    pub(crate) pack_id: String,
    pub(crate) display_name: String,
    pub(crate) renderer_kind: String,
    pub(crate) action_frame_counts: BTreeMap<String, usize>,
    pub(crate) fps: u8,
    pub(crate) manifest_generated: bool,
    pub(crate) imported: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) activated_instance_id: Option<String>,
    pub(crate) reason_code: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct RuntimeAssetLicense {
    pub(crate) r#type: String,
    pub(crate) attribution: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct RuntimeAssetEntry {
    pub(crate) asset_id: String,
    pub(crate) kind: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct RuntimeAssetAction {
    pub(crate) asset_id: String,
    pub(crate) r#loop: bool,
    pub(crate) priority: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) duration_ms: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct RuntimeImportedAssetPack {
    pub(crate) schema_version: String,
    pub(crate) pack_id: String,
    pub(crate) version: String,
    pub(crate) renderer_kind: String,
    pub(crate) license: RuntimeAssetLicense,
    pub(crate) assets: BTreeMap<String, RuntimeAssetEntry>,
    pub(crate) actions: BTreeMap<String, RuntimeAssetAction>,
    pub(crate) validation_status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct RuntimeAssetData {
    pub(crate) pack_id: String,
    pub(crate) action_id: String,
    pub(crate) asset_id: String,
    pub(crate) renderer_kind: String,
    pub(crate) mime_type: String,
    pub(crate) base64: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) frames: Option<Vec<RuntimeSpriteFrame>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub(crate) fps: Option<u8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct RuntimeSpriteFrame {
    pub(crate) mime_type: String,
    pub(crate) base64: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ImportedPackRecord {
    pack_id: String,
    display_name: String,
    renderer_kind: String,
    copied_asset_ids: Vec<String>,
    manifest_hash: String,
    created_at: String,
    #[serde(default)]
    active_instances: Vec<String>,
}

#[derive(Debug, Default, Serialize, Deserialize)]
struct AssetStore {
    #[serde(default)]
    packs: Vec<ImportedPackRecord>,
}

pub(crate) fn list_personalized_asset_packs(
    app: &AppHandle,
) -> Result<Vec<PersonalizedAssetPackView>, String> {
    let store = read_store(&store_path(app)?);
    Ok(store.packs.iter().map(pack_view).collect())
}

pub(crate) fn import_personalized_asset_pack(
    app: &AppHandle,
    manifest_path: String,
    display_name: Option<String>,
) -> Result<PersonalizedAssetImportResult, String> {
    import_pack_with_paths(
        PathBuf::from(manifest_path),
        display_name,
        store_path(app)?,
        storage_root(app)?,
    )
}

pub(crate) fn assemble_animated_sprite_pack(
    app: &AppHandle,
    source_folder_path: String,
    display_name: String,
    fps: Option<u8>,
    activate_instance_id: Option<String>,
) -> Result<AnimatedSpriteAssemblyResult, String> {
    assemble_animated_sprite_pack_with_paths(
        PathBuf::from(source_folder_path),
        display_name,
        fps,
        activate_instance_id,
        store_path(app)?,
        storage_root(app)?,
    )
}

pub(crate) fn activate_personalized_asset_pack(
    app: &AppHandle,
    pack_id: String,
    instance_id: String,
) -> Result<PersonalizedAssetActivationResult, String> {
    activate_pack_with_paths(pack_id, instance_id, store_path(app)?, storage_root(app)?)
}

fn activate_pack_with_paths(
    pack_id: String,
    instance_id: String,
    store_path: PathBuf,
    storage_root: PathBuf,
) -> Result<PersonalizedAssetActivationResult, String> {
    if !is_safe_id(&pack_id) {
        return Err("asset_pack_invalid".to_string());
    }
    if !is_safe_instance_id(&instance_id) {
        return Err("instance_id_invalid".to_string());
    }
    let mut store = read_store(&store_path);
    let pack_index = store
        .packs
        .iter()
        .position(|pack| pack.pack_id == pack_id)
        .ok_or_else(|| "asset_pack_not_found".to_string())?;
    validate_stored_pack(&storage_root, &store.packs[pack_index])?;
    for pack in &mut store.packs {
        pack.active_instances.retain(|item| item != &instance_id);
    }
    store.packs[pack_index]
        .active_instances
        .push(instance_id.clone());
    let renderer_kind = store.packs[pack_index].renderer_kind.clone();
    write_store(&store_path, &store)?;
    Ok(PersonalizedAssetActivationResult {
        pack_id: pack_id.clone(),
        instance_id,
        renderer_kind,
        validation_status: "valid".to_string(),
    })
}

fn assemble_animated_sprite_pack_with_paths(
    source_folder_path: PathBuf,
    display_name: String,
    fps: Option<u8>,
    activate_instance_id: Option<String>,
    store_path: PathBuf,
    storage_root: PathBuf,
) -> Result<AnimatedSpriteAssemblyResult, String> {
    let source_metadata = fs::symlink_metadata(&source_folder_path)
        .map_err(|_| "animated_sprite_source_missing".to_string())?;
    if source_metadata.file_type().is_symlink() {
        return Err("asset_symlink_rejected".to_string());
    }
    let source_folder = source_folder_path
        .canonicalize()
        .map_err(|_| "animated_sprite_source_missing".to_string())?;
    let source_metadata = fs::metadata(&source_folder)
        .map_err(|_| "animated_sprite_source_missing".to_string())?;
    if !source_metadata.is_dir() {
        return Err("animated_sprite_source_missing".to_string());
    }
    reject_symlink(&source_folder)?;

    let fps = fps.unwrap_or(DEFAULT_ANIMATED_SPRITE_FPS);
    if !(1..=24).contains(&fps) {
        return Err("animated_sprite_fps_invalid".to_string());
    }
    let display_name = sanitize_display_name(&display_name, "Animated Sprite Cat");
    if !is_safe_text(&display_name) {
        return Err("asset_display_name_invalid".to_string());
    }
    let pack_id = animated_sprite_pack_id(&display_name);
    let frames = scan_animated_sprite_frames(&source_folder)?;
    let action_frame_counts = frames
        .iter()
        .map(|(action, files)| (action.clone(), files.len()))
        .collect::<BTreeMap<_, _>>();

    let staging_dir = storage_root.join(format!("{pack_id}.animated-staging-{}", now_millis()));
    let _ = fs::remove_dir_all(&staging_dir);
    fs::create_dir_all(&staging_dir).map_err(|_| "asset_import_copy_failed".to_string())?;

    let assemble_result = (|| {
        for files in frames.values() {
            for file_name in files {
                let source = source_folder.join(file_name);
                reject_symlink(&source)?;
                scan_sprite_asset(&source)?;
                fs::copy(&source, staging_dir.join(file_name))
                    .map_err(|_| "asset_import_copy_failed".to_string())?;
            }
        }
        let manifest = animated_sprite_manifest(&pack_id, &display_name, fps, &frames)?;
        fs::write(staging_dir.join("manifest.json"), manifest)
            .map_err(|_| "asset_import_copy_failed".to_string())?;
        let imported = import_pack_with_paths(
            staging_dir.join("manifest.json"),
            Some(display_name.clone()),
            store_path.clone(),
            storage_root.clone(),
        )?;
        let activated_instance_id = match activate_instance_id
            .as_deref()
            .map(str::trim)
            .filter(|value| !value.is_empty())
        {
            Some(instance_id) => {
                activate_pack_with_paths(
                    imported.pack_id.clone(),
                    instance_id.to_string(),
                    store_path.clone(),
                    storage_root.clone(),
                )
                .map_err(|_| "animated_sprite_activation_failed".to_string())?;
                Some(instance_id.to_string())
            }
            None => None,
        };
        Ok::<AnimatedSpriteAssemblyResult, String>(AnimatedSpriteAssemblyResult {
            pack_id: imported.pack_id,
            display_name: imported.display_name,
            renderer_kind: "sprite".to_string(),
            action_frame_counts,
            fps,
            manifest_generated: true,
            imported: true,
            activated_instance_id,
            reason_code: "animated_sprite_manifest_generated".to_string(),
        })
    })();

    let _ = fs::remove_dir_all(&staging_dir);
    assemble_result
}

pub(crate) fn deactivate_personalized_asset_pack(
    app: &AppHandle,
    instance_id: String,
) -> Result<(), String> {
    if !is_safe_instance_id(&instance_id) {
        return Err("instance_id_invalid".to_string());
    }
    let store_path = store_path(app)?;
    let mut store = read_store(&store_path);
    for pack in &mut store.packs {
        pack.active_instances.retain(|item| item != &instance_id);
    }
    write_store(&store_path, &store)
}

pub(crate) fn delete_personalized_asset_pack(
    app: &AppHandle,
    pack_id: String,
) -> Result<Vec<PersonalizedAssetPackView>, String> {
    delete_pack_with_paths(pack_id, store_path(app)?, storage_root(app)?)
}

pub(crate) fn rename_personalized_asset_pack(
    app: &AppHandle,
    pack_id: String,
    display_name: String,
) -> Result<PersonalizedAssetPackView, String> {
    rename_pack_with_paths(pack_id, display_name, store_path(app)?)
}

fn rename_pack_with_paths(
    pack_id: String,
    display_name: String,
    store_path: PathBuf,
) -> Result<PersonalizedAssetPackView, String> {
    if !is_safe_id(&pack_id) {
        return Err("asset_pack_invalid".to_string());
    }
    let mut store = read_store(&store_path);
    let Some(pack) = store.packs.iter_mut().find(|pack| pack.pack_id == pack_id) else {
        return Err("asset_pack_not_found".to_string());
    };
    let sanitized = sanitize_display_name(&display_name, &pack.display_name);
    if sanitized == pack.display_name && display_name.trim().is_empty() {
        return Err("asset_display_name_invalid".to_string());
    }
    pack.display_name = sanitized;
    let view = pack_view(pack);
    write_store(&store_path, &store)?;
    Ok(view)
}

fn delete_pack_with_paths(
    pack_id: String,
    store_path: PathBuf,
    storage_root: PathBuf,
) -> Result<Vec<PersonalizedAssetPackView>, String> {
    if !is_safe_id(&pack_id) {
        return Err("asset_pack_invalid".to_string());
    }
    let mut store = read_store(&store_path);
    let before = store.packs.len();
    store.packs.retain(|pack| pack.pack_id != pack_id);
    if store.packs.len() == before {
        return Err("asset_pack_not_found".to_string());
    }
    fs::remove_dir_all(storage_root.join(&pack_id)).map_err(|_| "asset_delete_failed".to_string())?;
    write_store(&store_path, &store)?;
    Ok(store.packs.iter().map(pack_view).collect())
}

pub(crate) fn runtime_personalized_asset_pack(
    app: &AppHandle,
    instance_id: String,
) -> Result<Option<RuntimeImportedAssetPack>, String> {
    if !is_safe_instance_id(&instance_id) {
        return Err("instance_id_invalid".to_string());
    }
    let store = read_store(&store_path(app)?);
    let Some(pack) = store
        .packs
        .iter()
        .find(|pack| pack.active_instances.iter().any(|item| item == &instance_id))
    else {
        return Ok(None);
    };
    validate_stored_pack(&storage_root(app)?, pack)?;
    runtime_pack_from_record(&storage_root(app)?, pack).map(Some)
}

pub(crate) fn runtime_personalized_asset_data(
    app: &AppHandle,
    pack_id: String,
    action_id: String,
) -> Result<RuntimeAssetData, String> {
    if !is_safe_id(&pack_id) {
        return Err("asset_pack_invalid".to_string());
    }
    if !CORE_ACTIONS.contains(&action_id.as_str()) {
        return Err("asset_action_invalid".to_string());
    }
    let storage_root = storage_root(app)?;
    let store = read_store(&store_path(app)?);
    let pack = store
        .packs
        .iter()
        .find(|pack| pack.pack_id == pack_id)
        .ok_or_else(|| "asset_pack_not_found".to_string())?;
    validate_stored_pack(&storage_root, pack)?;
    let manifest = read_stored_manifest(&storage_root, pack)?;
    let action = manifest
        .get("actions")
        .and_then(Value::as_object)
        .and_then(|actions| actions.get(&action_id))
        .and_then(Value::as_object)
        .ok_or_else(|| "asset_action_invalid".to_string())?;
    let asset_id = action
        .get("assetId")
        .and_then(Value::as_str)
        .ok_or_else(|| "asset_action_invalid".to_string())?;
    let asset = manifest
        .get("assets")
        .and_then(Value::as_object)
        .and_then(|assets| assets.get(asset_id))
        .and_then(Value::as_object)
        .ok_or_else(|| "asset_missing".to_string())?;
    let asset_value = Value::Object(asset.clone());
    let file_names = asset_file_names(&asset_value, &pack.renderer_kind)?;
    let file_name = file_names
        .first()
        .ok_or_else(|| "asset_file_invalid".to_string())?;
    let path = storage_root.join(&pack.pack_id).join(file_name);
    validate_asset_file(&path, &pack.renderer_kind)?;
    let bytes = fs::read(path).map_err(|_| "asset_file_not_found".to_string())?;
    let frames = if pack.renderer_kind == "sprite" && file_names.len() > 1 {
        let mut frames = Vec::new();
        for frame_file in &file_names {
            let frame_path = storage_root.join(&pack.pack_id).join(frame_file);
            validate_asset_file(&frame_path, &pack.renderer_kind)?;
            let frame_bytes = fs::read(frame_path).map_err(|_| "asset_file_not_found".to_string())?;
            frames.push(RuntimeSpriteFrame {
                mime_type: "image/png".to_string(),
                base64: encode_base64(&frame_bytes),
            });
        }
        Some(frames)
    } else {
        None
    };
    Ok(RuntimeAssetData {
        pack_id: pack.pack_id.clone(),
        action_id,
        asset_id: asset_id.to_string(),
        renderer_kind: pack.renderer_kind.clone(),
        mime_type: if pack.renderer_kind == "sprite" {
            "image/png".to_string()
        } else if file_name.to_ascii_lowercase().ends_with(".glb") {
            "model/gltf-binary".to_string()
        } else {
            "model/gltf+json".to_string()
        },
        base64: encode_base64(&bytes),
        frames,
        fps: sprite_fps(&asset_value),
    })
}

pub(crate) fn capture_glb_preview(
    app: &AppHandle,
    pack_id: String,
    action_id: String,
) -> Result<String, String> {
    if !is_safe_id(&pack_id) {
        return Err("asset_pack_invalid".to_string());
    }
    if !CORE_ACTIONS.contains(&action_id.as_str()) {
        return Err("asset_action_invalid".to_string());
    }
    let storage_root = storage_root(app)?;
    let store = read_store(&store_path(app)?);
    let pack = store
        .packs
        .iter()
        .find(|pack| pack.pack_id == pack_id)
        .ok_or_else(|| "asset_pack_not_found".to_string())?;
    validate_stored_pack(&storage_root, pack)?;
    let manifest = read_stored_manifest(&storage_root, pack)?;
    let action = manifest
        .get("actions")
        .and_then(Value::as_object)
        .and_then(|actions| actions.get(&action_id))
        .and_then(Value::as_object)
        .ok_or_else(|| "asset_action_invalid".to_string())?;
    let asset_id = action
        .get("assetId")
        .and_then(Value::as_str)
        .ok_or_else(|| "asset_action_invalid".to_string())?;
    let asset = manifest
        .get("assets")
        .and_then(Value::as_object)
        .and_then(|assets| assets.get(asset_id))
        .and_then(Value::as_object)
        .ok_or_else(|| "asset_missing".to_string())?;
    let file_name = asset
        .get("fileName")
        .and_then(Value::as_str)
        .ok_or_else(|| "asset_file_invalid".to_string())?;
    let path = storage_root.join(&pack.pack_id).join(file_name);
    validate_asset_file(&path, &pack.renderer_kind)?;

    // Return the path to the GLB file - frontend will handle WebGL capture
    // via renderer.captureDataURL() once the pack is loaded
    Ok(path.to_string_lossy().to_string())
}

fn import_pack_with_paths(
    manifest_path: PathBuf,
    display_name: Option<String>,
    store_path: PathBuf,
    storage_root: PathBuf,
) -> Result<PersonalizedAssetImportResult, String> {
    let manifest_path = manifest_path
        .canonicalize()
        .map_err(|_| "asset_manifest_not_found".to_string())?;
    let manifest_dir = manifest_path
        .parent()
        .ok_or_else(|| "asset_manifest_not_found".to_string())?
        .to_path_buf();
    let raw_manifest = fs::read_to_string(&manifest_path)
        .map_err(|_| "asset_manifest_not_found".to_string())?;
    let manifest: Value = serde_json::from_str(&raw_manifest)
        .map_err(|_| "asset_manifest_invalid_json".to_string())?;
    validate_manifest(&manifest)?;

    let pack_id = string_field(&manifest, "packId")?;
    let renderer_kind = string_field(&manifest, "rendererKind")?;
    let display_name = sanitize_display_name(
        display_name
            .as_deref()
            .or_else(|| manifest.get("displayName").and_then(Value::as_str))
            .unwrap_or(pack_id),
        pack_id,
    );
    let assets = manifest
        .get("assets")
        .and_then(Value::as_object)
        .ok_or_else(|| "asset_manifest_invalid".to_string())?;

    let mut copied_asset_ids = Vec::new();
    let target_dir = storage_root.join(pack_id);
    let temp_dir = storage_root.join(format!("{pack_id}.importing"));
    let _ = fs::remove_dir_all(&temp_dir);
    fs::create_dir_all(&temp_dir).map_err(|_| "asset_import_copy_failed".to_string())?;

    let copy_result = (|| {
        let mut total_bytes = raw_manifest.len() as u64;
        let mut copied_files = BTreeSet::new();
        for (asset_id, asset) in assets {
            let file_names = asset_file_names(asset, renderer_kind)?;
            for file_name in file_names {
                if !copied_files.insert(file_name.clone()) {
                    continue;
                }
                let source = manifest_dir.join(&file_name);
                reject_symlink(&source)?;
                let metadata = fs::metadata(&source).map_err(|_| "asset_file_not_found".to_string())?;
                if !metadata.is_file() {
                    return Err("asset_file_not_found".to_string());
                }
                if metadata.len() > MAX_ASSET_BYTES {
                    return Err("asset_pack_too_large".to_string());
                }
                total_bytes = total_bytes.saturating_add(metadata.len());
                if total_bytes > MAX_PACK_BYTES {
                    return Err("asset_pack_too_large".to_string());
                }
                if renderer_kind == "gltf" {
                    scan_gltf_asset(&source)?;
                } else if renderer_kind == "sprite" {
                    scan_sprite_asset(&source)?;
                }
                fs::copy(&source, temp_dir.join(&file_name))
                    .map_err(|_| "asset_import_copy_failed".to_string())?;
            }
            copied_asset_ids.push(asset_id.clone());
        }
        fs::write(temp_dir.join("manifest.json"), &raw_manifest)
            .map_err(|_| "asset_import_copy_failed".to_string())?;
        Ok::<(), String>(())
    })();

    if let Err(error) = copy_result {
        let _ = fs::remove_dir_all(&temp_dir);
        return Err(error);
    }

    fs::create_dir_all(&storage_root).map_err(|_| "asset_import_copy_failed".to_string())?;
    let backup_dir = storage_root.join(format!("{pack_id}.previous"));
    let _ = fs::remove_dir_all(&backup_dir);
    if target_dir.exists() {
        fs::rename(&target_dir, &backup_dir).map_err(|_| "asset_import_copy_failed".to_string())?;
    }
    if let Err(_error) = fs::rename(&temp_dir, &target_dir) {
        let _ = fs::remove_dir_all(&temp_dir);
        if backup_dir.exists() {
            let _ = fs::rename(&backup_dir, &target_dir);
        }
        return Err("asset_import_copy_failed".to_string());
    }
    let _ = fs::remove_dir_all(&backup_dir);

    let mut store = read_store(&store_path);
    let previous_active = store
        .packs
        .iter()
        .find(|pack| pack.pack_id == pack_id)
        .map(|pack| pack.active_instances.clone())
        .unwrap_or_default();
    let record = ImportedPackRecord {
        pack_id: pack_id.to_string(),
        display_name,
        renderer_kind: renderer_kind.to_string(),
        copied_asset_ids: copied_asset_ids.clone(),
        manifest_hash: stable_hash(&raw_manifest),
        created_at: now_millis(),
        active_instances: previous_active,
    };
    store.packs.retain(|pack| pack.pack_id != pack_id);
    store.packs.push(record.clone());
    write_store(&store_path, &store)?;

    Ok(PersonalizedAssetImportResult {
        pack_id: record.pack_id,
        display_name: record.display_name,
        renderer_kind: record.renderer_kind,
        copied_asset_ids,
        manifest_hash: record.manifest_hash,
        app_managed_storage: true,
        validation_status: "valid".to_string(),
    })
}

fn validate_manifest(manifest: &Value) -> Result<(), String> {
    if scan_forbidden(manifest) {
        return Err("asset_manifest_forbidden_content".to_string());
    }
    if manifest.get("schemaVersion").and_then(Value::as_str) != Some("5.8") {
        return Err("asset_manifest_schema_invalid".to_string());
    }
    let pack_id = string_field(manifest, "packId")?;
    if !is_safe_id(pack_id) {
        return Err("asset_pack_invalid".to_string());
    }
    let display_name = string_field(manifest, "displayName")?;
    if !is_safe_text(display_name) {
        return Err("asset_display_name_invalid".to_string());
    }
    let renderer_kind = string_field(manifest, "rendererKind")?;
    if renderer_kind != "sprite" && renderer_kind != "gltf" {
        return Err("asset_renderer_invalid".to_string());
    }
    if !manifest.get("license").is_some_and(Value::is_object) {
        return Err("asset_license_missing".to_string());
    }
    let assets = manifest
        .get("assets")
        .and_then(Value::as_object)
        .ok_or_else(|| "asset_manifest_invalid".to_string())?;
    let actions = manifest
        .get("actions")
        .and_then(Value::as_object)
        .ok_or_else(|| "asset_manifest_invalid".to_string())?;

    for action in CORE_ACTIONS {
        let action_entry = actions
            .get(action)
            .and_then(Value::as_object)
            .ok_or_else(|| "core_action_missing".to_string())?;
        let asset_id = action_entry
            .get("assetId")
            .and_then(Value::as_str)
            .ok_or_else(|| "core_action_missing".to_string())?;
        if !assets.contains_key(asset_id) {
            return Err("asset_missing".to_string());
        }
    }

    for (asset_id, asset) in assets {
        if !is_safe_id(asset_id) {
            return Err("asset_manifest_invalid".to_string());
        }
        asset_file_names(asset, renderer_kind)?;
        if renderer_kind == "sprite" {
            validate_sprite_fps(asset)?;
        }
    }
    Ok(())
}

fn scan_gltf_asset(path: &Path) -> Result<(), String> {
    let bytes = fs::read(path).map_err(|_| "asset_file_not_found".to_string())?;
    let json = if path.extension().and_then(|value| value.to_str()) == Some("gltf") {
        serde_json::from_slice::<Value>(&bytes)
            .map_err(|_| "gltf_external_resource_rejected".to_string())?
    } else {
        parse_glb_json_chunk(&bytes)?
    };
    scan_gltf_json(&json)
}

fn scan_sprite_asset(path: &Path) -> Result<(), String> {
    let bytes = fs::read(path).map_err(|_| "asset_file_not_found".to_string())?;
    if bytes.len() < PNG_SIGNATURE.len() || &bytes[..PNG_SIGNATURE.len()] != PNG_SIGNATURE {
        return Err("asset_frame_corrupt".to_string());
    }
    Ok(())
}

fn parse_glb_json_chunk(bytes: &[u8]) -> Result<Value, String> {
    if bytes.len() < 20 || &bytes[0..4] != b"glTF" {
        return Err("gltf_external_resource_rejected".to_string());
    }
    let version = u32::from_le_bytes([bytes[4], bytes[5], bytes[6], bytes[7]]);
    let total_length = u32::from_le_bytes([bytes[8], bytes[9], bytes[10], bytes[11]]) as usize;
    if version != 2 || total_length != bytes.len() {
        return Err("gltf_external_resource_rejected".to_string());
    }
    let chunk_length = u32::from_le_bytes([bytes[12], bytes[13], bytes[14], bytes[15]]) as usize;
    let chunk_type = u32::from_le_bytes([bytes[16], bytes[17], bytes[18], bytes[19]]);
    if chunk_type != GLB_JSON_CHUNK || bytes.len() < 20 + chunk_length {
        return Err("gltf_external_resource_rejected".to_string());
    }
    serde_json::from_slice::<Value>(&bytes[20..20 + chunk_length])
        .map_err(|_| "gltf_external_resource_rejected".to_string())
}

fn scan_gltf_json(json: &Value) -> Result<(), String> {
    reject_gltf_uris(json)?;
    if array_len(json, "meshes") > MAX_GLTF_MESHES
        || array_len(json, "materials") > MAX_GLTF_MATERIALS
        || array_len(json, "textures") > MAX_GLTF_TEXTURES
        || array_len(json, "animations") > MAX_GLTF_ANIMATIONS
    {
        return Err("asset_pack_too_large".to_string());
    }
    if array_len(json, "meshes") == 0 || array_len(json, "nodes") == 0 || array_len(json, "scenes") == 0 {
        return Err("gltf_external_resource_rejected".to_string());
    }
    if let Some(required) = json.get("extensionsRequired").and_then(Value::as_array) {
        if !required.is_empty() {
            return Err("gltf_required_extension_rejected".to_string());
        }
    }
    if let Some(animations) = json.get("animations").and_then(Value::as_array) {
        for animation in animations {
            let Some(name) = animation.get("name").and_then(Value::as_str) else {
                return Err("gltf_external_resource_rejected".to_string());
            };
            if !CORE_ACTIONS.contains(&name) {
                return Err("gltf_external_resource_rejected".to_string());
            }
        }
    }
    reject_long_animation_accessors(json)?;
    Ok(())
}

fn reject_long_animation_accessors(json: &Value) -> Result<(), String> {
    let Some(accessors) = json.get("accessors").and_then(Value::as_array) else {
        return Ok(());
    };
    for accessor in accessors {
        let Some(max_values) = accessor.get("max").and_then(Value::as_array) else {
            continue;
        };
        for value in max_values {
            if value
                .as_f64()
                .is_some_and(|seconds| seconds > MAX_GLTF_ANIMATION_SECONDS)
            {
                return Err("gltf_external_resource_rejected".to_string());
            }
        }
    }
    Ok(())
}

fn reject_gltf_uris(value: &Value) -> Result<(), String> {
    match value {
        Value::String(text) => {
            let lower = text.to_ascii_lowercase();
            if lower.contains("://")
                || lower.starts_with("data:")
                || lower.starts_with("javascript:")
                || lower.contains("..")
                || lower.starts_with('/')
                || lower.contains("\\")
            {
                return Err("gltf_external_resource_rejected".to_string());
            }
            Ok(())
        }
        Value::Array(items) => {
            for item in items {
                reject_gltf_uris(item)?;
            }
            Ok(())
        }
        Value::Object(fields) => {
            for (key, nested) in fields {
                if key == "uri" {
                    if nested.as_str().is_some_and(|uri| !uri.is_empty()) {
                        return Err("gltf_external_resource_rejected".to_string());
                    }
                }
                reject_gltf_uris(nested)?;
            }
            Ok(())
        }
        _ => Ok(()),
    }
}

fn reject_symlink(path: &Path) -> Result<(), String> {
    let metadata = fs::symlink_metadata(path).map_err(|_| "asset_file_not_found".to_string())?;
    if metadata.file_type().is_symlink() {
        return Err("asset_symlink_rejected".to_string());
    }
    Ok(())
}

fn validate_stored_pack(storage_root: &Path, pack: &ImportedPackRecord) -> Result<(), String> {
    let manifest = read_stored_manifest(storage_root, pack)?;
    validate_manifest(&manifest)?;
    let renderer_kind = string_field(&manifest, "rendererKind")?;
    if renderer_kind != pack.renderer_kind {
        return Err("asset_renderer_mismatch".to_string());
    }
    let assets = manifest
        .get("assets")
        .and_then(Value::as_object)
        .ok_or_else(|| "asset_manifest_invalid".to_string())?;
    for asset in assets.values() {
        for file_name in asset_file_names(asset, renderer_kind)? {
            validate_asset_file(&storage_root.join(&pack.pack_id).join(file_name), renderer_kind)?;
        }
    }
    Ok(())
}

fn scan_animated_sprite_frames(source_folder: &Path) -> Result<BTreeMap<String, Vec<String>>, String> {
    let mut frames: BTreeMap<String, BTreeMap<u32, String>> = BTreeMap::new();
    let entries = fs::read_dir(source_folder).map_err(|_| "animated_sprite_source_missing".to_string())?;
    for entry in entries {
        let entry = entry.map_err(|_| "animated_sprite_source_missing".to_string())?;
        let path = entry.path();
        let metadata = fs::symlink_metadata(&path).map_err(|_| "animated_sprite_source_missing".to_string())?;
        if metadata.file_type().is_symlink() {
            return Err("asset_symlink_rejected".to_string());
        }
        if !metadata.is_file() {
            continue;
        }
        let Some(file_name) = path.file_name().and_then(|value| value.to_str()) else {
            return Err("animated_sprite_frame_name_invalid".to_string());
        };
        if !file_name.to_ascii_lowercase().ends_with(".png") {
            continue;
        }
        if !is_safe_file_name(file_name, "sprite") {
            return Err("animated_sprite_frame_name_invalid".to_string());
        }
        let Some((action, index)) = parse_animated_frame_file_name(file_name) else {
            return Err("animated_sprite_frame_name_invalid".to_string());
        };
        scan_sprite_asset(&path)?;
        let action_frames = frames.entry(action.to_string()).or_default();
        if action_frames.insert(index, file_name.to_string()).is_some() {
            return Err("animated_sprite_frame_name_invalid".to_string());
        }
    }

    let mut sorted = BTreeMap::new();
    for action in CORE_ACTIONS {
        let Some(action_frames) = frames.remove(action) else {
            return Err("animated_sprite_core_action_missing".to_string());
        };
        if !(2..=MAX_SPRITE_FRAMES_PER_ACTION).contains(&action_frames.len()) {
            return Err("animated_sprite_frame_count_invalid".to_string());
        }
        let first_index = *action_frames.keys().next().ok_or_else(|| "animated_sprite_frame_count_invalid".to_string())?;
        for expected in first_index..first_index + action_frames.len() as u32 {
            if !action_frames.contains_key(&expected) {
                return Err("animated_sprite_frame_name_invalid".to_string());
            }
        }
        sorted.insert(action.to_string(), action_frames.into_values().collect());
    }
    Ok(sorted)
}

fn parse_animated_frame_file_name(file_name: &str) -> Option<(&str, u32)> {
    let stem = file_name.strip_suffix(".png").or_else(|| file_name.strip_suffix(".PNG"))?;
    let (action, index) = stem.rsplit_once('-')?;
    if !CORE_ACTIONS.contains(&action) || index.len() < 3 || !index.chars().all(|character| character.is_ascii_digit()) {
        return None;
    }
    index.parse::<u32>().ok().map(|value| (action, value))
}

fn animated_sprite_manifest(
    pack_id: &str,
    display_name: &str,
    fps: u8,
    frames: &BTreeMap<String, Vec<String>>,
) -> Result<String, String> {
    let mut assets = serde_json::Map::new();
    let mut actions = serde_json::Map::new();
    for action in CORE_ACTIONS {
        let frame_files = frames
            .get(action)
            .ok_or_else(|| "animated_sprite_core_action_missing".to_string())?;
        let first_frame = frame_files
            .first()
            .ok_or_else(|| "animated_sprite_frame_count_invalid".to_string())?;
        assets.insert(action.to_string(), serde_json::json!({
            "assetId": action,
            "kind": "sprite",
            "fileName": first_frame,
            "frameFiles": frame_files,
            "fps": fps
        }));
        let mut action_entry = serde_json::Map::new();
        action_entry.insert("assetId".to_string(), Value::String(action.to_string()));
        action_entry.insert("loop".to_string(), Value::Bool(matches!(action, "idle" | "thinking" | "running" | "sleeping")));
        action_entry.insert("priority".to_string(), Value::String(if matches!(action, "error" | "need_input") {
            "urgent"
        } else if matches!(action, "success" | "warning") {
            "transient"
        } else {
            "base"
        }.to_string()));
        if matches!(action, "error" | "need_input") {
            action_entry.insert("durationMs".to_string(), Value::Number(6000.into()));
        }
        actions.insert(action.to_string(), Value::Object(action_entry));
    }
    let manifest = serde_json::json!({
        "schemaVersion": "5.8",
        "packId": pack_id,
        "displayName": display_name,
        "rendererKind": "sprite",
        "license": {
            "type": "user-generated",
            "attribution": "User assembled local animated sprite asset"
        },
        "assets": assets,
        "actions": actions
    });
    serde_json::to_string_pretty(&manifest).map_err(|_| "asset_import_copy_failed".to_string())
}

fn animated_sprite_pack_id(display_name: &str) -> String {
    let base = display_name
        .to_ascii_lowercase()
        .chars()
        .map(|character| if character.is_ascii_alphanumeric() { character } else { '-' })
        .collect::<String>()
        .split('-')
        .filter(|part| !part.is_empty())
        .collect::<Vec<_>>()
        .join("-")
        .chars()
        .take(36)
        .collect::<String>();
    let base = if base.is_empty() { "animated-sprite-cat".to_string() } else { base };
    let candidate = format!("animated-{base}-{}", now_millis());
    if is_safe_id(&candidate) {
        candidate
    } else {
        format!("animated-sprite-{}", now_millis())
    }
}

fn asset_file_names(asset: &Value, renderer_kind: &str) -> Result<Vec<String>, String> {
    let asset = asset.as_object().ok_or_else(|| "asset_manifest_invalid".to_string())?;
    let mut file_names = Vec::new();

    if let Some(file_name) = asset.get("fileName").and_then(Value::as_str) {
        if !is_safe_file_name(file_name, renderer_kind) {
            return Err("asset_file_invalid".to_string());
        }
        file_names.push(file_name.to_string());
    }

    if renderer_kind == "sprite" {
        if let Some(frame_files) = asset.get("frameFiles") {
            let frame_files = frame_files
                .as_array()
                .ok_or_else(|| "asset_frame_files_invalid".to_string())?;
            if !(2..=MAX_SPRITE_FRAMES_PER_ACTION).contains(&frame_files.len()) {
                return Err("asset_frame_files_invalid".to_string());
            }
            let mut seen = BTreeSet::new();
            for frame_file in frame_files {
                let frame_file = frame_file
                    .as_str()
                    .ok_or_else(|| "asset_frame_files_invalid".to_string())?;
                if !is_safe_file_name(frame_file, renderer_kind) || !seen.insert(frame_file.to_string()) {
                    return Err("asset_frame_files_invalid".to_string());
                }
                file_names.push(frame_file.to_string());
            }
        }
        if file_names.is_empty() {
            return Err("asset_file_invalid".to_string());
        }
        return Ok(file_names);
    }

    if file_names.len() == 1 {
        return Ok(file_names);
    }
    Err("asset_file_invalid".to_string())
}

fn validate_sprite_fps(asset: &Value) -> Result<(), String> {
    if asset.get("fps").is_some() && sprite_fps(asset).is_none() {
        return Err("asset_fps_invalid".to_string());
    }
    Ok(())
}

fn sprite_fps(asset: &Value) -> Option<u8> {
    let Some(fps) = asset.get("fps").and_then(Value::as_u64) else {
        return None;
    };
    if (1..=24).contains(&fps) {
        Some(fps as u8)
    } else {
        None
    }
}

fn validate_asset_file(path: &Path, renderer_kind: &str) -> Result<(), String> {
    reject_symlink(path)?;
    let metadata = fs::metadata(path).map_err(|_| "asset_file_not_found".to_string())?;
    if !metadata.is_file() {
        return Err("asset_file_not_found".to_string());
    }
    if metadata.len() > MAX_ASSET_BYTES {
        return Err("asset_pack_too_large".to_string());
    }
    if renderer_kind == "gltf" {
        scan_gltf_asset(path)
    } else if renderer_kind == "sprite" {
        scan_sprite_asset(path)
    } else {
        Err("asset_renderer_invalid".to_string())
    }
}

fn read_stored_manifest(storage_root: &Path, pack: &ImportedPackRecord) -> Result<Value, String> {
    let raw_manifest = fs::read_to_string(storage_root.join(&pack.pack_id).join("manifest.json"))
        .map_err(|_| "asset_manifest_not_found".to_string())?;
    serde_json::from_str(&raw_manifest).map_err(|_| "asset_manifest_invalid_json".to_string())
}

fn runtime_pack_from_record(
    storage_root: &Path,
    pack: &ImportedPackRecord,
) -> Result<RuntimeImportedAssetPack, String> {
    let manifest = read_stored_manifest(storage_root, pack)?;
    let license = manifest
        .get("license")
        .and_then(Value::as_object)
        .ok_or_else(|| "asset_license_missing".to_string())?;
    let assets = manifest
        .get("assets")
        .and_then(Value::as_object)
        .ok_or_else(|| "asset_manifest_invalid".to_string())?;
    let actions = manifest
        .get("actions")
        .and_then(Value::as_object)
        .ok_or_else(|| "asset_manifest_invalid".to_string())?;

    let mut runtime_assets = BTreeMap::new();
    for (asset_id, asset) in assets {
        let asset = asset
            .as_object()
            .ok_or_else(|| "asset_manifest_invalid".to_string())?;
        runtime_assets.insert(
            asset_id.clone(),
            RuntimeAssetEntry {
                asset_id: asset_id.clone(),
                kind: asset
                    .get("kind")
                    .and_then(Value::as_str)
                    .unwrap_or(&pack.renderer_kind)
                    .to_string(),
            },
        );
    }

    let mut runtime_actions = BTreeMap::new();
    for action_id in CORE_ACTIONS {
        let action = actions
            .get(action_id)
            .and_then(Value::as_object)
            .ok_or_else(|| "core_action_missing".to_string())?;
        runtime_actions.insert(
            action_id.to_string(),
            RuntimeAssetAction {
                asset_id: action
                    .get("assetId")
                    .and_then(Value::as_str)
                    .ok_or_else(|| "core_action_missing".to_string())?
                    .to_string(),
                r#loop: action
                    .get("loop")
                    .and_then(Value::as_bool)
                    .unwrap_or(matches!(action_id, "idle" | "thinking" | "running" | "sleeping")),
                priority: action
                    .get("priority")
                    .and_then(Value::as_str)
                    .unwrap_or("base")
                    .to_string(),
                duration_ms: action.get("durationMs").and_then(Value::as_u64),
            },
        );
    }

    Ok(RuntimeImportedAssetPack {
        schema_version: "5.0".to_string(),
        pack_id: pack.pack_id.clone(),
        version: pack.created_at.clone(),
        renderer_kind: pack.renderer_kind.clone(),
        license: RuntimeAssetLicense {
            r#type: license
                .get("type")
                .and_then(Value::as_str)
                .unwrap_or("user-generated")
                .to_string(),
            attribution: license
                .get("attribution")
                .and_then(Value::as_str)
                .unwrap_or("user imported asset")
                .to_string(),
        },
        assets: runtime_assets,
        actions: runtime_actions,
        validation_status: "valid".to_string(),
    })
}

fn store_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app_data_root(app)?.join("personalized-assets.json"))
}

fn storage_root(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app_data_root(app)?.join("asset-packs"))
}

fn app_data_root(app: &AppHandle) -> Result<PathBuf, String> {
    if cfg!(target_os = "macos") {
        if let Ok(home) = std::env::var("HOME") {
            return Ok(PathBuf::from(home)
                .join("Library")
                .join("Application Support")
                .join("agent-desktop-pet"));
        }
    }
    Ok(app
        .path()
        .app_data_dir()
        .map_err(|_| "asset_store_unavailable".to_string())?)
}

fn read_store(path: &Path) -> AssetStore {
    fs::read_to_string(path)
        .ok()
        .and_then(|content| serde_json::from_str::<AssetStore>(&content).ok())
        .unwrap_or_default()
}

fn write_store(path: &Path, store: &AssetStore) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|_| "asset_import_copy_failed".to_string())?;
    }
    let content = serde_json::to_string_pretty(store).map_err(|_| "asset_import_copy_failed".to_string())?;
    fs::write(path, content).map_err(|_| "asset_import_copy_failed".to_string())
}

fn pack_view(pack: &ImportedPackRecord) -> PersonalizedAssetPackView {
    PersonalizedAssetPackView {
        pack_id: pack.pack_id.clone(),
        display_name: pack.display_name.clone(),
        renderer_kind: pack.renderer_kind.clone(),
        copied_asset_ids: pack.copied_asset_ids.clone(),
        manifest_hash: pack.manifest_hash.clone(),
        created_at: pack.created_at.clone(),
        active_instances: pack.active_instances.clone(),
        validation_status: "valid".to_string(),
    }
}

fn string_field<'a>(manifest: &'a Value, field: &str) -> Result<&'a str, String> {
    manifest
        .get(field)
        .and_then(Value::as_str)
        .ok_or_else(|| "asset_manifest_invalid".to_string())
}

fn is_safe_id(value: &str) -> bool {
    (1..=64).contains(&value.len())
        && value
            .chars()
            .all(|character| character.is_ascii_alphanumeric() || matches!(character, '.' | '_' | '-'))
}

fn is_safe_instance_id(value: &str) -> bool {
    value == "default"
        || (value.starts_with("codex_")
            && (7..=96).contains(&value.len())
            && value
                .chars()
                .all(|character| character.is_ascii_alphanumeric() || matches!(character, '.' | '_' | '-')))
}

fn is_safe_text(value: &str) -> bool {
    (1..=160).contains(&value.chars().count())
        && !value.chars().any(|character| character.is_control())
}

fn is_safe_file_name(file_name: &str, renderer_kind: &str) -> bool {
    if !(1..=96).contains(&file_name.len()) {
        return false;
    }
    if !file_name
        .chars()
        .all(|character| character.is_ascii_alphanumeric() || matches!(character, '.' | '_' | '-'))
    {
        return false;
    }
    if renderer_kind == "sprite" {
        return file_name.to_ascii_lowercase().ends_with(".png");
    }
    file_name.to_ascii_lowercase().ends_with(".glb")
        || file_name.to_ascii_lowercase().ends_with(".gltf")
}

fn scan_forbidden(value: &Value) -> bool {
    match value {
        Value::String(text) => {
            let lower = text.to_ascii_lowercase();
            lower.contains("://")
                || lower.contains("file://")
                || lower.contains("javascript:")
                || lower.contains("..")
                || lower.contains("/users/")
                || lower.contains("/private/")
                || lower.contains("/volumes/")
                || lower.contains("\\")
                || lower.ends_with(".sh")
                || lower.ends_with(".js")
                || lower.ends_with(".mjs")
                || lower.ends_with(".command")
        }
        Value::Array(items) => items.iter().any(scan_forbidden),
        Value::Object(fields) => fields.iter().any(|(key, nested)| {
            let key = key.to_ascii_lowercase();
            key.contains("raw")
                || key.contains("payload")
                || key.contains("prompt")
                || key.contains("photo")
                || key.contains("path")
                || key.contains("token")
                || key.contains("authorization")
                || key.contains("workspace")
                || key.contains("config")
                || key.contains("transcript")
                || scan_forbidden(nested)
        }),
        _ => false,
    }
}

fn sanitize_display_name(value: &str, fallback: &str) -> String {
    let sanitized = value
        .chars()
        .map(|character| if character.is_control() { ' ' } else { character })
        .collect::<String>()
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ");
    if sanitized.is_empty() || sanitized.chars().count() > 80 {
        fallback.to_string()
    } else {
        sanitized
    }
}

fn stable_hash(value: &str) -> String {
    let mut hasher = DefaultHasher::new();
    value.hash(&mut hasher);
    format!("{:016x}", hasher.finish())
}

fn now_millis() -> String {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis().to_string())
        .unwrap_or_else(|_| "0".to_string())
}

fn encode_base64(bytes: &[u8]) -> String {
    const TABLE: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut output = String::with_capacity(bytes.len().div_ceil(3) * 4);
    for chunk in bytes.chunks(3) {
        let first = chunk[0];
        let second = *chunk.get(1).unwrap_or(&0);
        let third = *chunk.get(2).unwrap_or(&0);
        output.push(TABLE[(first >> 2) as usize] as char);
        output.push(TABLE[(((first & 0b0000_0011) << 4) | (second >> 4)) as usize] as char);
        if chunk.len() > 1 {
            output.push(TABLE[(((second & 0b0000_1111) << 2) | (third >> 6)) as usize] as char);
        } else {
            output.push('=');
        }
        if chunk.len() > 2 {
            output.push(TABLE[(third & 0b0011_1111) as usize] as char);
        } else {
            output.push('=');
        }
    }
    output
}

fn array_len(json: &Value, key: &str) -> usize {
    json.get(key)
        .and_then(Value::as_array)
        .map(|items| items.len())
        .unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn imports_valid_sprite_pack_and_replaces_duplicate() {
        let root = temp_root("sprite");
        let pack = root.join("pack");
        fs::create_dir_all(&pack).unwrap();
        for action in CORE_ACTIONS {
            fs::write(pack.join(format!("{action}.png")), PNG_SIGNATURE).unwrap();
        }
        fs::write(pack.join("manifest.json"), manifest_json("sprite", "png")).unwrap();
        let store = root.join("store.json");
        let storage = root.join("managed");

        let first = import_pack_with_paths(
            pack.join("manifest.json"),
            None,
            store.clone(),
            storage.clone(),
        )
        .unwrap();
        let second = import_pack_with_paths(
            pack.join("manifest.json"),
            Some("Mochi Replacement".to_string()),
            store.clone(),
            storage,
        )
        .unwrap();

        assert_eq!(first.pack_id, "mochi-sprite");
        assert_eq!(second.display_name, "Mochi Replacement");
        assert_eq!(read_store(&store).packs.len(), 1);
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn activates_pack_and_returns_runtime_manifest() {
        let root = temp_root("activate");
        let pack = root.join("pack");
        fs::create_dir_all(&pack).unwrap();
        for action in CORE_ACTIONS {
            fs::write(pack.join(format!("{action}.png")), PNG_SIGNATURE).unwrap();
        }
        fs::write(pack.join("manifest.json"), manifest_json("sprite", "png")).unwrap();
        let store = root.join("store.json");
        let storage = root.join("managed");

        import_pack_with_paths(pack.join("manifest.json"), None, store.clone(), storage.clone()).unwrap();
        let activation = activate_pack_with_paths(
            "mochi-sprite".to_string(),
            "codex_123".to_string(),
            store.clone(),
            storage.clone(),
        )
        .unwrap();
        assert_eq!(activation.instance_id, "codex_123");
        let store_data = read_store(&store);
        let runtime = runtime_pack_from_record(&storage, &store_data.packs[0]).unwrap();
        assert_eq!(runtime.pack_id, "mochi-sprite");
        assert_eq!(runtime.actions.len(), 8);
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn activation_is_exclusive_per_instance() {
        let root = temp_root("activate-exclusive");
        let pack_a = root.join("pack-a");
        let pack_b = root.join("pack-b");
        fs::create_dir_all(&pack_a).unwrap();
        fs::create_dir_all(&pack_b).unwrap();
        for action in CORE_ACTIONS {
            fs::write(pack_a.join(format!("{action}.png")), PNG_SIGNATURE).unwrap();
            fs::write(pack_b.join(format!("{action}.png")), PNG_SIGNATURE).unwrap();
        }
        fs::write(
            pack_a.join("manifest.json"),
            manifest_json_with_pack_id("sprite", "png", "mochi-a"),
        )
        .unwrap();
        fs::write(
            pack_b.join("manifest.json"),
            manifest_json_with_pack_id("sprite", "png", "mochi-b"),
        )
        .unwrap();
        let store = root.join("store.json");
        let storage = root.join("managed");

        import_pack_with_paths(pack_a.join("manifest.json"), None, store.clone(), storage.clone()).unwrap();
        import_pack_with_paths(pack_b.join("manifest.json"), None, store.clone(), storage.clone()).unwrap();
        activate_pack_with_paths(
            "mochi-a".to_string(),
            "codex_123".to_string(),
            store.clone(),
            storage.clone(),
        )
        .unwrap();
        activate_pack_with_paths(
            "mochi-b".to_string(),
            "codex_123".to_string(),
            store.clone(),
            storage.clone(),
        )
        .unwrap();

        let store_data = read_store(&store);
        let first = store_data
            .packs
            .iter()
            .find(|pack| pack.pack_id == "mochi-a")
            .unwrap();
        let second = store_data
            .packs
            .iter()
            .find(|pack| pack.pack_id == "mochi-b")
            .unwrap();
        assert!(first.active_instances.is_empty());
        assert_eq!(second.active_instances, vec!["codex_123".to_string()]);
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn rejects_corrupt_sprite_before_activation() {
        let root = temp_root("corrupt-sprite");
        let pack = root.join("pack");
        fs::create_dir_all(&pack).unwrap();
        for action in CORE_ACTIONS {
            fs::write(pack.join(format!("{action}.png")), PNG_SIGNATURE).unwrap();
        }
        fs::write(pack.join("manifest.json"), manifest_json("sprite", "png")).unwrap();
        let result = import_pack_with_paths(
            pack.join("manifest.json"),
            None,
            root.join("store.json"),
            root.join("managed"),
        );
        assert!(result.is_ok());
        fs::write(root.join("managed").join("mochi-sprite").join("idle.png"), "not png").unwrap();
        let mut store = read_store(&root.join("store.json"));
        let error = validate_stored_pack(&root.join("managed"), &mut store.packs[0]).unwrap_err();
        assert_eq!(error, "asset_frame_corrupt");
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn deletes_pack_and_active_instances() {
        let root = temp_root("delete");
        let pack = root.join("pack");
        fs::create_dir_all(&pack).unwrap();
        for action in CORE_ACTIONS {
            fs::write(pack.join(format!("{action}.png")), PNG_SIGNATURE).unwrap();
        }
        fs::write(pack.join("manifest.json"), manifest_json("sprite", "png")).unwrap();
        let store = root.join("store.json");
        let storage = root.join("managed");
        import_pack_with_paths(pack.join("manifest.json"), None, store.clone(), storage.clone()).unwrap();
        activate_pack_with_paths(
            "mochi-sprite".to_string(),
            "codex_123".to_string(),
            store.clone(),
            storage.clone(),
        )
        .unwrap();

        let remaining = delete_pack_with_paths("mochi-sprite".to_string(), store.clone(), storage.clone()).unwrap();
        assert!(remaining.is_empty());
        assert!(!storage.join("mochi-sprite").exists());
        assert!(read_store(&store).packs.is_empty());
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn renames_pack_without_changing_id_or_active_instances() {
        let root = temp_root("rename");
        let pack = root.join("pack");
        fs::create_dir_all(&pack).unwrap();
        for action in CORE_ACTIONS {
            fs::write(pack.join(format!("{action}.png")), PNG_SIGNATURE).unwrap();
        }
        fs::write(pack.join("manifest.json"), manifest_json("sprite", "png")).unwrap();
        let store = root.join("store.json");
        let storage = root.join("managed");
        import_pack_with_paths(pack.join("manifest.json"), None, store.clone(), storage.clone()).unwrap();
        activate_pack_with_paths(
            "mochi-sprite".to_string(),
            "codex_123".to_string(),
            store.clone(),
            storage.clone(),
        )
        .unwrap();

        let renamed = rename_pack_with_paths(
            "mochi-sprite".to_string(),
            "  Mochi Runtime\nPack  ".to_string(),
            store.clone(),
        )
        .unwrap();
        assert_eq!(renamed.pack_id, "mochi-sprite");
        assert_eq!(renamed.display_name, "Mochi Runtime Pack");
        assert_eq!(renamed.active_instances, vec!["codex_123".to_string()]);
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn rejects_forbidden_manifest_and_missing_core_action() {
        let root = temp_root("bad");
        let pack = root.join("pack");
        fs::create_dir_all(&pack).unwrap();
        let mut manifest: Value = serde_json::from_str(&manifest_json("sprite", "png")).unwrap();
        manifest["actions"]["error"] = Value::Null;
        fs::write(pack.join("manifest.json"), serde_json::to_string(&manifest).unwrap()).unwrap();
        let result = import_pack_with_paths(
            pack.join("manifest.json"),
            None,
            root.join("store.json"),
            root.join("managed"),
        );
        assert_eq!(result.unwrap_err(), "core_action_missing");

        manifest["actions"]["error"] = serde_json::json!({ "assetId": "error", "loop": false, "priority": "urgent" });
        manifest["assets"]["idle"]["fileName"] = Value::String("../idle.png".to_string());
        fs::write(pack.join("manifest.json"), serde_json::to_string(&manifest).unwrap()).unwrap();
        let result = import_pack_with_paths(
            pack.join("manifest.json"),
            None,
            root.join("store.json"),
            root.join("managed"),
        );
        assert_eq!(result.unwrap_err(), "asset_manifest_forbidden_content");
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn rejects_gltf_external_uri() {
        let root = temp_root("gltf");
        let pack = root.join("pack");
        fs::create_dir_all(&pack).unwrap();
        for action in CORE_ACTIONS {
            fs::write(pack.join(format!("{action}.gltf")), r#"{"asset":{"version":"2.0"},"buffers":[{"uri":"external.bin"}],"animations":[{"name":"idle"}]}"#).unwrap();
        }
        fs::write(pack.join("manifest.json"), manifest_json("gltf", "gltf")).unwrap();
        let result = import_pack_with_paths(
            pack.join("manifest.json"),
            None,
            root.join("store.json"),
            root.join("managed"),
        );
        assert_eq!(result.unwrap_err(), "gltf_external_resource_rejected");
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn rejects_invisible_gltf_without_scene_meshes_or_nodes() {
        let root = temp_root("empty-gltf");
        let pack = root.join("pack");
        fs::create_dir_all(&pack).unwrap();
        for action in CORE_ACTIONS {
            fs::write(pack.join(format!("{action}.gltf")), r#"{"asset":{"version":"2.0"},"animations":[{"name":"idle"}]}"#).unwrap();
        }
        fs::write(pack.join("manifest.json"), manifest_json("gltf", "gltf")).unwrap();
        let result = import_pack_with_paths(
            pack.join("manifest.json"),
            None,
            root.join("store.json"),
            root.join("managed"),
        );
        assert_eq!(result.unwrap_err(), "gltf_external_resource_rejected");
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn assembles_animated_sprite_pack_and_activates_target_instance() {
        let root = temp_root("animated-sprite");
        let source = root.join("frames");
        fs::create_dir_all(&source).unwrap();
        write_animated_sprite_frames(&source, 3);
        let store = root.join("store.json");
        let storage = root.join("managed");

        let result = assemble_animated_sprite_pack_with_paths(
            source,
            "Animated Orange Cat".to_string(),
            Some(12),
            Some("codex_animated".to_string()),
            store.clone(),
            storage.clone(),
        )
        .unwrap();

        assert_eq!(result.renderer_kind, "sprite");
        assert_eq!(result.fps, 12);
        assert_eq!(result.reason_code, "animated_sprite_manifest_generated");
        assert_eq!(result.activated_instance_id, Some("codex_animated".to_string()));
        assert!(result.action_frame_counts.values().all(|count| *count == 3));
        let stored = read_store(&store);
        let pack = stored.packs.iter().find(|pack| pack.pack_id == result.pack_id).unwrap();
        assert_eq!(pack.active_instances, vec!["codex_animated".to_string()]);
        let manifest = read_stored_manifest(&storage, pack).unwrap();
        let idle_asset = manifest["assets"]["idle"].as_object().unwrap();
        assert_eq!(idle_asset["fps"], Value::Number(12.into()));
        assert_eq!(idle_asset["frameFiles"].as_array().unwrap().len(), 3);
        assert!(!manifest["actions"]["idle"].as_object().unwrap().contains_key("durationMs"));
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn animated_sprite_rejects_missing_core_without_changing_previous_pack() {
        let root = temp_root("animated-sprite-invalid");
        let source = root.join("frames");
        fs::create_dir_all(&source).unwrap();
        write_animated_sprite_frames(&source, 2);
        fs::remove_file(source.join("error-000.png")).unwrap();
        fs::remove_file(source.join("error-001.png")).unwrap();
        let store = root.join("store.json");
        let storage = root.join("managed");

        let pack = root.join("pack");
        fs::create_dir_all(&pack).unwrap();
        for action in CORE_ACTIONS {
            fs::write(pack.join(format!("{action}.png")), PNG_SIGNATURE).unwrap();
        }
        fs::write(pack.join("manifest.json"), manifest_json("sprite", "png")).unwrap();
        import_pack_with_paths(pack.join("manifest.json"), None, store.clone(), storage.clone()).unwrap();
        activate_pack_with_paths(
            "mochi-sprite".to_string(),
            "codex_animated".to_string(),
            store.clone(),
            storage.clone(),
        )
        .unwrap();

        let result = assemble_animated_sprite_pack_with_paths(
            source,
            "Broken Animated Cat".to_string(),
            Some(12),
            Some("codex_animated".to_string()),
            store.clone(),
            storage,
        );
        assert_eq!(result.unwrap_err(), "animated_sprite_core_action_missing");
        let store_data = read_store(&store);
        let previous = store_data
            .packs
            .iter()
            .find(|pack| pack.pack_id == "mochi-sprite")
            .unwrap();
        assert_eq!(previous.active_instances, vec!["codex_animated".to_string()]);
        let _ = fs::remove_dir_all(root);
    }

    fn manifest_json(renderer_kind: &str, extension: &str) -> String {
        manifest_json_with_pack_id(renderer_kind, extension, &format!("mochi-{renderer_kind}"))
    }

    fn manifest_json_with_pack_id(renderer_kind: &str, extension: &str, pack_id: &str) -> String {
        let mut assets = serde_json::Map::new();
        let mut actions = serde_json::Map::new();
        for action in CORE_ACTIONS {
            assets.insert(
                action.to_string(),
                serde_json::json!({ "assetId": action, "kind": renderer_kind, "fileName": format!("{action}.{extension}") }),
            );
            actions.insert(
                action.to_string(),
                serde_json::json!({ "assetId": action, "loop": matches!(action, "idle" | "thinking" | "running" | "sleeping"), "priority": "base" }),
            );
        }
        serde_json::json!({
            "schemaVersion": "5.8",
            "packId": pack_id,
            "displayName": "Mochi",
            "rendererKind": renderer_kind,
            "license": { "type": "user-generated", "attribution": "test" },
            "assets": assets,
            "actions": actions
        })
        .to_string()
    }

    fn temp_root(name: &str) -> PathBuf {
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|duration| duration.as_nanos())
            .unwrap_or_default();
        let root = std::env::temp_dir().join(format!(
            "adp-v5-{}-{}-{:?}",
            name,
            nanos,
            std::thread::current().id()
        ));
        fs::create_dir_all(&root).unwrap();
        root
    }

    fn write_animated_sprite_frames(source: &Path, frame_count: u32) {
        for action in CORE_ACTIONS {
            for index in 0..frame_count {
                fs::write(
                    source.join(format!("{action}-{index:03}.png")),
                    PNG_SIGNATURE,
                )
                .unwrap();
            }
        }
    }
}
