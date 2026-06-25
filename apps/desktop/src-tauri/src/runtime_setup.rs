use crate::{
    bridge, sound, now_millis, AppSettings, AppState, PetInstance, PET_HEIGHT, PET_SPAWN_GAP,
    PET_WIDTH, SAFE_MARGIN, WindowPosition,
};
use std::{fs, path::PathBuf, sync::{Arc, Mutex}};
use tauri::{
    image::Image,
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::TrayIconBuilder,
    App, AppHandle, Manager, PhysicalPosition, PhysicalSize, WebviewUrl, WebviewWindow,
    WebviewWindowBuilder, WindowEvent,
};

pub(crate) fn setup(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let settings_path = settings_path(app.handle())?;
    let settings = read_settings(&settings_path);
    let sound = sound::SoundHandle::new(app.handle().clone(), settings.muted);
    let bridge_runtime = bridge::start(app.handle().clone(), sound.clone())
        .map_err(std::io::Error::other)?;
    let state = AppState {
        settings: Arc::new(Mutex::new(settings)),
        settings_path,
        api_debug: bridge_runtime.debug.clone(),
        sound,
    };

    app.manage(state.clone());
    app.manage(bridge_runtime);

    if let Some(window) = app.get_webview_window("main") {
        apply_initial_pet_window(app.handle(), &window, &state)?;
        install_window_persistence(window, state.clone());
    }
    restore_instance_windows(app.handle(), &state)?;

    setup_tray(app.handle(), state)?;
    Ok(())
}

fn settings_path(app: &AppHandle) -> tauri::Result<PathBuf> {
    let dir = app.path().app_config_dir()?;
    fs::create_dir_all(&dir)?;
    Ok(dir.join("settings.json"))
}

fn read_settings(path: &PathBuf) -> AppSettings {
    fs::read_to_string(path)
        .ok()
        .and_then(|content| serde_json::from_str::<AppSettings>(&content).ok())
        .unwrap_or_default()
}

pub(crate) fn save_settings(state: &AppState, settings: &AppSettings) -> Result<(), String> {
    if let Some(parent) = state.settings_path.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }
    let content = serde_json::to_string_pretty(settings).map_err(|error| error.to_string())?;
    fs::write(&state.settings_path, content).map_err(|error| error.to_string())
}

fn apply_initial_pet_window(
    app: &AppHandle,
    window: &WebviewWindow,
    state: &AppState,
) -> tauri::Result<()> {
    let settings = state
        .settings
        .lock()
        .map(|settings| settings.clone())
        .unwrap_or_default();
    let position = safe_pet_position(app, settings.pet_x, settings.pet_y);
    window.set_position(position)?;
    window.set_always_on_top(true)?;
    window.set_visible_on_all_workspaces(true)?;
    window.set_shadow(false)?;

    if settings.pet_visible {
        window.show()?;
        window.set_focus()?;
    }

    Ok(())
}

fn restore_instance_windows(app: &AppHandle, state: &AppState) -> tauri::Result<()> {
    let instances = state
        .settings
        .lock()
        .map(|settings| settings.pet_instances.clone())
        .unwrap_or_default();
    for (index, instance) in instances
        .iter()
        .enumerate()
        .filter(|(_, instance)| instance.visible)
    {
        create_or_show_instance_window(app, state, instance, index + 1)?;
    }
    Ok(())
}

