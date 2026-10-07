/**
 * POLARIS session helper (server-only).
 * Password login issuing an HMAC-signed HttpOnly session cookie.
 * All signing material and passwords are read exclusively from the
 * environment at runtime — no literals in this source file:
 *   POLARIS_SESSION_SIGNING_MATERIAL   (required to sign/verify)
 *   POLARIS_ADMIN_PASSWORD             (admin role login)
 *   POLARIS_EDITOR_PASSWORD            (editor role login)
 */
import { createHmac, timingSafeEqual } from "node:crypto";

import type { Role } from "@/lib/store";

export const SESSION_COOKIE = "polaris_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

type SessionPayload = { role: Role; name: string; exp: number };

function signingMaterial(): string | null {
  return process.env.POLARIS_SESSION_SIGNING_MATERIAL ?? null;
}

function envPassword(role: Role): string | null {
  if (role === "admin") return process.env.POLARIS_ADMIN_PASSWORD ?? null;
  if (role === "editor") return process.env.POLARIS_EDITOR_PASSWORD ?? null;
  return null;
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function sign(value: string): string {
  return createHmac("sha256", signingMaterial()!).update(value).digest("base64url");
}

function encode(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(raw: string | undefined): SessionPayload | null {
  if (!raw || !signingMaterial()) return null;
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = raw.slice(0, dot);
  const stamp = raw.slice(dot + 1);
  if (!safeEqual(stamp, sign(body))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload || typeof payload.exp !== "number") return null;
    if (payload.exp * 1000 < Date.now()) return null;
    if (payload.role !== "public" && payload.role !== "editor" && payload.role !== "admin") return null;
    return payload;
  } catch {
    return null;
  }
}

/** Verifies credentials from the login form. Returns null when invalid. */
export function verifyCredentials(role: Role, password: string): { name: string } | null {
  const expected = envPassword(role);
  if (!expected) return null;
  if (!safeEqual(password, expected)) return null;
  return { name: role === "admin" ? "S. Krishnan" : "Vikram Mehta" };
}

export function issueSession(role: Role, name: string): { cookie: string; maxAge: number } {
  const payload: SessionPayload = {
    role,
    name,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  return {
    cookie: `${SESSION_COOKIE}=${encode(payload)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`,
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function clearSession(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

/** Reads and verifies the session from a Cookie header value. */
export function readSession(cookieHeader: string | null): SessionPayload | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(`${SESSION_COOKIE}=`)) {
      return decode(trimmed.slice(SESSION_COOKIE.length + 1));
    }
  }
  return null;
}
