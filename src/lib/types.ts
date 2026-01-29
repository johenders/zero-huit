export type TaxonomyKind =
  | "type"
  | "keyword"
  | "style"
  | "feel"
  | "parametre"
  | "objectif";

export type Taxonomy = {
  id: string;
  kind: TaxonomyKind;
  label: string;
};

export type Video = {
  id: string;
  title: string;
  cloudflare_uid: string;
  status: "processing" | "ready";
  thumbnail_time_seconds: number | null;
  duration_seconds: number | null;
  budget_min: number | null;
  budget_max: number | null;
  is_featured: boolean;
  created_at: string;
  taxonomies: Taxonomy[];
};

export type ProjectObjective =
  | "promotion"
  | "recrutement"
  | "informatif"
  | "divertissement"
  | "autre";

export type ProjectDiffusion =
  | "reseaux_sociaux"
  | "web"
  | "tv"
  | "interne"
  | "autre";

export type Project = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  budget: number | null;
  video_type: string | null;
  objectives: ProjectObjective[];
  diffusions: ProjectDiffusion[];
  timeline: string | null;
  created_at: string;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  author_id?: string | null;
  author: string | null;
  published_at: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type Author = {
  id: string;
  name: string;
  role_title: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Translation = {
  key: string;
  locale: string;
  value: string;
  created_at: string;
  updated_at: string;
};

export type TaxonomyTranslation = {
  taxonomy_id: string;
  locale: string;
  label: string;
  created_at: string;
  updated_at: string;
};
