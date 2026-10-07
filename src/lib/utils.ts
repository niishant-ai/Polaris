import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
}

export function formatDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function relativeTime(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (Math.abs(mins) < 1) return "just now";
  if (Math.abs(mins) < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return `${days}d ago`;
  return formatDate(d);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 72);
}

export function toIsoDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const d = `${date.getUTCDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const REGIONS = [
  { id: "antarctic", label: "Antarctic" },
  { id: "arctic", label: "Arctic" },
  { id: "southern-ocean", label: "Southern Ocean" },
  { id: "himalaya", label: "Himalaya" },
] as const;

export const KINDS = [
  { id: "report", label: "Reports", singular: "Report" },
  { id: "image", label: "Images", singular: "Image" },
  { id: "video", label: "Videos", singular: "Video" },
  { id: "dataset", label: "Datasets", singular: "Dataset" },
] as const;

export const CHANNELS = [
  { id: "website", label: "Website", tone: "brand" },
  { id: "x", label: "X / Twitter", tone: "ink" },
  { id: "instagram", label: "Instagram", tone: "aurora" },
  { id: "linkedin", label: "LinkedIn", tone: "ice" },
  { id: "newsletter", label: "Newsletter", tone: "warn" },
] as const;

export function regionLabel(region: string): string {
  return REGIONS.find((r) => r.id === region)?.label ?? region;
}

export function kindLabel(kind: string): string {
  return KINDS.find((k) => k.id === kind)?.singular ?? kind;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export type Tone = "neutral" | "brand" | "aurora" | "warn" | "danger" | "ice";

/** Server-safe status helpers — imported by both server and client components. */
export function statusTone(status: string): Tone {
  switch (status) {
    case "published":
    case "catalogued":
      return "aurora";
    case "approved":
      return "brand";
    case "in_review":
      return "warn";
    case "rejected":
      return "danger";
    default:
      return "neutral";
  }
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: "Draft",
    in_review: "In review",
    approved: "Approved",
    published: "Published",
    rejected: "Rejected",
    catalogued: "Catalogued",
    processing: "Processing",
    planned: "Planned",
  };
  return map[status] ?? status;
}
