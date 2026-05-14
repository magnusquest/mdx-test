"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, generateId } from "ai";
import { useState, useRef, useEffect, type FormEvent, useMemo } from "react";

// Persist chat ID in sessionStorage so resume works across page reloads
function useChatId() {
	const [chatId] = useState(() => {
		if (typeof window === "undefined") return generateId();
		const stored = sessionStorage.getItem("chat-id");
		if (stored) return stored;
		const id = generateId();
		sessionStorage.setItem("chat-id", id);
		return id;
	});
	return chatId;
}

export default function ChatPage() {
	const chatId = useChatId();
	const [input, setInput] = useState("");
	const bottomRef = useRef<HTMLDivElement>(null);

	const transport = useMemo(
		() =>
			new DefaultChatTransport({
				api: "/api/chat",
				prepareSendMessagesRequest: ({ id, messages }) => ({
					body: { id, message: messages.at(-1) }
				}),
				prepareReconnectToStreamRequest: ({ id }) => ({
					api: `/api/chat/${id}/stream`
				})
			}),
		[]
	);

	const { messages, sendMessage, status } = useChat({
		id: chatId,
		transport,
		resume: true
	});

	const streaming = status === "streaming" || status === "submitted";

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (!input.trim() || streaming) return;
		sendMessage({ text: input.trim() });
		setInput("");
	}

	return (
		<main
			style={{
				maxWidth: 760,
				margin: "0 auto",
				padding: "2rem",
				fontFamily: "monospace"
			}}>
			<h1 style={{ fontSize: "1.25rem", marginBottom: "0.25rem" }}>MDX Chat</h1>
			<p style={{ fontSize: "0.75rem", color: "#888", marginBottom: "1.5rem" }}>
				chat id: {chatId} — reload during generation to test stream resume
			</p>

			<div style={{ minHeight: 400, marginBottom: "1rem" }}>
				{messages.map((m) => (
					<div
						key={m.id}
						style={{
							marginBottom: "1.25rem",
							display: "flex",
							flexDirection: "column",
							alignItems: m.role === "user" ? "flex-end" : "flex-start"
						}}>
						<span
							style={{ fontSize: "0.7rem", color: "#888", marginBottom: 4 }}>
							{m.role}
						</span>
						<pre
							style={{
								whiteSpace: "pre-wrap",
								wordBreak: "break-word",
								background: m.role === "user" ? "#dbeafe" : "#f5f5f5",
								padding: "0.75rem 1rem",
								borderRadius: 6,
								margin: 0,
								maxWidth: "90%",
								fontSize: "0.875rem",
								lineHeight: 1.6
							}}>
							{m.parts
								.filter((p) => p.type === "text")
								.map((p) => ("text" in p ? p.text : ""))
								.join("")}
						</pre>
					</div>
				))}
				{streaming && (
					<div
						style={{ color: "#888", fontSize: "0.8rem", marginBottom: "1rem" }}>
						▋
					</div>
				)}
				<div ref={bottomRef} />
			</div>

			<form
				onSubmit={handleSubmit}
				style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
				<textarea
					value={input}
					onChange={(e) => setInput(e.target.value)}
					rows={3}
					style={{
						flex: 1,
						resize: "vertical",
						padding: "0.5rem",
						fontFamily: "monospace",
						fontSize: "0.875rem",
						border: "1px solid #ccc",
						borderRadius: 4
					}}
					placeholder="Ask something… (Enter to send, Shift+Enter for newline)"
					disabled={streaming}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							handleSubmit(e as unknown as FormEvent);
						}
					}}
				/>
				<button
					type="submit"
					disabled={streaming}
					style={{
						padding: "0.5rem 1.25rem",
						background: streaming ? "#999" : "#111",
						color: "#fff",
						border: "none",
						borderRadius: 4,
						cursor: streaming ? "not-allowed" : "pointer",
						fontFamily: "monospace",
						fontSize: "0.875rem",
						height: 40
					}}>
					{streaming ? "…" : "Send"}
				</button>
			</form>
		</main>
	);
}
