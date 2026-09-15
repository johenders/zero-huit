/**
 * Jeu d'icônes des pages sectorielles.
 *
 * Un seul style : trait de 1,5, coins arrondis, grille de 24. Les icônes
 * servent de repère de lecture — elles ne remplacent jamais un mot.
 */

export type SectorIconName =
  | "accessibility"
  | "badge"
  | "budget"
  | "calendar"
  | "camera"
  | "chat"
  | "clipboard"
  | "clock"
  | "delivery"
  | "edit"
  | "heart"
  | "idea"
  | "layers"
  | "megaphone"
  | "pen"
  | "people"
  | "refresh"
  | "scale"
  | "share"
  | "stamp"
  | "video";

const PATHS: Record<SectorIconName, React.ReactNode> = {
  budget: (
    <>
      <rect x="3" y="5.5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 14.5h4" />
    </>
  ),
  stamp: (
    <>
      <path d="M9 3.5h6a2 2 0 0 1 2 2c0 2-1.5 2.5-1.5 4.5h-7C8.5 8 7 7.5 7 5.5a2 2 0 0 1 2-2Z" />
      <path d="M4.5 14h15" />
      <path d="M6 14v4.5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V14" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.4-5.7" />
      <path d="M20 4v4.5h-4.5" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.5a3 3 0 0 1 0 5" />
      <path d="M17.5 14.5a5.5 5.5 0 0 1 3 5" />
    </>
  ),
  accessibility: (
    <>
      <circle cx="12" cy="4.5" r="1.8" />
      <path d="M4.5 9h15" />
      <path d="M12 9v5" />
      <path d="m8.5 20.5 3.5-6.5 3.5 6.5" />
    </>
  ),
  chat: (
    <>
      <path d="M20 15a2.5 2.5 0 0 1-2.5 2.5H9L5 20.5v-3h-.5A2.5 2.5 0 0 1 2 15V7.5A2.5 2.5 0 0 1 4.5 5h13A2.5 2.5 0 0 1 20 7.5V15Z" />
      <path d="M7 9.5h8" />
      <path d="M7 13h5" />
    </>
  ),
  clipboard: (
    <>
      <path d="M9 4.5H7.5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-12a2 2 0 0 0-2-2H15" />
      <rect x="9" y="2.5" width="6" height="4" rx="1" />
      <path d="m9.5 13 1.8 1.8 3.5-3.6" />
    </>
  ),
  camera: (
    <>
      <path d="M3.5 8h3l1.4-2h6.2L15.5 8h2A2 2 0 0 1 19.5 10v7a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2v-7A2 2 0 0 1 3.5 8Z" />
      <circle cx="11.5" cy="13.5" r="3.2" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20v-3.5L15.5 5a2.1 2.1 0 0 1 3 3L7 19.5 3.5 20Z" />
      <path d="M14 6.5 17.5 10" />
    </>
  ),
  delivery: (
    <>
      <path d="m12 3 8 4.2v9.6L12 21l-8-4.2V7.2L12 3Z" />
      <path d="m4 7.2 8 4.3 8-4.3" />
      <path d="M12 11.5V21" />
    </>
  ),
  heart: (
    <>
      <path d="M12 20.3 4.9 13.2a4.7 4.7 0 0 1 0-6.7 4.6 4.6 0 0 1 6.4 0l.7.7.7-.7a4.6 4.6 0 0 1 6.4 0 4.7 4.7 0 0 1 0 6.7L12 20.3Z" />
    </>
  ),
  megaphone: (
    <>
      <path d="M4 13.5h3.5l9-4.5v10l-9-4.5H4v-1Z" />
      <path d="M7.5 14.5 9 20h3" />
      <path d="M19 10.2c.9.8 1.4 1.9 1.4 3.1s-.5 2.3-1.4 3.1" />
    </>
  ),
  share: (
    <>
      <path d="M7.5 13.5 16 18.2" />
      <path d="M16 5.8 7.5 10.5" />
      <circle cx="5.5" cy="12" r="2.3" />
      <circle cx="18.5" cy="4.5" r="2.3" />
      <circle cx="18.5" cy="19.5" r="2.3" />
    </>
  ),
  video: (
    <>
      <path d="M4 7.5h10.5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4v-9Z" />
      <path d="m16.5 10 4-2.3v8.6l-4-2.3" />
    </>
  ),
  idea: (
    <>
      <path d="M9.5 17.5h5" />
      <path d="M10 20.5h4" />
      <path d="M8 11.2a4 4 0 1 1 8 0c0 1.7-1 2.5-1.5 3.4-.3.5-.4 1-.4 1.6h-4.2c0-.6-.1-1.1-.4-1.6C9 13.7 8 12.9 8 11.2Z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.4v4.9l3.2 1.8" />
    </>
  ),
  badge: (
    <>
      <circle cx="12" cy="9.5" r="5.2" />
      <path d="m8.6 13.8-1.1 6.7 4.5-2.4 4.5 2.4-1.1-6.7" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.8" y="5.5" width="16.4" height="14.7" rx="2" />
      <path d="M3.8 10h16.4" />
      <path d="M8 3.5v4" />
      <path d="M16 3.5v4" />
    </>
  ),
  pen: (
    <>
      <path d="M4 20v-3.4L15.4 5.2a2.1 2.1 0 0 1 3 3L7 19.6 3.6 20Z" />
      <path d="M13.9 6.7 17.3 10" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3.5 8.5 4.3L12 12 3.5 7.8 12 3.5Z" />
      <path d="m3.5 12.2 8.5 4.3 8.5-4.3" />
      <path d="m3.5 16.4 8.5 4.3 8.5-4.3" />
    </>
  ),
  scale: (
    <>
      <path d="M12 4v16" />
      <path d="M6 7.5h12" />
      <path d="M6 7.5 3.5 14h5L6 7.5Z" />
      <path d="M18 7.5 15.5 14h5L18 7.5Z" />
      <path d="M8.5 20.5h7" />
    </>
  ),
};

export function SectorIcon({
  name,
  className = "h-6 w-6",
}: {
  name: SectorIconName;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
