"use client";

import { create } from "zustand";

export type Role = "public" | "editor" | "admin";

export const ROLE_META: Record<Role, { label: string; person: string; blurb: string }> = {
  public: {
    label: "Public visitor",
    person: "Meera · student",
    blurb: "Read the archive. Reading level: general public.",
  },
  editor: {
    label: "Editor",
    person: "Vikram Mehta · sci-comm",
    blurb: "Ingest, generate, submit and approve outreach content.",
  },
  admin: {
    label: "Admin",
    person: "S. Krishnan · outreach lead",
    blurb: "Everything an editor can do, plus publishing.",
  },
};

type PolarState = {
  role: Role;
  hydrated: boolean;
  paletteOpen: boolean;
  lastAudience: "public" | "student" | "researcher";
  setRole: (role: Role) => void;
  hydrate: () => void;
  setPaletteOpen: (open: boolean) => void;
  setLastAudience: (audience: "public" | "student" | "researcher") => void;
};

const STORAGE_KEY = "polaris.role";

export const usePolarStore = create<PolarState>((set) => ({
  role: "editor",
  hydrated: false,
  paletteOpen: false,
  lastAudience: "public",
  setRole: (role) => {
    set({ role });
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, role);
      document.documentElement.dataset.role = role;
    }
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const role = stored === "public" || stored === "editor" || stored === "admin" ? stored : "editor";
    set({ role, hydrated: true });
    document.documentElement.dataset.role = role;
  },
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  setLastAudience: (lastAudience) => set({ lastAudience }),
}));

export function canGenerate(role: Role): boolean {
  return role === "editor" || role === "admin";
}

export function canApprove(role: Role): boolean {
  return role === "editor" || role === "admin";
}

export function canPublish(role: Role): boolean {
  return role === "admin";
}
