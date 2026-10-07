import { ok } from "@/lib/api";
import { clearSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = ok({ signedOut: true });
  response.headers.append("Set-Cookie", clearSession());
  return response;
}
