use super::*;

pub(super) async fn post_event(
    State(state): State<HttpState>,
    headers: HeaderMap,
    body: Bytes,
) -> impl IntoResponse {
    post_event_for_target(state, headers, body, None).await
}

pub(super) async fn post_instance_event(
    State(state): State<HttpState>,
    Path(instance_id): Path<String>,
    headers: HeaderMap,
    body: Bytes,
) -> impl IntoResponse {
    if let Err((status, code)) = authorize(&headers, &state.token) {
        let reason = sanitized_reason(code, "auth");
        let summary = rejected_summary(
            state.debug.event_id(),
            None,
            None,
            None,
            None,
            None,
            status,
            reason,
        );
        state.debug.record_rejected(summary);
        return error_response(status, reason).into_response();
    }

    let Some(target) = resolve_instance_target(&state, &instance_id) else {
        let reason = if is_valid_instance_id(&instance_id) {
            sanitized_reason(RejectReasonCode::InstanceNotFound, "instance")
        } else {
            sanitized_reason(RejectReasonCode::InstanceIdInvalid, "instance")
        };
        let status = if reason.code == RejectReasonCode::InstanceNotFound {
            StatusCode::NOT_FOUND
        } else {
            StatusCode::BAD_REQUEST
        };
        let summary = rejected_summary(
            state.debug.event_id(),
            None,
            None,
            None,
            None,
            None,
            status,
            reason,
        );
        state.debug.record_rejected(summary);
        return error_response(status, reason).into_response();
    };

    post_event_for_target_with_authorized_request(state, body, Some(target))
        .await
        .into_response()
}

pub(super) async fn post_invalid_instance_path(
    State(state): State<HttpState>,
    headers: HeaderMap,
    _body: Bytes,
) -> impl IntoResponse {
    if let Err((status, code)) = authorize(&headers, &state.token) {
        let reason = sanitized_reason(code, "auth");
        let summary = rejected_summary(
            state.debug.event_id(),
            None,
            None,
            None,
            None,
            None,
            status,
            reason,
        );
        state.debug.record_rejected(summary);
        return error_response(status, reason).into_response();
    }

    let reason = sanitized_reason(RejectReasonCode::InstanceIdInvalid, "instance");
    let summary = rejected_summary(
        state.debug.event_id(),
        None,
        None,
        None,
        None,
        None,
        StatusCode::BAD_REQUEST,
        reason,
    );
    state.debug.record_rejected(summary);
    error_response(StatusCode::BAD_REQUEST, reason).into_response()
}

async fn post_event_for_target(
    state: HttpState,
    headers: HeaderMap,
    body: Bytes,
    target: Option<EventTarget>,
) -> (StatusCode, Json<Value>) {
    if let Err((status, code)) = authorize(&headers, &state.token) {
        let reason = sanitized_reason(code, "auth");
        let summary = rejected_summary(
            state.debug.event_id(),
            None,
            None,
            None,
            None,
            target.as_ref(),
            status,
            reason,
        );
        state.debug.record_rejected(summary);
        return error_response(status, reason);
    }

    post_event_for_target_with_authorized_request(state, body, target).await
}

