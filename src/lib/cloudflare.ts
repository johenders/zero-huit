export function cloudflareIframeSrc(uid: string) {
  const params = new URLSearchParams({
    autoplay: "true",
    preload: "true",
    quality: "1080",
  });
  return `https://iframe.videodelivery.net/${encodeURIComponent(uid)}?${params.toString()}`;
}

export function cloudflarePreviewIframeSrc(uid: string, startSeconds?: number | null) {
  const params = new URLSearchParams({
    autoplay: "true",
    muted: "true",
    loop: "true",
    controls: "false",
    preload: "true",
    quality: "240",
  });
  if (Number.isFinite(startSeconds)) {
    params.set("startTime", String(Math.max(0, Math.floor(startSeconds ?? 0))));
  }
  return `https://iframe.videodelivery.net/${encodeURIComponent(uid)}?${params.toString()}`;
}

export function cloudflareThumbnailSrc(
  uid: string,
  timeSeconds?: number | null,
  width?: number,
) {
  const base = `https://videodelivery.net/${encodeURIComponent(uid)}/thumbnails/thumbnail.jpg`;
  const params = new URLSearchParams();
  if (timeSeconds && !Number.isNaN(timeSeconds)) {
    params.set("time", `${timeSeconds}s`);
  }
  if (width && Number.isFinite(width)) {
    params.set("width", String(Math.max(1, Math.floor(width))));
  }
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}
