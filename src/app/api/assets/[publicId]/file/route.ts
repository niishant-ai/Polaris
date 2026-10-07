import { fail } from "@/lib/api";
import { getAssetDetail } from "@/lib/repositories";
import { getActingRole } from "@/lib/role";
import { createSignedUrl, isStorageConfigured, parseStoredFileUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

/**
 * GET /api/assets/[publicId]/file
 * Resolves the stored file for an asset and 302-redirects to a short-lived
 * signed URL (private Supabase Storage object). Metadata-only records 404.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;

  const detail = await getAssetDetail(publicId);
  if (!detail) return fail("not_found", `No asset with id "${publicId}".`, 404);

  const path = parseStoredFileUrl(detail.asset.fileUrl ?? "");
  if (!path) {
    return fail("no_file", "This asset has no stored binary file (metadata-only record).", 404);
  }
  if (!isStorageConfigured()) {
    return fail("storage_unconfigured", "Supabase Storage is not configured on the server.", 503);
  }

  // Unpublished research binaries are restricted to staff roles; published
  // open-licence assets remain readable by everyone.
  const role = await getActingRole();
  const isPublic = detail.asset.status === "published" && detail.asset.licence.startsWith("CC-");
  if (!isPublic && role === "public") {
    return fail("role_forbidden", "This file is restricted to Reviewer or Admin roles.", 403);
  }

  const signed = await createSignedUrl(path, 300);
  if (!signed.ok) return fail("sign_failed", signed.error, 502);

  return Response.redirect(signed.url, 302);
}
