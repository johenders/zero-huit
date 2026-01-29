import { ProjectsPage } from "@/app/projects/page";

export const dynamic = "force-dynamic";

export default async function ProjectsEn() {
  return ProjectsPage({ locale: "en" });
}
