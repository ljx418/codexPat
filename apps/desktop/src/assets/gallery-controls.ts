export function applyGalleryCardFilters(root: ParentNode) {
  const search = root.querySelector<HTMLInputElement>("#gallery-search")?.value.trim().toLowerCase() ?? "";
  const filter = root.querySelector<HTMLSelectElement>("#gallery-filter")?.value ?? "all";
  const style = root.querySelector<HTMLSelectElement>("#gallery-style-filter")?.value ?? "all";
  const color = root.querySelector<HTMLSelectElement>("#gallery-color-filter")?.value ?? "all";
  const motion = root.querySelector<HTMLSelectElement>("#gallery-motion-filter")?.value ?? "all";
  const source = root.querySelector<HTMLSelectElement>("#gallery-source-filter")?.value ?? "all";
  const renderer = root.querySelector<HTMLSelectElement>("#gallery-renderer-filter")?.value ?? "all";
  root.querySelectorAll<HTMLElement>("[data-gallery-pack]").forEach((card) => {
    const matchesSearch = !search || (card.dataset.gallerySearch ?? "").includes(search);
    const matchesFilter =
      filter === "all" ||
      (filter === "favorite" && card.dataset.galleryFavorite === "true") ||
      (filter === "active" && card.dataset.galleryActive === "true");
    const matchesStyle = style === "all" || card.dataset.galleryStyle === style;
    const matchesColor = color === "all" || card.dataset.galleryColor === color;
    const matchesMotion = motion === "all" || card.dataset.galleryMotion === motion;
    const matchesSource = source === "all" || card.dataset.gallerySource === source;
    const matchesRenderer = renderer === "all" || card.dataset.galleryRenderer === renderer;
    card.hidden = !(matchesSearch && matchesFilter && matchesStyle && matchesColor && matchesMotion && matchesSource && matchesRenderer);
  });
}
