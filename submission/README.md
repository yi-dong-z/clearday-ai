# ClearDay AI Submission Kit

This folder contains the copy, demo flow, deployment checklist, and QA notes for
submitting ClearDay AI to HackOnVibe.

## Project Snapshot

**Name:** ClearDay AI

**One-liner:** ClearDay AI turns messy student task notes into a focused day
plan with priorities, time blocks, and practical tips.

**Category:** AI micro-product, productivity, student tools

**Target users:** Students, first-time builders, and beginners preparing for
classes, applications, interviews, or hackathon work.

**Live demo:** https://clear-day-ai-hackathon.vercel.app

**Source code:** https://github.com/yi-dong-z/clearday-ai

## Submission Description

ClearDay AI helps students turn scattered thoughts into an actionable day plan.
Instead of asking users to manually organize tasks, the app lets them paste a
messy task dump, pick a planning mode, and generate a structured schedule using
the OpenAI Responses API. The result includes a short planning brief, top
priorities, time blocks, task reasoning, realistic durations, and practical tips.

The product is intentionally scoped as a focused hackathon micro-product: no
login, no database, no calendar integration, and no file upload. Recent plans are
saved locally so users can revisit or copy them during a demo.

## Problem

Students often know what they need to do, but their tasks are scattered across
classes, chores, applications, side projects, and personal goals. The hard part
is deciding what to do first, how intense the day should be, and how to turn a
messy list into a sequence that feels realistic.

## Solution

ClearDay AI creates a clean plan from messy notes:

- Focused, Balanced, and Light planning modes.
- English date selector defaulting to today and allowing future dates.
- AI-generated priorities, timeline, task reasons, durations, and tips.
- Separate capture page and plan board page.
- Local history with reopen and copy actions.
- Server-side API route so the OpenAI key is never exposed to the browser.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- OpenAI Responses API
- Browser `localStorage`
- Vercel-ready environment variables

## Useful Files

- `demo-script.md`: short demo flow and optional voiceover.
- `judging-notes.md`: concise judging highlights.
- `deployment-checklist.md`: Vercel deployment checklist.
- `qa-checklist.md`: final manual QA list.
