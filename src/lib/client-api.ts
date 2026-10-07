"use client";

import { usePolarStore } from "@/lib/store";

export type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: { code: string; message: string } };

/** Injects the acting role so the server can enforce permissions (mock auth). */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const role = usePolarStore.getState().role;
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-polaris-role": role,
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await response.json()) as ApiResponse<T>;
  if (!payload.ok) throw new Error(payload.error.message);
  return payload.data;
}

export function highlightTokens(text: string, tokens: string[]): string[] {
  return tokens.filter((token) => token.length > 2 && text.toLowerCase().includes(token));
}
