# Judging Notes

## What ClearDay AI Does

ClearDay AI converts messy student task notes into an executable day plan with
priorities, time blocks, task reasoning, durations, and practical tips.

## Why It Matters

Students and beginner builders often struggle less with knowing their tasks and
more with sequencing them. ClearDay reduces planning friction by turning an
unstructured task dump into a usable schedule in one step.

## Product Strengths

- Focused micro-product scope: one clear job, no unnecessary account system.
- Polished two-page workflow: capture first, plan review second.
- Planning modes make the same input adapt to different energy levels.
- Structured AI output makes the UI reliable and easy to scan.
- Local history supports demos and lightweight personal use.
- Copy-ready output helps the plan move into calendars, notes, or team chat.

## Technical Strengths

- Next.js App Router with a server API route.
- OpenAI Responses API with structured JSON schema output.
- TypeScript types for request, response, and saved plan shapes.
- Shared constants for client and server validation.
- Local static quality checks plus ESLint, TypeScript, and production build.
- Environment variable support for `OPENAI_API_KEY` and `OPENAI_MODEL`.

## Intentional Scope Decisions

- No login: keeps the first demo fast and approachable.
- No database: local history is enough for a hackathon micro-product.
- No calendar integration: avoids setup friction and keeps the demo reliable.
- No file upload: the core value is task organization from plain text.

## Future Improvements

- Calendar export or Google Calendar integration.
- Drag-and-drop editing for generated time blocks.
- Multiple plan templates for study, application prep, and hackathon days.
- Optional reminders and progress tracking.
- Shared plan links for teammates.
