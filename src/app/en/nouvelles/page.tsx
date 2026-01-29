import { NouvellesPage } from "@/app/nouvelles/page";

export const dynamic = "force-dynamic";

export default async function NouvellesEn() {
  return NouvellesPage({ locale: "en" });
}
