# Vercel Deployment Checklist

## Before Deploying

- Run `npm run check`.
- Confirm `.env.local` exists locally.
- Confirm `.env.local` is not committed.
- Confirm the app works at `http://localhost:3000`.
- Keep one successful plan saved for demo fallback.

## Required Environment Variables

Set these in Vercel project settings:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.4-mini
```

`OPENAI_MODEL` is optional in the code because the API route has a default, but
setting it in Vercel makes the deployment easier to inspect later.

## Vercel Settings

- Framework Preset: Next.js
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: leave default

## After Deploying

- Open the production URL.
- Generate a new plan with a normal student task input.
- Check that `/plan` opens after generation.
- Refresh `/plan` and confirm saved local history still appears.
- Test **Copy plan**.
- Test one mobile viewport.

## Common Failure Cases

- **Missing API key:** add `OPENAI_API_KEY` in Vercel environment variables.
- **Wrong API key:** create a fresh key and redeploy.
- **Model issue:** set `OPENAI_MODEL` to a supported model.
- **Local history empty in production:** expected behavior, because history is stored per browser and per domain.
