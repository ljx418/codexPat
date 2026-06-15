import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createMinimaxReferenceImagePrompt,
  createMinimaxCatActionPrompt,
  generateMinimaxCatReferenceActionImage,
  generateMinimaxCatActionImage,
  minimaxSummaryHasForbiddenLeak,
  preflightMinimaxImageToImageGeneration,
  preflightMinimaxGeneration
} from "./minimax-image-provider";

describe("V7.9 MiniMax image provider boundary", () => {
  it("requires credential", () => {
    const prompt = createMinimaxCatActionPrompt();
    const result = preflightMinimaxGeneration({
      prompt,
      actionIntent: "playing with a feather wand",
      uploadConsent: true,
      costDisclosureAccepted: true,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true
    });

    assert.equal(result.ok, false);
    assert.equal(result.reasonCode, "provider_credential_missing");
    assert.equal(minimaxSummaryHasForbiddenLeak(result), false);
  });

  it("requires explicit upload consent", () => {
    const prompt = createMinimaxCatActionPrompt();
    const result = preflightMinimaxGeneration({
      apiKey: "sk-test-redacted",
      prompt,
      actionIntent: "playing with a feather wand",
      uploadConsent: false,
      costDisclosureAccepted: true,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true
    });

    assert.equal(result.ok, false);
    assert.equal(result.reasonCode, "upload_consent_required");
    assert.equal(minimaxSummaryHasForbiddenLeak(result), false);
  });

  it("requires provider disclosures", () => {
    const prompt = createMinimaxCatActionPrompt();
    const result = preflightMinimaxGeneration({
      apiKey: "sk-test-redacted",
      prompt,
      actionIntent: "playing with a feather wand",
      uploadConsent: true,
      costDisclosureAccepted: false,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true
    });

    assert.equal(result.ok, false);
    assert.equal(result.reasonCode, "provider_disclosure_required");
  });

  it("rejects unsafe prompt content", () => {
    const result = preflightMinimaxGeneration({
      apiKey: "sk-test-redacted",
      prompt: "cat with /Users/example/private.png",
      actionIntent: "playing with a feather wand",
      uploadConsent: true,
      costDisclosureAccepted: true,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true
    });

    assert.equal(result.ok, false);
    assert.equal(result.reasonCode, "unsafe_prompt_rejected");
  });

  it("returns a safe live summary without raw prompt or credential", async () => {
    const prompt = createMinimaxCatActionPrompt();
    const result = await generateMinimaxCatActionImage({
      apiKey: "sk-test-redacted",
      prompt,
      actionIntent: "playing with a feather wand",
      uploadConsent: true,
      costDisclosureAccepted: true,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true,
      outputFileBase: "/private/tmp/agent-desktop-pet-v7-9-test/minimax-generated-cat-action",
      fetchImpl: async () => new Response(JSON.stringify({
        data: {
          image_base64: [Buffer.alloc(2048, 7).toString("base64")]
        },
        base_resp: {
          status_code: 0,
          status_msg: "success"
        }
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    });

    assert.equal(result.ok, true);
    assert.equal(result.imageCount, 1);
    assert.equal(result.outputFiles.length, 1);
    assert.equal(minimaxSummaryHasForbiddenLeak(result), false);
    assert.doesNotMatch(JSON.stringify(result), /fake-image-bytes|sk-test|raw prompt/i);
  });

  it("preflights image-to-image reference image capability with safe metadata", () => {
    const prompt = createMinimaxReferenceImagePrompt();
    const referenceImageBytes = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(2048, 1)]);
    const result = preflightMinimaxImageToImageGeneration({
      apiKey: "sk-test-redacted",
      prompt,
      actionIntent: "idle desktop pet pose",
      uploadConsent: true,
      costDisclosureAccepted: true,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true,
      referenceImageBytes,
      referenceImageMediaType: "image/jpeg"
    });

    assert.equal(result.ok, true);
    assert.equal(result.capability, "image_to_image_supported");
    assert.equal(result.reasonCode, "provider_capability_confirmed");
    assert.deepEqual(result.documentedFields, ["subject_reference", "type", "image_file", "data_url", "response_format"]);
    assert.equal(result.referenceImage?.mediaType, "image/jpeg");
    assert.equal(result.referenceImage?.sizeBucket, "small");
    assert.equal(minimaxSummaryHasForbiddenLeak(result), false);
    assert.doesNotMatch(JSON.stringify(result), /data:image|sk-test|Authorization/i);
  });

  it("requires image-to-image consent, disclosures, credential, and valid image", () => {
    const prompt = createMinimaxReferenceImagePrompt();
    const referenceImageBytes = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(2048, 1)]);

    assert.equal(preflightMinimaxImageToImageGeneration({
      prompt,
      actionIntent: "idle",
      uploadConsent: true,
      costDisclosureAccepted: true,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true,
      referenceImageBytes,
      referenceImageMediaType: "image/jpeg"
    }).reasonCode, "provider_credential_missing");

    assert.equal(preflightMinimaxImageToImageGeneration({
      apiKey: "sk-test-redacted",
      prompt,
      actionIntent: "idle",
      uploadConsent: false,
      costDisclosureAccepted: true,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true,
      referenceImageBytes,
      referenceImageMediaType: "image/jpeg"
    }).reasonCode, "consent_required");

    assert.equal(preflightMinimaxImageToImageGeneration({
      apiKey: "sk-test-redacted",
      prompt,
      actionIntent: "idle",
      uploadConsent: true,
      costDisclosureAccepted: false,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true,
      referenceImageBytes,
      referenceImageMediaType: "image/jpeg"
    }).reasonCode, "provider_disclosure_required");

    assert.equal(preflightMinimaxImageToImageGeneration({
      apiKey: "sk-test-redacted",
      prompt,
      actionIntent: "idle",
      uploadConsent: true,
      costDisclosureAccepted: true,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true,
      referenceImageBytes: Buffer.from("not-an-image"),
      referenceImageMediaType: "image/jpeg"
    }).reasonCode, "reference_image_invalid");
  });

  it("sends reference image via subject_reference without leaking it in summary", async () => {
    const prompt = createMinimaxReferenceImagePrompt({ actionIntent: "sleeping desktop pet pose" });
    const referenceImageBytes = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(2048, 1)]);
    let requestBody = "";
    const result = await generateMinimaxCatReferenceActionImage({
      apiKey: "sk-test-redacted",
      prompt,
      actionIntent: "sleeping desktop pet pose",
      uploadConsent: true,
      costDisclosureAccepted: true,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true,
      referenceImageBytes,
      referenceImageMediaType: "image/jpeg",
      outputFileBase: "/private/tmp/agent-desktop-pet-v18-i2i-test/minimax-reference-cat-action",
      fetchImpl: async (_url, init) => {
        requestBody = String(init?.body ?? "");
        return new Response(JSON.stringify({
          data: {
            image_base64: [Buffer.alloc(2048, 7).toString("base64")]
          },
          base_resp: {
            status_code: 0,
            status_msg: "success"
          }
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
    });

    assert.equal(result.ok, true);
    assert.equal(result.imageCount, 1);
    assert.match(requestBody, /"subject_reference"/);
    assert.match(requestBody, /"type":"character"/);
    assert.match(requestBody, /data:image\/jpeg;base64/);
    assert.equal(minimaxSummaryHasForbiddenLeak(result), false);
    assert.doesNotMatch(JSON.stringify(result), /data:image|sk-test|Authorization|raw provider response/i);
  });

  it("downloads provider image_urls into safe local output summary without recording the URL", async () => {
    const prompt = createMinimaxReferenceImagePrompt({ actionIntent: "8x9 motion sheet" });
    const referenceImageBytes = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(2048, 1)]);
    const providerImageBytes = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(4096, 9)]);
    let requestedImageUrl = false;

    const result = await generateMinimaxCatReferenceActionImage({
      apiKey: "sk-test-redacted",
      prompt,
      actionIntent: "8x9 motion sheet",
      uploadConsent: true,
      costDisclosureAccepted: true,
      privacyRetentionAccepted: true,
      licenseAttributionAccepted: true,
      referenceImageBytes,
      referenceImageMediaType: "image/jpeg",
      outputFileBase: "/private/tmp/agent-desktop-pet-v20-url-test/minimax-reference-cat-action",
      fetchImpl: async (url) => {
        if (String(url).includes("image_generation")) {
          return new Response(JSON.stringify({
            data: {
              image_urls: ["https://cdn.example.invalid/generated-cat-motion-sheet.jpeg"]
            },
            base_resp: {
              status_code: 0,
              status_msg: "success"
            }
          }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        }
        requestedImageUrl = true;
        return new Response(providerImageBytes, {
          status: 200,
          headers: { "Content-Type": "image/jpeg" }
        });
      }
    });

    assert.equal(requestedImageUrl, true);
    assert.equal(result.ok, true);
    assert.equal(result.imageCount, 1);
    assert.match(result.outputFiles[0].fileName, /minimax-reference-cat-action-1\.jpeg/);
    assert.equal(minimaxSummaryHasForbiddenLeak(result), false);
    assert.doesNotMatch(JSON.stringify(result), /cdn\.example|generated-cat-motion-sheet|sk-test|Authorization|raw provider response/i);
  });
});
