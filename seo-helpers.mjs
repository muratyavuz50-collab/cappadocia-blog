export function absoluteUrl(origin, value = "") {
  try { return new URL(value, `${origin}/`).href; }
  catch { return `${origin}/`; }
}

export function brandedTitle(value, brand = "CappadociaBlog") {
  const title = String(value || "").trim();
  if (!title || title.toLowerCase().includes(brand.toLowerCase())) return title;
  const candidate = `${title} | ${brand}`;
  return candidate.length <= 65 ? candidate : title;
}

export function xmlEscape(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function latestIsoDate(values = []) {
  const dates = values.map((value) => new Date(value)).filter((date) => Number.isFinite(date.valueOf()));
  return dates.length ? new Date(Math.max(...dates.map((date) => date.valueOf()))).toISOString() : undefined;
}
