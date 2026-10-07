import { fail, ok, readJson } from "@/lib/api";
import { clearSession, issueSession, verifyCredentials } from "@/lib/session";
import type { Role } from "@/lib/store";

export const dynamic = "force-dynamic";

type LoginBody = { role?: string; password?: string };

export async function POST(request: Request) {
  const body = await readJson<LoginBody>(request);
  const role = body?.role;
  if (role !== "admin" && role !== "editor") {
    return fail("bad_request", "role must be admin or editor.", 400);
  }
  if (!body?.password || typeof body.password !== "string") {
    return fail("bad_request", "password is required.", 400);
  }

  const identity = verifyCredentials(role as Role, body.password);
  if (!identity) {
    return fail("invalid_credentials", "Invalid password for the selected role.", 401);
  }

  const session = issueSession(role as Role, identity.name);
  const response = ok({ role, name: identity.name });
  response.headers.append("Set-Cookie", session.cookie);
  return response;
}

export async function DELETE() {
  const response = ok({ signedOut: true });
  response.headers.append("Set-Cookie", clearSession());
  return response;
}
