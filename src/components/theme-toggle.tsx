"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type ThemeChoice = "system" | "light" | "dark";
const STORAGE_KEY = "polaris.theme";

function applyChoice(choice: ThemeChoice) {
  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = choice === "system" ? (systemDark ? "dark" : "light") : choice;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  window.localStorage.setItem(STORAGE_KEY, choice);
}

export function ThemeToggle({ className }: { className?: string }) {
  const [choice, setChoice] = useState<ThemeChoice>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial: ThemeChoice =
      stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    setChoice(initial);
    setMounted(true);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const current = (window.localStorage.getItem(STORAGE_KEY) ?? "system") as ThemeChoice;
      if (current === "system") applyChoice("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const options: { id: ThemeChoice; label: string; Icon: typeof Sun }[] = [
    { id: "system", label: "Match system theme", Icon: Monitor },
    { id: "light", label: "Light theme", Icon: Sun },
    { id: "dark", label: "Dark theme", Icon: Moon },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn("flex items-center gap-0.5 rounded-full border border-line bg-surface p-0.5", className)}
    >
      {options.map(({ id, label, Icon }) => {
        const active = mounted && choice === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => {
              setChoice(id);
              applyChoice(id);
            }}
            className={cn(
              "flex size-7 items-center justify-center rounded-full transition-colors",
              active ? "bg-brand text-brand-ink" : "text-ink-3 hover:bg-surface-2 hover:text-ink-2",
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

/** Blocking script: sets the theme before first paint so there is no flash. */
export const THEME_SCRIPT = `(function(){try{var k='polaris.theme';var s=localStorage.getItem(k)||'system';var d=s==='dark'||(s==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var t=d?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.dataset.theme='light';}})();`;
