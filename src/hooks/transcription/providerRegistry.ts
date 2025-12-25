import type { TranscriptionEngine, ProviderMetadata, ProviderHookFactory } from './types'
import { useElevenLabsProvider } from './useElevenLabsProvider'
import { useDeepgramProvider } from './useDeepgramProvider'

export interface RegisteredProvider {
  metadata: ProviderMetadata
  hook: ProviderHookFactory
}

// Singleton provider registry
class ProviderRegistry {
  private providers: Map<TranscriptionEngine, RegisteredProvider> = new Map()

  register(provider: RegisteredProvider): void {
    this.providers.set(provider.metadata.id, provider)
  }

  get(id: TranscriptionEngine): RegisteredProvider | undefined {
    return this.providers.get(id)
  }

  getAll(): RegisteredProvider[] {
    return Array.from(this.providers.values())
  }

  getAllAvailable(): RegisteredProvider[] {
    return this.getAll().filter((p) => p.metadata.availability.isAvailable)
  }

  getMetadata(id: TranscriptionEngine): ProviderMetadata | undefined {
    return this.providers.get(id)?.metadata
  }
}

// Export singleton instance
export const providerRegistry = new ProviderRegistry()

// Register all providers here
// ADDING A NEW PROVIDER: Just add one registration block below!

// 1. ElevenLabs Provider
providerRegistry.register({
  metadata: {
    id: 'elevenlabs',
    name: 'ElevenLabs Scribe',
    description: 'High accuracy, automatic punctuation, real-time transcription',
    icon: '🎙️',
    tier: 'premium',
    requiresApiKey: true,
    requiresInternetConnection: true,
    requiresNativeModule: false,
    capabilities: {
      partialTranscripts: true,
      finalTranscripts: true,
      automaticPunctuation: true,
      speakerDiarization: false,
      languageDetection: false,
      customVocabulary: false,
      offlineMode: false,
      multiLanguage: true,
    },
    performance: {
      estimatedAccuracy: 93.5,
      averageLatency: '150ms',
      maxDuration: null, // Unlimited
    },
    availability: {
      isAvailable: true,
    },
  },
  hook: useElevenLabsProvider,
})

// 2. Deepgram Provider
providerRegistry.register({
  metadata: {
    id: 'deepgram',
    name: 'Deepgram',
    description: 'High accuracy, multiple models, real-time transcription',
    icon: '🌊',
    tier: 'premium',
    requiresApiKey: true,
    requiresInternetConnection: true,
    requiresNativeModule: false,
    capabilities: {
      partialTranscripts: true,
      finalTranscripts: true,
      automaticPunctuation: true,
      speakerDiarization: true,
      languageDetection: true,
      customVocabulary: false,
      offlineMode: false,
      multiLanguage: true,
    },
    performance: {
      estimatedAccuracy: 95.0,
      averageLatency: '100ms',
      maxDuration: null, // Unlimited
    },
    availability: {
      isAvailable: true,
    },
  },
  hook: useDeepgramProvider,
})

// Additional providers can be registered here
// Example: Whisper, Azure, AWS, etc.

// Helper functions
export function getAvailableProviders(): ProviderMetadata[] {
  return providerRegistry.getAllAvailable().map((p) => p.metadata)
}

export function getProviderMetadata(id: TranscriptionEngine): ProviderMetadata | undefined {
  return providerRegistry.getMetadata(id)
}

export function isProviderAvailable(id: TranscriptionEngine): boolean {
  const provider = providerRegistry.get(id)
  return provider?.metadata.availability.isAvailable ?? false
}
