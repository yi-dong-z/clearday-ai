export type PlanMode = "focused" | "balanced" | "light";

export type TimelineItem = {
  time: string;
  task: string;
  reason: string;
  durationMinutes?: number;
};

export type DailyPlan = {
  title: string;
  summary: string;
  topPriorities: string[];
  timeline: TimelineItem[];
  tips: string[];
};

export type GeneratePlanRequest = {
  rawText: string;
  date?: string;
  mode?: PlanMode;
};

export type SavedPlan = DailyPlan & {
  id: string;
  createdAt: string;
  originalInput: string;
  mode: PlanMode;
  date?: string;
};
