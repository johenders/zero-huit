import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@supabase/supabase-js";

function getCloudflareEnv() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_STREAM_TOKEN;
  if (!accountId) throw new Error("Missing env: CLOUDFLARE_ACCOUNT_ID");
  if (!token) throw new Error("Missing env: CLOUDFLARE_STREAM_TOKEN");
  return { accountId, token };
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") ?? "";
    const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!jwt) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { uid?: string };
    const uid = body.uid?.trim();
    if (!uid) {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });
    }

    const { url, anonKey } = getSupabaseEnv();
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      },
    });

    const { data: auth } = await supabase.auth.getUser(jwt);
    if (!auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", auth.user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { accountId, token } = getCloudflareEnv();
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(
        accountId,
      )}/stream/${encodeURIComponent(uid)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const rawText = await response.text();
    let json: { success?: boolean; errors?: unknown[] } | null = null;
    try {
      json = rawText ? (JSON.parse(rawText) as { success?: boolean; errors?: unknown[] }) : null;
    } catch {
      json = null;
    }

    const errors = json?.errors ?? [];
    const hasNotFound =
      response.status === 404 ||
      (Array.isArray(errors) &&
        errors.some((err) => {
          if (!err || typeof err !== "object") return false;
          if (!("code" in err)) return false;
          const code = (err as { code?: string | number }).code;
          return String(code) === "10003";
        }));

    if (!response.ok && !hasNotFound) {
      return NextResponse.json(
        { error: "Cloudflare error", details: rawText },
        { status: 502 },
      );
    }

    if (json && json.success === false && !hasNotFound) {
      return NextResponse.json(
        { error: "Cloudflare error", details: json.errors ?? json },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 },
    );
  }
}
