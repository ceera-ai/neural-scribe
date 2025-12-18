import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Default system prompt for formatting transcriptions
export const DEFAULT_FORMATTING_INSTRUCTIONS = `You are a prompt formatter for Claude Code. Your task is to take raw spoken transcriptions and transform them into clear, well-structured prompts.

Rules:
1. Output ONLY the formatted prompt - no explanations, no preamble, no meta-commentary
2. Preserve the user's intent and all technical details they mentioned
3. Organize scattered thoughts into logical structure
4. Fix grammar and remove filler words (um, uh, like, you know, so like)
5. Use clear, concise language
6. If the transcription is a coding task, format it as a clear request
7. If it contains multiple tasks, use bullet points or numbered lists
8. Keep technical terms, file names, and code references exactly as spoken
9. Do not add information that wasn't in the original
10. Do not ask questions - just format what was said`

export interface FormatResult {
  success: boolean
  formatted: string
  error?: string
}

/**
 * Format a raw transcription using Claude CLI
 */
export async function formatPrompt(
  rawText: string,
  customInstructions?: string,
  model: string = 'sonnet'
): Promise<FormatResult> {
  try {
    if (!rawText.trim()) {
      return { success: false, formatted: rawText, error: 'Empty text' }
    }

    const instructions = customInstructions || DEFAULT_FORMATTING_INSTRUCTIONS

    // Escape the text for shell - use base64 to handle all special characters safely
    const base64Text = Buffer.from(rawText).toString('base64')
    const base64Instructions = Buffer.from(instructions).toString('base64')

    // Build the command - decode base64 and pipe to claude
    const command = `echo "${base64Text}" | base64 -d | claude -p --model ${model} --system-prompt "$(echo "${base64Instructions}" | base64 -d)"`

    console.log('[Formatter] Formatting prompt with Claude CLI...')
    const startTime = Date.now()

    const { stdout, stderr } = await execAsync(command, {
      timeout: 60000, // 60 second timeout
      maxBuffer: 1024 * 1024, // 1MB buffer
      env: { ...process.env, FORCE_COLOR: '0' } // Disable color output
    })

    const elapsed = Date.now() - startTime
    console.log(`[Formatter] Formatting completed in ${elapsed}ms`)

    if (stderr && !stdout) {
      console.error('[Formatter] Claude CLI error:', stderr)
      return { success: false, formatted: rawText, error: stderr }
    }

    const formatted = stdout.trim()
    if (!formatted) {
      console.warn('[Formatter] Empty response from Claude CLI')
      return { success: false, formatted: rawText, error: 'Empty response' }
    }

    return { success: true, formatted }
  } catch (error: any) {
    console.error('[Formatter] Failed to format prompt:', error.message)

    // Check for specific errors
    if (error.message?.includes('ETIMEDOUT') || error.killed) {
      return { success: false, formatted: rawText, error: 'Formatting timed out' }
    }

    if (error.message?.includes('command not found') || error.message?.includes('ENOENT')) {
      return { success: false, formatted: rawText, error: 'Claude CLI not found' }
    }

    return { success: false, formatted: rawText, error: error.message || 'Unknown error' }
  }
}

/**
 * Check if Claude CLI is available
 */
export async function isClaudeCliAvailable(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('which claude', { timeout: 5000 })
    return !!stdout.trim()
  } catch {
    return false
  }
}

/**
 * Get Claude CLI version
 */
export async function getClaudeCliVersion(): Promise<string | null> {
  try {
    const { stdout } = await execAsync('claude --version', { timeout: 5000 })
    return stdout.trim()
  } catch {
    return null
  }
}
