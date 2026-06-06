# Demo Script

## 60-Second Demo Flow

1. Open ClearDay AI.
2. Paste a messy student task dump.
3. Choose a target date and planning mode.
4. Click **Generate schedule**.
5. Show the plan board: summary, priorities, timeline, durations, and tips.
6. Switch to **Focus** to show priority-first review.
7. Switch to **Archive** to show saved local history.
8. Click **Copy plan** to show that the result is ready for notes, calendar, or team chat.

## Example Input

```text
Tomorrow I have math homework, an English presentation, laundry, a 30-minute workout, and I need to review React basics before the hackathon. I also need to reply to my teammate, prepare a short demo script, and sleep earlier.
```

## Suggested Voiceover

ClearDay AI is a student planning tool for messy days.

Students often know what they need to do, but the tasks are scattered across
classes, chores, side projects, and personal goals. ClearDay lets the user paste
that messy task dump, choose how intense the day should feel, and generate a
clear schedule.

The app returns a planning brief, top priorities, realistic time blocks, task
reasons, and practical tips. The capture page and plan board are separated so the
workflow feels focused: first collect the mess, then review the plan.

For the hackathon demo, the scope is intentionally tight. There is no login and
no database. Plans are saved locally in the browser, and the OpenAI call happens
through a server route so the API key stays private.

## Backup Demo Plan

If the live API is slow or unavailable:

1. Keep one successful plan saved in local history before recording.
2. Open `/plan`.
3. Show the saved plan, Focus view, Archive view, and Copy action.
4. Explain that live generation uses the OpenAI Responses API through `/api/generate-plan`.
