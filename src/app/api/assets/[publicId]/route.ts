import { fail, ok } from "@/lib/api";
import { getAssetDetail } from "@/lib/repositories";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await params;
  const detail = await getAssetDetail(publicId);
  if (!detail) return fail("not_found", `No asset with id "${publicId}".`, 404);
  return ok(detail);
}
