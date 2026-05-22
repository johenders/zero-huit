"use client";

import { useEffect, useState } from "react";

type Props = {
  buttonLabel: string;
  closeLabel: string;
  modalTitle: string;
  videoSrc: string;
};

export function EventDemoButton({
  buttonLabel,
  closeLabel,
  modalTitle,
  videoSrc,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center gap-3 rounded-full border border-white/25 px-5 py-3 text-sm font-bold text-white transition hover:border-white/50 hover:bg-white/10"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black">
          <svg
            aria-hidden
            className="h-3.5 w-3.5 translate-x-[1px]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M8 5v14l11-7-11-7Z" />
          </svg>
        </span>
        {buttonLabel}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-10"
          role="dialog"
          aria-modal="true"
          aria-label={modalTitle}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-black shadow-[0_28px_100px_rgba(0,0,0,0.6)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-zinc-950 px-4 py-3">
              <div className="truncate text-sm font-semibold text-white">{modalTitle}</div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-white/10"
                aria-label={closeLabel}
              >
                <svg
                  aria-hidden
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="aspect-video w-full">
              <iframe
                className="h-full w-full"
                src={videoSrc}
                title={modalTitle}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
