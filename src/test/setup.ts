import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Electron APIs
const mockElectronAPI = {
  // Transcription
  getScribeToken: vi.fn().mockResolvedValue('mock-token'),

  // History
  saveTranscription: vi.fn().mockResolvedValue(true),
  getTranscriptions: vi.fn().mockResolvedValue([]),
  deleteTranscription: vi.fn().mockResolvedValue(true),

  // Settings
  getSettings: vi.fn().mockResolvedValue({
    recordHotkey: 'CommandOrControl+Shift+R',
    pasteHotkey: 'CommandOrControl+Shift+V',
    enableAI: true,
    enableHistory: true,
    theme: 'dark',
  }),
  setSettings: vi.fn().mockResolvedValue(true),

  // Gamification
  getGamificationStats: vi.fn().mockResolvedValue({
    totalWordsTranscribed: 0,
    totalRecordingTimeMs: 0,
    totalSessions: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: Date.now(),
  }),
  updateGamificationStats: vi.fn().mockResolvedValue(true),

  // IPC
  pasteToTerminal: vi.fn().mockResolvedValue({ success: true }),
  showNotification: vi.fn(),

  // Window controls
  minimizeWindow: vi.fn(),
  maximizeWindow: vi.fn(),
  closeWindow: vi.fn(),

  // Overlay
  showOverlay: vi.fn(),
  hideOverlay: vi.fn(),
  updateOverlayStatus: vi.fn(),
}

// Mock window.electronAPI
global.window = {
  ...global.window,
  electronAPI: mockElectronAPI,
} as any

// Mock matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any
