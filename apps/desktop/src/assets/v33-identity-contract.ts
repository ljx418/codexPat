import type { CatTraitSummary } from "./photo-suitability-traits";
import type { V33ReasonCode, V33SampleIntakeRecord, V33PhaseStatus } from "./v33-sample-intake";

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif|gps|latitude|longitude|geotag|location|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|https?:\/\/|file:\/\//i;

export type V33TraitSource = "local_review" | "local_model" | "manual_fixture" | "provider_candidate";

export type V33TraitSummaryRecord = {
  sampleId: string;
  furColor: string;
  pattern: string;
  bodyShape: string;
  faceShape: string;
  eyeFeature: string;
  tailFeature: string;
  confidence: "high" | "medium" | "low";
  identityRisks: V33ReasonCode[];
  source: V33TraitSource;
};

export type V33CharacterDesignContract = {
  characterId: string;
  sampleId: string;
  identityAnchors: string[];
  allowedStylization: string[];
  disallowedDrift: string[];
  reviewStatus: V33PhaseStatus;
  reasonCodes: V33ReasonCode[];
  evidenceRefs: string[];
};

export type V33IdentityGateResult = {
  status: V33PhaseStatus;
  sampleId: string;
  characterId: string;
  candidateId: string;
  reasonCodes: V33ReasonCode[];
  anchorCoverage: Record<string, boolean>;
  identityConsistency: "low" | "medium" | "high";
};

export function createV33TraitSummaryRecord(options: {
  intake: V33SampleIntakeRecord;
  bodyShape?: string;
  source?: V33TraitSource;
}): V33TraitSummaryRecord {
  const trait = options.intake.traitSummary;
  const record: V33TraitSummaryRecord = {
    sampleId: options.intake.sampleId,
    furColor: trait.coatColorBucket,
    pattern: trait.patternBucket,
    bodyShape: options.bodyShape ?? bodyShapeFromPose(trait),
    faceShape: trait.faceShapeBucket,
    eyeFeature: trait.eyeColorBucket,
    tailFeature: trait.tailVisibility,
    confidence: trait.confidence,
    identityRisks: trait.confidence === "low" ? ["trait_confidence_low"] : [],
    source: options.source ?? "local_review"
  };
  if (v33IdentityContractHasForbiddenContent(record)) {
    return {
      ...record,
      confidence: "low",
      identityRisks: [...new Set<V33ReasonCode>([...record.identityRisks, "privacy_boundary_failed"])]
    };
  }
  return record;
}

export function createV33CharacterDesignContract(options: {
  intake: V33SampleIntakeRecord;
  traitSummary: V33TraitSummaryRecord;
  evidenceRefs?: string[];
}): V33CharacterDesignContract {
  const reasonCodes = new Set<V33ReasonCode>();
  if (options.intake.status !== "passed" || !options.intake.safeTraitsAvailable) {
    reasonCodes.add(options.intake.reasonCode);
  }
  if (options.traitSummary.confidence === "low") {
    reasonCodes.add("trait_confidence_low");
  }
  const identityAnchors = anchorsFor(options.traitSummary);
  const contract: V33CharacterDesignContract = {
    characterId: `${options.intake.sampleId}_character`,
    sampleId: options.intake.sampleId,
    identityAnchors,
    allowedStylization: [
      "clean 2D desktop pet silhouette",
      "slightly simplified fur markings",
      "expressive but same-character facial features"
    ],
    disallowedDrift: [
      `fur_color_not_${options.traitSummary.furColor}`,
      `pattern_not_${options.traitSummary.pattern}`,
      "different_species",
      "different_character_per_action"
    ],
    reviewStatus: reasonCodes.size === 0 ? "passed" : "blocked",
    reasonCodes: reasonCodes.size === 0 ? ["sample_intake_passed"] : Array.from(reasonCodes).sort(),
    evidenceRefs: sanitizeEvidenceRefs(options.evidenceRefs ?? options.intake.evidenceRefs)
  };
  if (v33IdentityContractHasForbiddenContent(contract)) {
    return {
      ...contract,
      reviewStatus: "blocked",
      reasonCodes: [...new Set<V33ReasonCode>([...contract.reasonCodes, "privacy_boundary_failed"])].sort()
    };
  }
  return contract;
}

