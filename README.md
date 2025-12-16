# ElevenLabs Scribe v2 Real-Time Transcription App

A React + TypeScript application that uses ElevenLabs Scribe v2 API for real-time continuous speech transcription.

## Features

- Real-time continuous transcription using ElevenLabs Scribe v2
- WebSocket-based audio streaming
- Live transcript display with interim and final results
- Copy transcript to clipboard
- Clean, modern UI with status indicators
- Responsive design

## Prerequisites

- Node.js (v16 or higher)
- An ElevenLabs API key (get one from [ElevenLabs Dashboard](https://elevenlabs.io/app/settings/api-keys))

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure your API key:

   Option 1: Set it in the `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env and add your API key
   VITE_ELEVENLABS_API_KEY=your_api_key_here
   ```

   Option 2: Enter it in the app when you first run it

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## Usage

1. If you haven't set the API key in `.env`, enter it when prompted
2. Click "Start Recording" to begin transcription
3. Speak into your microphone
4. Watch the real-time transcription appear
5. Click "Stop Recording" when finished
6. Use "Copy Transcript" to copy the final transcript to your clipboard

## How It Works

The app uses the official **@elevenlabs/client** SDK:
- **SDK Integration**: Uses `Scribe.connect()` from @elevenlabs/client for seamless integration
- **Microphone Mode**: Automatically captures and streams audio from your microphone
- **Automatic Processing**: SDK handles audio format conversion (PCM 16-bit) and streaming
- **VAD (Voice Activity Detection)**: Automatic voice detection and transcript commits
- **Event-driven Updates**: Real-time events for partial and committed transcripts
- **Ultra-low Latency**: Achieves ~150ms transcription latency with Scribe v2 Realtime model

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technologies Used

- React 18
- TypeScript
- Vite
- **@elevenlabs/client** - Official ElevenLabs JavaScript SDK
- ElevenLabs Scribe v2 Realtime API
- WebRTC/WebSockets (handled by SDK)

## Important: Production Security

**⚠️ Security Warning**: This demo uses the API key directly in the client for simplicity. In production, you should:

1. Create a backend endpoint to generate single-use tokens:
```javascript
// Server endpoint
app.post('/api/scribe-token', async (req, res) => {
  const response = await fetch(
    'https://api.elevenlabs.io/v1/single-use-token/realtime_scribe',
    {
      method: 'POST',
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY }
    }
  );
  const data = await response.json();
  res.json({ token: data.token });
});
```

2. Use the token in your client instead of the API key
3. Never expose your API key in client-side code

## Troubleshooting

### Microphone Permission Denied
Make sure you grant microphone permissions when prompted by your browser.

### Connection Fails or Authentication Error
- Verify your API key is correct in the `.env` file
- Check your internet connection
- Ensure you have sufficient API credits in your ElevenLabs account
- For production, ensure you're using single-use tokens instead of API keys

### No Audio Being Captured
- Check your microphone is working in other applications
- Verify the correct microphone is selected in your browser settings
- Check browser console for permission errors

## License

MIT
