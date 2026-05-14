// In-memory store — POC only, resets on server restart

import type { UIMessage } from 'ai'

export type StreamBuffer = {
  chunks: string[] // SSE text chunks (tee'd from toUIMessageStreamResponse)
  done: boolean
}

type Chat = {
  messages: UIMessage[]
  activeStreamId: string | null
}

export const chatStore = new Map<string, Chat>()
export const streamStore = new Map<string, StreamBuffer>()

export function getOrCreateChat(id: string): Chat {
  if (!chatStore.has(id)) {
    chatStore.set(id, { messages: [], activeStreamId: null })
  }
  return chatStore.get(id)!
}
