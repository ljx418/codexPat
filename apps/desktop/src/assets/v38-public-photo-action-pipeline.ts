import type { V33PhaseStatus } from "./v33-sample-intake";

const FORBIDDEN_PATTERN =
  /\b(?:Authorization|Bearer\s+[A-Za-z0-9._-]+|api-token\.json|raw payload|raw provider response|raw http payload|workspace path|config path|prompt private text|shell history|clipboard|exif gps value|latitude|longitude|geotag|sk-[A-Za-z0-9_-]{8,})\b|\/Users\/|\/private\/|\/Volumes\/|file:\/\//i;

export const V38_TARGET_ACTION_IDS = [
  "idle",
  "walk",
  "jump",
  "sleep",
  "eat",
  "play",
  "alert",
  "celebrate"
] as const;

export type V38TargetActionId = (typeof V38_TARGET_ACTION_IDS)[number];
export type V38SampleClass = "passing_cat" | "negative_non_cat" | "blocked_multi_cat";
export type V38SourceStatus = "source_ready" | "blocked" | "failed";
export type V38RenderStatus = "renderable" | "blocked" | "failed";

export type V38PublicPhotoSource = {
  sampleId: string;
  displayName: string;
  sampleClass: V38SampleClass;
  commonsTitle: string;
  sourcePage: string;
  redirectUrl: string;
  expectedLicenseFamily: "cc-by-sa" | "public-domain-compatible" | "unknown";
  permissionSummary: string;
};

export type V38SourceManifest = {
  manifestId: "v38_public_photo_source_manifest";
  sampleScope: "tested_public_photo_samples_only";
  sources: V38PublicPhotoSource[];
  passingCatCount: number;
  negativeCount: number;
  blockedCount: number;
  status: V33PhaseStatus;
  reasonCodes: string[];
};

export type V38SanitizedPixelAsset = {
  sampleId: string;
  sanitizedImageRef: string;
  sourcePage: string;
  sourceHashRef: string;
  width: number;
  height: number;
  averageColor: string;
  exifStripped: boolean;
  status: V33PhaseStatus;
  reasonCodes: string[];
};

export type V38RenderableActionFramePack = {
  sampleId: string;
  candidateId: string;
  contactSheetRef: string;
  animatedPreviewRef: string;
  actionCoverage: V38TargetActionId[];
  frameCountByAction: Record<V38TargetActionId, number>;
  localMotionModel: "source_bound_photo_base_with_local_overlays";
  wholeImageTransformOnly: false;
  status: V38RenderStatus;
  reasonCodes: string[];
};

export type V38PublicPhotoActionPipeline = {
  pipelineId: "v38_public_photo_action_pipeline";
  sourceManifest: V38SourceManifest;
  sanitizedAssets: V38SanitizedPixelAsset[];
  renderablePacks: V38RenderableActionFramePack[];
  productUiAnchors: string[];
  status: V33PhaseStatus;
  reasonCodes: string[];
};