pub(crate) fn create_or_show_instance_window(
    app: &AppHandle,
    state: &AppState,
    instance: &PetInstance,
    slot: usize,
) -> tauri::Result<()> {
    if let Some(window) = app.get_webview_window(&instance.window_label) {
        window.set_visible_on_all_workspaces(true)?;
        window.set_always_on_top(true)?;
        window.show()?;
        window.set_focus()?;
        return Ok(());
    }

    let window =
        WebviewWindowBuilder::new(app, &instance.window_label, WebviewUrl::App("/".into()))
            .title(&instance.display_name)
            .inner_size(PET_WIDTH as f64, PET_HEIGHT as f64)
            .resizable(false)
            .decorations(false)
            .transparent(true)
            .shadow(false)
            .always_on_top(true)
            .visible_on_all_workspaces(true)
            .skip_taskbar(true)
            .visible(false)
            .accept_first_mouse(true)
            .build()?;

    let saved = PhysicalPosition::new(instance.position.x, instance.position.y);
    let safe = if position_is_visible(app, saved, PhysicalSize::new(PET_WIDTH, PET_HEIGHT)) {
        saved
    } else {
        pet_spawn_position_for_slot(app, PhysicalSize::new(PET_WIDTH, PET_HEIGHT), slot)
    };
    window.set_position(safe)?;
    window.set_always_on_top(true)?;
    window.set_visible_on_all_workspaces(true)?;
    window.set_shadow(false)?;
    window.show()?;
    install_window_persistence(window, state.clone());
    Ok(())
}

fn install_window_persistence(window: WebviewWindow, state: AppState) {
    let persistence_window = window.clone();
    let label = window.label().to_string();
    window.on_window_event(move |event| {
        if matches!(event, WindowEvent::Moved(_)) {
            if let Ok(position) = persistence_window.outer_position() {
                if let Ok(mut settings) = state.settings.lock() {
                    if label == "main" {
                        settings.pet_x = Some(position.x);
                        settings.pet_y = Some(position.y);
                    } else if let Some(instance) = settings
                        .pet_instances
                        .iter_mut()
                        .find(|instance| instance.window_label == label)
                    {
                        instance.position = WindowPosition {
                            x: position.x,
                            y: position.y,
                        };
                        instance.updated_at = now_millis();
                    }
                    let snapshot = settings.clone();
                    drop(settings);
                    let _ = save_settings(&state, &snapshot);
                }
            }
        }
    });
}

fn safe_pet_position(
    app: &AppHandle,
    saved_x: Option<i32>,
    saved_y: Option<i32>,
) -> PhysicalPosition<i32> {
    let size = PhysicalSize::new(PET_WIDTH, PET_HEIGHT);

    if let (Some(x), Some(y)) = (saved_x, saved_y) {
        let saved = PhysicalPosition::new(x, y);
        if position_is_visible(app, saved, size) {
            return saved;
        }
    }

    pet_spawn_position_for_slot(app, size, 0)
}

pub(crate) fn position_is_visible(
    app: &AppHandle,
    position: PhysicalPosition<i32>,
    size: PhysicalSize<u32>,
) -> bool {
    app.available_monitors()
        .map(|monitors| {
            monitors.iter().any(|monitor| {
                let origin = monitor.position();
                let monitor_size = monitor_position_size(monitor);
                let left = origin.x + SAFE_MARGIN;
                let top = origin.y + SAFE_MARGIN;
                let right = origin.x + monitor_size.0 - size.width as i32 - SAFE_MARGIN;
                let bottom =
                    origin.y + monitor_size.1 - size.height as i32 - SAFE_MARGIN;
                position.x >= left
                    && position.x <= right
                    && position.y >= top
                    && position.y <= bottom
            })
        })
        .unwrap_or(false)
}

pub(crate) fn clamp_pet_position(
    app: &AppHandle,
    requested: PhysicalPosition<i32>,
    size: PhysicalSize<u32>,
) -> PhysicalPosition<i32> {
    if let Ok(monitors) = app.available_monitors() {
        for monitor in monitors.iter() {
            let origin = monitor.position();
            let monitor_size = monitor_position_size(monitor);
            let left = origin.x + SAFE_MARGIN;
            let top = origin.y + SAFE_MARGIN;
            let right = origin.x + monitor_size.0 - size.width as i32 - SAFE_MARGIN;
            let bottom = origin.y + monitor_size.1 - size.height as i32 - SAFE_MARGIN;
            let horizontal_overlap = requested.x >= origin.x - size.width as i32
                && requested.x <= origin.x + monitor_size.0;
            let vertical_overlap = requested.y >= origin.y - size.height as i32
                && requested.y <= origin.y + monitor_size.1;
            if horizontal_overlap && vertical_overlap {
                return PhysicalPosition::new(
                    requested.x.clamp(left, right),
                    requested.y.clamp(top, bottom),
                );
            }
        }
    }

    pet_spawn_position_for_slot(app, size, 0)
}

