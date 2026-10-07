"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  AlertTriangle,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock,
  GripVertical,
  List,
} from "lucide-react";
import { useState } from "react";

import { apiFetch } from "@/lib/client-api";
import type { DraftSummary, ScheduleSummary } from "@/lib/repositories";
import { usePolarStore } from "@/lib/store";
import { Badge, Button, TabBar } from "@/components/ui/primitives";
import { cn, CHANNELS, statusLabel } from "@/lib/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CHANNEL_STYLE: Record<string, string> = {
  website: "bg-brand text-brand-ink",
  x: "bg-ink text-bg",
  instagram: "bg-aurora text-brand-ink",
  linkedin: "bg-ice text-brand-ink",
  newsletter: "bg-warn text-brand-ink",
  youtube: "bg-danger text-white",
};

function channelLabel(channel: string): string {
  return CHANNELS.find((c) => c.id === channel)?.label ?? channel;
}

export function ScheduleCalendar({
  initialItems,
  approvedDrafts,
}: {
  initialItems: ScheduleSummary[];
  approvedDrafts: DraftSummary[];
}) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(() => new Date());
  const [view, setView] = useState<"month" | "agenda">("month");
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragDraftId, setDragDraftId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const client = useQueryClient();
  const role = usePolarStore((s) => s.role);

  const { data } = useQuery({
    queryKey: ["schedule"],
    queryFn: () => apiFetch<{ items: ScheduleSummary[] }>("/api/schedule").then((d) => d.items),
    initialData: initialItems,
  });
  const liveItems = data ?? items;

  const move = useMutation({
    mutationFn: async (payload: { id: string; scheduledFor: string }) => {
      const result = await apiFetch<{ item: ScheduleSummary }>(`/api/schedule/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify({ scheduledFor: payload.scheduledFor }),
      });
      return result.item;
    },
    onSuccess: (item) => {
      setMessage(`Moved to ${format(parseISO(item.scheduledFor), "d MMM yyyy")}.`);
      void client.invalidateQueries({ queryKey: ["schedule"] });
      void client.invalidateQueries({ queryKey: ["stats"] });
    },
    onError: (error: Error) => setMessage(error.message),
  });

  const schedule = useMutation({
    mutationFn: async (payload: { draftId: string; scheduledFor: string; channel: string }) => {
      const result = await apiFetch<{ item: ScheduleSummary }>("/api/schedule", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return result.item;
    },
    onSuccess: (item) => {
      setMessage(`Scheduled “${item.headline}” for ${format(parseISO(item.scheduledFor), "d MMM")}.`);
      void client.invalidateQueries({ queryKey: ["schedule"] });
    },
    onError: (error: Error) => setMessage(error.message),
  });

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const itemsOn = (day: Date) =>
    liveItems.filter((item) => isSameDay(parseISO(item.scheduledFor), day));

  const crowded = (day: Date) => {
    const dayItems = itemsOn(day);
    const perChannel = new Map<string, number>();
    for (const item of dayItems) perChannel.set(item.channel, (perChannel.get(item.channel) ?? 0) + 1);
    return [...perChannel.values()].some((count) => count > 3);
  };

  const dropOnDay = (day: Date) => {
    const iso = `${format(day, "yyyy-MM-dd")}T10:00:00.000Z`;
    if (dragId) {
      setItems((current) =>
        current.map((item) => (item.id === dragId ? { ...item, scheduledFor: iso } : item)),
      );
      move.mutate({ id: dragId, scheduledFor: iso });
      setDragId(null);
    } else if (dragDraftId) {
      const draft = approvedDrafts.find((d) => d.id === dragDraftId);
      if (draft) {
        schedule.mutate({ draftId: draft.id, scheduledFor: iso, channel: draft.format === "social" ? "x" : "website" });
      }
      setDragDraftId(null);
    }
  };

  const shift = (id: string, days: number) => {
    const item = liveItems.find((entry) => entry.id === id);
    if (!item) return;
    const next = addDays(parseISO(item.scheduledFor), days);
    const iso = `${format(next, "yyyy-MM-dd")}T10:00:00.000Z`;
    setItems((current) => current.map((entry) => (entry.id === id ? { ...entry, scheduledFor: iso } : entry)));
    move.mutate({ id, scheduledFor: iso });
  };

  const selectedItem = liveItems.find((item) => item.id === selected) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            aria-label="Previous month"
            onClick={() => setCursor(addMonths(cursor, -1))}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
          <p className="min-w-[9.5rem] text-center font-[family-name:var(--font-display)] text-lg text-ink">
            {format(cursor, "MMMM yyyy")}
          </p>
          <Button
            variant="secondary"
            size="sm"
            aria-label="Next month"
            onClick={() => setCursor(addMonths(cursor, 1))}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCursor(new Date())}>
            Today
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {CHANNELS.map((channel) => (
              <span
                key={channel.id}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[0.625rem] font-semibold",
                  CHANNEL_STYLE[channel.id],
                )}
              >
                {channel.label}
              </span>
            ))}
          </div>
          <TabBar
            ariaLabel="Calendar view"
            value={view}
            onChange={setView}
            tabs={[
              { id: "month", label: "Month" },
              { id: "agenda", label: "Agenda" },
            ]}
          />
        </div>
      </div>

      {message ? (
        <p role="status" className="rounded-xl border border-line bg-surface-2 p-3 text-[0.8125rem] text-ink-2">
          {message}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        {view === "month" ? (
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="grid grid-cols-7 border-b border-line">
              {WEEKDAYS.map((day) => (
                <div key={day} className="px-2 py-2 text-center label-micro">
                  <span className="sm:hidden">{day.slice(0, 1)}</span>
                  <span className="hidden sm:inline">{day}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((day) => {
                const dayItems = itemsOn(day);
                const outside = !isSameMonth(day, cursor);
                return (
                  <div
                    key={day.toISOString()}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => dropOnDay(day)}
                    className={cn(
                      "min-h-24 border-b border-r border-line p-1.5 transition-colors last:border-r-0 sm:min-h-28",
                      outside ? "bg-surface-2/60" : "bg-surface",
                      isToday(day) && "bg-brand-soft/40",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          "font-[family-name:var(--font-mono)] text-[0.6875rem] tnum",
                          isToday(day) ? "font-bold text-brand" : outside ? "text-ink-3" : "text-ink-2",
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      {crowded(day) ? (
                        <AlertTriangle
                          className="size-3 text-warn"
                          aria-label="More than three posts on one channel today"
                          role="img"
                        />
                      ) : null}
                    </div>
                    <ul className="mt-1 space-y-1">
                      <AnimatePresence initial={false}>
                        {dayItems.map((item) => (
                          <motion.li
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.94 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.22 }}
                          >
                            <button
                              type="button"
                              draggable
                              onDragStart={() => setDragId(item.id)}
                              onDragEnd={() => setDragId(null)}
                              onClick={() => setSelected(item.id)}
                              aria-pressed={selected === item.id}
                              className={cn(
                                "flex w-full cursor-grab items-center gap-1 rounded px-1.5 py-1 text-left text-[0.625rem] font-semibold leading-tight active:cursor-grabbing",
                                CHANNEL_STYLE[item.channel] ?? "bg-surface-3 text-ink",
                                selected === item.id && "ring-2 ring-brand ring-offset-1",
                              )}
                            >
                              <GripVertical className="size-2.5 shrink-0 opacity-60" aria-hidden="true" />
                              <span className="truncate">{item.headline}</span>
                            </button>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-surface p-5">
            <ol className="space-y-3">
              {liveItems.length === 0 ? (
                <li className="py-8 text-center text-sm text-ink-3">Nothing scheduled yet.</li>
              ) : (
                [...liveItems]
                  .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))
                  .map((item) => (
                    <li key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-3">
                      <span className="w-24 shrink-0 font-[family-name:var(--font-mono)] text-[0.6875rem] text-ink-3 tnum">
                        {format(parseISO(item.scheduledFor), "d MMM · HH:mm")}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[0.625rem] font-semibold",
                          CHANNEL_STYLE[item.channel] ?? "bg-surface-3 text-ink",
                        )}
                      >
                        {channelLabel(item.channel)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-medium text-ink">
                        {item.headline}
                      </span>
                      <Badge>{statusLabel(item.status)}</Badge>
                    </li>
                  ))
              )}
            </ol>
          </div>
        )}

        <div className="space-y-4">
          {selectedItem ? (
            <div className="rounded-2xl border border-brand/40 bg-brand-soft/40 p-4">
              <p className="label-micro">Selected item</p>
              <p className="mt-2 text-[0.875rem] font-semibold leading-snug text-ink">{selectedItem.headline}</p>
              <p className="mt-1 text-[0.6875rem] text-ink-3">
                {format(parseISO(selectedItem.scheduledFor), "EEEE d MMMM yyyy")} ·{" "}
                {channelLabel(selectedItem.channel)}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Button size="sm" variant="secondary" onClick={() => shift(selectedItem.id, -7)}>
                  − 1 week
                </Button>
                <Button size="sm" variant="secondary" onClick={() => shift(selectedItem.id, -1)}>
                  − 1 day
                </Button>
                <Button size="sm" variant="secondary" onClick={() => shift(selectedItem.id, 1)}>
                  + 1 day
                </Button>
                <Button size="sm" variant="secondary" onClick={() => shift(selectedItem.id, 7)}>
                  + 1 week
                </Button>
              </div>
              <p className="mt-3 text-[0.6875rem] leading-relaxed text-ink-3">
                Dragging is optional — these buttons provide the keyboard equivalent required by WCAG 2.2
                criterion 2.5.7.
              </p>
            </div>
          ) : null}

          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="label-micro flex items-center gap-1.5">
              <CalendarPlus className="size-3" aria-hidden="true" /> Approved &amp; unscheduled
            </p>
            {approvedDrafts.length === 0 ? (
              <p className="mt-3 flex items-start gap-2 text-[0.8125rem] leading-relaxed text-ink-3">
                <Clock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                Nothing waiting. Approve a draft in the review queue and it will appear here.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {approvedDrafts.map((draft) => (
                  <li key={draft.id}>
                    <button
                      type="button"
                      draggable
                      onDragStart={() => setDragDraftId(draft.id)}
                      onDragEnd={() => setDragDraftId(null)}
                      onClick={() =>
                        schedule.mutate({
                          draftId: draft.id,
                          scheduledFor: `${format(addDays(new Date(), 1), "yyyy-MM-dd")}T10:00:00.000Z`,
                          channel: draft.format === "social" ? "x" : "website",
                        })
                      }
                      className="flex w-full cursor-grab items-start gap-2 rounded-lg border border-line bg-surface-2 p-2.5 text-left transition-colors hover:border-brand active:cursor-grabbing"
                    >
                      <GripVertical className="mt-0.5 size-3 shrink-0 text-ink-3" aria-hidden="true" />
                      <span className="min-w-0">
                        <span className="block truncate text-[0.8125rem] font-medium text-ink">
                          {draft.headline}
                        </span>
                        <span className="mt-0.5 block text-[0.625rem] text-ink-3">
                          {draft.format} · {draft.audience} · drag onto a day or click to schedule tomorrow
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {role === "public" ? (
              <p className="mt-3 text-[0.6875rem] text-warn">
                Scheduling requires the Editor or Admin role.
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="label-micro flex items-center gap-1.5">
              <List className="size-3" aria-hidden="true" /> Channel load this month
            </p>
            <ul className="mt-3 space-y-2">
              {CHANNELS.map((channel) => {
                const count = liveItems.filter(
                  (item) =>
                    item.channel === channel.id && isSameMonth(parseISO(item.scheduledFor), cursor),
                ).length;
                return (
                  <li key={channel.id} className="flex items-center gap-2 text-[0.75rem]">
                    <span
                      className={cn("size-2 rounded-full", CHANNEL_STYLE[channel.id])}
                      aria-hidden="true"
                    />
                    <span className="flex-1 text-ink-2">{channel.label}</span>
                    <span className="tnum text-ink-3">{count}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