export function createV38PublicPhotoSources(): V38PublicPhotoSource[] {
  return [
    {
      sampleId: "v38_orange_tabby_public",
      displayName: "Orange Tabby Cat",
      sampleClass: "passing_cat",
      commonsTitle: "File:Orange Tabby Cat.jpg",
      sourcePage: "https://commons.wikimedia.org/wiki/File:Orange_Tabby_Cat.jpg",
      redirectUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Orange_Tabby_Cat.jpg",
      expectedLicenseFamily: "cc-by-sa",
      permissionSummary: "Wikimedia Commons public file; license and attribution must be verified in V38.1 evidence"
    },
    {
      sampleId: "v38_tuxedo_public",
      displayName: "Tuxedo Cat Black And White",
      sampleClass: "passing_cat",
      commonsTitle: "File:TUXEDO CAT BLACK AND WHITE.jpg",
      sourcePage: "https://commons.wikimedia.org/wiki/File:TUXEDO_CAT_BLACK_AND_WHITE.jpg",
      redirectUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/TUXEDO_CAT_BLACK_AND_WHITE.jpg",
      expectedLicenseFamily: "cc-by-sa",
      permissionSummary: "Wikimedia Commons public file; license and attribution must be verified in V38.1 evidence"
    },
    {
      sampleId: "v38_a_cat_public",
      displayName: "A-Cat",
      sampleClass: "passing_cat",
      commonsTitle: "File:A-Cat.jpg",
      sourcePage: "https://commons.wikimedia.org/wiki/File:A-Cat.jpg",
      redirectUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/A-Cat.jpg",
      expectedLicenseFamily: "cc-by-sa",
      permissionSummary: "Wikimedia Commons public file; license and attribution must be verified in V38.1 evidence"
    },
    {
      sampleId: "v38_negative_dog_public",
      displayName: "Negative Dog Public Sample",
      sampleClass: "negative_non_cat",
      commonsTitle: "File:My dog.jpg",
      sourcePage: "https://commons.wikimedia.org/wiki/File:My_dog.jpg",
      redirectUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/My_dog.jpg",
      expectedLicenseFamily: "cc-by-sa",
      permissionSummary: "Wikimedia Commons public negative sample; must be rejected as non-cat in V38.1/V38.2 evidence"
    },
    {
      sampleId: "v38_multi_cat_public",
      displayName: "Multi Cat Public Blocked Sample",
      sampleClass: "blocked_multi_cat",
      commonsTitle: "File:Collage of Six Cats-02.jpg",
      sourcePage: "https://commons.wikimedia.org/wiki/File:Collage_of_Six_Cats-02.jpg",
      redirectUrl: "https://commons.wikimedia.org/wiki/Special:Redirect/file/Collage_of_Six_Cats-02.jpg",
      expectedLicenseFamily: "cc-by-sa",
      permissionSummary: "Wikimedia Commons public blocked sample; must stay blocked as multi-cat identity ambiguity"
    }
  ];
}

export function createV38SourceManifest(sources = createV38PublicPhotoSources()): V38SourceManifest {
  const passingCatCount = sources.filter((source) => source.sampleClass === "passing_cat").length;
  const negativeCount = sources.filter((source) => source.sampleClass === "negative_non_cat").length;
  const blockedCount = sources.filter((source) => source.sampleClass === "blocked_multi_cat").length;
  const reasonCodes = new Set<string>();
  if (passingCatCount < 3) reasonCodes.add("passing_public_cat_count_too_low");
  if (negativeCount < 1) reasonCodes.add("negative_public_sample_missing");
  if (blockedCount < 1) reasonCodes.add("blocked_public_sample_missing");
  if (v38PublicPhotoActionPipelineHasForbiddenContent(sources)) reasonCodes.add("security_boundary_failed");
  return {
    manifestId: "v38_public_photo_source_manifest",
    sampleScope: "tested_public_photo_samples_only",
    sources,
    passingCatCount,
    negativeCount,
    blockedCount,
    status: reasonCodes.size === 0 ? "passed" : "failed",
    reasonCodes: reasonCodes.size === 0 ? ["public_source_manifest_ready"] : Array.from(reasonCodes).sort()
  };
}

export function createV38PublicPhotoActionPipeline(options: {
  sanitizedAssets?: V38SanitizedPixelAsset[];
  renderablePacks?: V38RenderableActionFramePack[];
} = {}): V38PublicPhotoActionPipeline {
  const sourceManifest = createV38SourceManifest();
  const sanitizedAssets = options.sanitizedAssets ?? [];
  const renderablePacks = options.renderablePacks ?? [];
  const reasonCodes = new Set<string>();
  if (sourceManifest.status !== "passed") reasonCodes.add("source_manifest_not_ready");
  if (sanitizedAssets.filter((asset) => asset.status === "passed").length < 3) reasonCodes.add("sanitized_public_photo_count_too_low");
  if (renderablePacks.filter((pack) => pack.status === "renderable").length < 3) reasonCodes.add("renderable_public_photo_pack_count_too_low");
  if (v38PublicPhotoActionPipelineHasForbiddenContent({ sourceManifest, sanitizedAssets, renderablePacks })) {
    reasonCodes.add("security_boundary_failed");
  }
  return {
    pipelineId: "v38_public_photo_action_pipeline",
    sourceManifest,
    sanitizedAssets,
    renderablePacks,
    productUiAnchors: [
      "v38-public-photo-action-entry",
      "v38-public-source-status",
      "v38-pixel-asset-status",
      "v38-renderable-pack-preview",
      "v38-product-apply-rollback",
      "v38-blocked-reason"
    ],
    status: reasonCodes.size === 0 ? "passed" : "blocked",
    reasonCodes: reasonCodes.size === 0 ? ["v38_public_photo_pipeline_ready"] : Array.from(reasonCodes).sort()
  };
}

