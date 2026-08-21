import { createClient } from "@supabase/supabase-js";

/**
 * DeepAI image generation with a rotating pool of API keys.
 *
 * Every key holds a small balance. When a key runs out of credit (402 / "out of
 * credits") or its auth breaks (401 / 403) we disable it automatically and move
 * on to the next one. Transient failures only bump a failure counter.
 */

type KeyRow = {
  id: string;
  api_key: string;
  calls: number;
  failures: number;
};

function db() {
  return createClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_SERVICE_ROLE_KEY"]!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function listKeys() {
  const { data } = await db()
    .from("music_deepai_keys")
    .select("id, label, active, disabled_reason, calls, failures, created_at")
    .order("created_at", { ascending: true });
  return (data ?? []) as {
    id: string;
    label: string | null;
    active: boolean;
    disabled_reason: string | null;
    calls: number;
    failures: number;
  }[];
}

export async function addKey(apiKey: string, label?: string) {
  const { error } = await db()
    .from("music_deepai_keys")
    .upsert(
      { api_key: apiKey.trim(), label: label ?? null, active: true, disabled_reason: null },
      { onConflict: "api_key" },
    );
  if (error) throw new Error(error.message);
}

async function activeKeys(): Promise<KeyRow[]> {
  const { data } = await db()
    .from("music_deepai_keys")
    .select("id, api_key, calls, failures")
    .eq("active", true)
    .order("calls", { ascending: true })
    .limit(20);
  const rows = (data ?? []) as KeyRow[];
  const fallback = process.env["DEEPAI_API_KEY"];
  if (fallback && !rows.some((r) => r.api_key === fallback)) {
    rows.push({ id: "env", api_key: fallback, calls: 0, failures: 0 });
  }
  return rows;
}

async function disable(id: string, reason: string) {
  if (id === "env") return;
  await db().from("music_deepai_keys").update({ active: false, disabled_reason: reason }).eq("id", id);
}

async function bump(row: KeyRow, ok: boolean) {
  if (row.id === "env") return;
  await db()
    .from("music_deepai_keys")
    .update({
      calls: row.calls + 1,
      failures: ok ? row.failures : row.failures + 1,
      last_used_at: new Date().toISOString(),
    })
    .eq("id", row.id);
}

const CLEAN_STYLE =
  "clean modern album cover, bold minimal composition, soft grain, rich gradient lighting, high detail, no text, no watermark";

/** Generates an image and returns its URL, rotating keys until one succeeds. */
export async function deepaiImage(prompt: string, style = CLEAN_STYLE): Promise<string | null> {
  const keys = await activeKeys();
  if (keys.length === 0) return null;

  for (const row of keys) {
    try {
      const form = new FormData();
      form.set("text", `${prompt}, ${style}`);
      const res = await fetch("https://api.deepai.org/api/text2img", {
        method: "POST",
        headers: { "api-key": row.api_key },
        body: form,
      });
      const body = await res.text();

      if (res.status === 401 || res.status === 403) {
        await disable(row.id, `auth error ${res.status}`);
        continue;
      }
      if (res.status === 402 || /out of credit|quota|insufficient/i.test(body)) {
        await disable(row.id, "out of credits");
        continue;
      }
      if (!res.ok) {
        await bump(row, false);
        continue;
      }

      const data = JSON.parse(body) as { output_url?: string; err?: string };
      if (!data.output_url) {
        if (data.err && /credit|quota/i.test(data.err)) await disable(row.id, "out of credits");
        else await bump(row, false);
        continue;
      }
      await bump(row, true);
      return data.output_url;
    } catch (e) {
      console.error("DeepAI request failed", e);
      await bump(row, false);
    }
  }
  return null;
}
