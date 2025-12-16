# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # TypeScript compile + Vite production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Architecture

This is a React + TypeScript browser app for real-time speech transcription using ElevenLabs Scribe v2 API.

### Key Components

- **`src/App.tsx`** - Main UI with recording controls and transcript display
- **`src/hooks/useElevenLabsScribe.ts`** - Custom hook managing WebSocket connection to ElevenLabs, microphone streaming, and transcript state. Uses `@elevenlabs/client` SDK's `Scribe.connect()` with event handlers for `RealtimeEvents` (OPEN, SESSION_STARTED, PARTIAL_TRANSCRIPT, COMMITTED_TRANSCRIPT, etc.)
- **`src/utils/getScribeToken.ts`** - Fetches single-use auth tokens from ElevenLabs API (client-side for demo; should be server-side in production)

### Data Flow

1. User clicks "Start Recording" → `startRecording()` generates a token via ElevenLabs API
2. `Scribe.connect()` opens WebSocket with microphone streaming (echo cancellation, noise suppression enabled)
3. Partial transcripts update in real-time, replacing the last non-final segment
4. Committed transcripts are marked as final and appended to the segment array
5. All segments are joined for display and clipboard copy

### Environment

Requires `VITE_ELEVENLABS_API_KEY` in `.env` file.
