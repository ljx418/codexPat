use crate::{
    is_valid_instance_id,
    runtime_setup::{
        create_or_show_instance_window, monitor_position_size, pet_spawn_position_for_slot,
        position_is_visible, reset_position_for_index, save_settings,
    },
    AppState, WindowPosition, PET_HEIGHT, PET_WIDTH, SAFE_MARGIN,
};
use serde::Serialize;
use tauri::{AppHandle, Manager, PhysicalPosition, PhysicalSize, WebviewWindow};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct WindowLayeringDiagnostics {
    pub(crate) always_on_top_requested: bool,
    pub(crate) visible_on_all_workspaces_requested: bool,
    pub(crate) skip_taskbar_requested: bool,
    pub(crate) transparent_requested: bool,
    pub(crate) last_show_action_at: String,
    pub(crate) last_focus_action_at: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ScreenshotObservationDiagnostics {
    pub(crate) desktop_capture: String,
    pub(crate) pet_region_capture: String,
    pub(crate) reason_code: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct PetVisibilityDiagnostics {
    pub(crate) ok: bool,
    pub(crate) instance_id: String,
    pub(crate) window_label: String,
    pub(crate) visible: bool,
    pub(crate) position: WindowPosition,
    pub(crate) size: WindowSize,
    pub(crate) monitor_summary: String,
    pub(crate) monitor_scale_factor: f64,
    pub(crate) layering: WindowLayeringDiagnostics,
    pub(crate) screenshot_observation: ScreenshotObservationDiagnostics,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct WindowSize {
    pub(crate) width: u32,
    pub(crate) height: u32,
}

pub(crate) fn pet_visibility_diagnostics(
    app: &AppHandle,
    state: &AppState,
    instance_id: &str,
) -> Result<PetVisibilityDiagnostics, String> {
    if !is_valid_instance_id(instance_id) {
        return Err("instance_id_invalid".to_string());
    }

    let (target_instance_id, window_label, configured_visible, configured_position) = {
        let settings = state.settings.lock().map_err(|error| error.to_string())?;
        if instance_id == "default" {
            (
                "default".to_string(),
                "main".to_string(),
                settings.pet_visible,
                WindowPosition {
                    x: settings.pet_x.unwrap_or(SAFE_MARGIN),
                    y: settings.pet_y.unwrap_or(SAFE_MARGIN),
                },
            )
        } else {
            let instance = settings
                .pet_instances
                .iter()
                .find(|instance| instance.instance_id == instance_id)
                .ok_or_else(|| "instance_not_found".to_string())?;
            (
                instance.instance_id.clone(),
                instance.window_label.clone(),
                instance.visible,
                instance.position.clone(),
            )
        }
    };

    let Some(window) = app.get_webview_window(&window_label) else {
        return Ok(visibility_diagnostics_from_parts(
            target_instance_id,
            window_label,
            false,
            configured_position,
            WindowSize {
                width: PET_WIDTH,
                height: PET_HEIGHT,
            },
            monitor_summary(app),
            monitor_scale_factor(app),
            "window_not_found",
        ));
    };

    let position = window
        .outer_position()
        .map(|position| WindowPosition {
            x: position.x,
            y: position.y,
        })
        .unwrap_or(configured_position);
    let size = window
        .outer_size()
        .map(|size| window_size_for_visibility(app, size))
        .unwrap_or(WindowSize {
            width: PET_WIDTH,
            height: PET_HEIGHT,
        });
    let window_visible = window.is_visible().unwrap_or(configured_visible);
    let visible = configured_visible && window_visible;
    let reason_code = if !configured_visible || !window_visible {
        "window_hidden"
    } else if !position_is_visible(
        app,
        PhysicalPosition::new(position.x, position.y),
        PhysicalSize::new(size.width, size.height),
    ) {
        "window_offscreen"
    } else {
        "desktop_visible"
    };

    Ok(visibility_diagnostics_from_parts(
        target_instance_id,
        window_label,
        visible,
        position,
        size,
        monitor_summary(app),
        monitor_scale_factor(app),
        reason_code,
    ))
}

pub(crate) fn resurface_pet_instance_by_id(
    app: &AppHandle,
    state: &AppState,
    instance_id: &str,
    reset_position: bool,
) -> Result<PetVisibilityDiagnostics, String> {
    if !is_valid_instance_id(instance_id) {
        return Err("instance_id_invalid".to_string());
    }

    if instance_id == "default" {
        let position = if reset_position {
            Some(pet_spawn_position_for_slot(
                app,
                PhysicalSize::new(PET_WIDTH, PET_HEIGHT),
                0,
            ))
        } else {
            None
        };
        {
            let mut settings = state.settings.lock().map_err(|error| error.to_string())?;
            settings.pet_visible = true;
            if let Some(position) = position {
                settings.pet_x = Some(position.x);
                settings.pet_y = Some(position.y);
            }
            let snapshot = settings.clone();
            drop(settings);
            save_settings(state, &snapshot)?;
        }
        if let Some(window) = app.get_webview_window("main") {
            if let Some(position) = position {
                window
                    .set_position(position)
                    .map_err(|error| error.to_string())?;
            }
            apply_pet_window_layering(&window)?;
            window.show().map_err(|error| error.to_string())?;
            window.set_focus().map_err(|error| error.to_string())?;
        }
        return pet_visibility_diagnostics(app, state, instance_id);
    }

    let (instance, slot, reset_to) = {
        let mut settings = state.settings.lock().map_err(|error| error.to_string())?;
        let index = settings
            .pet_instances
            .iter()
            .position(|instance| instance.instance_id == instance_id)
            .ok_or_else(|| "instance_not_found".to_string())?;
        let reset_to = if reset_position {
            Some(reset_position_for_index(app, index + 1))
        } else {
            None
        };
        let instance = settings
            .pet_instances
            .get_mut(index)
            .ok_or_else(|| "instance_not_found".to_string())?;
        instance.visible = true;
        if let Some(position) = reset_to {
            instance.position = WindowPosition {
                x: position.x,
                y: position.y,
            };
        }
        instance.updated_at = crate::now_millis();
        let instance = instance.clone();
        let snapshot = settings.clone();
        drop(settings);
        save_settings(state, &snapshot)?;
        (instance, index + 1, reset_to)
    };

    create_or_show_instance_window(app, state, &instance, slot).map_err(|error| error.to_string())?;
    if let Some(position) = reset_to {
        if let Some(window) = app.get_webview_window(&instance.window_label) {
            window
                .set_position(position)
                .map_err(|error| error.to_string())?;
            apply_pet_window_layering(&window)?;
            window.show().map_err(|error| error.to_string())?;
            window.set_focus().map_err(|error| error.to_string())?;
        }
    }

    pet_visibility_diagnostics(app, state, instance_id)
}

fn visibility_diagnostics_from_parts(
    instance_id: String,
    window_label: String,
    visible: bool,
    position: WindowPosition,
    size: WindowSize,
    monitor_summary: String,
    monitor_scale_factor: f64,
    reason_code: &str,
) -> PetVisibilityDiagnostics {
    PetVisibilityDiagnostics {
        ok: reason_code == "desktop_visible",
        instance_id,
        window_label,
        visible,
        position,
        size,
        monitor_summary,
        monitor_scale_factor,
        layering: WindowLayeringDiagnostics {
            always_on_top_requested: true,
            visible_on_all_workspaces_requested: true,
            skip_taskbar_requested: true,
            transparent_requested: true,
            last_show_action_at: "redacted-time".to_string(),
            last_focus_action_at: "redacted-time".to_string(),
        },
        screenshot_observation: ScreenshotObservationDiagnostics {
            desktop_capture: if reason_code == "desktop_visible" {
                "pending".to_string()
            } else {
                "not_visible".to_string()
            },
            pet_region_capture: if reason_code == "desktop_visible" {
                "pending".to_string()
            } else {
                "not_visible".to_string()
            },
            reason_code: reason_code.to_string(),
        },
    }
}

fn monitor_summary(app: &AppHandle) -> String {
    app.primary_monitor()
        .ok()
        .flatten()
        .map(|monitor| {
            let size = monitor_position_size(&monitor);
            format!("monitor_primary_{}x{}", size.0, size.1)
        })
        .unwrap_or_else(|| "monitor_unavailable".to_string())
}

fn monitor_scale_factor(app: &AppHandle) -> f64 {
    app.primary_monitor()
        .ok()
        .flatten()
        .map(|monitor| monitor.scale_factor())
        .unwrap_or(1.0)
}

fn window_size_for_visibility(app: &AppHandle, physical_size: PhysicalSize<u32>) -> WindowSize {
    let scale_factor = monitor_scale_factor(app);
    if scale_factor <= 0.0 {
        return WindowSize {
            width: physical_size.width,
            height: physical_size.height,
        };
    }
    WindowSize {
        width: (physical_size.width as f64 / scale_factor).round() as u32,
        height: (physical_size.height as f64 / scale_factor).round() as u32,
    }
}

fn apply_pet_window_layering(window: &WebviewWindow) -> Result<(), String> {
    window
        .set_visible_on_all_workspaces(true)
        .map_err(|error| error.to_string())?;
    window
        .set_always_on_top(true)
        .map_err(|error| error.to_string())?;
    window.set_shadow(false).map_err(|error| error.to_string())
}
