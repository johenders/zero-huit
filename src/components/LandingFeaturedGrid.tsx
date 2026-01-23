"use client";

import { useState } from "react";

import type { Video } from "@/lib/types";
import { VideoCard } from "@/components/VideoCard";
import { VideoModal } from "@/components/VideoModal";

type Props = {
  videos: Video[];
};

export function LandingFeaturedGrid({ videos }: Props) {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  if (videos.length === 0) return null;

  return (
    <section className="bg-black/90 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.45em] text-zinc-400">
              R&#233;alisations favorites
            </span>
            <h2 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">
              Huit projets qui mettent notre signature en mouvement.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300">
              Chaque vignette reprend l'exp&#233;rience du portfolio pour vous plonger
              directement dans nos productions les plus marquantes.
            </p>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {videos.map((video, index) => (
            <VideoCard
              key={video.id}
              video={video}
              prewarmPreview={index < 6}
              onOpen={(nextVideo) => setActiveVideo(nextVideo)}
            />
          ))}
        </div>
      </div>
      <VideoModal
        open={Boolean(activeVideo)}
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
      />
    </section>
  );
}
