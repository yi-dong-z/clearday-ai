import { STORAGE_KEY } from "@/lib/plan-constants";
import type { DailyPlan, PlanMode, SavedPlan } from "@/lib/types";

export {
  MAX_NOTE_LENGTH,
  MAX_SAVED_PLANS,
  STORAGE_KEY
} from "@/lib/plan-constants";

export const examples = [
  "Tomorrow I have math homework, an English presentation, laundry, a 30-minute workout, and I need to review React basics before the hackathon.",
  "I have class from 10 to 12, need to finish my resume, practice an interview question, cook dinner, and sleep earlier.",
  "I want to study algorithms, clean my desk, reply to team messages, and prepare a short project demo script tonight."
];

export const modeOptions: Array<{
  value: PlanMode;
  label: string;
  detail: string;
}> = [
  { value: "focused", label: "Focused", detail: "Protect deep work" },
  { value: "balanced", label: "Balanced", detail: "Study and life" },
  { value: "light", label: "Light", detail: "Low-pressure day" }
];

export const monthOptions = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

export const ritualSteps = [
  "Capture messy notes",
  "Pick planning mode",
  "Generate time blocks",
  "Review your plan"
];

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function formatDate(value: string) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric"
  }).format(new Date(`${value}T12:00:00`));
}

export function getTodayDateValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDateParts(value: string) {
  const fallback = getTodayDateValue();
  const [year, month, day] = (value || fallback).split("-").map(Number);

  return {
    year,
    month,
    day
  };
}

export function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export function createDateValue(year: number, month: number, day: number) {
  const safeDay = Math.min(day, getDaysInMonth(year, month));

  return [
    year,
    String(month).padStart(2, "0"),
    String(safeDay).padStart(2, "0")
  ].join("-");
}

export function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function getModeLabel(value: PlanMode) {
  return modeOptions.find((item) => item.value === value)?.label ?? "Focused";
}

export function getTotalMinutes(plan: DailyPlan) {
  return plan.timeline.reduce(
    (total, item) => total + (item.durationMinutes ?? 0),
    0
  );
}

export function formatMinutes(minutes: number) {
  if (!minutes) {
    return "Flexible";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
}

export function safeLoadPlans(): SavedPlan[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) {
      return [];
    }

    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as SavedPlan[]) : [];
  } catch {
    return [];
  }
}

export function savePlans(plans: SavedPlan[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

export function serializePlanForClipboard(plan: SavedPlan) {
  const lines = [
    plan.title,
    "",
    plan.summary,
    "",
    "Top priorities:",
    ...plan.topPriorities.map((item, index) => `${index + 1}. ${item}`),
    "",
    "Timeline:",
    ...plan.timeline.map(
      (item) =>
        `${item.time}: ${item.task} (${item.durationMinutes ?? "?"} min) - ${item.reason}`
    ),
    "",
    "Tips:",
    ...plan.tips.map((tip) => `- ${tip}`)
  ];

  return lines.join("\n");
}