pub(crate) fn pet_spawn_position_for_slot(
    app: &AppHandle,
    size: PhysicalSize<u32>,
    slot: usize,
) -> PhysicalPosition<i32> {
    if let Ok(Some(monitor)) = app.primary_monitor() {
        let origin = monitor.position();
        let monitor_size = monitor_position_size(&monitor);
        let left = origin.x + SAFE_MARGIN;
        let top = origin.y + SAFE_MARGIN;
        let right = origin.x + monitor_size.0 - size.width as i32 - SAFE_MARGIN;
        let bottom = origin.y + monitor_size.1 - size.height as i32 - SAFE_MARGIN;
        let step_x = (size.width as i32 * 2 / 3).max(1) + PET_SPAWN_GAP;
        let step_y = (size.height as i32 * 3 / 4).max(1) + PET_SPAWN_GAP;
        let anchor_x =
            origin.x + monitor_size.0 * 3 / 4 - size.width as i32 / 2;
        let anchor_y =
            origin.y + monitor_size.1 * 2 / 3 - size.height as i32 / 2;
        let vertical_slot = if slot == 0 {
            0
        } else {
            let distance = ((slot + 1) / 2) as i32;
            if slot % 2 == 1 {
                -distance
            } else {
                distance
            }
        };
        let max_columns = ((right - left) / step_x + 1).max(1) as usize;
        for column in 0..max_columns {
            let x_direction = if column % 2 == 0 { 1 } else { -1 };
            let x_distance = ((column + 1) / 2) as i32;
            let candidate = PhysicalPosition::new(
                anchor_x + x_direction * x_distance * step_x,
                anchor_y + vertical_slot * step_y,
            );
            let clamped = PhysicalPosition::new(
                candidate.x.clamp(left, right),
                candidate.y.clamp(top, bottom),
            );
            if position_is_visible(app, clamped, size) {
                return clamped;
            }
        }
        return PhysicalPosition::new(anchor_x.clamp(left, right), anchor_y.clamp(top, bottom));
    }

    PhysicalPosition::new(SAFE_MARGIN, SAFE_MARGIN)
}

pub(crate) fn monitor_position_size(monitor: &tauri::Monitor) -> (i32, i32) {
    let size = monitor.size();
    let scale_factor = monitor.scale_factor();
    if scale_factor <= 0.0 {
        return (size.width as i32, size.height as i32);
    }
    (
        (size.width as f64 / scale_factor).round() as i32,
        (size.height as f64 / scale_factor).round() as i32,
    )
}

pub(crate) fn reset_position_for_index(app: &AppHandle, index: usize) -> PhysicalPosition<i32> {
    let size = PhysicalSize::new(PET_WIDTH, PET_HEIGHT);
    pet_spawn_position_for_slot(app, size, index)
}

fn setup_tray(app: &AppHandle, state: AppState) -> tauri::Result<()> {
    let title = MenuItem::with_id(app, "title", "Agent Desktop Pet", false, None::<&str>)?;
    let settings = MenuItem::with_id(app, "settings", "显示设置", true, None::<&str>)?;
    let mute = MenuItem::with_id(app, "mute", "静音 / 取消静音", true, None::<&str>)?;
    let visibility = MenuItem::with_id(app, "visibility", "显示 / 隐藏猫咪", true, None::<&str>)?;
    let switch_3d = MenuItem::with_id(app, "switch_3d", "切换到3D渲染", true, None::<&str>)?;
    let reset_position = MenuItem::with_id(app, "reset_position", "重置位置", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
    let separator_a = PredefinedMenuItem::separator(app)?;
    let separator_b = PredefinedMenuItem::separator(app)?;

    let menu = Menu::with_items(
        app,
        &[
            &title,
            &separator_a,
            &settings,
            &mute,
            &visibility,
            &switch_3d,
            &reset_position,
            &separator_b,
            &quit,
        ],
    )?;

    let tray_icon = build_tray_icon();
    let tray = TrayIconBuilder::with_id("main-tray")
        .menu(&menu)
        .show_menu_on_left_click(true);
    let tray = if let Some(icon) = tray_icon {
        tray.icon(icon)
    } else {
        tray
    };

    tray.on_menu_event(move |app, event| match event.id().as_ref() {
        "settings" => {
            let _ = open_settings_window(app);
        }
        "mute" => {
            let _ = toggle_muted(&state);
        }
        "visibility" => {
            let _ = toggle_pet_visibility(app, &state);
        }
        "switch_3d" => {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.eval("localStorage.setItem('agentDesktopPet.rendererKind', 'gltf'); location.reload();");
            }
        }
        "reset_position" => {
            let _ = reset_pet_position(app, &state);
        }
        "quit" => {
            app.state::<bridge::BridgeRuntime>().shutdown();
            app.exit(0);
        }
        _ => {}
    })
    .build(app)?;

    Ok(())
}

