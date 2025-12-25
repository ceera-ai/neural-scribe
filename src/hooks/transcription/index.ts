export { useTranscriptionEngine } from './useTranscriptionEngine'
export { useElevenLabsProvider } from './useElevenLabsProvider'
export { useDeepgramProvider } from './useDeepgramProvider'
export { providerRegistry, getAvailableProviders, getProviderMetadata, isProviderAvailable } from './providerRegistry'
export type {
  TranscriptionProvider,
  TranscriptionProviderOptions,
  TranscriptionEngine,
  TranscriptSegment,
  ProviderMetadata
} from './types'
