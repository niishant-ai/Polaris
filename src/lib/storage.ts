/**
 * Supabase Storage helper (server-only, official supabase-js client).
 * All credentials are read exclusively from environment variables at runtime:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE, optional SUPABASE_ASSETS_BUCKET.
 * This source file contains no literal credentials.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const BUCKET = process.env.SUPABASE_ASSETS_BUCKET ?? "assets";

let cachedClient: SupabaseClient | null = null;

export function isStorageConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE);
}

function getClient(): SupabaseClient | null {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) return null;
  cachedClient ??= createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE,
    { auth: { persistSession: false } },
  );
  return cachedClient;
}

export function storageObjectPath(assetPublicId: string, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
  return `${assetPublicId}/${safe}`;
}

/** Uploads bytes to the private assets bucket. */
export async function uploadToStorage(
  path: string,
  bytes: Uint8Array,
  mimeType: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = getClient();
  if (!client) {
    return { ok: false, error: "Supabase Storage is not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE missing)." };
  }
  const { error } = await client.storage.from(BUCKET).upload(path, bytes, {
    contentType: mimeType || "application/octet-stream",
    upsert: true,
  });
  if (error) return { ok: false, error: `Storage upload failed: ${error.message}` };
  return { ok: true };
}

/** Creates a short-lived signed URL for a private object. */
export async function createSignedUrl(
  path: string,
  expiresInSeconds = 300,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const client = getClient();
  if (!client) {
    return { ok: false, error: "Supabase Storage is not configured." };
  }
  const { data, error } = await client.storage.from(BUCKET).createSignedUrl(path, expiresInSeconds);
  if (error || !data) {
    return { ok: false, error: `Signed URL failed: ${error?.message ?? "no data returned"}` };
  }
  return { ok: true, url: data.signedUrl };
}

/** fileUrl prefix marking objects that live in Supabase Storage. */
export const STORAGE_URL_PREFIX = "supabase:";

export function toStoredFileUrl(path: string): string {
  return `${STORAGE_URL_PREFIX}${BUCKET}/${path}`;
}

export function parseStoredFileUrl(fileUrl: string): string | null {
  if (!fileUrl.startsWith(STORAGE_URL_PREFIX)) return null;
  const rest = fileUrl.slice(STORAGE_URL_PREFIX.length);
  const prefix = `${BUCKET}/`;
  return rest.startsWith(prefix) ? rest.slice(prefix.length) : rest;
}
