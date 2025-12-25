# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Neural Scribe - Developed by [Ceera.ai](https://ceera.ai)**

## Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # TypeScript compile + Vite production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Architecture

This is a React + TypeScript Electron app for real-time speech transcription with support for multiple engines (ElevenLabs Scribe and Deepgram).

### Key Components

- **`src/App.tsx`** - Main UI with recording controls and transcript display
- **`src/hooks/transcription/`** - Modular transcription engine architecture with support for ElevenLabs and Deepgram providers
  - `useElevenLabsProvider.ts` - ElevenLabs Scribe provider using `@elevenlabs/client` SDK
  - `useDeepgramProvider.ts` - Deepgram provider using `@deepgram/sdk`
  - `providerRegistry.ts` - Provider registration and metadata
  - `useTranscriptionEngine.ts` - Main hook that selects and initializes the correct provider
- **`src/hooks/useElevenLabsScribe.ts`** - Legacy hook (being refactored)

### Data Flow

1. User clicks "Start Recording" → System gets API token for selected transcription engine (ElevenLabs or Deepgram)
2. Provider-specific connection opens WebSocket with microphone streaming (echo cancellation, noise suppression enabled)
3. Partial transcripts update in real-time, replacing the last non-final segment
4. Committed/final transcripts are marked as final and appended to the segment array
5. All segments are joined for display and clipboard copy

### Environment

API keys are stored securely in Electron settings:

- ElevenLabs API key for ElevenLabs Scribe engine
- Deepgram API key for Deepgram engine (if using Deepgram)