async fn post_event_for_target_with_authorized_request(
    state: HttpState,
    body: Bytes,
    target: Option<EventTarget>,
) -> (StatusCode, Json<Value>) {
    if body.len() > 8192 {
        let reason = sanitized_reason(RejectReasonCode::PayloadTooLarge, "payload");
        let summary = rejected_summary(
            state.debug.event_id(),
            None,
            None,
            None,
            None,
            target.as_ref(),
            StatusCode::BAD_REQUEST,
            reason,
        );
        state.debug.record_rejected(summary);
        return error_response(StatusCode::BAD_REQUEST, reason);
    }

    let value = match serde_json::from_slice::<Value>(&body) {
        Ok(value) => value,
        Err(_error) => {
            let reason = sanitized_reason(RejectReasonCode::SchemaInvalid, "payload");
            let summary = rejected_summary(
                state.debug.event_id(),
                None,
                None,
                None,
                None,
                target.as_ref(),
                StatusCode::BAD_REQUEST,
                reason,
            );
            state.debug.record_rejected(summary);
            return error_response(StatusCode::BAD_REQUEST, reason);
        }
    };

    if let Err(error) = validate_pet_event(&value) {
        let code = classify_validation_error(&error);
        let field = infer_validation_reason_field(&value, &error);
        let reason = sanitized_reason(code, field);
        let summary = rejected_summary(
            state.debug.event_id(),
            safe_source_id(&value),
            safe_level(&value),
            None,
            None,
            target.as_ref(),
            StatusCode::BAD_REQUEST,
            reason,
        );
        state.debug.record_rejected(summary);
        return error_response(StatusCode::BAD_REQUEST, reason);
    }

    let source_id_for_limit = rate_limit_key(&value, target.as_ref());
    if state
        .rate_limiter
        .lock()
        .map_err(|error| error.to_string())
        .and_then(|mut limiter| limiter.check(&source_id_for_limit))
        .is_err()
    {
        let reason = sanitized_reason(RejectReasonCode::RateLimited, "rate_limit");
        let summary = rejected_summary(
            state.debug.event_id(),
            source_id(&value),
            level(&value),
            string_field(&value, "title"),
            string_field(&value, "message"),
            target.as_ref(),
            StatusCode::TOO_MANY_REQUESTS,
            reason,
        );
        state.debug.record_rejected(summary);
        return error_response(StatusCode::TOO_MANY_REQUESTS, reason);
    }

    let received_at = received_at();
    let mut accepted = match accepted_event_from_value(value, received_at.clone()) {
        Ok(event) => event,
        Err(_error) => {
            let reason = sanitized_reason(RejectReasonCode::SchemaInvalid, "payload");
            let summary = rejected_summary(
                state.debug.event_id(),
                None,
                None,
                None,
                None,
                target.as_ref(),
                StatusCode::BAD_REQUEST,
                reason,
            );
            state.debug.record_rejected(summary);
            return error_response(StatusCode::BAD_REQUEST, reason);
        }
    };
    if let Some(target) = target.as_ref() {
        accepted.target_instance_id = Some(target.instance_id.clone());
        accepted.target_window_label = Some(target.window_label.clone());
    }

    let event_id = state.debug.event_id();
    if state
        .debug
        .admit_event(event_id.clone(), accepted.clone())
        .is_err()
    {
        let reason = sanitized_reason(RejectReasonCode::QueueFull, "queue");
        let summary = rejected_summary(
            event_id,
            Some(accepted.source.id),
            Some(accepted.level),
            accepted.title,
            accepted.message,
            target.as_ref(),
            StatusCode::TOO_MANY_REQUESTS,
            reason,
        );
        state.debug.record_rejected(summary);
        return error_response(StatusCode::TOO_MANY_REQUESTS, reason);
    }

    let summary = EventSummary {
        id: event_id.clone(),
        received_at: received_at.clone(),
        source_id: Some(accepted.source.id.clone()),
        level: Some(accepted.level.clone()),
        title_preview: preview(accepted.title.as_deref(), 80),
        message_preview: preview(accepted.message.as_deref(), 120),
        target_instance_id: target.as_ref().map(|target| target.instance_id.clone()),
        target_window_label: target.as_ref().map(|target| target.window_label.clone()),
        status: StatusCode::ACCEPTED.as_u16(),
        accepted: true,
        reason_code: None,
        reason_field: None,
        reason: None,
    };
    state.debug.record_accepted(summary);
    if let Some(target) = target.as_ref() {
        if let Some(app_state) = state.app.try_state::<crate::AppState>() {
            let _ = crate::update_pet_instance_runtime(
                &app_state,
                &target.instance_id,
                &accepted.level,
                &received_at,
            );
        }
    }

    let emit_result = if let Some(target) = target.as_ref() {
        if target.visible {
            state
                .app
                .get_webview_window(&target.window_label)
                .ok_or(())
                .and_then(|window| window.emit("pet-event:accepted", &accepted).map_err(|_| ()))
        } else {
            Ok(())
        }
    } else {
        state
            .app
            .emit("pet-event:accepted", &accepted)
            .map_err(|_| ())
    };
    if emit_result.is_err() {
        let reason = sanitized_reason(RejectReasonCode::BridgeUnavailable, "bridge");
        let summary = rejected_summary(
            event_id.clone(),
            Some(accepted.source.id),
            Some(accepted.level),
            accepted.title,
            accepted.message,
            target.as_ref(),
            StatusCode::INTERNAL_SERVER_ERROR,
            reason,
        );
        state.debug.record_rejected(summary);
        return error_response(StatusCode::SERVICE_UNAVAILABLE, reason);
    }

    state.debug.mark_emitted(&event_id);
    let target_visible = target.as_ref().map(|target| target.visible).unwrap_or(true);
    state.sound.handle_event(&accepted, target_visible);

    (
        StatusCode::ACCEPTED,
        Json(json!({
            "ok": true,
            "accepted": true,
            "eventId": event_id,
            "queued": true
        })),
    )
}

