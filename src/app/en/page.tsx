import { HomePage } from "@/app/page";

export const dynamic = "force-dynamic";

export default async function HomeEn() {
  return HomePage({ locale: "en" });
}
