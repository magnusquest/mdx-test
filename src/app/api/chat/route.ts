import { type NextRequest } from "next/server";
import {
	streamText,
	generateId,
	convertToModelMessages,
	type UIMessage
} from "ai";
import { model } from "@/lib/llm";
import { readSystemPrompt } from "@/lib/read-system-prompt";
import { chatStore, streamStore, getOrCreateChat } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
	const { id, message } = (await req.json()) as {
		id: string;
		message: UIMessage;
	};

	const chat = getOrCreateChat(id);
	const messages: UIMessage[] = [...chat.messages, message];
	chat.messages = messages;

	const streamId = generateId();
	const buffer: string[] = [];
	streamStore.set(streamId, { chunks: buffer, done: false });
	chat.activeStreamId = streamId;

	const result = streamText({
		model,
		system: readSystemPrompt(),
		messages: await convertToModelMessages(messages)
	});

	return result.toUIMessageStreamResponse({
		originalMessages: messages,
		generateMessageId: generateId,
		onFinish: ({ messages: finished }) => {
			chat.messages = finished as UIMessage[];
			chat.activeStreamId = null;
		},
		consumeSseStream: async ({ stream }) => {
			// Buffer tee'd SSE text for stream resume
			const reader = stream.getReader();
			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					buffer.push(value);
				}
			} finally {
				reader.releaseLock();
				const buf = streamStore.get(streamId);
				if (buf) buf.done = true;
			}
		}
	});
}
