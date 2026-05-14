# mdx-test

Next.js 15 chat app exploring resumable AI streams and MDX-formatted responses.

## What it does

- Sends messages to any OpenRouter-compatible model
- Streams responses with Vercel AI SDK (`streamText` + `toUIMessageStreamResponse`)
- **Resumable streams**: reload mid-generation and the client reconnects to the in-flight SSE buffer via `GET /api/chat/[id]/stream`
- Chat ID persists in `sessionStorage` across page reloads
- System prompt loaded from `prompts/system.mdx` at runtime — instructs the model to format output as MDX

## Stack

- Next.js 15 (App Router, Node.js runtime)
- Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/openai-compatible`)
- OpenRouter as LLM gateway

## Setup

```bash
cp .env.example .env.local   # or create manually
npm install
npm run dev
```

`.env.local` variables:

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `OPENROUTER_MODEL` | Model ID (default: `anthropic/claude-3.5-haiku`) |

## Architecture

```
POST /api/chat
  → streams response to client
  → tees SSE chunks into in-memory buffer (keyed by streamId)

GET /api/chat/[id]/stream
  → client calls this on reconnect
  → polls buffer and replays buffered + live chunks
```

> **POC note:** The stream buffer is in-memory and resets on server restart. For production, replace with Redis pub/sub or a durable queue.

## Prompt

Edit `prompts/system.mdx` to change the assistant's behavior and formatting rules. The file is read fresh on every request.
