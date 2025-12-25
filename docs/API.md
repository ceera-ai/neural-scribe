# Neural Scribe API Documentation

This document provides comprehensive documentation for all public APIs in Neural Scribe, including IPC handlers, React hooks, and type definitions.

**Version**: 1.0.0
**Last Updated**: 2025-12-20

---

## Table of Contents

1. [IPC API Reference](#ipc-api-reference)
   - [Token Management](#token-management)
   - [Settings](#settings)
   - [History](#history)
   - [Clipboard Operations](#clipboard-operations)
   - [Terminal Operations](#terminal-operations)
   - [Word Replacements](#word-replacements)
   - [Voice Commands](#voice-commands)
   - [Hotkey Operations](#hotkey-operations)
   - [Prompt Formatting](#prompt-formatting)
   - [Gamification](#gamification)
2. [React Hooks API](#react-hooks-api)
3. [Type Definitions](#type-definitions)
4. [Events](#events)
5. [Store Modules API](#store-modules-api) _(Internal)_
6. [Service Layer API](#service-layer-api) _(Internal)_

---

## IPC API Reference

All IPC APIs are accessed through the `window.electronAPI` object, which is exposed via Electron's context bridge.

### Token Management

#### `getScribeToken()`

Retrieves a single-use authentication token from ElevenLabs API for Scribe v2 WebSocket connection.

**Signature:**

```typescript
getScribeToken(): Promise<string>
```

**Returns:**
`Promise<string>` - Authentication token for ElevenLabs Scribe

**Example:**

```typescript
const token = await window.electronAPI.getScribeToken()
```

**Throws:**

- `Error` if ElevenLabs API key is not configured
- `Error` if network request fails

---

### Settings

#### `getSettings()`

Retrieves all application settings.

**Signature:**

```typescript
getSettings(): Promise<AppSettings>
```

**Returns:**
`Promise<AppSettings>` - Complete settings object

**Example:**

```typescript
const settings = await window.electronAPI.getSettings()
console.log(settings.recordHotkey) // "CommandOrControl+Shift+R"
```

---

#### `setSettings()`

Updates application settings (partial update supported).

**Signature:**

```typescript
setSettings(settings: Partial<AppSettings>): Promise<AppSettings>
```

**Parameters:**

- `settings` (Partial<AppSettings>) - Settings to update

**Returns:**
`Promise<AppSettings>` - Updated complete settings object

**Example:**

```typescript
await window.electronAPI.setSettings({
  recordHotkey: 'CommandOrControl+Shift+T',
  voiceCommandsEnabled: true,
})
```

---

#### `getApiKey()`

Retrieves the stored ElevenLabs API key.

**Signature:**

```typescript
getApiKey(): Promise<string>
```

**Returns:**
`Promise<string>` - API key (empty string if not set)

---

#### `setApiKey()`

Stores the ElevenLabs API key securely.

**Signature:**

```typescript
setApiKey(apiKey: string): Promise<boolean>
```

**Parameters:**

- `apiKey` (string) - ElevenLabs API key

**Returns:**
`Promise<boolean>` - Success status

**Example:**

```typescript
await window.electronAPI.setApiKey('sk_...')
```

---

#### `hasApiKey()`

Checks if an API key is configured.

**Signature:**

```typescript
hasApiKey(): Promise<boolean>
```

**Returns:**
`Promise<boolean>` - True if API key exists

---

### History

#### `getHistory()`

Retrieves all saved transcription records.

**Signature:**

```typescript
getHistory(): Promise<TranscriptionRecord[]>
```

**Returns:**
`Promise<TranscriptionRecord[]>` - Array of transcription records, sorted by timestamp (newest first)

**Example:**

```typescript
const history = await window.electronAPI.getHistory()
console.log(`Total transcriptions: ${history.length}`)
```

---

#### `saveTranscription()`

Saves a transcription record to history.

**Signature:**

```typescript
saveTranscription(record: TranscriptionRecord): Promise<boolean>
```

**Parameters:**

- `record` (TranscriptionRecord) - Transcription record to save

**Returns:**
`Promise<boolean>` - Success status

**Example:**

```typescript
await window.electronAPI.saveTranscription({
  id: crypto.randomUUID(),
  text: 'Final transcribed text',
  originalText: 'raw transcription',
  timestamp: Date.now(),
  wordCount: 5,
  duration: 3.5,
})
```

---

#### `deleteTranscription()`

Deletes a transcription record by ID.

**Signature:**

```typescript
deleteTranscription(id: string): Promise<boolean>
```

**Parameters:**

- `id` (string) - Transcription record ID

**Returns:**
`Promise<boolean>` - Success status

---

#### `clearHistory()`

Deletes all transcription records.

**Signature:**

```typescript
clearHistory(): Promise<boolean>
```

**Returns:**
`Promise<boolean>` - Success status

---

#### `getLastTranscription()`

Retrieves the most recent transcription record.

**Signature:**

```typescript
getLastTranscription(): Promise<TranscriptionRecord | null>
```

**Returns:**
`Promise<TranscriptionRecord | null>` - Most recent record or null if history is empty

---

### Clipboard Operations

#### `copyToClipboard()`

Copies text to the system clipboard.

**Signature:**

```typescript
copyToClipboard(text: string): Promise<boolean>
```

**Parameters:**

- `text` (string) - Text to copy

**Returns:**
`Promise<boolean>` - Success status

**Example:**

```typescript
await window.electronAPI.copyToClipboard("echo 'Hello World'")
```

---

#### `readClipboard()`

Reads text from the system clipboard.

**Signature:**

```typescript
readClipboard(): Promise<string>
```

**Returns:**
`Promise<string>` - Clipboard contents

---

### Terminal Operations

#### `getRunningTerminals()`

Gets list of currently running terminal applications.

**Signature:**

```typescript
getRunningTerminals(): Promise<TerminalApp[]>
```

**Returns:**
`Promise<TerminalApp[]>` - Array of running terminal apps

**Example:**

```typescript
const terminals = await window.electronAPI.getRunningTerminals()
console.log(terminals) // [{ name: "iTerm2", bundleId: "com.googlecode.iterm2", displayName: "iTerm2" }]
```

---

#### `getSupportedTerminals()`

Gets list of all supported terminal applications.

**Signature:**

```typescript
getSupportedTerminals(): Promise<TerminalApp[]>
```

**Returns:**
`Promise<TerminalApp[]>` - Array of supported terminal apps

---

#### `pasteToTerminal()`

Pastes text to a specific terminal application.

**Signature:**

```typescript
pasteToTerminal(text: string, bundleId: string): Promise<{
  success: boolean
  needsPermission: boolean
  copied: boolean
}>
```

**Parameters:**

- `text` (string) - Text to paste
- `bundleId` (string) - Terminal app bundle ID (e.g., "com.googlecode.iterm2")

**Returns:**
Object with:

- `success` (boolean) - Whether paste succeeded
- `needsPermission` (boolean) - Whether accessibility permissions are needed
- `copied` (boolean) - Whether text was copied to clipboard as fallback

**Example:**

```typescript
const result = await window.electronAPI.pasteToTerminal('npm install', 'com.googlecode.iterm2')
if (result.needsPermission) {
  console.log('Accessibility permissions required')
}
```

---

#### `getTerminalWindows()`

Gets all open terminal windows across all terminal apps.

**Signature:**

```typescript
getTerminalWindows(): Promise<TerminalWindow[]>
```

**Returns:**
`Promise<TerminalWindow[]>` - Array of terminal windows

---

#### `pasteToTerminalWindow()`

Pastes text to a specific terminal window.

**Signature:**

```typescript
pasteToTerminalWindow(
  text: string,
  bundleId: string,
  windowName: string
): Promise<{
  success: boolean
  needsPermission: boolean
  copied: boolean
}>
```

**Parameters:**

- `text` (string) - Text to paste
- `bundleId` (string) - Terminal app bundle ID
- `windowName` (string) - Window name/title

---

#### `pasteToLastActiveTerminal()`

Automatically detects and pastes to the most recently active terminal.

**Signature:**

```typescript
pasteToLastActiveTerminal(text: string): Promise<{
  success: boolean
  needsPermission: boolean
  copied: boolean
  targetApp: string | null
}>
```

**Parameters:**

- `text` (string) - Text to paste

**Returns:**
Object with:

- `success` (boolean) - Whether paste succeeded
- `needsPermission` (boolean) - Whether accessibility permissions are needed
- `copied` (boolean) - Whether text was copied to clipboard
- `targetApp` (string | null) - Name of target terminal app

**Example:**

```typescript
const result = await window.electronAPI.pasteToLastActiveTerminal('ls -la')
console.log(`Pasted to ${result.targetApp}`)
```

---

### Word Replacements

#### `getReplacements()`

Retrieves all word replacement rules.

**Signature:**

```typescript
getReplacements(): Promise<WordReplacement[]>
```

**Returns:**
`Promise<WordReplacement[]>` - Array of replacement rules

---

#### `addReplacement()`

Adds a new word replacement rule.

**Signature:**

```typescript
addReplacement(replacement: WordReplacement): Promise<boolean>
```

**Parameters:**

- `replacement` (WordReplacement) - Replacement rule to add

**Example:**

```typescript
await window.electronAPI.addReplacement({
  id: crypto.randomUUID(),
  from: 'docker compose',
  to: 'docker-compose',
  caseSensitive: false,
  wholeWord: true,
  enabled: true,
})
```

---

#### `updateReplacement()`

Updates an existing replacement rule.

**Signature:**

```typescript
updateReplacement(id: string, updates: Partial<WordReplacement>): Promise<boolean>
```

---

#### `deleteReplacement()`

Deletes a replacement rule.

**Signature:**

```typescript
deleteReplacement(id: string): Promise<boolean>
```

---

#### `applyReplacements()`

Applies all enabled replacement rules to text.

**Signature:**

```typescript
applyReplacements(text: string): Promise<string>
```

**Parameters:**

- `text` (string) - Text to process

**Returns:**
`Promise<string>` - Text with replacements applied

**Example:**

```typescript
const original = 'run docker compose up'
const replaced = await window.electronAPI.applyReplacements(original)
// Result: "run docker-compose up"
```

---

### Voice Commands

#### `getVoiceCommandTriggers()`

Retrieves all voice command trigger phrases.

**Signature:**

```typescript
getVoiceCommandTriggers(): Promise<VoiceCommandTrigger[]>
```

**Returns:**
`Promise<VoiceCommandTrigger[]>` - Array of voice command triggers

---

#### `updateVoiceCommandTrigger()`

Updates a voice command trigger.

**Signature:**

```typescript
updateVoiceCommandTrigger(
  id: string,
  updates: Partial<VoiceCommandTrigger>
): Promise<boolean>
```

---

#### `addVoiceCommandTrigger()`

Adds a custom voice command trigger.

**Signature:**

```typescript
addVoiceCommandTrigger(trigger: VoiceCommandTrigger): Promise<boolean>
```

**Example:**

```typescript
await window.electronAPI.addVoiceCommandTrigger({
  id: crypto.randomUUID(),
  phrase: 'execute it',
  command: 'send',
  enabled: true,
  isCustom: true,
})
```

---

#### `deleteVoiceCommandTrigger()`

Deletes a custom voice command trigger.

**Signature:**

```typescript
deleteVoiceCommandTrigger(id: string): Promise<boolean>
```

---

#### `resetVoiceCommandTriggers()`

Resets voice commands to defaults.

**Signature:**

```typescript
resetVoiceCommandTriggers(): Promise<boolean>
```

---

#### `getEnabledVoiceCommands()`

Gets currently enabled voice command phrases grouped by action.

**Signature:**

```typescript
getEnabledVoiceCommands(): Promise<{
  send: string[]
  clear: string[]
  cancel: string[]
}>
```

**Returns:**
Object mapping command types to arrays of trigger phrases

**Example:**

```typescript
const commands = await window.electronAPI.getEnabledVoiceCommands()
console.log(commands.send) // ["send it", "execute it", ...]
```

---

### Hotkey Operations

#### `updateHotkey()`

Updates a global hotkey binding.

**Signature:**

```typescript
updateHotkey(
  type: 'paste' | 'record',
  newHotkey: string
): Promise<{ success: boolean; error?: string }>
```

**Parameters:**

- `type` ('paste' | 'record') - Hotkey type to update
- `newHotkey` (string) - New hotkey combination (e.g., "CommandOrControl+Shift+R")

**Returns:**
Object with success status and optional error message

**Example:**

```typescript
const result = await window.electronAPI.updateHotkey('record', 'CommandOrControl+Shift+T')
if (!result.success) {
  console.error(result.error)
}
```

---

### Prompt Formatting

#### `formatPrompt()`

Formats transcribed text using Claude AI.

**Signature:**

```typescript
formatPrompt(text: string): Promise<{
  success: boolean
  formatted: string
  error?: string
  skipped?: boolean
}>
```

**Parameters:**

- `text` (string) - Transcribed text to format

**Returns:**
Object with:

- `success` (boolean) - Whether formatting succeeded
- `formatted` (string) - Formatted text (or original if failed/skipped)
- `error` (string) - Error message if failed
- `skipped` (boolean) - True if text was too short to format

**Example:**

```typescript
const result = await window.electronAPI.formatPrompt('make a new directory called my project')
console.log(result.formatted) // "mkdir my-project"
```

---

#### `getPromptFormattingSettings()`

Gets current prompt formatting settings.

**Signature:**

```typescript
getPromptFormattingSettings(): Promise<{
  enabled: boolean
  instructions: string
  model: 'sonnet' | 'opus' | 'haiku'
}>
```

---

#### `setPromptFormattingEnabled()`

Enables or disables prompt formatting.

**Signature:**

```typescript
setPromptFormattingEnabled(enabled: boolean): Promise<boolean>
```

---

#### `setPromptFormattingInstructions()`

Sets custom formatting instructions.

**Signature:**

```typescript
setPromptFormattingInstructions(instructions: string): Promise<boolean>
```

**Example:**

```typescript
await window.electronAPI.setPromptFormattingInstructions(
  'Convert voice commands to Python scripts with proper error handling'
)
```

---

#### `setPromptFormattingModel()`

Sets the Claude model to use for formatting.

**Signature:**

```typescript
setPromptFormattingModel(model: 'sonnet' | 'opus' | 'haiku'): Promise<boolean>
```

**Parameters:**

- `model` - Claude model variant:
  - `'sonnet'` - Balanced performance/cost (default)
  - `'opus'` - Highest quality
  - `'haiku'` - Fastest/cheapest

---

#### `getDefaultFormattingInstructions()`

Gets the default formatting instructions.

**Signature:**

```typescript
getDefaultFormattingInstructions(): Promise<string>
```

---

#### `checkClaudeCli()`

Checks if Claude CLI is available on the system.

**Signature:**

```typescript
checkClaudeCli(): Promise<{
  available: boolean
  version: string | null
}>
```

---

#### `generateTitle()`

Generates a short title for a transcription using Claude AI.

**Signature:**

```typescript
generateTitle(text: string): Promise<{
  success: boolean
  title: string
  error?: string
}>
```

**Example:**

```typescript
const result = await window.electronAPI.generateTitle('npm install express cors dotenv')
console.log(result.title) // "Install Express dependencies"
```

---

#### `reformatText()`

Reformats text with optional custom instructions.

**Signature:**

```typescript
reformatText(
  text: string,
  customInstructions?: string
): Promise<{
  success: boolean
  formatted: string
  error?: string
}>
```

**Parameters:**

- `text` (string) - Text to reformat
- `customInstructions` (string, optional) - Custom formatting instructions

---

### Gamification

#### `getGamificationData()`

Retrieves all gamification data (stats, level, achievements).

**Signature:**

```typescript
getGamificationData(): Promise<GamificationData>
```

**Returns:**
`Promise<GamificationData>` - Complete gamification state

---

#### `saveGamificationData()`

Saves gamification data.

**Signature:**

```typescript
saveGamificationData(data: GamificationData): Promise<boolean>
```

---

#### `recordGamificationSession()`

Records a transcription session and updates XP/stats.

**Signature:**

```typescript
recordGamificationSession(params: {
  words: number
  durationMs: number
}): Promise<boolean>
```

**Parameters:**

- `params.words` (number) - Number of words transcribed
- `params.durationMs` (number) - Session duration in milliseconds

**Example:**

```typescript
await window.electronAPI.recordGamificationSession({
  words: 150,
  durationMs: 45000, // 45 seconds
})
```

---

#### `unlockGamificationAchievement()`

Unlocks an achievement and awards XP.

**Signature:**

```typescript
unlockGamificationAchievement(params: {
  achievementId: string
  xpReward: number
}): Promise<boolean>
```

---

#### `checkGamificationDailyLogin()`

Checks daily login streak and awards bonus XP.

**Signature:**

```typescript
checkGamificationDailyLogin(): Promise<boolean>
```

---

#### `resetGamificationProgress()`

Resets all gamification progress (development/testing only).

**Signature:**

```typescript
resetGamificationProgress(): Promise<boolean>
```

---

## React Hooks API

### `useElevenLabsScribe()`

Custom hook for managing ElevenLabs Scribe v2 real-time transcription.

**Location**: `src/hooks/useElevenLabsScribe.ts`

**Signature:**

```typescript
function useElevenLabsScribe(options: ScribeOptions): ScribeState
```

**Parameters:**

```typescript
interface ScribeOptions {
  selectedMicrophoneId: string
  onRecordingStopped: (text: string, duration: number) => void
  onVoiceCommand?: (command: 'send' | 'clear' | 'cancel') => void
  voiceCommandsEnabled: boolean
  onSaveTranscript?: () => void
}
```

**Returns:**

```typescript
interface ScribeState {
  isConnected: boolean
  isRecording: boolean
  transcriptSegments: TranscriptSegment[]
  editedTranscript: string | null
  error: string | null
  startRecording: () => Promise<void>
  stopRecording: () => void
  clearTranscript: () => void
  setEditedTranscript: (text: string) => void
}
```

**Example:**

```typescript
const { isRecording, transcriptSegments, startRecording, stopRecording } = useElevenLabsScribe({
  selectedMicrophoneId: 'default',
  onRecordingStopped: (text, duration) => {
    console.log(`Recorded: "${text}" (${duration}s)`)
  },
  voiceCommandsEnabled: true,
  onVoiceCommand: (command) => {
    if (command === 'send') {
      pasteToTerminal()
    }
  },
})
```

---

### `useAudioAnalyzer()`

Custom hook for real-time audio level and frequency analysis.

**Location**: `src/hooks/useAudioAnalyzer.ts`

**Signature:**

```typescript
function useAudioAnalyzer(stream: MediaStream | null, isRecording: boolean): AudioAnalyzerState
```

**Returns:**

```typescript
interface AudioAnalyzerState {
  audioLevel: number // 0-100
  frequencyData: Uint8Array
}
```

---

### `useGamification()`

Custom hook for managing gamification state and achievements.

**Location**: `src/hooks/useGamification.ts`

**Signature:**

```typescript
function useGamification(): GamificationHookState
```

---

## Type Definitions

### `TranscriptionRecord`

```typescript
interface TranscriptionRecord {
  id: string
  text: string // Primary text (most recent formatted version or original)
  originalText?: string // Raw transcription
  formattedText?: string // Legacy: first formatted version
  formattedVersions?: FormattedVersion[] // All formatted versions
  wasFormatted?: boolean // Whether formatting was applied
  title?: string // AI-generated title
  timestamp: number // Unix timestamp
  wordCount: number
  duration: number // Recording duration in seconds
}
```

### `AppSettings`

```typescript
interface AppSettings {
  apiKey: string
  selectedMicrophoneId: string | null
  selectedTerminalId: string | null
  pasteHotkey: string // Default: "CommandOrControl+Shift+V"
  recordHotkey: string // Default: "CommandOrControl+Shift+R"
  replacementsEnabled: boolean
  voiceCommandsEnabled: boolean
  promptFormattingEnabled: boolean
  promptFormattingInstructions: string
  promptFormattingModel: 'sonnet' | 'opus' | 'haiku'
  historyLimit: number // 0 = no limit
}
```

### `WordReplacement`

```typescript
interface WordReplacement {
  id: string
  from: string // Text to find
  to: string // Replacement text
  caseSensitive: boolean
  wholeWord: boolean // Only replace whole words
  enabled: boolean
}
```

### `VoiceCommandTrigger`

```typescript
interface VoiceCommandTrigger {
  id: string
  phrase: string // Trigger phrase (e.g., "send it")
  command: 'send' | 'clear' | 'cancel'
  enabled: boolean
  isCustom: boolean // User-created vs built-in
}
```

### `TerminalApp`

```typescript
interface TerminalApp {
  name: string // Internal name
  bundleId: string // macOS bundle identifier
  displayName: string // User-facing name
}
```

### `TerminalWindow`

```typescript
interface TerminalWindow {
  appName: string
  bundleId: string
  windowName: string // Window title
  windowIndex: number
  displayName: string
}
```

---

## Events

### Main Process → Renderer Events

These events are sent from the main process to the renderer. Use the `on*` methods to subscribe.

#### `toggle-recording`

Triggered when the record hotkey is pressed.

**Subscribe:**

```typescript
window.electronAPI.onToggleRecording(() => {
  if (isRecording) {
    stopRecording()
  } else {
    startRecording()
  }
})
```

---

#### `transcription-pasted`

Triggered when transcription is pasted to terminal.

**Subscribe:**

```typescript
window.electronAPI.onTranscriptionPasted((text: string) => {
  console.log(`Pasted: ${text}`)
})
```

---

#### `paste-last-transcription`

Triggered when the paste hotkey is pressed.

**Subscribe:**

```typescript
window.electronAPI.onPasteLastTranscription(() => {
  pasteLastTranscription()
})
```

---

#### `history-changed`

Triggered when transcription history is modified.

**Subscribe:**

```typescript
window.electronAPI.onHistoryChanged(() => {
  // Refresh history list
  loadHistory()
})
```

---

#### `gamification-data-changed`

Triggered when gamification data changes.

**Subscribe:**

```typescript
window.electronAPI.onGamificationDataChanged(() => {
  // Refresh gamification UI
  loadGamificationData()
})
```

---

#### `achievement-unlocked`

Triggered when an achievement is unlocked.

**Subscribe:**

```typescript
window.electronAPI.onAchievementUnlocked((achievementId: string) => {
  showAchievementPopup(achievementId)
})
```

---

### Renderer → Main Process Messages

These are one-way messages sent from renderer to main process.

#### `recording-state-changed`

Notifies main process of recording state changes.

**Send:**

```typescript
window.electronAPI.notifyRecordingState(true) // Started recording
window.electronAPI.notifyRecordingState(false) // Stopped recording
```

---

#### `audio-level`

Sends real-time audio level for overlay visualization.

**Send:**

```typescript
window.electronAPI.sendAudioLevel(75) // 0-100
```

---

#### `frequency-data`

Sends frequency spectrum data for overlay visualization.

**Send:**

```typescript
window.electronAPI.sendFrequencyData([12, 45, 78, ...]) // Array of frequency magnitudes
```

---

#### `recording-time`

Sends current recording time for overlay display.

**Send:**

```typescript
window.electronAPI.sendRecordingTime(45) // seconds
```

---

#### `voice-commands-update`

Sends updated voice commands to overlay.

**Send:**

```typescript
window.electronAPI.sendVoiceCommands({
  send: ['send it', 'execute it'],
  clear: ['clear'],
  cancel: ['cancel'],
})
```

---

#### `transcript-preview`

Sends live transcript preview to overlay.

**Send:**

```typescript
window.electronAPI.sendTranscriptPreview('npm install express', 3)
```

---

#### `overlay-status`

Sends status information to overlay.

**Send:**

```typescript
window.electronAPI.sendOverlayStatus({
  connected: true,
  formattingEnabled: true,
})
```

---

#### `log-error`

Logs error information to main process console.

**Send:**

```typescript
window.electronAPI.logError({
  message: 'Failed to connect',
  stack: error.stack,
  componentStack: info.componentStack,
})
```

---

## Store Modules API

**Note**: This section documents internal store modules used by the main process. These are not directly accessible from the renderer process but are used by IPC handlers.

### Overview

The store is modularized into focused feature modules for better maintainability and testability. Each module uses `electron-store` with encryption for sensitive data.

**Module Structure**:

```
electron/main/store/
├── settings.ts       - Settings management
├── history.ts        - Transcription history
├── replacements.ts   - Word replacements
├── voice-commands.ts - Voice command triggers
└── gamification/     - Gamification system
```

---

### Settings Module (`store/settings.ts`)

Manages all application settings including API keys, hotkeys, and feature flags.

#### Types

```typescript
interface AppSettings {
  apiKey: string
  selectedMicrophoneId: string | null
  selectedTerminalId: string | null
  pasteHotkey: string
  recordHotkey: string
  replacementsEnabled: boolean
  voiceCommandsEnabled: boolean
  promptFormattingEnabled: boolean
  promptFormattingInstructions: string
  promptFormattingModel: 'sonnet' | 'opus' | 'haiku'
  historyLimit: number
}

interface PromptFormattingSettings {
  enabled: boolean
  instructions: string
  model: 'sonnet' | 'opus' | 'haiku'
}
```

#### Exported Functions

**Settings CRUD**:

- `getSettings(): AppSettings` - Get all settings
- `setSettings(settings: Partial<AppSettings>): void` - Update settings (partial)
- `resetSettings(): void` - Reset to defaults

**API Key Management**:

- `getApiKey(): string` - Get API key (empty if not set)
- `setApiKey(apiKey: string): void` - Set API key (encrypted)
- `hasApiKey(): boolean` - Check if API key exists

**Prompt Formatting**:

- `getPromptFormattingSettings(): PromptFormattingSettings` - Get formatting config
- `setPromptFormattingEnabled(enabled: boolean): void` - Enable/disable formatting
- `setPromptFormattingInstructions(instructions: string): void` - Set custom instructions
- `setPromptFormattingModel(model): void` - Set Claude model variant

**Hotkey Getters**:

- `getRecordHotkey(): string` - Get record hotkey
- `getPasteHotkey(): string` - Get paste hotkey

**Feature Flags**:

- `areReplacementsEnabled(): boolean` - Check if replacements enabled
- `areVoiceCommandsEnabled(): boolean` - Check if voice commands enabled
- `isPromptFormattingEnabled(): boolean` - Check if formatting enabled

**History Settings**:

- `getHistoryLimit(): number` - Get max history entries (0 = unlimited)
- `setHistoryLimit(limit: number): void` - Set history limit

#### Usage Example

```typescript
import { getSettings, setSettings, hasApiKey } from './store/settings'

// Get all settings
const settings = getSettings()

// Update specific settings
setSettings({
  recordHotkey: 'CommandOrControl+Shift+T',
  voiceCommandsEnabled: true,
})

// Check API key
if (!hasApiKey()) {
  console.log('No API key configured')
}
```

---

### History Module (`store/history.ts`)

Manages transcription history with auto-limiting, search, and statistics capabilities.

#### Types

```typescript
interface TranscriptionRecord {
  id: string
  text: string
  originalText?: string
  formattedText?: string
  formattedVersions?: FormattedVersion[]
  wasFormatted?: boolean
  title?: string
  timestamp: number
  wordCount: number
  duration: number
}

interface FormattedVersion {
  id: string
  text: string
  timestamp: number
  sourceVersion: 'original' | string
  customInstructions?: string
}
```

#### Exported Functions

**Retrieval**:

- `getHistory(): TranscriptionRecord[]` - Get all records (newest first)
- `getLastTranscription(): TranscriptionRecord | null` - Get most recent record
- `searchHistory(query: string): TranscriptionRecord[]` - Search by text/title (case-insensitive)
- `findTranscriptionById(id: string): TranscriptionRecord | null` - Find by ID

**Modification**:

- `saveTranscription(record: TranscriptionRecord): void` - Save or update record
- `updateTranscription(id: string, updates: Partial<TranscriptionRecord>): boolean` - Partial update
- `deleteTranscription(id: string): boolean` - Delete by ID
- `deleteTranscriptions(ids: string[]): number` - Delete multiple, returns count
- `clearHistory(): void` - Delete all records

**Statistics & Filtering**:

- `getHistoryStats()` - Get totals, averages, formatted count
- `getRecentTranscriptions(limit: number): TranscriptionRecord[]` - Get last N records
- `getTranscriptionsByDateRange(start: number, end: number): TranscriptionRecord[]` - Filter by date

#### Usage Example

```typescript
import { saveTranscription, searchHistory, getHistoryStats } from './store/history'

// Save a transcription
saveTranscription({
  id: crypto.randomUUID(),
  text: 'npm install express',
  originalText: 'install express',
  timestamp: Date.now(),
  wordCount: 3,
  duration: 2.5,
  wasFormatted: true,
})

// Search history
const dockerRecords = searchHistory('docker')

// Get statistics
const stats = getHistoryStats()
console.log(`Total: ${stats.totalRecords}, Avg words: ${stats.averageWordCount}`)
```

---

### Replacements Module (`store/replacements.ts`)

**Status**: _Coming in Phase 5 Day 1_

CRUD operations for word replacement rules.

---

### Voice Commands Module (`store/voice-commands.ts`)

**Status**: _Coming in Phase 5 Day 1_

Manages voice command trigger phrases (built-in and custom).

---

### Gamification Module (`store/gamification/`)

Comprehensive gamification system with XP, levels, achievements, and statistics tracking.

**Module Structure**:

```
store/gamification/
├── index.ts          # Main orchestrator
├── levels.ts         # XP/level calculations
├── stats.ts          # Statistics and streaks
└── achievements.ts   # Achievement tracking
```

#### Types

```typescript
interface GamificationData {
  version: string
  stats: UserStats
  level: LevelSystem
  achievements: AchievementsState
  metadata: {
    lastSaved: number
    totalSaves: number
    backupCount: number
  }
}

interface UserStats {
  totalWordsTranscribed: number
  totalRecordingTimeMs: number
  totalSessions: number
  currentStreak: number
  longestStreak: number
  lastActiveDate: string
  firstSessionDate: string
}

interface LevelSystem {
  currentXP: number
  level: number
  rank: string
  xpToNextLevel: number
  xpForCurrentLevel: number
  totalXPForNextLevel: number
}

interface AchievementsState {
  unlocked: Record<string, UnlockedAchievement>
}
```

#### Exported Functions

**Data Access**:

- `getGamificationData(): GamificationData` - Get complete gamification state
- `saveGamificationData(data: Partial<GamificationData>): void` - Save (partial update)

**Session & Progress**:

- `recordGamificationSession(words, durationMs)` - Record session, update stats/XP
- `checkDailyLoginBonus()` - Check/award daily bonus, update streak
- `resetGamificationProgress()` - Reset all progress

**Achievements**:

- `unlockGamificationAchievement(id, xpReward)` - Unlock achievement, award XP

**Level Calculations** (from `levels.ts`):

- `calculateLevelFromXP(xp): number` - Get level from total XP
- `calculateXPForLevel(level): number` - Get XP required for level
- `getRankForLevel(level): Rank` - Get rank name/icon for level
- `updateLevelFromXP(xp): LevelSystem` - Create complete level data from XP

**Stats Tracking** (from `stats.ts`):

- `updateSessionStats(stats, words, durationMs): UserStats` - Update session stats
- `updateStreak(stats, today): UserStats` - Update daily streak
- `getDerivedStats(stats)` - Calculate averages and totals
- `isActiveToday(stats): boolean` - Check if active today

**Achievement Helpers** (from `achievements.ts`):

- `isAchievementUnlocked(achievements, id): boolean` - Check if unlocked
- `unlockAchievement(achievements, id, xp)` - Unlock with XP reward
- `getUnlockedAchievementIds(achievements): string[]` - Get all unlocked IDs
- `getTotalAchievementXP(achievements): number` - Total XP from achievements

#### XP Rewards

```typescript
{
  perWord: 1,          // 1 XP per word transcribed
  perMinute: 10,       // 10 XP per minute of recording
  sessionBonus: 25,    // 25 XP for completing a session
  dailyBonus: 50       // 50 XP for daily login
}
```

#### Ranks

| Level | Rank         | Icon |
| ----- | ------------ | ---- |
| 1-4   | Initiate     | 🌱   |
| 5-9   | Apprentice   | 📝   |
| 10-14 | Scribe       | ✍️   |
| 15-19 | Transcriber  | 🎙️   |
| 20-29 | Linguist     | 🗣️   |
| 30-39 | Oracle       | 🔮   |
| 40-49 | Cyberscribe  | ⚡   |
| 50-74 | Neural Sage  | 🧠   |
| 75-99 | Transcendent | ✨   |
| 100+  | Singularity  | 🌌   |

#### Usage Example

```typescript
import {
  recordGamificationSession,
  checkDailyLoginBonus,
  getGamificationData,
} from './store/gamification'

// Record a transcription session
const result = recordGamificationSession(150, 45000)
console.log(`+${result.xpGained} XP`)
if (result.leveledUp) {
  showLevelUpAnimation(result.oldLevel, result.newLevel)
}

// Check daily login
const dailyResult = checkDailyLoginBonus()
if (dailyResult.bonusAwarded) {
  console.log(`+${dailyResult.xpGained} XP daily bonus!`)
  console.log(`${dailyResult.currentStreak} day streak!`)
}

// Get current stats
const data = getGamificationData()
console.log(`Level ${data.level.level} ${data.level.rank}`)
console.log(`${data.stats.totalWordsTranscribed} words transcribed`)
```

---

## Service Layer API

The service layer provides singleton classes that encapsulate business logic. These are internal APIs used by IPC handlers and main process code.

### FormattingService

Singleton service for AI-powered text formatting using Claude.

#### `FormattingService.getInstance()`

Gets the singleton instance.

**Signature:**

```typescript
static getInstance(): FormattingService
```

**Returns:**
`FormattingService` - Singleton instance

**Example:**

```typescript
import { FormattingService } from './services'
const service = FormattingService.getInstance()
```

---

#### `formatPrompt(text)`

Formats transcribed text using Claude AI.

**Signature:**

```typescript
formatPrompt(text: string): Promise<FormatResult>
```

**Parameters:**

- `text` _(string)_ - Raw transcribed text

**Returns:**

```typescript
interface FormatResult {
  success: boolean
  formatted: string
  error?: string
  skipped?: boolean
}
```

**Example:**

```typescript
const result = await service.formatPrompt('install express and cors')
if (result.success && !result.skipped) {
  console.log(result.formatted) // "npm install express cors"
}
```

**Behavior:**

- Returns original text if formatting is disabled in settings
- Returns original text on error (graceful degradation)
- Skips formatting for text shorter than 15 words
- Respects user's model selection in settings

---

#### `reformatText(text, customInstructions?)`

Reformats text with optional custom instructions.

**Signature:**

```typescript
reformatText(text: string, customInstructions?: string): Promise<FormatResult>
```

**Parameters:**

- `text` _(string)_ - Text to reformat
- `customInstructions` _(string, optional)_ - Custom formatting instructions

**Returns:**
`Promise<FormatResult>`

**Example:**

```typescript
const result = await service.reformatText('npm install express', 'Convert to pnpm')
console.log(result.formatted) // "pnpm add express"
```

---

#### `generateTitle(text)`

Generates a concise title (2-5 words) for transcribed text.

**Signature:**

```typescript
generateTitle(text: string): Promise<TitleResult>
```

**Parameters:**

- `text` _(string)_ - Transcribed or formatted text

**Returns:**

```typescript
interface TitleResult {
  success: boolean
  title: string
  error?: string
}
```

**Example:**

```typescript
const result = await service.generateTitle('npm install express cors dotenv')
console.log(result.title) // "Install Express Dependencies"
```

**Fallback:**
On failure, returns first 50 characters of input text

---

#### `checkClaudeCliStatus()`

Checks if Claude CLI is available and gets version.

**Signature:**

```typescript
checkClaudeCliStatus(): Promise<ClaudeCliStatus>
```

**Returns:**

```typescript
interface ClaudeCliStatus {
  available: boolean
  version: string | null
}
```

**Example:**

```typescript
const status = await service.checkClaudeCliStatus()
if (status.available) {
  console.log(`Claude CLI ${status.version} available`)
}
```

---

#### `getDefaultInstructions()`

Gets the default formatting instructions.

**Signature:**

```typescript
getDefaultInstructions(): string
```

**Returns:**
`string` - Default formatting instructions

---

#### `getSettings()`

Gets current prompt formatting settings from store.

**Signature:**

```typescript
getSettings(): PromptFormattingSettings
```

**Returns:**

```typescript
interface PromptFormattingSettings {
  enabled: boolean
  customInstructions: string
  model: string
}
```

---

### TerminalService

Singleton service for terminal automation and text pasting.

#### `TerminalService.getInstance()`

Gets the singleton instance.

**Signature:**

```typescript
static getInstance(): TerminalService
```

**Returns:**
`TerminalService` - Singleton instance

**Example:**

```typescript
import { TerminalService } from './services'
const service = TerminalService.getInstance()
```

---

#### `getRunningTerminals()`

Gets all currently running terminal applications.

**Signature:**

```typescript
getRunningTerminals(): Promise<TerminalApp[]>
```

**Returns:**

```typescript
interface TerminalApp {
  name: string
  bundleId: string
  displayName: string
}
```

**Example:**

```typescript
const terminals = await service.getRunningTerminals()
terminals.forEach((term) => {
  console.log(`${term.displayName} (${term.bundleId})`)
})
```

**Supported Terminals:**

- iTerm2 (`com.googlecode.iterm2`)
- Warp (`dev.warp.Warp-Stable`)
- Hyper (`co.zeit.hyper`)
- Terminal.app (`com.apple.Terminal`)

---

#### `getTerminalWindows()`

Gets all open terminal windows across all terminal apps.

**Signature:**

```typescript
getTerminalWindows(): Promise<TerminalWindow[]>
```

**Returns:**

```typescript
interface TerminalWindow {
  appName: string
  bundleId: string
  windowName: string
  windowIndex: number
  displayName: string
}
```

**Example:**

```typescript
const windows = await service.getTerminalWindows()
console.log(`Found ${windows.length} terminal windows`)
```

---

#### `pasteToTerminal(text, bundleId)`

Pastes text to a specific terminal application.

**Signature:**

```typescript
pasteToTerminal(text: string, bundleId: string): Promise<PasteResult>
```

**Parameters:**

- `text` _(string)_ - Text to paste
- `bundleId` _(string)_ - Terminal app bundle ID

**Returns:**

```typescript
interface PasteResult {
  success: boolean
  needsPermission: boolean
  copied: boolean
}
```

**Example:**

```typescript
const result = await service.pasteToTerminal('npm install', 'com.googlecode.iterm2')

if (result.needsPermission) {
  // Show permission dialog
} else if (result.success) {
  console.log('Pasted successfully')
} else if (result.copied) {
  console.log('Copied to clipboard (paste manually)')
}
```

---

#### `pasteToWindow(text, bundleId, windowName)`

Pastes text to a specific terminal window.

**Signature:**

```typescript
pasteToWindow(
  text: string,
  bundleId: string,
  windowName: string
): Promise<PasteResult>
```

**Parameters:**

- `text` _(string)_ - Text to paste
- `bundleId` _(string)_ - Terminal app bundle ID
- `windowName` _(string)_ - Window name/title

**Returns:**
`Promise<PasteResult>`

**Example:**

```typescript
const result = await service.pasteToWindow('ls -la', 'com.googlecode.iterm2', 'Session 1')
```

---

#### `pasteToActiveTerminal(text)`

Automatically detects and pastes to the most recently active terminal.

**Signature:**

```typescript
pasteToActiveTerminal(text: string): Promise<PasteResult & { targetApp: string | null }>
```

**Parameters:**

- `text` _(string)_ - Text to paste

**Returns:**

```typescript
{
  success: boolean
  needsPermission: boolean
  copied: boolean
  targetApp: string | null
}
```

**Example:**

```typescript
const result = await service.pasteToActiveTerminal('docker-compose up')

if (result.success) {
  console.log(`Pasted to ${result.targetApp}`)
} else if (result.needsPermission) {
  notifyUser('Please grant accessibility permissions')
} else if (result.copied) {
  notifyUser('Copied to clipboard (paste manually)')
}
```

**Recommended:** This is the preferred method as it requires no user selection.

---

#### `hasRunningTerminals()`

Checks if any terminals are currently running.

**Signature:**

```typescript
hasRunningTerminals(): Promise<boolean>
```

**Returns:**
`Promise<boolean>` - True if at least one terminal is running

---

#### `getRunningTerminalCount()`

Gets the count of running terminal applications.

**Signature:**

```typescript
getRunningTerminalCount(): Promise<number>
```

**Returns:**
`Promise<number>` - Number of running terminals

---

#### `findTerminalByBundleId(bundleId)`

Finds a terminal by bundle ID.

**Signature:**

```typescript
findTerminalByBundleId(bundleId: string): Promise<TerminalApp | null>
```

**Parameters:**

- `bundleId` _(string)_ - Terminal app bundle ID

**Returns:**
`Promise<TerminalApp | null>` - Terminal app or null if not found

**Example:**

```typescript
const terminal = await service.findTerminalByBundleId('com.googlecode.iterm2')
if (terminal) {
  console.log(`Found: ${terminal.displayName}`)
}
```

---

### Service Layer Benefits

1. **Singleton Pattern**: Single instance per service, no state management needed
2. **Clean APIs**: Well-defined public methods with TypeScript types
3. **Testability**: Easy to mock and test in isolation
4. **Separation of Concerns**: Business logic separated from IPC handlers
5. **Reusability**: Services can be used across different entry points

### Usage in IPC Handlers

**Before (Direct Import)**:

```typescript
import { formatPrompt } from './prompt-formatter'

ipcMain.handle('format-prompt', async (_, text) => {
  return await formatPrompt(text)
})
```

**After (Service Layer)**:

```typescript
import { FormattingService } from './services'

ipcMain.handle('format-prompt', async (_, text) => {
  return await FormattingService.getInstance().formatPrompt(text)
})
```

---

## Error Handling

All IPC handlers use Zod validation schemas to ensure type safety. Invalid requests will throw validation errors.

**Example Error:**

```typescript
try {
  await window.electronAPI.setSettings({ invalidKey: 'value' })
} catch (error) {
  console.error('Validation error:', error)
}
```

---

## Best Practices

1. **Always check `hasApiKey()` before operations requiring API access**
2. **Handle errors from all async IPC calls**
3. **Remove event listeners when components unmount**
4. **Use TypeScript types for better IDE support**
5. **Validate user input before sending to IPC handlers**

---

**See also**:

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture overview
- [EXAMPLES.md](./EXAMPLES.md) - Usage examples
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Development guide
