import { NextResponse } from "next/server";
import { getSupabaseRouteHandlerClient } from "@/lib/supabase/server";
import { defaultRecommendationSettings } from "@/lib/recommendationsSettings";

async function requireAdmin() {
  const supabase = await getSupabaseRouteHandlerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return false;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", auth.user.id)
    .single();
  return profile?.role === "admin";
}

async function loadSettingsFile() {
  const { promises: fs } = await import("fs");
  const path = await import("path");
  const filePath = path.join(process.cwd(), "data", "recommendations-settings.json");
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("ENOENT")) return defaultRecommendationSettings;
    throw error;
  }
}

async function writeSettingsFile(payload: unknown) {
  const { promises: fs } = await import("fs");
  const path = await import("path");
  const dirPath = path.join(process.cwd(), "data");
  const filePath = path.join(dirPath, "recommendations-settings.json");
  await fs.mkdir(dirPath, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  }
  try {
    const settings = await loadSettingsFile();
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  }
  try {
    const body = (await request.json()) as { settings?: unknown };
    if (!body.settings) {
      return NextResponse.json({ error: "Settings manquants." }, { status: 400 });
    }
    await writeSettingsFile(body.settings);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur." },
      { status: 500 },
    );
  }
}
