import { CORE_ACTION_IDS, type CoreActionId, type RendererKind } from "./asset-manifest";
import { createAssetManagerPackViews } from "./asset-manager-view-model";

export type AssetManagerPanelPack = {
  packId: string;
  displayName: string;
  rendererKind: Extract<RendererKind, "sprite" | "gltf">;
  copiedAssetIds: string[];
  activeInstances: string[];
  validationStatus: string;
  manifestHash: string;
  createdAt: string;
};

export type AssetManagerPanelFormatters = {
  escapeHtml: (value: string) => string;
  formatTimestamp: (value: string) => string;
  shortStateLabel: (value: CoreActionId) => string;
};

export function assetPackList(packs: AssetManagerPanelPack[], formatters: AssetManagerPanelFormatters) {
  if (packs.length === 0) {
    return `<p class="diagnostics-empty">尚未导入个性化资产包。</p>`;
  }
  const { escapeHtml, formatTimestamp, shortStateLabel } = formatters;
  const views = createAssetManagerPackViews(packs);
  return `
    <div class="asset-pack-list-grid">
      ${packs.map((pack, index) => {
        const view = views[index];
        return `
        <article class="asset-pack-card">
          <div>
            <h3>${escapeHtml(view.displayName)}</h3>
            <dl class="asset-pack-meta-grid">
              <div><dt>Pack ID</dt><dd>${escapeHtml(view.packId)}</dd></div>
              <div><dt>Renderer</dt><dd>${escapeHtml(view.rendererKind)}</dd></div>
              <div><dt>Actions</dt><dd>${escapeHtml(view.actionCoverage)}</dd></div>
              <div><dt>Hash</dt><dd>${escapeHtml(pack.manifestHash)}</dd></div>
              <div><dt>Imported</dt><dd>${escapeHtml(formatTimestamp(pack.createdAt))}</dd></div>
              <div><dt>Status</dt><dd>${escapeHtml(view.validationStatus)}</dd></div>
              <div><dt>Health</dt><dd>${escapeHtml(view.healthStatus)} · ${escapeHtml(view.reasonCode)}</dd></div>
              <div><dt>Active</dt><dd>${escapeHtml(view.activeInstanceSummary)}</dd></div>
            </dl>
            <label class="asset-pack-rename-control">
              <span>显示名称</span>
              <input type="text" maxlength="80" value="${escapeHtml(view.displayName)}" data-asset-pack-name-input="${escapeHtml(view.packId)}" aria-label="${escapeHtml(view.displayName)} 的显示名称" />
            </label>
          </div>
          <div class="asset-pack-actions">
            <span class="instance-badge">${view.activeInstanceCount ? "Runtime active" : "Imported"}</span>
            <button class="secondary-action" type="button" data-asset-pack-preview="${escapeHtml(view.packId)}" data-preview-action="idle">预览</button>
            <button class="secondary-action" type="button" data-asset-pack-rename="${escapeHtml(view.packId)}">重命名</button>
            <button class="secondary-action" type="button" data-asset-pack-delete="${escapeHtml(view.packId)}">删除</button>
          </div>
          <div class="asset-preview-action-row" aria-label="${escapeHtml(view.displayName)} action preview">
            ${view.previewActions.map((action) => `
              <button class="icon-action" type="button" title="预览 ${escapeHtml(action)}" data-asset-pack-preview="${escapeHtml(view.packId)}" data-preview-action="${escapeHtml(action)}">${escapeHtml(shortStateLabel(action))}</button>
            `).join("")}
          </div>
        </article>
      `;
      }).join("")}
    </div>
  `;
}

export function assetPreviewPanel(packs: AssetManagerPanelPack[]) {
  if (packs.length === 0) {
    return "";
  }
  return `
    <article class="asset-preview-panel">
      <header class="guided-output-header">
        <div>
          <h3>资产预览</h3>
          <p id="asset-preview-summary">选择资产包和动作进行预览。预览不会激活到任何猫。</p>
        </div>
        <span class="instance-badge">Preview only</span>
      </header>
      <div id="asset-preview-stage" class="asset-preview-stage" aria-label="Asset pack preview"></div>
    </article>
  `;
}
