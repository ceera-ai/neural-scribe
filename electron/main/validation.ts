import { z } from 'zod'

/**
 * Zod validation schemas for IPC message payloads
 *
 * @remarks
 * These schemas provide runtime validation for data sent from renderer
 * to main process via IPC. This prevents malformed data from causing
 * crashes or security issues.
 */

// Settings validation
export const AppSettingsSchema = z.object({
  apiKey: z.string().optional(),
  selectedMicrophoneId: z.string().nullable().optional(),
  selectedTerminalId: z.string().nullable().optional(),
  pasteHotkey: z.string().optional(),
  recordHotkey: z.string().optional(),
  replacementsEnabled: z.boolean().optional(),
  voiceCommandsEnabled: z.boolean().optional(),
  promptFormattingEnabled: z.boolean().optional(),
  promptFormattingInstructions: z.string().optional(),
  promptFormattingModel: z.enum(['sonnet', 'opus', 'haiku']).optional(),
  historyLimit: z.number().int().min(0).optional(),
})

export const ApiKeySchema = z.string().min(1, 'API key cannot be empty')

// Transcription record validation
export const FormattedVersionSchema = z.object({
  id: z.string(),
  text: z.string(),
  timestamp: z.number(),
  sourceVersion: z.string(),
  customInstructions: z.string().optional(),
})

export const TranscriptionRecordSchema = z.object({
  id: z.string(),
  text: z.string(),
  originalText: z.string().optional(),
  formattedText: z.string().optional(),
  formattedVersions: z.array(FormattedVersionSchema).optional(),
  wasFormatted: z.boolean().optional(),
  title: z.string().optional(),
  timestamp: z.number(),
  wordCount: z.number().int().min(0),
  duration: z.number().min(0),
})

// Terminal operations validation
export const PasteToTerminalSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty'),
  bundleId: z.string().min(1, 'Bundle ID cannot be empty'),
})

export const PasteToTerminalWindowSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty'),
  bundleId: z.string().min(1, 'Bundle ID cannot be empty'),
  windowName: z.string().min(1, 'Window name cannot be empty'),
})

// Gamification validation
export const GamificationSessionSchema = z.object({
  words: z.number().int().min(0),
  durationMs: z.number().int().min(0),
})

export const GamificationAchievementSchema = z.object({
  achievementId: z.string().min(1),
  xpReward: z.number().int().min(0),
})

// Word replacements validation
export const WordReplacementSchema = z.object({
  id: z.string(),
  from: z.string().min(1),
  to: z.string(),
  caseSensitive: z.boolean(),
  wholeWord: z.boolean(),
  enabled: z.boolean(),
})

export const WordReplacementUpdateSchema = z.object({
  from: z.string().min(1).optional(),
  to: z.string().optional(),
  caseSensitive: z.boolean().optional(),
  wholeWord: z.boolean().optional(),
  enabled: z.boolean().optional(),
})

export const WordReplacementsArraySchema = z.array(WordReplacementSchema)

// Format prompt validation
export const FormatPromptSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty'),
})

export const ReformatTextSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty'),
  customInstructions: z.string().optional(),
})

// Generate title validation
export const GenerateTitleSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty'),
})

// Prompt formatting settings validation
export const PromptFormattingSettingsSchema = z.object({
  enabled: z.boolean(),
  instructions: z.string().optional(),
  model: z.enum(['sonnet', 'opus', 'haiku']).optional(),
})

// Voice commands validation
export const VoiceCommandsSchema = z.object({
  send: z.array(z.string()),
  clear: z.array(z.string()),
  cancel: z.array(z.string()),
})

export const VoiceCommandTriggerSchema = z.object({
  id: z.string(),
  phrase: z.string().min(1),
  command: z.enum(['send', 'clear', 'cancel']),
  enabled: z.boolean(),
  isCustom: z.boolean(),
})

export const VoiceCommandTriggerUpdateSchema = z.object({
  phrase: z.string().min(1).optional(),
  command: z.enum(['send', 'clear', 'cancel']).optional(),
  enabled: z.boolean().optional(),
  isCustom: z.boolean().optional(),
})

// Error logging validation
export const ErrorLogSchema = z.object({
  message: z.string(),
  stack: z.string(),
  componentStack: z.string().optional(),
})

/**
 * Helper function to validate and parse data with Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param errorMessage - Custom error message prefix
 * @returns Parsed and validated data
 * @throws Error if validation fails
 */
export function validateIPC<T>(schema: z.ZodSchema<T>, data: unknown, errorMessage: string): T {
  const result = schema.safeParse(data)

  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
    throw new Error(`${errorMessage}: ${errors}`)
  }

  return result.data
}
