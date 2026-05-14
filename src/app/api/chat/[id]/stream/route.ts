import { type NextRequest } from "next/server";
import { UI_MESSAGE_STREAM_HEADERS } from "ai";
import { chatStore, streamStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;
	const chat = chatStore.get(id);

	if (!chat?.activeStreamId) {
		return new Response(null, { status: 204 });
	}

	const buffer = streamStore.get(chat.activeStreamId);
	if (!buffer) {
		return new Response(null, { status: 204 });
	}

	const encoder = new TextEncoder();
	let position = 0;

	const readable = new ReadableStream<Uint8Array>({
		async pull(controller) {
			// Poll for new SSE text chunks (POC polling — use pub/sub + Redis in production)
			let waited = 0;
			while (position >= buffer.chunks.length && !buffer.done) {
				await new Promise((r) => setTimeout(r, 20));
				waited += 20;
				if (waited > 60_000) {
					controller.close();
					return;
				}
			}

			if (position < buffer.chunks.length) {
				controller.enqueue(encoder.encode(buffer.chunks[position++]));
			} else if (buffer.done) {
				controller.close();
			}
		}
	});

	return new Response(readable, { headers: UI_MESSAGE_STREAM_HEADERS });
}
