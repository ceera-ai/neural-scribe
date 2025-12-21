/**
 * Settings Module Tests
 *
 * Tests for electron/main/store/settings.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock electron-store BEFORE imports
vi.mock('electron-store', () => {
  const defaultSettings = {
    apiKey: '',
    selectedMicrophoneId: null,
    selectedTerminalId: null,
    pasteHotkey: 'CommandOrControl+Shift+V',
    recordHotkey: 'CommandOrControl+Shift+R',
    replacementsEnabled: true,
    voiceCommandsEnabled: true,
    promptFormattingEnabled: true,
    promptFormattingInstructions: '',
    promptFormattingModel: 'sonnet',
    historyLimit: 500,
  }

  let mockData: any = {
    settings: { ...defaultSettings },
  }

  return {
    default: class MockStore {
      get(key: string, defaultValue?: any) {
        const keys = key.split('.')
        let value = mockData

        for (const k of keys) {
          value = value?.[k]
        }

        return value !== undefined ? value : defaultValue
      }

      set(key: string, value: any) {
        const keys = key.split('.')
        if (keys.length === 1) {
          mockData[keys[0]] = value
        } else {
          // Handle nested keys like 'settings.apiKey'
          let target = mockData
          for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) {
              target[keys[i]] = {}
            }
            target = target[keys[i]]
          }
          target[keys[keys.length - 1]] = value
        }
      }

      clear() {
        mockData = { settings: { ...defaultSettings } }
      }
    },
  }
})

// Now import the actual module
import {
  getSettings,
  setSettings,
  resetSettings,
  getApiKey,
  setApiKey,
  hasApiKey,
  getPromptFormattingSettings,
  setPromptFormattingEnabled,
  setPromptFormattingInstructions,
  setPromptFormattingModel,
  getRecordHotkey,
  getPasteHotkey,
  areReplacementsEnabled,
  areVoiceCommandsEnabled,
  isPromptFormattingEnabled,
  getHistoryLimit,
  setHistoryLimit,
  DEFAULT_SETTINGS,
} from '../settings'

describe('Settings Module', () => {
  beforeEach(() => {
    // Reset to default settings before each test
    resetSettings()
  })

  describe('getSettings', () => {
    it('returns default settings on fresh install', () => {
      const settings = getSettings()
      expect(settings).toEqual(DEFAULT_SETTINGS)
    })

    it('returns all settings fields', () => {
      const settings = getSettings()
      expect(settings).toHaveProperty('apiKey')
      expect(settings).toHaveProperty('selectedMicrophoneId')
      expect(settings).toHaveProperty('selectedTerminalId')
      expect(settings).toHaveProperty('pasteHotkey')
      expect(settings).toHaveProperty('recordHotkey')
      expect(settings).toHaveProperty('replacementsEnabled')
      expect(settings).toHaveProperty('voiceCommandsEnabled')
      expect(settings).toHaveProperty('promptFormattingEnabled')
      expect(settings).toHaveProperty('promptFormattingInstructions')
      expect(settings).toHaveProperty('promptFormattingModel')
      expect(settings).toHaveProperty('historyLimit')
    })
  })

  describe('setSettings', () => {
    it('updates settings partially', () => {
      setSettings({ recordHotkey: 'CommandOrControl+Shift+T' })

      const settings = getSettings()
      expect(settings.recordHotkey).toBe('CommandOrControl+Shift+T')
      expect(settings.pasteHotkey).toBe('CommandOrControl+Shift+V') // unchanged
    })

    it('updates multiple settings at once', () => {
      setSettings({
        voiceCommandsEnabled: false,
        replacementsEnabled: false,
        historyLimit: 100,
      })

      const settings = getSettings()
      expect(settings.voiceCommandsEnabled).toBe(false)
      expect(settings.replacementsEnabled).toBe(false)
      expect(settings.historyLimit).toBe(100)
    })

    it('preserves other settings when updating one field', () => {
      const original = getSettings()
      setSettings({ apiKey: 'test-api-key' })

      const updated = getSettings()
      expect(updated.apiKey).toBe('test-api-key')
      expect(updated.recordHotkey).toBe(original.recordHotkey)
      expect(updated.pasteHotkey).toBe(original.pasteHotkey)
    })
  })

  describe('resetSettings', () => {
    it('resets all settings to defaults', () => {
      setSettings({
        apiKey: 'custom-key',
        recordHotkey: 'CommandOrControl+R',
        historyLimit: 50,
      })

      resetSettings()

      const settings = getSettings()
      expect(settings).toEqual(DEFAULT_SETTINGS)
    })
  })

  describe('API Key Management', () => {
    describe('getApiKey', () => {
      it('returns empty string when no API key is set', () => {
        const apiKey = getApiKey()
        expect(apiKey).toBe('')
      })

      it('returns the stored API key', () => {
        setApiKey('sk_test_key_123')
        const apiKey = getApiKey()
        expect(apiKey).toBe('sk_test_key_123')
      })
    })

    describe('setApiKey', () => {
      it('stores the API key', () => {
        setApiKey('sk_new_key_456')
        expect(getApiKey()).toBe('sk_new_key_456')
      })

      it('overwrites existing API key', () => {
        setApiKey('sk_old_key')
        setApiKey('sk_new_key')
        expect(getApiKey()).toBe('sk_new_key')
      })
    })

    describe('hasApiKey', () => {
      it('returns false when no API key is set', () => {
        resetSettings() // Ensure clean state
        setApiKey('') // Explicitly set to empty
        const apiKey = getApiKey()
        expect(apiKey).toBe('')
        expect(hasApiKey()).toBe(false)
      })

      it('returns true when API key is set', () => {
        setApiKey('sk_test_key')
        expect(hasApiKey()).toBe(true)
      })

      it('returns false when API key is empty string', () => {
        setApiKey('')
        expect(hasApiKey()).toBe(false)
      })
    })
  })

  describe('Prompt Formatting Settings', () => {
    describe('getPromptFormattingSettings', () => {
      it('returns default formatting settings', () => {
        const settings = getPromptFormattingSettings()
        expect(settings.enabled).toBe(true)
        expect(settings.instructions).toBe('')
        expect(settings.model).toBe('sonnet')
      })

      it('returns updated formatting settings', () => {
        setPromptFormattingEnabled(false)
        setPromptFormattingInstructions('Custom instructions')
        setPromptFormattingModel('haiku')

        const settings = getPromptFormattingSettings()
        expect(settings.enabled).toBe(false)
        expect(settings.instructions).toBe('Custom instructions')
        expect(settings.model).toBe('haiku')
      })
    })

    describe('setPromptFormattingEnabled', () => {
      it('enables prompt formatting', () => {
        setPromptFormattingEnabled(true)
        expect(getPromptFormattingSettings().enabled).toBe(true)
      })

      it('disables prompt formatting', () => {
        setPromptFormattingEnabled(false)
        expect(getPromptFormattingSettings().enabled).toBe(false)
      })
    })

    describe('setPromptFormattingInstructions', () => {
      it('sets custom instructions', () => {
        const instructions = 'Format as Python code with type hints'
        setPromptFormattingInstructions(instructions)
        expect(getPromptFormattingSettings().instructions).toBe(instructions)
      })

      it('allows empty instructions (resets to default)', () => {
        setPromptFormattingInstructions('Custom')
        setPromptFormattingInstructions('')
        expect(getPromptFormattingSettings().instructions).toBe('')
      })
    })

    describe('setPromptFormattingModel', () => {
      it('sets model to sonnet', () => {
        setPromptFormattingModel('sonnet')
        expect(getPromptFormattingSettings().model).toBe('sonnet')
      })

      it('sets model to opus', () => {
        setPromptFormattingModel('opus')
        expect(getPromptFormattingSettings().model).toBe('opus')
      })

      it('sets model to haiku', () => {
        setPromptFormattingModel('haiku')
        expect(getPromptFormattingSettings().model).toBe('haiku')
      })
    })
  })

  describe('Hotkey Getters', () => {
    describe('getRecordHotkey', () => {
      it('returns default record hotkey', () => {
        expect(getRecordHotkey()).toBe('CommandOrControl+Shift+R')
      })

      it('returns updated record hotkey', () => {
        setSettings({ recordHotkey: 'CommandOrControl+R' })
        expect(getRecordHotkey()).toBe('CommandOrControl+R')
      })
    })

    describe('getPasteHotkey', () => {
      it('returns default paste hotkey', () => {
        expect(getPasteHotkey()).toBe('CommandOrControl+Shift+V')
      })

      it('returns updated paste hotkey', () => {
        setSettings({ pasteHotkey: 'CommandOrControl+V' })
        expect(getPasteHotkey()).toBe('CommandOrControl+V')
      })
    })
  })

  describe('Feature Flag Getters', () => {
    describe('areReplacementsEnabled', () => {
      it('returns true by default', () => {
        expect(areReplacementsEnabled()).toBe(true)
      })

      it('returns false when disabled', () => {
        setSettings({ replacementsEnabled: false })
        expect(areReplacementsEnabled()).toBe(false)
      })
    })

    describe('areVoiceCommandsEnabled', () => {
      it('returns true by default', () => {
        expect(areVoiceCommandsEnabled()).toBe(true)
      })

      it('returns false when disabled', () => {
        setSettings({ voiceCommandsEnabled: false })
        expect(areVoiceCommandsEnabled()).toBe(false)
      })
    })

    describe('isPromptFormattingEnabled', () => {
      it('returns true by default', () => {
        expect(isPromptFormattingEnabled()).toBe(true)
      })

      it('returns false when disabled', () => {
        setSettings({ promptFormattingEnabled: false })
        expect(isPromptFormattingEnabled()).toBe(false)
      })
    })
  })

  describe('History Settings', () => {
    describe('getHistoryLimit', () => {
      it('returns default history limit (500)', () => {
        expect(getHistoryLimit()).toBe(500)
      })

      it('returns updated history limit', () => {
        setSettings({ historyLimit: 100 })
        expect(getHistoryLimit()).toBe(100)
      })

      it('returns 0 for unlimited history', () => {
        setSettings({ historyLimit: 0 })
        expect(getHistoryLimit()).toBe(0)
      })
    })

    describe('setHistoryLimit', () => {
      it('sets history limit', () => {
        setHistoryLimit(200)
        expect(getHistoryLimit()).toBe(200)
      })

      it('allows setting limit to 0 (unlimited)', () => {
        setHistoryLimit(0)
        expect(getHistoryLimit()).toBe(0)
      })

      it('allows large limits', () => {
        setHistoryLimit(10000)
        expect(getHistoryLimit()).toBe(10000)
      })
    })
  })

  describe('Type Definitions', () => {
    it('DEFAULT_SETTINGS matches AppSettings interface', () => {
      expect(DEFAULT_SETTINGS).toHaveProperty('apiKey')
      expect(DEFAULT_SETTINGS).toHaveProperty('selectedMicrophoneId')
      expect(DEFAULT_SETTINGS).toHaveProperty('selectedTerminalId')
      expect(DEFAULT_SETTINGS).toHaveProperty('pasteHotkey')
      expect(DEFAULT_SETTINGS).toHaveProperty('recordHotkey')
      expect(DEFAULT_SETTINGS).toHaveProperty('replacementsEnabled')
      expect(DEFAULT_SETTINGS).toHaveProperty('voiceCommandsEnabled')
      expect(DEFAULT_SETTINGS).toHaveProperty('promptFormattingEnabled')
      expect(DEFAULT_SETTINGS).toHaveProperty('promptFormattingInstructions')
      expect(DEFAULT_SETTINGS).toHaveProperty('promptFormattingModel')
      expect(DEFAULT_SETTINGS).toHaveProperty('historyLimit')
    })

    it('DEFAULT_SETTINGS has correct types', () => {
      expect(typeof DEFAULT_SETTINGS.apiKey).toBe('string')
      expect(typeof DEFAULT_SETTINGS.pasteHotkey).toBe('string')
      expect(typeof DEFAULT_SETTINGS.recordHotkey).toBe('string')
      expect(typeof DEFAULT_SETTINGS.replacementsEnabled).toBe('boolean')
      expect(typeof DEFAULT_SETTINGS.voiceCommandsEnabled).toBe('boolean')
      expect(typeof DEFAULT_SETTINGS.promptFormattingEnabled).toBe('boolean')
      expect(typeof DEFAULT_SETTINGS.promptFormattingInstructions).toBe('string')
      expect(typeof DEFAULT_SETTINGS.promptFormattingModel).toBe('string')
      expect(typeof DEFAULT_SETTINGS.historyLimit).toBe('number')
    })
  })

  describe('Edge Cases', () => {
    it('handles null microphone ID', () => {
      setSettings({ selectedMicrophoneId: null })
      expect(getSettings().selectedMicrophoneId).toBeNull()
    })

    it('handles null terminal ID', () => {
      setSettings({ selectedTerminalId: null })
      expect(getSettings().selectedTerminalId).toBeNull()
    })

    it('handles device IDs', () => {
      setSettings({ selectedMicrophoneId: 'device-12345' })
      setSettings({ selectedTerminalId: 'com.googlecode.iterm2' })

      const settings = getSettings()
      expect(settings.selectedMicrophoneId).toBe('device-12345')
      expect(settings.selectedTerminalId).toBe('com.googlecode.iterm2')
    })
  })
})