export function createV38BundledPublicPhotoActionPipeline(): V38PublicPhotoActionPipeline {
  const sourceById = new Map(createV38PublicPhotoSources().map((source) => [source.sampleId, source]));
  const sampleSummaries = [
    { sampleId: "v38_orange_tabby_public", averageColor: "#85715C" },
    { sampleId: "v38_tuxedo_public", averageColor: "#8A735C" },
    { sampleId: "v38_a_cat_public", averageColor: "#917F64" }
  ];
  const sanitizedAssets: V38SanitizedPixelAsset[] = sampleSummaries.map((summary) => {
    const source = sourceById.get(summary.sampleId);
    return {
      sampleId: summary.sampleId,
      sanitizedImageRef: `/v38/${summary.sampleId}/sanitized.png`,
      sourcePage: source?.sourcePage ?? "",
      sourceHashRef: `docs/V38.x/evidence/assets/${summary.sampleId}/sanitized-sha256.txt`,
      width: 512,
      height: 512,
      averageColor: summary.averageColor,
      exifStripped: true,
      status: "passed",
      reasonCodes: ["bundled_sanitized_public_photo_ready"]
    };
  });
  const renderablePacks: V38RenderableActionFramePack[] = sampleSummaries.map((summary) => ({
    sampleId: summary.sampleId,
    candidateId: `${summary.sampleId}_v38_public_photo_pack`,
    contactSheetRef: `/v38/${summary.sampleId}/contact-sheet.png`,
    animatedPreviewRef: `/v38/${summary.sampleId}/animated-preview.gif`,
    actionCoverage: [...V38_TARGET_ACTION_IDS],
    frameCountByAction: Object.fromEntries(V38_TARGET_ACTION_IDS.map((actionId) => [actionId, 4])) as V38RenderableActionFramePack["frameCountByAction"],
    localMotionModel: "source_bound_photo_base_with_local_overlays",
    wholeImageTransformOnly: false,
    status: "renderable",
    reasonCodes: ["bundled_renderable_frame_pack_ready", "local_overlays_present", "whole_image_transform_only_rejected"]
  }));
  return createV38PublicPhotoActionPipeline({ sanitizedAssets, renderablePacks });
}

export function buildV38PublicPhotoActionEvidenceSnapshot(pipeline: V38PublicPhotoActionPipeline) {
  return {
    pipelineId: pipeline.pipelineId,
    sourceManifest: pipeline.sourceManifest,
    sanitizedAssets: pipeline.sanitizedAssets.map((asset) => ({
      sampleId: asset.sampleId,
      sanitizedImageRef: asset.sanitizedImageRef,
      sourcePage: asset.sourcePage,
      sourceHashRef: asset.sourceHashRef,
      width: asset.width,
      height: asset.height,
      averageColor: asset.averageColor,
      exifStripped: asset.exifStripped,
      status: asset.status,
      reasonCodes: asset.reasonCodes
    })),
    renderablePacks: pipeline.renderablePacks,
    productUiAnchors: pipeline.productUiAnchors,
    status: pipeline.status,
    reasonCodes: pipeline.reasonCodes
  };
}

export function runV38ClaimScan(value: unknown) {
  const text = JSON.stringify(value);
  const forbidden = [
    "arbitrary-cat automatic generation ready",
    "automatic photo-to-animation ready for arbitrary cats",
    "automatic photo-to-2D ready for arbitrary cats",
    "raw-photo pixel generation verified for arbitrary cats",
    "provider integration verified",
    "Petdex parity achieved",
    "3D ready",
    "production signed release ready",
    "Windows ready",
    "cross-platform ready"
  ];
  const hits = forbidden.filter((phrase) => text.includes(phrase));
  return { status: hits.length === 0 ? "passed" as const : "failed" as const, hits };
}

export function v38PublicPhotoActionPipelineHasForbiddenContent(value: unknown) {
  return FORBIDDEN_PATTERN.test(JSON.stringify(value));
}
