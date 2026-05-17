# YouTube Transcriber

An n8n workflow + web frontend that turns any YouTube URL into a fully transcribed, summarised, and archived document set.

## What it produces

For each video, a folder is created at `transcripts/YYYY-MM-DD_video-title-slug/` containing:

| File | Contents |
|------|----------|
| `audio.mp3` | Extracted audio at 192kbps |
| `transcript.md` | Full transcript with speaker turns, timestamps, and frontmatter metadata |
| `summary.md` | Key points, winning quotes, themes, overview |
| `metadata.json` | Channel, title, publish date, duration, views, description, keywords |

## Stack

- **n8n** (Sliplane) — workflow orchestration
- **n8n-nodes-youtube-dl** — YouTube → MP3 (community node, no Dockerfile changes needed)
- **Fireflies.ai API** — transcription with speaker diarisation
- **OpenRouter** (`google/gemma-3-27b-it:free`) — insights + quote extraction
- **GitHub API** — output storage

## Setup

### 1. Install the community node

In your n8n instance: **Settings → Community Nodes → Install** → search `n8n-nodes-youtube-dl`

### 2. Import the workflow

In n8n: **Workflows → Import from file** → select `workflow.json`

### 3. Configure credentials

Create the following credentials in n8n (Settings → Credentials):

**GitHub API** (HTTP Header Auth)
```
Name: GitHub API
Header Name: Authorization
Header Value: Bearer ghp_YOUR_PERSONAL_ACCESS_TOKEN
```
Token needs: `repo` scope (read + write contents)

**Fireflies API** (HTTP Header Auth)
```
Name: Fireflies API  
Header Name: Authorization
Header Value: Bearer YOUR_FIREFLIES_API_KEY
```
Get key from: fireflies.ai → Settings → API

**OpenRouter API** (HTTP Header Auth)
```
Name: OpenRouter API
Header Name: Authorization  
Header Value: Bearer sk-or-YOUR_OPENROUTER_KEY
```

### 4. Update credential references

In the workflow, attach the above credentials to these nodes:
- `Upload MP3 to GitHub` → GitHub API
- `Submit to Fireflies` → Fireflies API
- `Fetch Transcript` → Fireflies API
- `Extract Insights` → OpenRouter API
- `Upload transcript.md` → GitHub API
- `Upload summary.md` → GitHub API
- `Upload metadata.json` → GitHub API

### 5. Activate the workflow

Toggle the workflow to **Active**. The webhook URL will be:
```
https://YOUR-N8N-DOMAIN/webhook/yt-transcriber
```

### 6. Deploy the frontend

Edit `frontend/index.html` line 1 of the script block:
```js
const N8N_WEBHOOK = 'https://YOUR-N8N-DOMAIN/webhook/yt-transcriber';
```

Host anywhere static: Cloudflare Pages, GitHub Pages, Vercel, etc.

## Tuning the wait time

The `Wait for Transcription` node defaults to **300 seconds (5 minutes)**. Fireflies typically completes in 2-4 minutes for videos under 60 minutes. For longer videos, increase this. For a more robust setup, replace the Wait node with a Fireflies webhook callback (configure at fireflies.ai → Settings → Webhooks).

## Fireflies plan note

Direct `uploadAudio` API access requires the **Business tier**. On Pro, use the Zapier integration or swap Fireflies for OpenAI Whisper via the OpenRouter API (add `whisper-1` model call against the MP3 binary instead).

## Output example

```
transcripts/
  2026-05-17_the-future-of-ai-agents/
    audio.mp3
    transcript.md
    summary.md
    metadata.json
```
