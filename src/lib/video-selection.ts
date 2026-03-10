import type { Video } from "@/lib/types";

function shuffleVideos(videos: Video[]) {
  const next = [...videos];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    next[index] = next[swapIndex];
    next[swapIndex] = current;
  }
  return next;
}

export function prioritizePortfolioVideos(videos: Video[]) {
  const availableVideos = videos.filter((video) => !video.cloudflare_uid.startsWith("pending:"));
  const favorites = availableVideos.filter((video) => video.is_featured);
  const others = availableVideos.filter((video) => !video.is_featured);
  return [...shuffleVideos(favorites), ...others];
}

export function selectShowcaseVideos(videos: Video[], count = 6) {
  const availableVideos = videos.filter((video) => !video.cloudflare_uid.startsWith("pending:"));
  const showcased = availableVideos.filter((video) => video.is_showcased);
  if (showcased.length >= count) return showcased.slice(0, count);

  const showcasedIds = new Set(showcased.map((video) => video.id));
  const favoriteFallback = shuffleVideos(
    availableVideos.filter((video) => video.is_featured && !showcasedIds.has(video.id)),
  );

  return [...showcased, ...favoriteFallback].slice(0, count);
}
