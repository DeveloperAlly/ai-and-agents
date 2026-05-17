# n8n Agent

A Vite + React app that uses Claude to generate, deploy, test, and iterate n8n workflows from plain-English specs.

## What it does

1. You describe a workflow in plain English
2. Claude generates valid n8n workflow JSON
3. The app deploys it to your n8n instance via the REST API
4. Triggers an execution and polls for the result
5. If it fails, the error goes back to Claude with "fix this"
6. Repeats until passing or max iterations reached

## Setup

```bash
npm install
npm run dev
```

Open the app, paste your n8n URL and API key in the header (Settings → n8n API → Create API Key).

## CORS requirement

For browser requests to reach your n8n instance, add this env var to your Sliplane deployment:

```
N8N_CORS_ALLOWED_ORIGINS=*
```

## Credential hints

If your workflow needs credentials (GitHub, OpenAI, etc.), find the credential ID in n8n at `Settings → Credentials → click the credential → look at the URL`. Then add hints like:

```
GitHub API → credId:abc123
OpenAI → credId:def456
```

The agent passes these to Claude so it references them correctly in the generated JSON.

## Deploy

Build with `npm run build` and serve `dist/` from any static host (Cloudflare Pages, Vercel, etc.).
