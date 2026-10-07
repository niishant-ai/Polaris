import { fail, ok, readJson } from "@/lib/api";
import { createAsset, getExpeditions, listAssets } from "@/lib/repositories";
import { getActingRole } from "@/lib/role";
import { isStorageConfigured, storageObjectPath, toStoredFileUrl, uploadToStorage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const kinds = url.searchParams.getAll("kind");
  const assets = await listAssets({
    kinds: kinds.length ? kinds : undefined,
    region: url.searchParams.get("region") ?? undefined,
    yearFrom: url.searchParams.get("yearFrom") ? Number(url.searchParams.get("yearFrom")) : undefined,
    yearTo: url.searchParams.get("yearTo") ? Number(url.searchParams.get("yearTo")) : undefined,
    expeditionSlug: url.searchParams.get("expedition") ?? undefined,
    tag: url.searchParams.get("tag") ?? undefined,
    limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
  });
  return ok({ assets, expeditions: await getExpeditions() });
}

type CreateAssetBody = {
  filename?: string;
  mimeType?: string;
  sizeBytes?: number;
  kind?: string;
  title?: string;
  description?: string;
  expeditionSlug?: string | null;
  tags?: string[];
  year?: number;
  author?: string;
  licence?: string;
  pageCount?: number | null;
  durationSeconds?: number | null;
  sampleText?: string;
};

const VALID_KINDS = new Set(["report", "image", "video", "dataset"]);

export async function POST(request: Request) {
  const role = await getActingRole();
  if (role === "public") {
    return fail("role_forbidden", "Ingesting material requires the Editor or Admin role.", 403);
  }

  const contentType = request.headers.get("content-type") ?? "";

  /* ---------------- multipart upload (real binary files) ---------------- */
  if (contentType.includes("multipart/form-data")) {
    try {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return fail("bad_request", "A file field is required for multipart ingest.", 400);
      }
      const kind = String(form.get("kind") ?? "");
      if (!VALID_KINDS.has(kind)) {
        return fail("bad_request", "kind must be one of report, image, video or dataset.", 400);
      }
      const title = String(form.get("title") ?? "").trim() || file.name;
      const filename = file.name;
      const mimeType = file.type || "application/octet-stream";
      const sizeBytes = file.size;

      let sampleText = String(form.get("sampleText") ?? "");
      // For text-extractable reports, read a bounded preview for passages.
      if (kind === "report" && !sampleText && (mimeType === "text/plain" || mimeType === "text/csv" || mimeType === "application/json")) {
        sampleText = await file.slice(0, 64 * 1024).text();
      }

      // Persist the binary in Supabase Storage when configured; otherwise
      // fall back to metadata-only cataloguing (demo mode).
      let fileUrl = "";
      if (isStorageConfigured()) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60) || "asset";
        // Deterministic object path (no timestamp) so `upsert` dedupes
        // re-uploads of the same title+filename instead of leaking objects.
        const path = storageObjectPath(slug, filename);
        const upload = await uploadToStorage(path, bytes, mimeType);
        if (!upload.ok) {
          return fail("storage_failed", upload.error, 502);
        }
        fileUrl = toStoredFileUrl(path);
      }

      const asset = await createAsset({
        filename,
        mimeType,
        sizeBytes,
        kind,
        title,
        description: String(form.get("description") ?? "").trim() || "Uploaded via multipart ingest.",
        expeditionSlug: (form.get("expeditionSlug") as string) || null,
        tags: String(form.get("tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean),
        year: Number(form.get("year") ?? new Date().getFullYear()),
        author: String(form.get("author") ?? "").trim() || "Unattributed upload",
        licence: String(form.get("licence") ?? "CC-BY-4.0"),
        pageCount: form.get("pageCount") ? Number(form.get("pageCount")) : null,
        durationSeconds: form.get("durationSeconds") ? Number(form.get("durationSeconds")) : null,
        sampleText,
        createdBy: "Vikram Mehta",
        createdByRole: role,
        fileUrl: fileUrl || undefined,
      });
      return ok({ asset, stored: Boolean(fileUrl) }, { status: 201 });
    } catch (error) {
      return fail("ingest_failed", error instanceof Error ? error.message : "Unknown upload failure", 500);
    }
  }

  /* ---------------- legacy JSON ingest (metadata-only) ---------------- */
  const body = await readJson<CreateAssetBody>(request);
  if (!body?.filename || !body.mimeType) {
    return fail("bad_request", "filename and mimeType are required.", 400);
  }
  if (!body.kind || !VALID_KINDS.has(body.kind)) {
    return fail("bad_request", "kind must be one of report, image, video or dataset.", 400);
  }

  try {
    const asset = await createAsset({
      filename: body.filename,
      mimeType: body.mimeType,
      sizeBytes: body.sizeBytes ?? 0,
      kind: body.kind,
      title: body.title?.trim() || body.filename,
      description: body.description?.trim() || "Auto-catalogued asset.",
      expeditionSlug: body.expeditionSlug || null,
      tags: body.tags ?? [],
      year: body.year ?? new Date().getFullYear(),
      author: body.author?.trim() || "Unattributed upload",
      licence: body.licence || "CC-BY-4.0",
      pageCount: body.pageCount ?? null,
      durationSeconds: body.durationSeconds ?? null,
      sampleText: body.sampleText ?? "",
      createdBy: "Vikram Mehta",
      createdByRole: role,
    });
    return ok({ asset }, { status: 201 });
  } catch (error) {
    return fail("ingest_failed", error instanceof Error ? error.message : "Unknown ingest failure", 500);
  }
}
