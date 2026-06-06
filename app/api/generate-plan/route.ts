import { NextResponse } from "next/server";
import { MAX_NOTE_LENGTH } from "@/lib/plan-constants";
import type { DailyPlan, GeneratePlanRequest, PlanMode } from "@/lib/types";
import { planSchema } from "@/lib/plan-schema";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = "gpt-5.4-mini";

function extractOutputText(payload: unknown): string {
  if (
    payload &&
    typeof payload === "object" &&
    "output_text" in payload &&
    typeof payload.output_text === "string"
  ) {
    return payload.output_text;
  }

  const output = payload && typeof payload === "object" && "output" in payload
    ? payload.output
    : undefined;

  if (!Array.isArray(output)) {
    return "";
  }

  return output
    .flatMap((item) => {
      if (!item || typeof item !== "object" || !("content" in item)) {
        return [];
      }
      const content = item.content;
      if (!Array.isArray(content)) {
        return [];
      }
      return content
        .map((part) => {
          if (!part || typeof part !== "object") {
            return "";
          }
          if ("text" in part && typeof part.text === "string") {
            return part.text;
          }
          if ("output_text" in part && typeof part.output_text === "string") {
            return part.output_text;
          }
          return "";
        })
        .filter(Boolean);
    })
    .join("\n");
}

function normalizeMode(mode: unknown): PlanMode {
  if (mode === "focused" || mode === "balanced" || mode === "light") {
    return mode;
  }
  return "focused";
}

function isValidPlan(plan: unknown): plan is DailyPlan {
  if (!plan || typeof plan !== "object") {
    return false;
  }

  const candidate = plan as DailyPlan;
  return (
    typeof candidate.title === "string" &&
    typeof candidate.summary === "string" &&
    Array.isArray(candidate.topPriorities) &&
    Array.isArray(candidate.timeline) &&
    Array.isArray(candidate.tips) &&
    candidate.timeline.every(
      (item) =>
        item &&
        typeof item.time === "string" &&
        typeof item.task === "string" &&
        typeof item.reason === "string"
    )
  );
}

export async function POST(request: Request) {
  let body: GeneratePlanRequest;

  try {
    body = (await request.json()) as GeneratePlanRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawText = body.rawText?.trim();

  if (!rawText) {
    return NextResponse.json(
      { error: "Add your messy task notes before generating a plan." },
      { status: 400 }
    );
  }

  if (rawText.length > MAX_NOTE_LENGTH) {
    return NextResponse.json(
      {
        error: `Keep the note under ${MAX_NOTE_LENGTH.toLocaleString("en")} characters for the hackathon demo.`
      },
      { status: 400 }
    );
  }

  const mode = normalizeMode(body.mode);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OpenAI API key is missing. Add OPENAI_API_KEY to your local .env.local or Vercel environment variables."
      },
      { status: 500 }
    );
  }

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;

  const prompt = [
    "You are ClearDay AI, a calm planning assistant for students and beginners.",
    "Turn messy notes into a practical day plan. Prefer concrete tasks, realistic duration, and a focused sequence.",
    "Use concise English. Avoid motivational fluff. If the user gives no exact time, create sensible blocks such as Morning, Midday, Afternoon, Evening.",
    `Planning mode: ${mode}.`,
    body.date ? `Target date: ${body.date}.` : "Target date: not specified.",
    "Messy notes:",
    rawText
  ].join("\n\n");

  try {
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        input: prompt,
        text: {
          format: {
            type: "json_schema",
            name: "daily_plan",
            strict: true,
            schema: planSchema
          }
        }
      })
    });

    const payload = (await response.json()) as unknown;

    if (!response.ok) {
      const message =
        payload &&
        typeof payload === "object" &&
        "error" in payload &&
        payload.error &&
        typeof payload.error === "object" &&
        "message" in payload.error &&
        typeof payload.error.message === "string"
          ? payload.error.message
          : "OpenAI request failed.";

      return NextResponse.json({ error: message }, { status: response.status });
    }

    const outputText = extractOutputText(payload);
    const plan = JSON.parse(outputText) as unknown;

    if (!isValidPlan(plan)) {
      return NextResponse.json(
        { error: "The generated plan did not match the expected structure." },
        { status: 502 }
      );
    }

    return NextResponse.json(plan);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while generating the plan.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
