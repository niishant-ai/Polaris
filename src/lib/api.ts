import { NextResponse } from "next/server";

export type ApiError = { code: string; message: string; details?: unknown };

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(code: string, message: string, status = 400, details?: unknown): NextResponse {
  return NextResponse.json({ ok: false, error: { code, message, details } satisfies ApiError }, { status });
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
