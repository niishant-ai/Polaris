import { cookies, headers } from "next/headers";

import { readSession, SESSION_COOKIE } from "@/lib/session";
import type { Role } from "@/lib/store";

/**
 * Resolves the acting role: a verified session cookie wins. The legacy
 * x-polaris-role header is only honoured when POLARIS_ALLOW_ROLE_HEADER=true,
 * so a public deployment can never be privilege-escalated by a spoofed header.
 * Anonymous visitors get read-only access.
 */
export async function getActingRole(): Promise<Role> {
  const cookieJar = await cookies();
  // readSession() parses a Cookie header, so serialise the jar rather than
  // passing a bare value (which would never match the cookie name).
  const cookieHeader = cookieJar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const session = readSession(cookieHeader || null);
  if (session) return session.role;

  if (process.env.POLARIS_ALLOW_ROLE_HEADER === "true") {
    const headerBag = await headers();
    const value = headerBag.get("x-polaris-role");
    return value === "public" || value === "editor" || value === "admin" ? value : "public";
  }

  return "public";
}