fn resolve_instance_target(state: &HttpState, instance_id: &str) -> Option<EventTarget> {
    if !is_valid_instance_id(instance_id) {
        return None;
    }
    let app_state = state.app.try_state::<crate::AppState>()?;
    let settings = app_state.settings.lock().ok()?;
    crate::pet_instance_target(&settings, instance_id).map(
        |(instance_id, window_label, visible)| EventTarget {
            instance_id,
            window_label,
            visible,
        },
    )
}

fn source_id(value: &Value) -> Option<String> {
    value
        .get("source")
        .and_then(|source| source.get("id"))
        .and_then(|id| id.as_str())
        .map(ToString::to_string)
}

fn rate_limit_key(value: &Value, target: Option<&EventTarget>) -> String {
    let source = source_id(value).unwrap_or_else(|| "unknown".to_string());
    match target {
        Some(target) => format!("{source}:{}", target.instance_id),
        None => format!("{source}:default"),
    }
}

pub(super) fn safe_source_id(value: &Value) -> Option<String> {
    match source_id(value) {
        Some(source_id) if is_valid_source_id(&source_id) => Some(source_id),
        Some(_) => Some("invalid_source".to_string()),
        None => Some("unknown".to_string()),
    }
}

fn level(value: &Value) -> Option<String> {
    value
        .get("level")
        .and_then(|level| level.as_str())
        .map(ToString::to_string)
}

pub(super) fn safe_level(value: &Value) -> Option<String> {
    level(value).filter(|level| {
        matches!(
            level.as_str(),
            "idle"
                | "thinking"
                | "running"
                | "success"
                | "warning"
                | "error"
                | "need_input"
                | "sleeping"
        )
    })
}

fn string_field(value: &Value, field: &str) -> Option<String> {
    value
        .get(field)
        .and_then(|value| value.as_str())
        .map(ToString::to_string)
}

pub(super) fn classify_validation_error(error: &str) -> RejectReasonCode {
    if error.contains("is not allowed") || error.contains("is not one of") {
        RejectReasonCode::WhitelistInvalid
    } else {
        RejectReasonCode::SchemaInvalid
    }
}

pub(super) fn infer_validation_reason_field(value: &Value, error: &str) -> &'static str {
    if source_id(value)
        .as_deref()
        .is_some_and(|source_id| !is_valid_source_id(source_id))
    {
        return "source.id";
    }
    if string_field(value, "sound")
        .as_deref()
        .is_some_and(|sound| !is_allowed_sound(sound))
    {
        return "sound";
    }
    if string_field(value, "action")
        .as_deref()
        .is_some_and(|action| !is_allowed_action_or_level(action))
    {
        return "action";
    }
    if value
        .get("hardware")
        .and_then(|hardware| hardware.get("light"))
        .and_then(|light| light.get("effect"))
        .and_then(|effect| effect.as_str())
        .is_some_and(|effect| !is_allowed_light_effect(effect))
    {
        return "hardware.light.effect";
    }
    if string_field(value, "level")
        .as_deref()
        .is_some_and(|level| !is_allowed_action_or_level(level))
    {
        return "level";
    }
    if string_field(value, "sound").is_some() && field_error_matches(error, "sound") {
        return "sound";
    }
    if string_field(value, "action").is_some() && field_error_matches(error, "action") {
        return "action";
    }
    if string_field(value, "level").is_some() && field_error_matches(error, "level") {
        return "level";
    }
    "payload"
}

fn is_allowed_action_or_level(value: &str) -> bool {
    matches!(
        value,
        "idle"
            | "thinking"
            | "running"
            | "success"
            | "warning"
            | "error"
            | "need_input"
            | "sleeping"
    )
}

fn is_allowed_sound(value: &str) -> bool {
    matches!(
        value,
        "none" | "success_chime" | "warning_chime" | "error_chime" | "need_input_chime"
    )
}

fn is_allowed_light_effect(value: &str) -> bool {
    matches!(
        value,
        "none"
            | "thinking_blue"
            | "running_cyan"
            | "success_green"
            | "warning_amber"
            | "error_red"
            | "need_input_purple"
            | "sleeping_warm_dim"
    )
}

fn field_error_matches(error: &str, field: &str) -> bool {
    error.contains(&format!("\"{field}\""))
        || error.contains(&format!("/{field}"))
        || error.contains(field)
}
