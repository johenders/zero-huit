/**
 * Envoi d'événements de conversion.
 *
 * Loi 25 : aucun témoin n'est déposé ici. On se contente de pousser dans la
 * couche de données ; `AnalyticsManager` ne charge gtag que si le consentement
 * a été accordé. Sans consentement, ces appels sont sans effet.
 */

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function trackEvent(name: string, params: EventParams = {}) {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event: name, ...params });
  } catch {
    // Le suivi ne doit jamais casser la page.
  }
}

/**
 * Seuils de lecture vidéo. Le guide : « La lecture vidéo à 75 % est le
 * meilleur signal prédictif de lead qualifié sur ce type de page. »
 */
export const VIDEO_PROGRESS_THRESHOLDS = [25, 50, 75, 100] as const;