export function runV33IdentityGate(options: {
  contract: V33CharacterDesignContract;
  candidateId: string;
  candidateAnchors: string[];
  actionIdentityConsistency: number;
  disallowedDriftObserved?: string[];
}): V33IdentityGateResult {
  const reasonCodes = new Set<V33ReasonCode>();
  const anchorCoverage = Object.fromEntries(options.contract.identityAnchors.map((anchor) => [
    anchor,
    options.candidateAnchors.includes(anchor)
  ])) as Record<string, boolean>;
  if (options.contract.reviewStatus !== "passed") {
    for (const code of options.contract.reasonCodes) reasonCodes.add(code);
  }
  if (Object.values(anchorCoverage).some((covered) => !covered)) {
    reasonCodes.add("identity_drift");
  }
  if (options.actionIdentityConsistency < 0.78) {
    reasonCodes.add("identity_drift");
  }
  if ((options.disallowedDriftObserved ?? []).length > 0) {
    reasonCodes.add("identity_drift");
  }
  if (v33IdentityContractHasForbiddenContent(options)) {
    reasonCodes.add("privacy_boundary_failed");
  }
  const blocked = reasonCodes.has("trait_confidence_low") || reasonCodes.has("privacy_boundary_failed");
  const failed = Array.from(reasonCodes).some((code) => code !== "sample_intake_passed");
  return {
    status: blocked ? "blocked" : failed ? "failed" : "passed",
    sampleId: options.contract.sampleId,
    characterId: options.contract.characterId,
    candidateId: sanitizeId(options.candidateId, "v33_candidate"),
    reasonCodes: reasonCodes.size === 0 ? ["sample_intake_passed"] : Array.from(reasonCodes).sort(),
    anchorCoverage,
    identityConsistency: bucket(options.actionIdentityConsistency)
  };
}

export function buildV33IdentityEvidenceSnapshot(result: V33IdentityGateResult) {
  return {
    status: result.status,
    sampleId: result.sampleId,
    characterId: result.characterId,
    candidateId: result.candidateId,
    reasonCodes: result.reasonCodes,
    anchorCoverage: result.anchorCoverage,
    identityConsistency: result.identityConsistency
  };
}

export function v33IdentityContractHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}

function anchorsFor(record: V33TraitSummaryRecord) {
  return [
    `fur:${record.furColor}`,
    `pattern:${record.pattern}`,
    `body:${record.bodyShape}`,
    `face:${record.faceShape}`,
    `eyes:${record.eyeFeature}`,
    `tail:${record.tailFeature}`
  ].filter((anchor) => !anchor.endsWith(":unknown") && !anchor.endsWith(":metadata_only"));
}

function bodyShapeFromPose(trait: CatTraitSummary) {
  return trait.bodyPose === "metadata_only" || trait.bodyPose === "unknown" ? "compact_desktop_pet" : trait.bodyPose;
}

function bucket(value: number): "low" | "medium" | "high" {
  if (value >= 0.86) return "high";
  if (value >= 0.78) return "medium";
  return "low";
}

function sanitizeEvidenceRefs(refs: string[]) {
  return refs
    .map((ref) => ref.replace(/\\/g, "/").replace(/[^A-Za-z0-9._/-]/g, "_").slice(0, 120))
    .filter((ref) => ref && !FORBIDDEN_PATTERN.test(ref));
}

function sanitizeId(value: string, fallback: string) {
  const normalized = value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 96);
  return /^[A-Za-z0-9._-]{1,96}$/.test(normalized) ? normalized : fallback;
}