fn build_tray_icon() -> Option<Image<'static>> {
    let width: usize = 32;
    let height: usize = 32;
    let mut rgba = Vec::with_capacity(width * height * 4);

    for y in 0..height {
        for x in 0..width {
            let dx = x as i32 - 16;
            let dy = y as i32 - 16;
            let in_face = dx * dx + dy * dy <= 12 * 12;
            let in_left_ear = x > 5 && x < 14 && y > 2 && y < 12 && y < 18 - x;
            let in_right_ear = x > 18 && x < 27 && y > 2 && y < 12 && y < x - 12;

            if in_face || in_left_ear || in_right_ear {
                rgba.extend_from_slice(&[91, 103, 122, 255]);
            } else {
                rgba.extend_from_slice(&[0, 0, 0, 0]);
            }
        }
    }

    Some(Image::new_owned(rgba, width as u32, height as u32))
}

pub(crate) fn open_settings_window(app: &AppHandle) -> tauri::Result<()> {
    if let Some(window) = app.get_webview_window("settings") {
        window.set_always_on_top(true)?;
        window.show()?;
        window.set_focus()?;
        return Ok(());
    }

    let window = WebviewWindowBuilder::new(app, "settings", WebviewUrl::App("/".into()))
        .title("Agent Desktop Pet 设置")
        .inner_size(1080.0, 760.0)
        .min_inner_size(720.0, 520.0)
        .resizable(true)
        .decorations(true)
        .always_on_top(true)
        .build()?;
    window.show()?;
    window.set_focus()?;

    Ok(())
}

fn toggle_muted(state: &AppState) -> Result<(), String> {
    let updated = {
        let mut settings = state.settings.lock().map_err(|error| error.to_string())?;
        settings.muted = !settings.muted;
        settings.clone()
    };
    state.sound.set_muted(updated.muted);
    save_settings(state, &updated)
}

fn toggle_pet_visibility(app: &AppHandle, state: &AppState) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| "main window not found".to_string())?;
    let updated = {
        let mut settings = state.settings.lock().map_err(|error| error.to_string())?;
        settings.pet_visible = !settings.pet_visible;
        if settings.pet_visible {
            window.show().map_err(|error| error.to_string())?;
            window.set_focus().map_err(|error| error.to_string())?;
        } else {
            window.hide().map_err(|error| error.to_string())?;
        }
        settings.clone()
    };
    save_settings(state, &updated)
}

fn reset_pet_position(app: &AppHandle, state: &AppState) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| "main window not found".to_string())?;
    let position = pet_spawn_position_for_slot(app, PhysicalSize::new(PET_WIDTH, PET_HEIGHT), 0);
    window
        .set_position(position)
        .map_err(|error| error.to_string())?;
    window
        .set_visible_on_all_workspaces(true)
        .map_err(|error| error.to_string())?;
    window
        .set_always_on_top(true)
        .map_err(|error| error.to_string())?;

    let updated = {
        let mut settings = state.settings.lock().map_err(|error| error.to_string())?;
        settings.pet_x = Some(position.x);
        settings.pet_y = Some(position.y);
        settings.pet_visible = true;
        settings.clone()
    };
    window.show().map_err(|error| error.to_string())?;
    save_settings(state, &updated)
}
