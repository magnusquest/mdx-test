import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export function readSystemPrompt(): string {
  return readFileSync(join(process.cwd(), 'prompts', 'system.mdx'), 'utf-8')
}
