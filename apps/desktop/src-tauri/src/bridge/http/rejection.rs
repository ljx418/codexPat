use super::super::RejectReasonCode;
use axum::{
    http::{header::AUTHORIZATION, HeaderMap, StatusCode},
    Json,
};
use serde_json::{json, Value};

#[derive(Clone, Copy)]
pub(super) struct SanitizedRejectReason {
    pub(super) code: RejectReasonCode,
    pub(super) field: &'static str,
    pub(super) message: &'static str,
}

pub(super) fn authorize(
    headers: &HeaderMap,
    token: &str,
) -> Result<(), (StatusCode, RejectReasonCode)> {
    let Some(value) = headers.get(AUTHORIZATION) else {
        return Err((StatusCode::UNAUTHORIZED, RejectReasonCode::AuthMissing));
    };
    let Ok(value) = value.to_str() else {
        return Err((StatusCode::UNAUTHORIZED, RejectReasonCode::AuthInvalid));
    };
    if value == format!("Bearer {token}") {
        Ok(())
    } else {
        Err((StatusCode::UNAUTHORIZED, RejectReasonCode::AuthInvalid))
    }
}

pub(super) fn sanitized_reason(
    code: RejectReasonCode,
    field: &'static str,
) -> SanitizedRejectReason {
    let field = normalized_reason_field(code, field);
    SanitizedRejectReason {
        code,
        field,
        message: reason_for_field(code, field),
    }
}

fn normalized_reason_field(code: RejectReasonCode, field: &'static str) -> &'static str {
    match code {
        RejectReasonCode::AuthMissing | RejectReasonCode::AuthInvalid => "auth",
        RejectReasonCode::SchemaInvalid => match field {
            "source.id" | "level" | "action" | "sound" | "hardware.light.effect" => field,
            _ => "payload",
        },
        RejectReasonCode::WhitelistInvalid => match field {
            "level" | "action" | "sound" | "hardware.light.effect" => field,
            _ => "payload",
        },
        RejectReasonCode::PayloadTooLarge => "payload",
        RejectReasonCode::RateLimited => "rate_limit",
        RejectReasonCode::InstanceIdInvalid => "instance",
        RejectReasonCode::InstanceNotFound => "instance",
        RejectReasonCode::DefaultInstanceCannotDetach => "instance",
        RejectReasonCode::InstanceLimitReached => "instance_limit",
        RejectReasonCode::DisplayNameInvalid => "display_name",
        RejectReasonCode::SourceKindInvalid => "source.kind",
        RejectReasonCode::WorkspaceLabelInvalid => "workspace_label",
        RejectReasonCode::WorkspaceHashInvalid => "workspace_hash",
        RejectReasonCode::QueueFull | RejectReasonCode::QueueReplaced => "queue",
        RejectReasonCode::BridgeUnavailable
        | RejectReasonCode::PortBindFailed
        | RejectReasonCode::EmitFailed => "bridge",
    }
}

pub(super) fn error_response(
    status: StatusCode,
    reason: SanitizedRejectReason,
) -> (StatusCode, Json<Value>) {
    (
        status,
        Json(json!({
            "ok": false,
            "accepted": false,
            "reasonCode": reason_code_str(reason.code),
            "reasonField": reason.field,
            "reason": reason.message
        })),
    )
}

fn reason_for_field(code: RejectReasonCode, field: &'static str) -> &'static str {
    match code {
        RejectReasonCode::AuthMissing => "authorization bearer token is required",
        RejectReasonCode::AuthInvalid => "authorization bearer token is invalid",
        RejectReasonCode::SchemaInvalid | RejectReasonCode::WhitelistInvalid => match field {
            "source.id" => "source id is invalid",
            "level" => "level is not an accepted value",
            "action" => "action is not an accepted ID",
            "sound" => "sound is not an accepted ID",
            "hardware.light.effect" => "hardware light effect is not an accepted ID",
            _ => "payload failed schema validation",
        },
        RejectReasonCode::PayloadTooLarge => "payload is too large",
        RejectReasonCode::RateLimited => "source rate limit exceeded",
        RejectReasonCode::InstanceIdInvalid => "instance id is invalid",
        RejectReasonCode::InstanceNotFound => "instance was not found",
        RejectReasonCode::DefaultInstanceCannotDetach => "default instance cannot be detached",
        RejectReasonCode::InstanceLimitReached => "pet instance limit reached",
        RejectReasonCode::DisplayNameInvalid => "display name is invalid",
        RejectReasonCode::SourceKindInvalid => "source kind is not accepted",
        RejectReasonCode::WorkspaceLabelInvalid => "workspace label is invalid",
        RejectReasonCode::WorkspaceHashInvalid => "workspace hash is invalid",
        RejectReasonCode::QueueFull => "event queue is full",
        RejectReasonCode::QueueReplaced => "queued event was replaced",
        RejectReasonCode::BridgeUnavailable => "bridge unavailable",
        RejectReasonCode::PortBindFailed => "port bind failed",
        RejectReasonCode::EmitFailed => "bridge unavailable",
    }
}

pub(super) fn reason_code_str(code: RejectReasonCode) -> &'static str {
    match code {
        RejectReasonCode::AuthMissing => "auth_missing",
        RejectReasonCode::AuthInvalid => "auth_invalid",
        RejectReasonCode::SchemaInvalid => "schema_invalid",
        RejectReasonCode::WhitelistInvalid => "whitelist_invalid",
        RejectReasonCode::PayloadTooLarge => "payload_too_large",
        RejectReasonCode::RateLimited => "rate_limited",
        RejectReasonCode::InstanceIdInvalid => "instance_id_invalid",
        RejectReasonCode::InstanceNotFound => "instance_not_found",
        RejectReasonCode::DefaultInstanceCannotDetach => "default_instance_cannot_detach",
        RejectReasonCode::InstanceLimitReached => "instance_limit_reached",
        RejectReasonCode::DisplayNameInvalid => "display_name_invalid",
        RejectReasonCode::SourceKindInvalid => "source_kind_invalid",
        RejectReasonCode::WorkspaceLabelInvalid => "workspace_label_invalid",
        RejectReasonCode::WorkspaceHashInvalid => "workspace_hash_invalid",
        RejectReasonCode::QueueFull => "queue_full",
        RejectReasonCode::QueueReplaced => "queue_replaced",
        RejectReasonCode::BridgeUnavailable => "bridge_unavailable",
        RejectReasonCode::PortBindFailed => "port_bind_failed",
        RejectReasonCode::EmitFailed => "emit_failed",
    }
}
