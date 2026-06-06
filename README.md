# ClearDay AI

ClearDay AI is a HackOnVibe micro-product for students and new builders. It turns messy task notes into a focused day plan with priorities, time blocks, and practical tips.

## Links

- Live demo: https://clear-day-ai-hackathon.vercel.app
- Source code: https://github.com/yi-dong-z/clearday-ai

## Features

- Messy task input with examples
- Planning modes: Focused, Balanced, Light
- AI-generated structured timeline
- Top priorities and practical tips
- History saved in `localStorage`
- Copy-ready plan output
- Vercel-ready API route

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- OpenAI Responses API
- `localStorage` for saved plans

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add your API key in `.env.local`:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.4-mini
```

Open `http://localhost:3000`.

## Quality Checks

Run the full pre-submission check before demo or deployment:

```bash
npm run check
```

This runs a small product-structure check, ESLint, TypeScript, and the Next.js
production build.

## API

`POST /api/generate-plan`

```json
{
  "rawText": "Class at 10, finish resume, review React, gym, prep demo script.",
  "date": "2026-06-06",
  "mode": "focused"
}
```

The response contains:

- `title`
- `summary`
- `topPriorities`
- `timeline`
- `tips`

## Demo Script

1. Paste a messy student task dump.
2. Choose a planning mode.
3. Generate a plan.
4. Show the timeline, priorities, and tips.
5. Refresh the page and show that history persists.
6. Copy the generated plan.

## Submission Materials

Hackathon-ready copy and checklists live in `submission/`:

- `README.md`: project description and submission overview
- `demo-script.md`: demo flow and suggested voiceover
- `judging-notes.md`: judging highlights and technical strengths
- `deployment-checklist.md`: Vercel setup and post-deploy checks
- `qa-checklist.md`: final manual QA checklist
