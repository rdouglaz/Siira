"use client";

import { createClient } from "@/lib/supabase/client";

type EdgeResult<T> = { data: T; response: Response };

/** Calls the Supabase Edge API with the current user's access token. */
export async function callEdge<T>(
  action: string,
  body?: Record<string, unknown>,
  init?: RequestInit
): Promise<EdgeResult<T>> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Please sign in to use this feature.");

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/siira-api/${action}`;
  const response = await fetch(url, {
    ...init,
    method: init?.method ?? "POST",
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${session.access_token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    body: body ? JSON.stringify(body) : init?.body,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Request failed (${response.status})`);
  }

  return { data: (await response.json()) as T, response };
}

export async function fetchEdgeAudio(body: Record<string, unknown>): Promise<Blob> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Please sign in to use speech.");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/siira-api/deepgram/tts`,
    {
      method: "POST",
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `TTS failed (${response.status})`);
  }
  return response.blob();
}
