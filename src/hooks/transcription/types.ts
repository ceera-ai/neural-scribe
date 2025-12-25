export interface TranscriptSegment {
  text: string
  isFinal: boolean
  timestamp: number
}

export interface TranscriptionProvider {
  // State
  isConnected: boolean
  isRecording: boolean
  transcriptSegments: TranscriptSegment[]
  editedTranscript: string | null
  error: string | null
  sessionId: string | null

  // Methods
  startRecording: () => Promise<void>
  stopRecording: () => void
  clearTranscript: () => void
  setEditedTranscript: (text: string | null) => void
}

export interface TranscriptionProviderOptions {
  selectedMicrophoneId?: string | null
  onRecordingStopped?: (transcript: string, duration: number) => Promise<string> | string | void
  onVoiceCommand?: (command: 'send' | 'clear' | 'cancel', transcript: string) => void
  voiceCommandsEnabled?: boolean
  onSaveTranscript?: (transcript: string) => Promise<void> | void
  onFormattingOverride?: (override: boolean | null) => void
}

// Extensible engine ID - add new providers here
export type TranscriptionEngine =
  | 'elevenlabs'
  | 'deepgram'
  | 'azure'
  | 'aws'
  | 'whisper'
  | 'macos-native'

// Provider metadata for UI and capabilities
export interface ProviderMetadata {
  id: TranscriptionEngine
  name: string // Display name
  description: string // Short description
  icon: string // Emoji or icon identifier
  tier: 'free' | 'premium' | 'enterprise' // Pricing tier

  // Requirements
  requiresApiKey: boolean
  requiresInternetConnection: boolean
  requiresNativeModule: boolean

  // Capabilities
  capabilities: {
    partialTranscripts: boolean // Real-time word-by-word updates
    finalTranscripts: boolean // Committed final segments
    automaticPunctuation: boolean // Auto-adds punctuation
    speakerDiarization: boolean // Multiple speaker detection
    languageDetection: boolean // Auto-detect language
    customVocabulary: boolean // Support custom word lists
    offlineMode: boolean // Works without internet
    multiLanguage: boolean // Supports multiple languages
  }

  // Performance characteristics
  performance: {
    estimatedAccuracy: number // 0-100 percentage
    averageLatency: string // e.g., "150ms", "500ms"
    maxDuration: string | null // e.g., "60s", null = unlimited
  }

  // Additional requirements note
  requirementsNote?: string // e.g., "Requires macOS 14+"

  // Status
  availability: {
    isAvailable: boolean // Is this provider currently available?
    unavailableReason?: string // Why it's not available
  }
}

// Provider hook factory type
export type ProviderHookFactory = (options: TranscriptionProviderOptions) => TranscriptionProvider
