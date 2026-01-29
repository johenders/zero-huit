import { PortfolioPage } from "@/app/portfolio/page";

export const dynamic = "force-dynamic";

export default async function PortfolioEn() {
  return PortfolioPage({ locale: "en" });
}
