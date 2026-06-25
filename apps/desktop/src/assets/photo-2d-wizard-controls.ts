export type Photo2DProviderDisclosureControls = {
  uploadConsent: boolean;
  termsReviewed: boolean;
  costDisclosureAccepted: boolean;
  privacyDisclosureAccepted: boolean;
  retentionDisclosureAccepted: boolean;
  licenseDisclosureAccepted: boolean;
};

type ProviderDisclosureControlId = keyof Photo2DProviderDisclosureControls;

const PROVIDER_DISCLOSURE_CONTROL_SELECTORS: Record<ProviderDisclosureControlId, string> = {
  uploadConsent: "#photo-2d-provider-upload-consent",
  termsReviewed: "#photo-2d-provider-terms",
  costDisclosureAccepted: "#photo-2d-provider-cost",
  privacyDisclosureAccepted: "#photo-2d-provider-privacy",
  retentionDisclosureAccepted: "#photo-2d-provider-retention",
  licenseDisclosureAccepted: "#photo-2d-provider-license"
};

export function bindPhoto2DProviderDisclosureControls(root: ParentNode, onChange: () => void) {
  for (const selector of Object.values(PROVIDER_DISCLOSURE_CONTROL_SELECTORS)) {
    root.querySelector<HTMLInputElement>(selector)?.addEventListener("change", onChange);
  }
}

export function readPhoto2DProviderDisclosureControls(root: ParentNode): Photo2DProviderDisclosureControls {
  return {
    uploadConsent: readChecked(root, PROVIDER_DISCLOSURE_CONTROL_SELECTORS.uploadConsent),
    termsReviewed: readChecked(root, PROVIDER_DISCLOSURE_CONTROL_SELECTORS.termsReviewed),
    costDisclosureAccepted: readChecked(root, PROVIDER_DISCLOSURE_CONTROL_SELECTORS.costDisclosureAccepted),
    privacyDisclosureAccepted: readChecked(root, PROVIDER_DISCLOSURE_CONTROL_SELECTORS.privacyDisclosureAccepted),
    retentionDisclosureAccepted: readChecked(root, PROVIDER_DISCLOSURE_CONTROL_SELECTORS.retentionDisclosureAccepted),
    licenseDisclosureAccepted: readChecked(root, PROVIDER_DISCLOSURE_CONTROL_SELECTORS.licenseDisclosureAccepted)
  };
}

export function resetPhoto2DProviderDisclosureControls(root: ParentNode) {
  for (const selector of Object.values(PROVIDER_DISCLOSURE_CONTROL_SELECTORS)) {
    const checkbox = root.querySelector<HTMLInputElement>(selector);
    if (checkbox) {
      checkbox.checked = false;
    }
  }
}

function readChecked(root: ParentNode, selector: string) {
  return root.querySelector<HTMLInputElement>(selector)?.checked ?? false;
}
