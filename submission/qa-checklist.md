# QA Checklist

## Functional QA

- Empty input shows a validation message and does not call the API.
- Normal student input generates a readable plan.
- The generated plan has a title, summary, priorities, timeline, and tips.
- Plan generation redirects from `/` to `/plan`.
- `/plan` can reopen a saved plan from local history.
- **Copy plan** writes readable text to the clipboard.
- **Clear history** requires confirmation.
- API failure keeps the user's input visible.

## UI QA

- Capture page and plan board are clearly separate.
- Mode labels do not overflow on desktop or mobile.
- Date selector is fully English.
- Date defaults to today.
- Date selector prevents past dates.
- Timeline cards do not overlap.
- Buttons have visible hover and focus states.
- Empty plan state is understandable.

## Responsive QA

- Desktop: sidebar, capture form, setup panel, and plan board fit without overlap.
- Tablet: controls wrap cleanly.
- Mobile: capture page stacks naturally.
- Mobile: plan board tabs remain usable.
- Mobile: archive/history items are readable.

## Engineering QA

Run:

```bash
npm run check
```

Expected result:

- Static quality check passes.
- ESLint passes.
- TypeScript passes.
- Next.js production build passes.
