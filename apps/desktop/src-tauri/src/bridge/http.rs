use super::{
    protocol::{accepted_event_from_value, capabilities, validate_pet_event},
    rate_limit::RateLimiter,
    received_at, BridgeDebugHandle, EventSummary, RejectReasonCode, LISTEN_ADDRESS,
};
use crate::sound::SoundHandle;
use axum::{
    body::Bytes,
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    routing::{delete, get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{
    net::SocketAddr,
    sync::{Arc, Mutex},
};
use tauri::{AppHandle, Emitter, Manager};
use tokio::{net::TcpListener, sync::oneshot};

mod rejection;
mod instances;
mod events;
use events::{post_event, post_instance_event, post_invalid_instance_path};
#[cfg(test)]
use events::{
    classify_validation_error, infer_validation_reason_field, safe_level, safe_source_id,
};
use instances::{
    delete_instance, get_instance_visibility, get_instances, post_instance,
    post_instance_visibility_resurface,
};
use rejection::{
    authorize, error_response, reason_code_str, sanitized_reason, SanitizedRejectReason,
};

#[derive(Clone)]
struct HttpState {
    app: AppHandle,
    token: String,
    debug: BridgeDebugHandle,
    sound: SoundHandle,
    rate_limiter: Arc<Mutex<RateLimiter>>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct HealthResponse {
    ok: bool,
    app: &'static str,
    phase: &'static str,
    listen_address: &'static str,
}

#[derive(Clone)]
struct EventTarget {
    instance_id: String,
    window_label: String,
    visible: bool,
}

pub fn spawn_server(
    app: AppHandle,
    token: String,
    debug: BridgeDebugHandle,
    sound: SoundHandle,
    shutdown_rx: oneshot::Receiver<()>,
) {
    let state = HttpState {
        app,
        token,
        debug: debug.clone(),
        sound,
        rate_limiter: Arc::new(Mutex::new(RateLimiter::default())),
    };

    tauri::async_runtime::spawn(async move {
        let address = match LISTEN_ADDRESS.parse::<SocketAddr>() {
            Ok(address) => address,
            Err(error) => {
                debug.set_startup_error(error.to_string());
                debug.record_rejected(EventSummary {
                    id: debug.event_id(),
                    received_at: received_at(),
                    source_id: None,
                    level: None,
                    title_preview: None,
                    message_preview: None,
                    target_instance_id: None,
                    target_window_label: None,
                    status: StatusCode::SERVICE_UNAVAILABLE.as_u16(),
                    accepted: false,
                    reason_code: Some(RejectReasonCode::BridgeUnavailable),
                    reason_field: Some("bridge".to_string()),
                    reason: Some("listen address is invalid".to_string()),
                });
                return;
            }
        };

        let listener = match TcpListener::bind(address).await {
            Ok(listener) => listener,
            Err(error) => {
                debug.set_startup_error(error.to_string());
                debug.record_rejected(EventSummary {
                    id: debug.event_id(),
                    received_at: received_at(),
                    source_id: None,
                    level: None,
                    title_preview: None,
                    message_preview: None,
                    target_instance_id: None,
                    target_window_label: None,
                    status: StatusCode::SERVICE_UNAVAILABLE.as_u16(),
                    accepted: false,
                    reason_code: Some(RejectReasonCode::PortBindFailed),
                    reason_field: Some("bridge".to_string()),
                    reason: Some("port bind failed".to_string()),
                });
                return;
            }
        };

        debug.set_enabled(true);
        let app = bridge_router(state);

        let server = axum::serve(listener, app).with_graceful_shutdown(async {
            let _ = shutdown_rx.await;
        });

        if let Err(error) = server.await {
            debug.set_startup_error(error.to_string());
        }
    });
}

fn bridge_router(state: HttpState) -> Router {
    Router::new()
        .route("/api/health", get(health))
        .route("/api/capabilities", get(get_capabilities))
        .route("/api/diagnostics", get(get_diagnostics))
        .route("/api/settings/open", post(post_settings_open))
        .route("/api/instances", get(get_instances).post(post_instance))
        .route("/api/instances/:instance_id", delete(delete_instance))
        .route(
            "/api/instances/:instance_id/visibility",
            get(get_instance_visibility),
        )
        .route(
            "/api/instances/:instance_id/visibility/resurface",
            post(post_instance_visibility_resurface),
        )
        .route("/api/events", post(post_event))
        .route(
            "/api/instances/:instance_id/events",
            post(post_instance_event),
        )
        .route(
            "/api/instances/:invalid_a/:invalid_b/events",
            post(post_invalid_instance_path),
        )
        .route(
            "/api/instances/:invalid_a/:invalid_b/:invalid_c/events",
            post(post_invalid_instance_path),
        )
        .with_state(state)
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        ok: true,
        app: "agent-desktop-pet",
        phase: "phase-4",
        listen_address: LISTEN_ADDRESS,
    })
}

async fn get_capabilities() -> Json<impl Serialize> {
    Json(capabilities())
}

async fn get_diagnostics(State(state): State<HttpState>, headers: HeaderMap) -> impl IntoResponse {
    if let Err((status, code)) = authorize(&headers, &state.token) {
        let reason = sanitized_reason(code, "auth");
        state.debug.record_rejected(rejected_summary(
            state.debug.event_id(),
            None,
            None,
            None,
            None,
            None,
            status,
            reason,
        ));
        return (
            status,
            Json(json!({
                "ok": false,
                "accepted": false,
                "reasonCode": reason_code_str(code),
                "reasonField": reason.field,
                "reason": reason.message
            })),
        )
            .into_response();
    }

    Json(state.debug.snapshot(state.sound.diagnostics())).into_response()
}

async fn post_settings_open(State(state): State<HttpState>, headers: HeaderMap) -> impl IntoResponse {
    if let Err((status, code)) = authorize(&headers, &state.token) {
        let reason = sanitized_reason(code, "auth");
        state.debug.record_rejected(rejected_summary(
            state.debug.event_id(),
            None,
            None,
            None,
            None,
            None,
            status,
            reason,
        ));
        return error_response(status, reason).into_response();
    }

    match crate::open_settings_window(&state.app) {
        Ok(()) => Json(json!({
            "ok": true,
            "windowLabel": "settings",
            "reasonCode": "settings_opened"
        }))
        .into_response(),
        Err(_error) => {
            let reason = sanitized_reason(RejectReasonCode::BridgeUnavailable, "bridge");
            error_response(StatusCode::SERVICE_UNAVAILABLE, reason).into_response()
        }
    }
}

fn is_valid_instance_id(value: &str) -> bool {
    let length = value.chars().count();
    (1..=64).contains(&length)
        && !value.contains("..")
        && value.chars().all(|character| {
            character.is_ascii_alphanumeric() || matches!(character, '.' | '_' | '-')
        })
}

fn is_valid_display_name(value: &str) -> bool {
    let length = value.chars().count();
    (1..=40).contains(&length)
        && !value
            .chars()
            .any(|character| character.is_control() || matches!(character, '/' | '\\' | ':'))
}

fn is_valid_optional_label(value: Option<&str>) -> bool {
    let Some(value) = value else {
        return true;
    };
    value.chars().count() <= 80
        && !value
            .chars()
            .any(|character| character.is_control() || matches!(character, '/' | '\\' | ':'))
}

fn is_valid_optional_workspace_hash(value: Option<&str>) -> bool {
    let Some(value) = value else {
        return true;
    };
    let length = value.chars().count();
    (1..=128).contains(&length)
        && value
            .chars()
            .all(|character| character.is_ascii_alphanumeric() || matches!(character, '_' | '-'))
}

fn rejected_summary(
    id: String,
    source_id: Option<String>,
    level: Option<String>,
    title: Option<String>,
    message: Option<String>,
    target: Option<&EventTarget>,
    status: StatusCode,
    reason: SanitizedRejectReason,
) -> EventSummary {
    EventSummary {
        id,
        received_at: received_at(),
        source_id,
        level,
        title_preview: preview(title.as_deref(), 80),
        message_preview: preview(message.as_deref(), 120),
        target_instance_id: target.map(|target| target.instance_id.clone()),
        target_window_label: target.map(|target| target.window_label.clone()),
        status: status.as_u16(),
        accepted: false,
        reason_code: Some(reason.code),
        reason_field: Some(reason.field.to_string()),
        reason: Some(reason.message.to_string()),
    }
}

fn is_valid_source_id(value: &str) -> bool {
    let length = value.chars().count();
    (1..=64).contains(&length)
        && value.chars().all(|character| {
            character.is_ascii_alphanumeric() || matches!(character, '.' | '_' | '-')
        })
}

fn preview(value: Option<&str>, max_chars: usize) -> Option<String> {
    value.map(|value| value.chars().take(max_chars).collect())
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn rejected_for_invalid_payload(value: Value) -> EventSummary {
        let error = validate_pet_event(&value).expect_err("payload should be invalid");
        let code = classify_validation_error(&error);
        let field = infer_validation_reason_field(&value, &error);
        rejected_summary(
            "evt_test".to_string(),
            safe_source_id(&value),
            safe_level(&value),
            None,
            None,
            None,
            StatusCode::BAD_REQUEST,
            sanitized_reason(code, field),
        )
    }

    fn assert_no_sensitive_text(summary: &EventSummary) {
        let serialized = serde_json::to_string(summary).expect("summary should serialize");
        for forbidden in [
            "../../x.wav",
            "file://",
            "http://",
            "https://",
            "/tmp/",
            "Application Support",
            "api-token.json",
            "/Users/",
            "C:\\Users\\",
            "nope",
        ] {
            assert!(
                !serialized.contains(forbidden),
                "summary should not contain forbidden text {forbidden}: {serialized}"
            );
        }
    }

    fn event_with_sound(sound: &str) -> Value {
        json!({
            "source": {
                "id": "smoke.local",
                "kind": "custom",
                "name": "Smoke"
            },
            "level": "success",
            "sound": sound
        })
    }

    #[test]
    fn sanitizes_invalid_sound_paths_and_urls() {
        for sound in [
            "../../x.wav",
            "file:///tmp/x.wav",
            "https://example.com/x.wav",
            "/Users/test/secret.wav",
            "C:\\Users\\test\\secret.wav",
        ] {
            let summary = rejected_for_invalid_payload(event_with_sound(sound));
            assert_eq!(
                summary.reason_code,
                Some(RejectReasonCode::WhitelistInvalid)
            );
            assert_eq!(summary.reason_field.as_deref(), Some("sound"));
            assert_eq!(
                summary.reason.as_deref(),
                Some("sound is not an accepted ID")
            );
            assert_no_sensitive_text(&summary);
        }
    }

    #[test]
    fn sanitizes_invalid_level_without_echoing_value() {
        let summary = rejected_for_invalid_payload(json!({
            "source": {
                "id": "smoke.local",
                "kind": "custom"
            },
            "level": "nope"
        }));
        assert_eq!(summary.reason_field.as_deref(), Some("level"));
        assert_eq!(
            summary.reason.as_deref(),
            Some("level is not an accepted value")
        );
        assert_eq!(summary.level, None);
        assert_no_sensitive_text(&summary);
    }

    #[test]
    fn sanitizes_invalid_source_id() {
        let summary = rejected_for_invalid_payload(json!({
            "source": {
                "id": "../../secret",
                "kind": "custom"
            },
            "level": "success"
        }));
        assert_eq!(summary.source_id.as_deref(), Some("invalid_source"));
        assert_eq!(summary.reason_field.as_deref(), Some("source.id"));
        assert_eq!(summary.reason.as_deref(), Some("source id is invalid"));
        assert_no_sensitive_text(&summary);
    }

    #[test]
    fn keeps_auth_and_rate_limit_reasons_readable() {
        let auth = sanitized_reason(RejectReasonCode::AuthMissing, "auth");
        assert_eq!(auth.field, "auth");
        assert_eq!(auth.message, "authorization bearer token is required");

        let rate_limited = sanitized_reason(RejectReasonCode::RateLimited, "rate_limit");
        assert_eq!(rate_limited.field, "rate_limit");
        assert_eq!(rate_limited.message, "source rate limit exceeded");
    }

    #[test]
    fn error_response_uses_sanitized_reason_and_field() {
        let (_status, Json(body)) = error_response(
            StatusCode::BAD_REQUEST,
            sanitized_reason(RejectReasonCode::WhitelistInvalid, "sound"),
        );
        assert_eq!(body["reasonCode"], "whitelist_invalid");
        assert_eq!(body["reasonField"], "sound");
        assert_eq!(body["reason"], "sound is not an accepted ID");
    }
}
