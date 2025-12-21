/**
 * Tests for TerminalService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { TerminalApp, TerminalWindow, PasteResult } from '../TerminalService'

// Mock terminal module
vi.mock('../../terminal', () => ({
  getRunningTerminals: vi.fn(),
  getTerminalWindows: vi.fn(),
  pasteToTerminal: vi.fn(),
  pasteToTerminalWindow: vi.fn(),
  pasteToLastActiveTerminal: vi.fn(),
}))

import { TerminalService } from '../TerminalService'
import * as terminalAutomation from '../../terminal'

describe('TerminalService', () => {
  let service: TerminalService

  beforeEach(() => {
    vi.clearAllMocks()
    service = TerminalService.getInstance()
  })

  describe('getInstance', () => {
    it('returns singleton instance', () => {
      const instance1 = TerminalService.getInstance()
      const instance2 = TerminalService.getInstance()
      expect(instance1).toBe(instance2)
    })

    it('returns instance of TerminalService', () => {
      const instance = TerminalService.getInstance()
      expect(instance).toBeInstanceOf(TerminalService)
    })
  })

  describe('getRunningTerminals', () => {
    it('calls getRunningTerminals implementation', async () => {
      const mockTerminals: TerminalApp[] = [
        {
          name: 'iTerm2',
          bundleId: 'com.googlecode.iterm2',
          displayName: 'iTerm2',
        },
      ]

      vi.mocked(terminalAutomation.getRunningTerminals).mockResolvedValue(mockTerminals)

      const result = await service.getRunningTerminals()

      expect(terminalAutomation.getRunningTerminals).toHaveBeenCalled()
      expect(result).toEqual(mockTerminals)
    })

    it('returns empty array when no terminals running', async () => {
      vi.mocked(terminalAutomation.getRunningTerminals).mockResolvedValue([])

      const result = await service.getRunningTerminals()

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('returns multiple terminals', async () => {
      const mockTerminals: TerminalApp[] = [
        { name: 'iTerm2', bundleId: 'com.googlecode.iterm2', displayName: 'iTerm2' },
        { name: 'Warp', bundleId: 'dev.warp.Warp-Stable', displayName: 'Warp' },
        { name: 'Terminal', bundleId: 'com.apple.Terminal', displayName: 'Terminal' },
      ]

      vi.mocked(terminalAutomation.getRunningTerminals).mockResolvedValue(mockTerminals)

      const result = await service.getRunningTerminals()

      expect(result).toHaveLength(3)
      expect(result).toEqual(mockTerminals)
    })
  })

  describe('getTerminalWindows', () => {
    it('calls getTerminalWindows implementation', async () => {
      const mockWindows: TerminalWindow[] = [
        {
          appName: 'iTerm2',
          bundleId: 'com.googlecode.iterm2',
          windowName: 'Session 1',
          windowIndex: 0,
          displayName: 'iTerm2 - Session 1',
        },
      ]

      vi.mocked(terminalAutomation.getTerminalWindows).mockResolvedValue(mockWindows)

      const result = await service.getTerminalWindows()

      expect(terminalAutomation.getTerminalWindows).toHaveBeenCalled()
      expect(result).toEqual(mockWindows)
    })

    it('returns empty array when no windows', async () => {
      vi.mocked(terminalAutomation.getTerminalWindows).mockResolvedValue([])

      const result = await service.getTerminalWindows()

      expect(result).toEqual([])
    })

    it('returns multiple windows', async () => {
      const mockWindows: TerminalWindow[] = [
        {
          appName: 'iTerm2',
          bundleId: 'com.googlecode.iterm2',
          windowName: 'Session 1',
          windowIndex: 0,
          displayName: 'iTerm2 - Session 1',
        },
        {
          appName: 'iTerm2',
          bundleId: 'com.googlecode.iterm2',
          windowName: 'Session 2',
          windowIndex: 1,
          displayName: 'iTerm2 - Session 2',
        },
      ]

      vi.mocked(terminalAutomation.getTerminalWindows).mockResolvedValue(mockWindows)

      const result = await service.getTerminalWindows()

      expect(result).toHaveLength(2)
    })
  })

  describe('pasteToTerminal', () => {
    it('pastes text to terminal', async () => {
      const mockResult: PasteResult = {
        success: true,
        needsPermission: false,
        copied: false,
      }

      vi.mocked(terminalAutomation.pasteToTerminal).mockResolvedValue(mockResult)

      const result = await service.pasteToTerminal('echo "Hello"', 'com.googlecode.iterm2')

      expect(terminalAutomation.pasteToTerminal).toHaveBeenCalledWith(
        'echo "Hello"',
        'com.googlecode.iterm2'
      )
      expect(result).toEqual(mockResult)
    })

    it('handles permission needed', async () => {
      const mockResult: PasteResult = {
        success: false,
        needsPermission: true,
        copied: false,
      }

      vi.mocked(terminalAutomation.pasteToTerminal).mockResolvedValue(mockResult)

      const result = await service.pasteToTerminal('test', 'com.apple.Terminal')

      expect(result.success).toBe(false)
      expect(result.needsPermission).toBe(true)
    })

    it('handles paste failure with clipboard fallback', async () => {
      const mockResult: PasteResult = {
        success: false,
        needsPermission: false,
        copied: true,
      }

      vi.mocked(terminalAutomation.pasteToTerminal).mockResolvedValue(mockResult)

      const result = await service.pasteToTerminal('command', 'invalid.bundle')

      expect(result.success).toBe(false)
      expect(result.copied).toBe(true)
    })
  })

  describe('pasteToWindow', () => {
    it('pastes text to specific window', async () => {
      const mockResult: PasteResult = {
        success: true,
        needsPermission: false,
        copied: false,
      }

      vi.mocked(terminalAutomation.pasteToTerminalWindow).mockResolvedValue(mockResult)

      const result = await service.pasteToWindow(
        'npm install',
        'com.googlecode.iterm2',
        'Session 1'
      )

      expect(terminalAutomation.pasteToTerminalWindow).toHaveBeenCalledWith(
        'npm install',
        'com.googlecode.iterm2',
        'Session 1'
      )
      expect(result.success).toBe(true)
    })

    it('passes all parameters correctly', async () => {
      const mockResult: PasteResult = {
        success: true,
        needsPermission: false,
        copied: false,
      }

      vi.mocked(terminalAutomation.pasteToTerminalWindow).mockResolvedValue(mockResult)

      await service.pasteToWindow('text', 'bundle.id', 'Window Name')

      expect(terminalAutomation.pasteToTerminalWindow).toHaveBeenCalledWith(
        'text',
        'bundle.id',
        'Window Name'
      )
    })
  })

  describe('pasteToActiveTerminal', () => {
    it('pastes to active terminal', async () => {
      const mockResult = {
        success: true,
        needsPermission: false,
        copied: false,
        targetApp: 'iTerm2',
      }

      vi.mocked(terminalAutomation.pasteToLastActiveTerminal).mockResolvedValue(mockResult)

      const result = await service.pasteToActiveTerminal('git status')

      expect(terminalAutomation.pasteToLastActiveTerminal).toHaveBeenCalledWith('git status')
      expect(result.success).toBe(true)
      expect(result.targetApp).toBe('iTerm2')
    })

    it('returns targetApp name', async () => {
      const mockResult = {
        success: true,
        needsPermission: false,
        copied: false,
        targetApp: 'Warp',
      }

      vi.mocked(terminalAutomation.pasteToLastActiveTerminal).mockResolvedValue(mockResult)

      const result = await service.pasteToActiveTerminal('ls -la')

      expect(result.targetApp).toBe('Warp')
    })

    it('returns null targetApp when no terminal found', async () => {
      const mockResult = {
        success: false,
        needsPermission: false,
        copied: true,
        targetApp: null,
      }

      vi.mocked(terminalAutomation.pasteToLastActiveTerminal).mockResolvedValue(mockResult)

      const result = await service.pasteToActiveTerminal('test')

      expect(result.targetApp).toBe(null)
      expect(result.success).toBe(false)
      expect(result.copied).toBe(true)
    })
  })

  describe('hasRunningTerminals', () => {
    it('returns true when terminals are running', async () => {
      const mockTerminals: TerminalApp[] = [
        { name: 'iTerm2', bundleId: 'com.googlecode.iterm2', displayName: 'iTerm2' },
      ]

      vi.mocked(terminalAutomation.getRunningTerminals).mockResolvedValue(mockTerminals)

      const result = await service.hasRunningTerminals()

      expect(result).toBe(true)
    })

    it('returns false when no terminals running', async () => {
      vi.mocked(terminalAutomation.getRunningTerminals).mockResolvedValue([])

      const result = await service.hasRunningTerminals()

      expect(result).toBe(false)
    })

    it('returns true with multiple terminals', async () => {
      const mockTerminals: TerminalApp[] = [
        { name: 'iTerm2', bundleId: 'com.googlecode.iterm2', displayName: 'iTerm2' },
        { name: 'Warp', bundleId: 'dev.warp.Warp-Stable', displayName: 'Warp' },
      ]

      vi.mocked(terminalAutomation.getRunningTerminals).mockResolvedValue(mockTerminals)

      const result = await service.hasRunningTerminals()

      expect(result).toBe(true)
    })
  })

  describe('getRunningTerminalCount', () => {
    it('returns 0 when no terminals', async () => {
      vi.mocked(terminalAutomation.getRunningTerminals).mockResolvedValue([])

      const count = await service.getRunningTerminalCount()

      expect(count).toBe(0)
    })

    it('returns 1 for single terminal', async () => {
      const mockTerminals: TerminalApp[] = [
        { name: 'iTerm2', bundleId: 'com.googlecode.iterm2', displayName: 'iTerm2' },
      ]

      vi.mocked(terminalAutomation.getRunningTerminals).mockResolvedValue(mockTerminals)

      const count = await service.getRunningTerminalCount()

      expect(count).toBe(1)
    })

    it('returns correct count for multiple terminals', async () => {
      const mockTerminals: TerminalApp[] = [
        { name: 'iTerm2', bundleId: 'com.googlecode.iterm2', displayName: 'iTerm2' },
        { name: 'Warp', bundleId: 'dev.warp.Warp-Stable', displayName: 'Warp' },
        { name: 'Terminal', bundleId: 'com.apple.Terminal', displayName: 'Terminal' },
      ]

      vi.mocked(terminalAutomation.getRunningTerminals).mockResolvedValue(mockTerminals)

      const count = await service.getRunningTerminalCount()

      expect(count).toBe(3)
    })
  })

  describe('findTerminalByBundleId', () => {
    const mockTerminals: TerminalApp[] = [
      { name: 'iTerm2', bundleId: 'com.googlecode.iterm2', displayName: 'iTerm2' },
      { name: 'Warp', bundleId: 'dev.warp.Warp-Stable', displayName: 'Warp' },
    ]

    beforeEach(() => {
      vi.mocked(terminalAutomation.getRunningTerminals).mockResolvedValue(mockTerminals)
    })

    it('finds terminal by bundle ID', async () => {
      const result = await service.findTerminalByBundleId('com.googlecode.iterm2')

      expect(result).not.toBe(null)
      expect(result?.name).toBe('iTerm2')
      expect(result?.bundleId).toBe('com.googlecode.iterm2')
    })

    it('returns null for non-existent bundle ID', async () => {
      const result = await service.findTerminalByBundleId('non.existent.terminal')

      expect(result).toBe(null)
    })

    it('finds correct terminal among multiple', async () => {
      const result = await service.findTerminalByBundleId('dev.warp.Warp-Stable')

      expect(result).not.toBe(null)
      expect(result?.name).toBe('Warp')
    })

    it('returns null when no terminals running', async () => {
      vi.mocked(terminalAutomation.getRunningTerminals).mockResolvedValue([])

      const result = await service.findTerminalByBundleId('com.googlecode.iterm2')

      expect(result).toBe(null)
    })
  })

  describe('Integration Tests', () => {
    it('complete terminal workflow', async () => {
      // Check for running terminals
      const mockTerminals: TerminalApp[] = [
        { name: 'iTerm2', bundleId: 'com.googlecode.iterm2', displayName: 'iTerm2' },
      ]
      vi.mocked(terminalAutomation.getRunningTerminals).mockResolvedValue(mockTerminals)

      const hasTerminals = await service.hasRunningTerminals()
      expect(hasTerminals).toBe(true)

      const count = await service.getRunningTerminalCount()
      expect(count).toBe(1)

      // Find terminal
      const terminal = await service.findTerminalByBundleId('com.googlecode.iterm2')
      expect(terminal).not.toBe(null)

      // Paste to terminal
      const pasteResult: PasteResult = {
        success: true,
        needsPermission: false,
        copied: false,
      }
      vi.mocked(terminalAutomation.pasteToTerminal).mockResolvedValue(pasteResult)

      const result = await service.pasteToTerminal('npm test', terminal!.bundleId)
      expect(result.success).toBe(true)
    })

    it('no terminals workflow', async () => {
      vi.mocked(terminalAutomation.getRunningTerminals).mockResolvedValue([])

      const hasTerminals = await service.hasRunningTerminals()
      expect(hasTerminals).toBe(false)

      const count = await service.getRunningTerminalCount()
      expect(count).toBe(0)

      const terminal = await service.findTerminalByBundleId('any.bundle')
      expect(terminal).toBe(null)
    })

    it('paste to active terminal workflow', async () => {
      const mockResult = {
        success: true,
        needsPermission: false,
        copied: false,
        targetApp: 'iTerm2',
      }

      vi.mocked(terminalAutomation.pasteToLastActiveTerminal).mockResolvedValue(mockResult)

      const result = await service.pasteToActiveTerminal('echo "test"')

      expect(result.success).toBe(true)
      expect(result.targetApp).toBe('iTerm2')
      expect(result.needsPermission).toBe(false)
      expect(result.copied).toBe(false)
    })
  })
})
