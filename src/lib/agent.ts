import { Agent } from '@mastra/core/agent'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

const openrouter = createOpenAICompatible({
  name: 'openrouter',
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
  headers: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'mdx-test',
  },
})

export const chatAgent = new Agent({
  name: 'MDX Chat',
  model: openrouter(process.env.OPENROUTER_MODEL ?? 'anthropic/claude-3.5-haiku'),
  instructions: '',
})
