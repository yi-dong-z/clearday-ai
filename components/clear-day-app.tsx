"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clipboard,
  Clock,
  History,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Loader2,
  RefreshCcw,
  Sparkles,
  TimerReset,
  Trash2
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  MAX_NOTE_LENGTH,
  MAX_SAVED_PLANS,
  cn,
  createDateValue,
  createId,
  examples,
  formatCreatedAt,
  formatDate,
  formatMinutes,
  getDateParts,
  getDaysInMonth,
  getModeLabel,
  getTodayDateValue,
  getTotalMinutes,
  modeOptions,
  monthOptions,
  ritualSteps,
  safeLoadPlans,
  savePlans,
  serializePlanForClipboard
} from "@/lib/plan-utils";
import type { DailyPlan, PlanMode, SavedPlan } from "@/lib/types";

type WorkspaceView = "timeline" | "focus" | "archive";

const workspaceViews: Array<{
  value: WorkspaceView;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { value: "timeline", label: "Timeline", icon: CalendarDays },
  { value: "focus", label: "Focus", icon: ListChecks },
  { value: "archive", label: "Archive", icon: Archive }
];

export function ClearDayCapturePage() {
  const router = useRouter();
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const [rawText, setRawText] = useState(examples[0]);
  const [date, setDate] = useState("");
  const [mode, setMode] = useState<PlanMode>("focused");
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPlans(safeLoadPlans());
      setDate((current) => current || getTodayDateValue());
      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function generatePlan() {
    const currentRawText = notesRef.current?.value ?? rawText;
    const trimmed = currentRawText.trim();

    if (!trimmed) {
      setError("Add your messy task notes first.");
      return;
    }

    if (currentRawText !== rawText) {
      setRawText(currentRawText);
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          rawText: trimmed,
          date,
          mode
        })
      });

      const payload = (await response.json()) as DailyPlan & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Plan generation failed.");
      }

      const savedPlan: SavedPlan = {
        ...payload,
        id: createId(),
        createdAt: new Date().toISOString(),
        originalInput: trimmed,
        mode,
        date
      };

      const nextPlans = [savedPlan, ...safeLoadPlans()].slice(
        0,
        MAX_SAVED_PLANS
      );
      savePlans(nextPlans);
      setPlans(nextPlans);
      router.push(`/plan?id=${encodeURIComponent(savedPlan.id)}`);
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Plan generation failed."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const latestPlan = plans[0] ?? null;
  const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;

  return (
    <main className="min-h-dvh bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-4">
      <div className="mx-auto grid max-w-[1180px] gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <PlannerSidebar
          activeItem="capture"
          savedCount={plans.length}
          blockCount={latestPlan?.timeline.length ?? 0}
          mode={mode}
        />

        <section className="rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <form
            className="grid min-h-[calc(100dvh-2rem)] lg:grid-cols-[minmax(0,1fr)_320px]"
            onSubmit={(event) => {
              event.preventDefault();
              void generatePlan();
            }}
          >
            <div className="border-b border-[var(--border)] p-4 lg:border-b-0 lg:border-r lg:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-[var(--accent-dark)]">
                    <Inbox className="size-4" aria-hidden />
                    Capture
                  </div>
                  <h1 className="mt-2 text-3xl font-semibold leading-tight">
                    Plan a clearer day
                  </h1>
                  <p className="mt-2 max-w-[65ch] text-pretty text-sm leading-6 text-[var(--muted)]">
                    This page is only for messy input and AI generation. After
                    the schedule is created, ClearDay opens the plan page.
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--panel-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  onClick={() => {
                    setRawText("");
                    setError("");
                  }}
                  aria-label="Clear notes"
                >
                  <RefreshCcw className="size-4" aria-hidden />
                </button>
              </div>

              <label className="mt-6 block text-sm font-medium" htmlFor="notes">
                Task dump
              </label>
              <textarea
                id="notes"
                ref={notesRef}
                value={rawText}
                onChange={(event) => setRawText(event.target.value)}
                className="mt-2 min-h-[340px] w-full resize-y rounded-md border border-[var(--border)] bg-white px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
                maxLength={MAX_NOTE_LENGTH}
                placeholder="Example: class at 10, finish resume, review React, gym, prep demo script..."
              />

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--muted)]">
                <span className="font-mono tabular-nums">
                  {rawText.length}/{MAX_NOTE_LENGTH}
                </span>
                <button
                  type="button"
                  className="min-h-9 rounded-md px-2 font-medium text-[var(--accent-dark)] transition hover:bg-[var(--accent-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  onClick={() =>
                    setRawText(
                      examples[
                        (examples.indexOf(rawText) + 1) % examples.length
                      ] ?? examples[1]
                    )
                  }
                >
                  Use another example
                </button>
              </div>

              {error ? (
                <div
                  className="mt-4 flex gap-2 rounded-md border border-[var(--danger)] bg-red-50 px-3 py-2 text-sm text-red-900"
                  role="alert"
                >
                  <AlertCircle
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden
                  />
                  <p className="text-pretty">{error}</p>
                </div>
              ) : null}
            </div>

            <aside className="grid content-start gap-4 p-4 lg:p-6">
              <div>
                <h2 className="text-xl font-semibold">Planning setup</h2>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  Choose how intense today should feel before generating.
                </p>
              </div>

              <EnglishDateSelect value={date} onChange={setDate} />

              <div className="grid gap-2">
                {modeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMode(option.value)}
                    className={cn(
                      "flex min-h-12 items-center justify-between gap-3 rounded-md border px-3 py-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)]",
                      mode === option.value
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "border-[var(--border)] bg-white hover:bg-[var(--panel-muted)]"
                    )}
                    aria-pressed={mode === option.value}
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className="text-right text-[var(--muted)]">
                      {option.detail}
                    </span>
                  </button>
                ))}
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-muted)] p-3">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="font-mono font-semibold tabular-nums">
                      {wordCount}
                    </p>
                    <p className="text-[var(--muted)]">Words</p>
                  </div>
                  <div>
                    <p className="font-semibold">{getModeLabel(mode)}</p>
                    <p className="text-[var(--muted)]">Mode</p>
                  </div>
                  <div>
                    <p className="font-mono font-semibold tabular-nums">
                      {plans.length}
                    </p>
                    <p className="text-[var(--muted)]">Saved</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--accent-dark)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Sparkles className="size-4" aria-hidden />
                )}
                {isLoading ? "Generating schedule" : "Generate schedule"}
              </button>

              {isHydrated && latestPlan ? (
                <Link
                  href={`/plan?id=${latestPlan.id}`}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium transition hover:bg-[var(--panel-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                >
                  View latest plan
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : null}
            </aside>
          </form>
        </section>
      </div>
    </main>
  );
}

export function ClearDayPlanPage({ initialPlanId }: { initialPlanId?: string }) {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string | null>(
    initialPlanId ?? null
  );
  const [workspaceView, setWorkspaceView] =
    useState<WorkspaceView>("timeline");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle"
  );
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const loadedPlans = safeLoadPlans();
      setPlans(loadedPlans);
      setActivePlanId((current) => current ?? loadedPlans[0]?.id ?? null);
      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isConfirmingClear) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsConfirmingClear(false);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [isConfirmingClear]);

  const activePlan = useMemo(
    () => plans.find((plan) => plan.id === activePlanId) ?? plans[0] ?? null,
    [activePlanId, plans]
  );

  function clearHistory() {
    if (!isConfirmingClear) {
      setIsConfirmingClear(true);
      return;
    }

    setPlans([]);
    setActivePlanId(null);
    savePlans([]);
    setIsConfirmingClear(false);
  }

  async function copyPlan() {
    if (!activePlan) {
      return;
    }

    try {
      await navigator.clipboard.writeText(serializePlanForClipboard(activePlan));
      setCopyStatus("copied");
      window.setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      setCopyStatus("failed");
    }
  }

  return (
    <main className="min-h-dvh bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-4">
      <div className="mx-auto grid max-w-[1440px] gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <PlannerSidebar
          activeItem="plan"
          savedCount={plans.length}
          blockCount={activePlan?.timeline.length ?? 0}
          mode={activePlan?.mode ?? "focused"}
        />

        <section className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <div className="flex flex-col gap-3 border-b border-[var(--border)] p-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-[var(--accent-dark)]">
                <LayoutDashboard className="size-4" aria-hidden />
                Plan board
              </div>
              <h1 className="mt-2 text-3xl font-semibold leading-tight">
                {activePlan ? activePlan.title : "No plan selected"}
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {activePlan
                  ? `${formatDate(activePlan.date ?? "")} · ${activePlan.timeline.length} blocks · ${formatMinutes(
                      getTotalMinutes(activePlan)
                    )}`
                  : isHydrated
                    ? "Generate a schedule first, then review it here."
                    : "Loading saved plans..."}
              </p>
            </div>

            <div className="flex flex-wrap items-start gap-2 xl:justify-end">
              <Link
                href="/"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium transition hover:bg-[var(--panel-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              >
                <ArrowLeft className="size-4" aria-hidden />
                New plan
              </Link>

              <div
                className="inline-flex rounded-md border border-[var(--border)] bg-[var(--panel-muted)] p-1"
                role="tablist"
                aria-label="Plan workspace"
              >
                {workspaceViews.map((view) => {
                  const Icon = view.icon;
                  return (
                    <button
                      key={view.value}
                      type="button"
                      onClick={() => setWorkspaceView(view.value)}
                      className={cn(
                        "inline-flex min-h-9 items-center gap-2 rounded px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)]",
                        workspaceView === view.value
                          ? "bg-white text-[var(--foreground)]"
                          : "text-[var(--muted)] hover:bg-white"
                      )}
                      role="tab"
                      aria-selected={workspaceView === view.value}
                    >
                      <Icon className="size-4" aria-hidden />
                      {view.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={!activePlan}
                onClick={() => void copyPlan()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium transition hover:bg-[var(--panel-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50"
              >
                <Clipboard className="size-4" aria-hidden />
                {copyStatus === "copied" ? "Copied" : "Copy plan"}
              </button>
            </div>

            <p className="min-h-5 text-xs text-[var(--muted)]" aria-live="polite">
              {copyStatus === "copied"
                ? "Ready to paste into your submission notes."
                : copyStatus === "failed"
                  ? "Copy failed. Please try again."
                  : ""}
            </p>
          </div>

          {!isHydrated ? (
            <PlanSkeleton />
          ) : workspaceView === "timeline" ? (
            activePlan ? (
              <TimelineWorkspace plan={activePlan} />
            ) : (
              <NoPlanState />
            )
          ) : workspaceView === "focus" ? (
            <FocusWorkspace plan={activePlan} />
          ) : (
            <ArchiveWorkspace
              activePlan={activePlan}
              plans={plans}
              isConfirmingClear={isConfirmingClear}
              onClearHistory={clearHistory}
              onOpenPlan={(plan) => {
                setActivePlanId(plan.id);
                setWorkspaceView("timeline");
              }}
            />
          )}
        </section>
      </div>
    </main>
  );
}

function PlannerSidebar({
  activeItem,
  savedCount,
  blockCount,
  mode
}: {
  activeItem: "capture" | "plan";
  savedCount: number;
  blockCount: number;
  mode: PlanMode;
}) {
  return (
    <aside className="rounded-lg bg-[var(--foreground)] p-4 text-white lg:min-h-[calc(100dvh-2rem)]">
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-md bg-white text-[var(--accent-dark)]">
          <Sparkles className="size-5" aria-hidden />
        </div>
        <div>
          <p className="font-semibold">ClearDay AI</p>
          <p className="text-sm text-white/60">Student planner</p>
        </div>
      </div>

      <nav className="mt-6 grid gap-1" aria-label="ClearDay sections">
        <Link
          href="/"
          className={cn(
            "flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-white/70",
            activeItem === "capture"
              ? "bg-white text-[var(--foreground)]"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          )}
        >
          <Inbox className="size-4" aria-hidden />
          Capture
        </Link>
        <Link
          href="/plan"
          className={cn(
            "flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-white/70",
            activeItem === "plan"
              ? "bg-white text-[var(--foreground)]"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          )}
        >
          <LayoutDashboard className="size-4" aria-hidden />
          Plan board
        </Link>
      </nav>

      <div className="mt-6 rounded-lg border border-white/15 bg-white/5 p-3">
        <div className="flex items-center gap-2">
          <ListChecks className="size-4 text-white/70" aria-hidden />
          <p className="text-sm font-medium">Daily ritual</p>
        </div>
        <ol className="mt-3 grid gap-2">
          {ritualSteps.map((step, index) => (
            <li key={step} className="flex items-center gap-2 text-sm">
              <span className="grid size-6 shrink-0 place-items-center rounded-md bg-white/10 font-mono text-xs tabular-nums text-white/70">
                {index + 1}
              </span>
              <span className="text-white/72">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 grid gap-2 text-sm">
        <div className="flex min-h-11 items-center justify-between gap-3 rounded-md bg-white/8 px-3 py-2">
          <p className="text-white/55">Saved</p>
          <p className="font-semibold tabular-nums">{savedCount}</p>
        </div>
        <div className="flex min-h-11 items-center justify-between gap-3 rounded-md bg-white/8 px-3 py-2">
          <p className="text-white/55">Blocks</p>
          <p className="font-semibold tabular-nums">{blockCount}</p>
        </div>
        <div className="flex min-h-11 items-center justify-between gap-3 rounded-md bg-white/8 px-3 py-2">
          <p className="text-white/55">Mode</p>
          <p className="truncate font-semibold">{getModeLabel(mode)}</p>
        </div>
      </div>
    </aside>
  );
}

function EnglishDateSelect({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const todayValue = getTodayDateValue();
  const todayParts = getDateParts(todayValue);
  const selected = getDateParts(value || todayValue);
  const years = Array.from({ length: 2 }, (_, index) => todayParts.year + index);
  const daysInSelectedMonth = getDaysInMonth(selected.year, selected.month);

  function updateDate(next: Partial<typeof selected>) {
    const year = next.year ?? selected.year;
    const month = next.month ?? selected.month;
    const day = next.day ?? selected.day;
    const nextValue = createDateValue(year, month, day);

    onChange(nextValue < todayValue ? todayValue : nextValue);
  }

  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-medium">Target date</legend>
      <div className="grid gap-2">
        <div className="flex min-h-11 items-center gap-2 rounded-md border border-[var(--border)] bg-white px-3 py-2">
          <CalendarDays className="size-4 text-[var(--muted)]" aria-hidden />
          <p className="text-sm font-medium">
            {formatDate(value || todayValue)}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_80px_92px]">
          <label className="block text-xs font-medium text-[var(--muted)]">
            Month
            <select
              value={selected.month}
              onChange={(event) =>
                updateDate({ month: Number(event.target.value) })
              }
              className="mt-1 min-h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            >
              {monthOptions.map((month, index) => (
                <option key={month} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-medium text-[var(--muted)]">
            Day
            <select
              value={selected.day}
              onChange={(event) =>
                updateDate({ day: Number(event.target.value) })
              }
              className="mt-1 min-h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            >
              {Array.from({ length: daysInSelectedMonth }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-medium text-[var(--muted)]">
            Year
            <select
              value={selected.year}
              onChange={(event) =>
                updateDate({ year: Number(event.target.value) })
              }
              className="mt-1 min-h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </fieldset>
  );
}

function PlanSkeleton() {
  return (
    <div className="grid gap-4 p-4">
      <div className="grid gap-3 xl:grid-cols-[1fr_260px]">
        <div className="h-28 rounded-md bg-[var(--panel-muted)]" />
        <div className="h-28 rounded-md bg-[var(--panel-muted)]" />
      </div>
      <div className="grid gap-3">
        {[0, 1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-20 rounded-md border border-[var(--border)] bg-[var(--panel-muted)]"
          />
        ))}
      </div>
    </div>
  );
}

function NoPlanState() {
  return (
    <div className="grid min-h-[520px] place-items-center p-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto grid size-12 place-items-center rounded-lg border border-[var(--border)] bg-[var(--panel-muted)]">
          <Clock className="size-6 text-[var(--accent)]" aria-hidden />
        </div>
        <h2 className="mt-4 text-xl font-semibold">No saved plan yet</h2>
        <p className="mt-2 text-pretty text-sm leading-6 text-[var(--muted)]">
          Start from the capture page, generate a schedule, and ClearDay will
          open it here.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--accent-dark)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2"
        >
          Create a plan
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

function TimelineWorkspace({ plan }: { plan: SavedPlan }) {
  const totalMinutes = getTotalMinutes(plan);
  const firstBlock = plan.timeline[0];
  const lastBlock = plan.timeline[plan.timeline.length - 1];

  return (
    <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-muted)] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold">AI planning brief</h2>
              <p className="mt-2 max-w-[70ch] text-pretty text-sm leading-6 text-[var(--muted)]">
                {plan.summary}
              </p>
            </div>
            <div className="w-fit rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm">
              <p className="font-medium">{formatDate(plan.date ?? "")}</p>
              <p className="text-[var(--muted)]">
                {getModeLabel(plan.mode)} mode
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <SummaryMetric
              icon={Clock}
              label="Blocks"
              value={String(plan.timeline.length)}
            />
            <SummaryMetric
              icon={TimerReset}
              label="Planned"
              value={formatMinutes(totalMinutes)}
            />
            <SummaryMetric
              icon={CheckCircle2}
              label="Priorities"
              value={String(plan.topPriorities.length)}
            />
          </div>
        </div>

        <ol className="mt-4 divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-white">
          {plan.timeline.map((item, index) => (
            <li
              key={`${item.time}-${item.task}-${index}`}
              className="grid gap-3 p-4 sm:grid-cols-[112px_1fr]"
            >
              <div className="flex items-center gap-2 text-sm font-medium tabular-nums text-[var(--accent-dark)]">
                <Clock className="size-4" aria-hidden />
                {item.time}
              </div>
              <div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <p className="font-semibold">{item.task}</p>
                  {item.durationMinutes ? (
                    <span className="w-fit rounded-md bg-[var(--accent-soft)] px-2 py-1 font-mono text-xs tabular-nums text-[var(--accent-dark)]">
                      {item.durationMinutes} min
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-pretty text-sm leading-6 text-[var(--muted)]">
                  {item.reason}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <aside className="grid h-fit gap-4">
        <div className="rounded-lg border border-[var(--border)] bg-white p-4">
          <div className="flex items-center gap-2">
            <ListChecks className="size-5 text-[var(--accent)]" aria-hidden />
            <h3 className="font-semibold">Priority stack</h3>
          </div>
          <div className="mt-3 grid gap-2">
            {plan.topPriorities.map((priority, index) => (
              <div
                key={`${priority}-${index}`}
                className="rounded-md border border-[var(--border)] bg-[var(--panel-muted)] p-3"
              >
                <p className="font-mono text-xs tabular-nums text-[var(--accent-dark)]">
                  P{index + 1}
                </p>
                <p className="mt-1 text-sm font-medium leading-6">{priority}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-white p-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-5 text-[var(--accent)]" aria-hidden />
            <h3 className="font-semibold">Day range</h3>
          </div>
          <dl className="mt-3 grid gap-3 text-sm">
            <div>
              <dt className="text-[var(--muted)]">Start</dt>
              <dd className="mt-1 font-medium">{firstBlock?.time ?? "Open"}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Wrap</dt>
              <dd className="mt-1 font-medium">{lastBlock?.time ?? "Open"}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Total planned</dt>
              <dd className="mt-1 font-medium">{formatMinutes(totalMinutes)}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}

function FocusWorkspace({ plan }: { plan: SavedPlan | null }) {
  if (!plan) {
    return <NoPlanState />;
  }

  const firstAction = plan.timeline[0];

  return (
    <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="rounded-lg border border-[var(--border)] bg-white p-4">
        <h2 className="text-xl font-semibold">Focus checklist</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          A lightweight execution board for the generated plan.
        </p>

        <div className="mt-4 grid gap-2">
          {plan.topPriorities.map((priority, index) => (
            <label
              key={`${priority}-${index}`}
              className="flex min-h-12 items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--panel-muted)] p-3 text-sm transition hover:bg-white"
            >
              <input
                type="checkbox"
                className="mt-1 size-4 accent-[var(--accent-dark)]"
              />
              <span>
                <span className="block font-mono text-xs tabular-nums text-[var(--accent-dark)]">
                  Priority {index + 1}
                </span>
                <span className="mt-1 block font-medium leading-6">
                  {priority}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <aside className="grid h-fit gap-4">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--panel-muted)] p-4">
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-[var(--accent)]" aria-hidden />
            <h3 className="font-semibold">Start here</h3>
          </div>
          <p className="mt-3 font-medium">{firstAction?.task ?? plan.title}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {firstAction?.reason ?? plan.summary}
          </p>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-white p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-[var(--success)]" aria-hidden />
            <h3 className="font-semibold">Review tips</h3>
          </div>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted)]">
            {plan.tips.map((tip, index) => (
              <li key={`${tip}-${index}`}>{tip}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

function ArchiveWorkspace({
  activePlan,
  plans,
  isConfirmingClear,
  onClearHistory,
  onOpenPlan
}: {
  activePlan: SavedPlan | null;
  plans: SavedPlan[];
  isConfirmingClear: boolean;
  onClearHistory: () => void;
  onOpenPlan: (plan: SavedPlan) => void;
}) {
  return (
    <div className="p-4">
      <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <History className="size-5 text-[var(--accent)]" aria-hidden />
          <div>
            <h2 className="font-semibold">Saved sessions</h2>
            <p className="text-sm text-[var(--muted)]">
              Reopen previous plans from local history.
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={!plans.length}
          onClick={onClearHistory}
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:opacity-50",
            isConfirmingClear
              ? "border-[var(--danger)] bg-red-50 text-red-900"
              : "border-[var(--border)] bg-white text-[var(--muted)] hover:bg-[var(--panel-muted)]"
          )}
        >
          <Trash2 className="size-4" aria-hidden />
          {isConfirmingClear ? "Confirm clear" : "Clear history"}
        </button>
      </div>

      {plans.length ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => onOpenPlan(plan)}
              className={cn(
                "min-h-44 rounded-lg border p-4 text-left transition hover:bg-[var(--panel-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]",
                activePlan?.id === plan.id
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border)] bg-white"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="line-clamp-2 font-semibold">{plan.title}</p>
                {activePlan?.id === plan.id ? (
                  <span className="rounded-md border border-[var(--accent)] px-1.5 py-0.5 text-xs font-medium text-[var(--accent-dark)]">
                    Open
                  </span>
                ) : null}
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                {plan.summary}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs tabular-nums text-[var(--muted)]">
                <span>{formatCreatedAt(plan.createdAt)}</span>
                <span>{plan.timeline.length} blocks</span>
                <span>{formatMinutes(getTotalMinutes(plan))}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--panel-muted)] p-4 text-sm text-[var(--muted)]">
          Generate your first plan to save it here.
        </div>
      )}
    </div>
  );
}

function SummaryMetric({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm">
      <Icon className="size-4 text-[var(--accent)]" aria-hidden />
      <span className="text-[var(--muted)]">{label}</span>
      <span className="ml-auto font-semibold tabular-nums">{value}</span>
    </div>
  );
}
