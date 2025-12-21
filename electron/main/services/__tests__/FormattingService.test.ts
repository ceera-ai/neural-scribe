/**
 * Tests for FormattingService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock prompt-formatter module
vi.mock('../../prompt-formatter', () => ({
  formatPrompt: vi.fn(),
  generateTitle: vi.fn(),
  isClaudeCliAvailable: vi.fn(),
  getClaudeCliVersion: vi.fn(),
  DEFAULT_FORMATTING_INSTRUCTIONS: 'Convert voice commands to shell syntax',
}))

// Mock settings module
vi.mock('../../store/settings', () => ({
  getPromptFormattingSettings: vi.fn(),
}))

import { FormattingService } from '../FormattingService'
import * as promptFormatter from '../../prompt-formatter'
import * as settings from '../../store/settings'

describe('FormattingService', () => {
  let service: FormattingService

  beforeEach(() => {
    vi.clearAllMocks()
    service = FormattingService.getInstance()
  })

  describe('getInstance', () => {
    it('returns singleton instance', () => {
      const instance1 = FormattingService.getInstance()
      const instance2 = FormattingService.getInstance()
      expect(instance1).toBe(instance2)
    })

    it('returns instance of FormattingService', () => {
      const instance = FormattingService.getInstance()
      expect(instance).toBeInstanceOf(FormattingService)
    })
  })

  describe('formatPrompt', () => {
    beforeEach(() => {
      vi.mocked(settings.getPromptFormattingSettings).mockReturnValue({
        enabled: true,
        customInstructions: 'Test instructions',
        model: 'claude-3-5-sonnet-20241022',
      })
    })

    it('calls formatPrompt implementation when enabled', async () => {
      vi.mocked(promptFormatter.formatPrompt).mockResolvedValue({
        success: true,
        formatted: 'npm install express',
        skipped: false,
      })

      const result = await service.formatPrompt('install express')

      expect(promptFormatter.formatPrompt).toHaveBeenCalledWith('install express')
      expect(result.success).toBe(true)
      expect(result.formatted).toBe('npm install express')
    })

    it('returns original text when formatting disabled', async () => {
      vi.mocked(settings.getPromptFormattingSettings).mockReturnValue({
        enabled: false,
        customInstructions: '',
        model: 'claude-3-5-sonnet-20241022',
      })

      const result = await service.formatPrompt('test input')

      expect(promptFormatter.formatPrompt).not.toHaveBeenCalled()
      expect(result.success).toBe(true)
      expect(result.formatted).toBe('test input')
      expect(result.skipped).toBe(true)
    })

    it('returns formatted text on success', async () => {
      vi.mocked(promptFormatter.formatPrompt).mockResolvedValue({
        success: true,
        formatted: 'ls -la',
        skipped: false,
      })

      const result = await service.formatPrompt('list all files')

      expect(result.success).toBe(true)
      expect(result.formatted).toBe('ls -la')
      expect(result.skipped).toBe(false)
    })

    it('handles skipped formatting', async () => {
      vi.mocked(promptFormatter.formatPrompt).mockResolvedValue({
        success: true,
        formatted: 'hi',
        skipped: true,
      })

      const result = await service.formatPrompt('hi')

      expect(result.success).toBe(true)
      expect(result.formatted).toBe('hi')
      expect(result.skipped).toBe(true)
    })

    it('handles errors gracefully', async () => {
      vi.mocked(promptFormatter.formatPrompt).mockRejectedValue(
        new Error('Claude CLI not available')
      )

      const result = await service.formatPrompt('test input')

      expect(result.success).toBe(false)
      expect(result.formatted).toBe('test input') // Original text
      expect(result.error).toBe('Claude CLI not available')
    })

    it('handles unknown errors', async () => {
      vi.mocked(promptFormatter.formatPrompt).mockRejectedValue('Unknown error type')

      const result = await service.formatPrompt('test')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unknown error')
    })

    it('preserves original text on failure', async () => {
      const originalText = 'important command'
      vi.mocked(promptFormatter.formatPrompt).mockRejectedValue(new Error('Failure'))

      const result = await service.formatPrompt(originalText)

      expect(result.formatted).toBe(originalText)
    })
  })

  describe('reformatText', () => {
    beforeEach(() => {
      vi.mocked(settings.getPromptFormattingSettings).mockReturnValue({
        enabled: true,
        customInstructions: '',
        model: 'claude-3-5-sonnet-20241022',
      })
    })

    it('reformats text', async () => {
      vi.mocked(promptFormatter.formatPrompt).mockResolvedValue({
        success: true,
        formatted: 'pnpm add express',
        skipped: false,
      })

      const result = await service.reformatText('npm install express')

      expect(result.success).toBe(true)
      expect(result.formatted).toBe('pnpm add express')
    })

    it('accepts custom instructions parameter', async () => {
      vi.mocked(promptFormatter.formatPrompt).mockResolvedValue({
        success: true,
        formatted: 'yarn add express',
        skipped: false,
      })

      const result = await service.reformatText('npm install express', 'Use yarn')

      expect(result.success).toBe(true)
    })

    it('handles errors gracefully', async () => {
      vi.mocked(promptFormatter.formatPrompt).mockRejectedValue(new Error('Failed'))

      const result = await service.reformatText('test input', 'custom')

      expect(result.success).toBe(false)
      expect(result.formatted).toBe('test input')
      expect(result.error).toBe('Failed')
    })
  })

  describe('generateTitle', () => {
    it('generates title successfully', async () => {
      vi.mocked(promptFormatter.generateTitle).mockResolvedValue({
        success: true,
        title: 'Install Express',
      })

      const result = await service.generateTitle('npm install express')

      expect(promptFormatter.generateTitle).toHaveBeenCalledWith('npm install express')
      expect(result.success).toBe(true)
      expect(result.title).toBe('Install Express')
    })

    it('handles errors with fallback', async () => {
      vi.mocked(promptFormatter.generateTitle).mockRejectedValue(
        new Error('Title generation failed')
      )

      const longText = 'a'.repeat(100)
      const result = await service.generateTitle(longText)

      expect(result.success).toBe(false)
      expect(result.title).toBe(longText.substring(0, 50)) // Fallback: first 50 chars
      expect(result.error).toBe('Title generation failed')
    })

    it('returns error message for unknown errors', async () => {
      vi.mocked(promptFormatter.generateTitle).mockRejectedValue('unknown')

      const result = await service.generateTitle('test')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Unknown error')
    })

    it('uses first 50 characters as fallback', async () => {
      vi.mocked(promptFormatter.generateTitle).mockRejectedValue(new Error('Failed'))

      const text = 'This is a very long command that exceeds fifty characters limit'
      const result = await service.generateTitle(text)

      expect(result.title).toBe(text.substring(0, 50))
      expect(result.title.length).toBe(50)
    })
  })

  describe('checkClaudeCliStatus', () => {
    it('returns available status when CLI is available', async () => {
      vi.mocked(promptFormatter.isClaudeCliAvailable).mockResolvedValue(true)
      vi.mocked(promptFormatter.getClaudeCliVersion).mockResolvedValue('1.2.3')

      const status = await service.checkClaudeCliStatus()

      expect(status.available).toBe(true)
      expect(status.version).toBe('1.2.3')
    })

    it('returns unavailable status when CLI is not available', async () => {
      vi.mocked(promptFormatter.isClaudeCliAvailable).mockResolvedValue(false)

      const status = await service.checkClaudeCliStatus()

      expect(status.available).toBe(false)
      expect(status.version).toBe(null)
      expect(promptFormatter.getClaudeCliVersion).not.toHaveBeenCalled()
    })

    it('calls isClaudeCliAvailable', async () => {
      vi.mocked(promptFormatter.isClaudeCliAvailable).mockResolvedValue(true)
      vi.mocked(promptFormatter.getClaudeCliVersion).mockResolvedValue('2.0.0')

      await service.checkClaudeCliStatus()

      expect(promptFormatter.isClaudeCliAvailable).toHaveBeenCalled()
    })

    it('calls getClaudeCliVersion when available', async () => {
      vi.mocked(promptFormatter.isClaudeCliAvailable).mockResolvedValue(true)
      vi.mocked(promptFormatter.getClaudeCliVersion).mockResolvedValue('3.1.0')

      const status = await service.checkClaudeCliStatus()

      expect(promptFormatter.getClaudeCliVersion).toHaveBeenCalled()
      expect(status.version).toBe('3.1.0')
    })
  })

  describe('getDefaultInstructions', () => {
    it('returns default formatting instructions', () => {
      const instructions = service.getDefaultInstructions()
      expect(instructions).toBe('Convert voice commands to shell syntax')
    })

    it('returns a string', () => {
      const instructions = service.getDefaultInstructions()
      expect(typeof instructions).toBe('string')
    })

    it('returns non-empty string', () => {
      const instructions = service.getDefaultInstructions()
      expect(instructions.length).toBeGreaterThan(0)
    })
  })

  describe('getSettings', () => {
    it('returns prompt formatting settings', () => {
      const mockSettings = {
        enabled: true,
        customInstructions: 'Custom test',
        model: 'claude-3-5-sonnet-20241022',
      }
      vi.mocked(settings.getPromptFormattingSettings).mockReturnValue(mockSettings)

      const result = service.getSettings()

      expect(result).toEqual(mockSettings)
      expect(settings.getPromptFormattingSettings).toHaveBeenCalled()
    })

    it('calls getPromptFormattingSettings', () => {
      vi.mocked(settings.getPromptFormattingSettings).mockReturnValue({
        enabled: false,
        customInstructions: '',
        model: 'claude-3-5-sonnet-20241022',
      })

      service.getSettings()

      expect(settings.getPromptFormattingSettings).toHaveBeenCalled()
    })
  })

  describe('Integration Tests', () => {
    it('full formatting workflow', async () => {
      vi.mocked(settings.getPromptFormattingSettings).mockReturnValue({
        enabled: true,
        customInstructions: '',
        model: 'claude-3-5-sonnet-20241022',
      })

      vi.mocked(promptFormatter.formatPrompt).mockResolvedValue({
        success: true,
        formatted: 'git status',
        skipped: false,
      })

      vi.mocked(promptFormatter.generateTitle).mockResolvedValue({
        success: true,
        title: 'Check Git Status',
      })

      // Format prompt
      const formatResult = await service.formatPrompt('check git status')
      expect(formatResult.formatted).toBe('git status')

      // Generate title
      const titleResult = await service.generateTitle(formatResult.formatted)
      expect(titleResult.title).toBe('Check Git Status')
    })

    it('disabled formatting workflow', async () => {
      vi.mocked(settings.getPromptFormattingSettings).mockReturnValue({
        enabled: false,
        customInstructions: '',
        model: 'claude-3-5-sonnet-20241022',
      })

      const result = await service.formatPrompt('any input')

      expect(result.success).toBe(true)
      expect(result.formatted).toBe('any input')
      expect(result.skipped).toBe(true)
      expect(promptFormatter.formatPrompt).not.toHaveBeenCalled()
    })
  })
})
