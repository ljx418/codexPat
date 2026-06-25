use super::*;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreateInstanceRequest {
    source_kind: Option<String>,
    source_id: Option<String>,
    display_name: Option<String>,
    workspace_label: Option<String>,
    workspace_hash: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ResurfaceVisibilityRequest {
    #[serde(default)]
    reset_position: bool,
}

pub(super) async fn get_instances(
    State(state): State<HttpState>,
    headers: HeaderMap,
) -> impl IntoResponse {
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

    match state.app.try_state::<crate::AppState>() {
        Some(app_state) => match app_state.settings.lock() {
            Ok(settings) => Json(json!({
                "ok": true,
                "instances": crate::pet_instance_views(&settings),
                "limits": crate::pet_instance_limits(&settings)
            }))
            .into_response(),
            Err(_error) => {
                let reason = sanitized_reason(RejectReasonCode::BridgeUnavailable, "bridge");
                error_response(StatusCode::SERVICE_UNAVAILABLE, reason).into_response()
            }
        },
        None => {
            let reason = sanitized_reason(RejectReasonCode::BridgeUnavailable, "bridge");
            error_response(StatusCode::SERVICE_UNAVAILABLE, reason).into_response()
        }
    }
}

pub(super) async fn post_instance(
    State(state): State<HttpState>,
    headers: HeaderMap,
    body: Bytes,
) -> impl IntoResponse {
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

    if body.len() > 4096 {
        let reason = sanitized_reason(RejectReasonCode::PayloadTooLarge, "payload");
        state.debug.record_rejected(rejected_summary(
            state.debug.event_id(),
            None,
            None,
            None,
            None,
            None,
            StatusCode::BAD_REQUEST,
            reason,
        ));
        return error_response(StatusCode::BAD_REQUEST, reason).into_response();
    }

    let request = match serde_json::from_slice::<CreateInstanceRequest>(&body) {
        Ok(request) => request,
        Err(_error) => {
            let reason = sanitized_reason(RejectReasonCode::SchemaInvalid, "payload");
            state.debug.record_rejected(rejected_summary(
                state.debug.event_id(),
                None,
                None,
                None,
                None,
                None,
                StatusCode::BAD_REQUEST,
                reason,
            ));
            return error_response(StatusCode::BAD_REQUEST, reason).into_response();
        }
    };

    let source_kind = request.source_kind.unwrap_or_else(|| "codex".to_string());
    if !matches!(source_kind.as_str(), "codex" | "custom") {
        let reason = sanitized_reason(RejectReasonCode::SourceKindInvalid, "source.kind");
        state.debug.record_rejected(rejected_summary(
            state.debug.event_id(),
            None,
            None,
            None,
            None,
            None,
            StatusCode::BAD_REQUEST,
            reason,
        ));
        return error_response(StatusCode::BAD_REQUEST, reason).into_response();
    }

    let source_id = request.source_id.unwrap_or_else(|| {
        if source_kind == "codex" {
            "codex.local".to_string()
        } else {
            "custom.local".to_string()
        }
    });
    if !is_valid_source_id(&source_id) {
        let reason = sanitized_reason(RejectReasonCode::WhitelistInvalid, "source.id");
        state.debug.record_rejected(rejected_summary(
            state.debug.event_id(),
            None,
            None,
            None,
            None,
            None,
            StatusCode::BAD_REQUEST,
            reason,
        ));
        return error_response(StatusCode::BAD_REQUEST, reason).into_response();
    }

    let display_name = request
        .display_name
        .map(|value| value.trim().to_string())
        .unwrap_or_else(|| "Codex Cat".to_string());
    if !is_valid_display_name(&display_name) {
        let reason = sanitized_reason(RejectReasonCode::DisplayNameInvalid, "display_name");
        state.debug.record_rejected(rejected_summary(
            state.debug.event_id(),
            None,
            None,
            None,
            None,
            None,
            StatusCode::BAD_REQUEST,
            reason,
        ));
        return error_response(StatusCode::BAD_REQUEST, reason).into_response();
    }

    if !is_valid_optional_label(request.workspace_label.as_deref()) {
        let reason = sanitized_reason(RejectReasonCode::WorkspaceLabelInvalid, "workspace_label");
        state.debug.record_rejected(rejected_summary(
            state.debug.event_id(),
            None,
            None,
            None,
            None,
            None,
            StatusCode::BAD_REQUEST,
            reason,
        ));
        return error_response(StatusCode::BAD_REQUEST, reason).into_response();
    }

    if !is_valid_optional_workspace_hash(request.workspace_hash.as_deref()) {
        let reason = sanitized_reason(RejectReasonCode::WorkspaceHashInvalid, "workspace_hash");
        state.debug.record_rejected(rejected_summary(
            state.debug.event_id(),
            None,
            None,
            None,
            None,
            None,
            StatusCode::BAD_REQUEST,
            reason,
        ));
        return error_response(StatusCode::BAD_REQUEST, reason).into_response();
    }

    let app_state = match state.app.try_state::<crate::AppState>() {
        Some(app_state) => app_state,
        None => {
            let reason = sanitized_reason(RejectReasonCode::BridgeUnavailable, "bridge");
            return error_response(StatusCode::SERVICE_UNAVAILABLE, reason).into_response();
        }
    };
    if let Ok(settings) = app_state.settings.lock() {
        if crate::pet_instance_limits(&settings).at_hard_limit {
            let reason = sanitized_reason(RejectReasonCode::InstanceLimitReached, "instance_limit");
            state.debug.record_rejected(rejected_summary(
                state.debug.event_id(),
                None,
                None,
                None,
                None,
                None,
                StatusCode::CONFLICT,
                reason,
            ));
            return error_response(StatusCode::CONFLICT, reason).into_response();
        }
    }
    let instance = match crate::create_pet_instance_for_source(
        &state.app,
        &app_state,
        display_name,
        source_kind,
        source_id,
        request.workspace_label,
        request.workspace_hash,
    ) {
        Ok(instance) => instance,
        Err(error) => {
            if error == "instance_limit_reached" {
                let reason =
                    sanitized_reason(RejectReasonCode::InstanceLimitReached, "instance_limit");
                return error_response(StatusCode::CONFLICT, reason).into_response();
            }
            let reason = sanitized_reason(RejectReasonCode::BridgeUnavailable, "bridge");
            return error_response(StatusCode::SERVICE_UNAVAILABLE, reason).into_response();
        }
    };

    Json(json!({
        "ok": true,
        "created": true,
        "instanceId": instance.instance_id,
        "displayName": instance.display_name,
        "windowLabel": instance.window_label,
        "export": format!("export AGENT_DESKTOP_PET_INSTANCE_ID={}", instance.instance_id),
        "instance": instance
    }))
    .into_response()
}

pub(super) async fn delete_instance(
    State(state): State<HttpState>,
    Path(instance_id): Path<String>,
    headers: HeaderMap,
) -> impl IntoResponse {
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

    if !is_valid_instance_id(&instance_id) {
        let reason = sanitized_reason(RejectReasonCode::InstanceIdInvalid, "instance");
        state.debug.record_rejected(rejected_summary(
            state.debug.event_id(),
            None,
            None,
            None,
            None,
            None,
            StatusCode::BAD_REQUEST,
            reason,
        ));
        return error_response(StatusCode::BAD_REQUEST, reason).into_response();
    }

    if instance_id == "default" {
        let reason = sanitized_reason(RejectReasonCode::DefaultInstanceCannotDetach, "instance");
        state.debug.record_rejected(rejected_summary(
            state.debug.event_id(),
            None,
            None,
            None,
            None,
            None,
            StatusCode::BAD_REQUEST,
            reason,
        ));
        return error_response(StatusCode::BAD_REQUEST, reason).into_response();
    }

    let app_state = match state.app.try_state::<crate::AppState>() {
        Some(app_state) => app_state,
        None => {
            let reason = sanitized_reason(RejectReasonCode::BridgeUnavailable, "bridge");
            return error_response(StatusCode::SERVICE_UNAVAILABLE, reason).into_response();
        }
    };

    match crate::detach_pet_instance_by_id(&state.app, &app_state, &instance_id) {
        Ok(instance) => Json(json!({
            "ok": true,
            "detached": true,
            "instanceId": instance.instance_id,
            "windowLabel": instance.window_label
        }))
        .into_response(),
        Err(error) if error == "instance_not_found" => {
            let reason = sanitized_reason(RejectReasonCode::InstanceNotFound, "instance");
            state.debug.record_rejected(rejected_summary(
                state.debug.event_id(),
                None,
                None,
                None,
                None,
                None,
                StatusCode::NOT_FOUND,
                reason,
            ));
            error_response(StatusCode::NOT_FOUND, reason).into_response()
        }
        Err(error) if error == "default_instance_cannot_detach" => {
            let reason = sanitized_reason(RejectReasonCode::DefaultInstanceCannotDetach, "instance");
            state.debug.record_rejected(rejected_summary(
                state.debug.event_id(),
                None,
                None,
                None,
                None,
                None,
                StatusCode::BAD_REQUEST,
                reason,
            ));
            error_response(StatusCode::BAD_REQUEST, reason).into_response()
        }
        Err(_error) => {
            let reason = sanitized_reason(RejectReasonCode::BridgeUnavailable, "bridge");
            error_response(StatusCode::SERVICE_UNAVAILABLE, reason).into_response()
        }
    }
}

pub(super) async fn get_instance_visibility(
    State(state): State<HttpState>,
    Path(instance_id): Path<String>,
    headers: HeaderMap,
) -> impl IntoResponse {
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

    if !is_valid_instance_id(&instance_id) {
        let reason = sanitized_reason(RejectReasonCode::InstanceIdInvalid, "instance");
        state.debug.record_rejected(rejected_summary(
            state.debug.event_id(),
            None,
            None,
            None,
            None,
            None,
            StatusCode::BAD_REQUEST,
            reason,
        ));
        return error_response(StatusCode::BAD_REQUEST, reason).into_response();
    }

    let app_state = match state.app.try_state::<crate::AppState>() {
        Some(app_state) => app_state,
        None => {
            let reason = sanitized_reason(RejectReasonCode::BridgeUnavailable, "bridge");
            return error_response(StatusCode::SERVICE_UNAVAILABLE, reason).into_response();
        }
    };

    match crate::pet_visibility_diagnostics(&state.app, &app_state, &instance_id) {
        Ok(visibility) => Json(json!({
            "ok": true,
            "visibility": visibility
        }))
        .into_response(),
        Err(error) if error == "instance_not_found" => {
            let reason = sanitized_reason(RejectReasonCode::InstanceNotFound, "instance");
            error_response(StatusCode::NOT_FOUND, reason).into_response()
        }
        Err(error) if error == "instance_id_invalid" => {
            let reason = sanitized_reason(RejectReasonCode::InstanceIdInvalid, "instance");
            error_response(StatusCode::BAD_REQUEST, reason).into_response()
        }
        Err(_error) => {
            let reason = sanitized_reason(RejectReasonCode::BridgeUnavailable, "bridge");
            error_response(StatusCode::SERVICE_UNAVAILABLE, reason).into_response()
        }
    }
}

pub(super) async fn post_instance_visibility_resurface(
    State(state): State<HttpState>,
    Path(instance_id): Path<String>,
    headers: HeaderMap,
    body: Bytes,
) -> impl IntoResponse {
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

    if !is_valid_instance_id(&instance_id) {
        let reason = sanitized_reason(RejectReasonCode::InstanceIdInvalid, "instance");
        state.debug.record_rejected(rejected_summary(
            state.debug.event_id(),
            None,
            None,
            None,
            None,
            None,
            StatusCode::BAD_REQUEST,
            reason,
        ));
        return error_response(StatusCode::BAD_REQUEST, reason).into_response();
    }

    if body.len() > 1024 {
        let reason = sanitized_reason(RejectReasonCode::PayloadTooLarge, "payload");
        state.debug.record_rejected(rejected_summary(
            state.debug.event_id(),
            None,
            None,
            None,
            None,
            None,
            StatusCode::BAD_REQUEST,
            reason,
        ));
        return error_response(StatusCode::BAD_REQUEST, reason).into_response();
    }

    let request = if body.is_empty() {
        ResurfaceVisibilityRequest {
            reset_position: false,
        }
    } else {
        match serde_json::from_slice::<ResurfaceVisibilityRequest>(&body) {
            Ok(request) => request,
            Err(_error) => {
                let reason = sanitized_reason(RejectReasonCode::SchemaInvalid, "payload");
                state.debug.record_rejected(rejected_summary(
                    state.debug.event_id(),
                    None,
                    None,
                    None,
                    None,
                    None,
                    StatusCode::BAD_REQUEST,
                    reason,
                ));
                return error_response(StatusCode::BAD_REQUEST, reason).into_response();
            }
        }
    };

    let app_state = match state.app.try_state::<crate::AppState>() {
        Some(app_state) => app_state,
        None => {
            let reason = sanitized_reason(RejectReasonCode::BridgeUnavailable, "bridge");
            return error_response(StatusCode::SERVICE_UNAVAILABLE, reason).into_response();
        }
    };

    match crate::resurface_pet_instance_by_id(
        &state.app,
        &app_state,
        &instance_id,
        request.reset_position,
    ) {
        Ok(visibility) => Json(json!({
            "ok": true,
            "resurfaced": true,
            "visibility": visibility
        }))
        .into_response(),
        Err(error) if error == "instance_not_found" => {
            let reason = sanitized_reason(RejectReasonCode::InstanceNotFound, "instance");
            error_response(StatusCode::NOT_FOUND, reason).into_response()
        }
        Err(error) if error == "instance_id_invalid" => {
            let reason = sanitized_reason(RejectReasonCode::InstanceIdInvalid, "instance");
            error_response(StatusCode::BAD_REQUEST, reason).into_response()
        }
        Err(_error) => {
            let reason = sanitized_reason(RejectReasonCode::BridgeUnavailable, "bridge");
            error_response(StatusCode::SERVICE_UNAVAILABLE, reason).into_response()
        }
    }
}
