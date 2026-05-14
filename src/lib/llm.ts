import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const openrouter = createOpenAICompatible({
	name: "openrouter",
	baseURL: "https://openrouter.ai/api/v1",
	apiKey: process.env.OPENROUTER_API_KEY!,
	headers: {
		"HTTP-Referer": "http://localhost:3000",
		"X-Title": "mdx-test"
	}
});

export const model = openrouter(
	process.env.OPENROUTER_MODEL ?? "anthropic/claude-3.5-haiku"
);
