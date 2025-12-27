# 🎙️ Neural Scribe

### AI-Powered Voice Transcription for Developers

> Transform your voice into executable terminal commands with real-time AI formatting. Built by [Ceera.ai](https://ceera.ai)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-33+-green.svg)](https://www.electronjs.org/)
[![Tests](https://img.shields.io/badge/tests-341%20passing-brightgreen.svg)](docs/ARCHITECTURE.md#testing)

---

## Overview

Neural Scribe is a production-ready Electron desktop application that provides ultra-low-latency voice transcription with support for multiple transcription engines (ElevenLabs Scribe and Deepgram). Designed for developers, writers, and productivity enthusiasts, it offers seamless terminal integration, customizable voice commands, and an engaging gamification system.

**Developed by [Ceera.ai](https://ceera.ai)**

### Why Neural Scribe?

- **Multi-Engine Support**: Choose between ElevenLabs Scribe or Deepgram for transcription (applies to all features including dictation)
- **Ultra-Low Latency**: ~100-150ms transcription latency with real-time streaming
- **Voice Commands**: Control transcription with natural voice triggers ("send it", "clear", "cancel")
- **Terminal Integration**: Paste transcriptions directly to any terminal with keyboard shortcuts
- **Smart Formatting**: AI-powered prompt formatting using Claude Code CLI with voice dictation
- **Gamification**: Track your transcription stats, earn XP, and unlock achievements
- **Customizable**: Word replacements, voice command triggers, and hotkey configuration
- **Privacy-Focused**: Runs locally, data stays on your machine
- **Production-Ready**: Comprehensive error handling, IPC validation, and sandbox security

---

## Features

### Core Transcription

- ✅ **Real-Time Transcription**: Continuous speech-to-text with live updates
- ✅ **Voice Activity Detection**: Automatic detection and smart transcript commits
- ✅ **High Accuracy**: Support for ElevenLabs Scribe and Deepgram engines
- ✅ **Microphone Selection**: Choose from available input devices
- ✅ **Visual Feedback**: Real-time waveform and audio level visualization

### Voice Commands

- ✅ **Send Command**: "send it", "submit", "paste" - pastes to terminal
- ✅ **Clear Command**: "clear", "delete", "erase" - clears current transcript
- ✅ **Cancel Command**: "cancel", "stop", "nevermind" - discards and stops
- ✅ **Custom Triggers**: Add your own voice command phrases
- ✅ **Enable/Disable**: Toggle voice commands on or off

### Terminal Integration

- ✅ **Direct Paste**: Paste transcriptions to any running terminal
- ✅ **Terminal Detection**: Automatically finds Terminal.app, iTerm2, Warp, Hyper, Alacritty, Kitty
- ✅ **Window Selection**: Choose specific terminal windows
- ✅ **Global Hotkeys**: Configurable keyboard shortcuts for paste and record
- ✅ **Smart Routing**: Remembers last active terminal

### AI-Powered Features

- ✅ **Prompt Formatting**: Automatically format transcriptions using Claude Code CLI
- ✅ **Custom Instructions**: Define your own formatting rules
- ✅ **Model Selection**: Choose between Sonnet, Opus, or Haiku
- ✅ **Title Generation**: Auto-generate titles for transcriptions
- ✅ **Reformat Dialog**: Reformat with custom instructions on-demand

### Word Replacements

- ✅ **Find & Replace**: Automatically replace words in transcriptions
- ✅ **Case Sensitive**: Option for case-sensitive replacements
- ✅ **Whole Word**: Match whole words only
- ✅ **Regex Support**: Pattern matching for advanced users
- ✅ **Bulk Management**: Add, edit, delete, and toggle replacements

### Gamification

- ✅ **XP System**: Earn experience points for transcriptions
- ✅ **Levels**: Level up based on accumulated XP
- ✅ **Achievements**: Unlock badges for milestones (First Word, Speed Demon, Marathon Runner, etc.)
- ✅ **Stats Tracking**: Monitor words transcribed, sessions completed, and time spent
- ✅ **Daily Login Bonus**: Earn bonus XP for consecutive days
- ✅ **Streak Tracking**: Track your daily transcription streaks

### Overlay & UI

- ✅ **Recording Overlay**: Beautiful floating overlay during recording
- ✅ **Status Indicators**: Connection status, formatting status, recording time
- ✅ **Focus Mode**: Minimal distraction-free transcript view
- ✅ **Waveform Visualization**: Real-time audio waveform display
- ✅ **AI Orb**: Animated spectrum visualization
- ✅ **Transcript Preview**: Live preview with word count

### History & Organization

- ✅ **Automatic Saving**: All transcriptions saved automatically
- ✅ **Search & Filter**: Find transcriptions quickly
- ✅ **Export Options**: Copy individual or all transcriptions
- ✅ **Formatted Versions**: Track multiple formatted versions
- ✅ **History Limit**: Configure max history items (0 = unlimited)
- ✅ **Bulk Delete**: Clear history with confirmation

### Security & Stability

- ✅ **Error Boundaries**: Graceful error handling prevents crashes
- ✅ **Sandbox Mode**: Renderer processes isolated for security
- ✅ **IPC Validation**: Runtime validation of all inter-process communication
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Testing**: Comprehensive unit and E2E test suite

---

## Screenshots

> **Note**: Screenshots coming soon! Check back after the first release.

---

## Installation

### Prerequisites

- **macOS**: 12.0 (Monterey) or later
- **Windows**: Windows 10 or later (upcoming)
- **Linux**: Ubuntu 20.04+ or equivalent (upcoming)
- **ElevenLabs API Key**: Get one from [ElevenLabs Dashboard](https://elevenlabs.io/app/settings/api-keys)
- **Claude Code CLI** (optional): For AI-powered prompt formatting

### Download

#### Option 1: Pre-built Binaries (Recommended)

Download the latest release for your platform:

- [macOS (Apple Silicon)](https://github.com/yourusername/neural-scribe/releases) - `.dmg`
- [macOS (Intel)](https://github.com/yourusername/neural-scribe/releases) - `.dmg`
- [Windows](https://github.com/yourusername/neural-scribe/releases) - `.exe` (coming soon)
- [Linux](https://github.com/yourusername/neural-scribe/releases) - `.AppImage` (coming soon)

#### Option 2: Build from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/neural-scribe.git
cd neural-scribe

# Install dependencies
npm install

# Build the application
npm run build

# Package for your platform
npm run package        # Detects platform automatically
npm run package:mac    # macOS only
```

The packaged app will be in the `dist` directory.

---

## Usage

### First Launch

1. **Launch Neural Scribe** from your Applications folder (macOS) or Start Menu (Windows)
2. **Enter API Key** when prompted (get one from [ElevenLabs](https://elevenlabs.io))
3. **Grant Permissions**:
   - Microphone access (required for transcription)
   - Accessibility access (optional, for terminal integration)

### Basic Transcription

1. Click **Start Recording** (or press your configured hotkey)
2. Speak into your microphone
3. Watch real-time transcription appear
4. Click **Stop Recording** when finished
5. Use **Copy** to copy transcript to clipboard
6. Use **Send** (voice command or button) to paste to terminal

### Voice Commands

While recording, say:

- **"send it"** / **"submit"** / **"paste"** → Paste to terminal and stop recording
- **"clear"** / **"delete"** / **"erase"** → Clear current transcript
- **"cancel"** / **"stop"** / **"nevermind"** → Discard and stop recording

Customize voice command triggers in Settings → Voice Commands.

### Terminal Integration

**Setup** (macOS):

1. Go to **System Settings → Privacy & Security → Accessibility**
2. Click the **+** button and add **Neural Scribe**
3. Enable the checkbox for Neural Scribe

**Usage**:

- Voice command: Say **"send it"** while recording
- Keyboard shortcut: Press your configured **Paste Hotkey** (default: `Cmd+Shift+V`)
- Settings: Choose specific terminal app and window

**Supported Terminals**:

- Terminal.app
- iTerm2
- Warp
- Hyper
- Alacritty
- Kitty

### AI-Powered Formatting

**Prerequisites**:

1. Install [Claude Code CLI](https://claude.ai/code): `npm install -g @anthropic-ai/claude-code`
2. Configure Claude API key
3. Enable formatting in Settings → Prompt Formatting

**Features**:

- **Auto-format**: Transcriptions automatically formatted on save
- **Custom Instructions**: Define how you want text formatted (e.g., "format as bullet points", "fix grammar only")
- **Reformat**: Right-click any transcription → Reformat to apply new formatting
- **Model Selection**: Choose Sonnet (balanced), Opus (most capable), or Haiku (fastest)

### Keyboard Shortcuts

| Action               | Default Shortcut | Customizable |
| -------------------- | ---------------- | ------------ |
| Start/Stop Recording | `Cmd+Shift+R`    | ✅ Yes       |
| Paste to Terminal    | `Cmd+Shift+V`    | ✅ Yes       |
| Open Settings        | `Cmd+,`          | ❌ No        |

Customize shortcuts in Settings → Hotkeys.

### Configuration

Access settings via the menu bar icon or **Settings** button:

**General**:

- API Key configuration
- Microphone selection
- History limit

**Terminal**:

- Default terminal app
- Paste hotkey
- Auto-paste on voice command

**Voice Commands**:

- Enable/disable voice commands
- Customize trigger phrases
- Add custom commands

**Word Replacements**:

- Add find/replace rules
- Case sensitivity options
- Whole word matching

**Prompt Formatting**:

- Enable/disable AI formatting
- Custom formatting instructions
- Model selection (Sonnet, Opus, Haiku)

**Gamification**:

- View stats and achievements
- Track progress
- Daily login bonuses

---

## Development

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/yourusername/neural-scribe.git
cd neural-scribe

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will launch with hot-reload enabled. Changes to source files will automatically refresh.

### Project Structure

```
neural-scribe/
├── electron/
│   ├── main/                  # Electron main process
│   │   ├── index.ts           # App entry point
│   │   ├── ipc-handlers.ts    # IPC message handlers
│   │   ├── overlay.ts         # Recording overlay window
│   │   ├── validation.ts      # Zod IPC validation schemas
│   │   ├── store/             # Modular data store (Phase 5)
│   │   │   ├── settings.ts    # Settings management
│   │   │   ├── history.ts     # Transcription history
│   │   │   ├── replacements.ts # Word replacements
│   │   │   ├── voice-commands.ts # Voice command triggers
│   │   │   ├── gamification/  # Gamification system
│   │   │   │   ├── levels.ts  # XP & level calculations
│   │   │   │   ├── stats.ts   # Statistics & streaks
│   │   │   │   ├── achievements.ts # Achievement unlocking
│   │   │   │   └── index.ts   # Gamification orchestrator
│   │   │   └── index.ts       # Store module exports
│   │   ├── services/          # Business logic services (Phase 5)
│   │   │   ├── FormattingService.ts # AI formatting
│   │   │   ├── TerminalService.ts # Terminal automation
│   │   │   └── index.ts       # Service exports
│   │   └── ...
│   └── preload/               # Preload scripts (context bridge)
│       └── index.ts
├── src/                       # Renderer process (React)
│   ├── components/            # React components
│   ├── hooks/                 # Custom React hooks
│   ├── styles/                # CSS modules
│   ├── types/                 # TypeScript types
│   ├── constants/             # Constants and configs
│   └── App.tsx                # Main app component
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md        # System architecture
│   ├── API.md                 # API reference
│   ├── EXAMPLES.md            # Usage examples
│   └── PHASE_*.md             # Phase completion reports
├── resources/                 # Icons and assets
└── tests/                     # Test files
```

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot-reload
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm test                 # Run tests in watch mode
npm run test:unit        # Run unit tests once
npm run test:e2e         # Run E2E tests
npm run test:coverage    # Generate coverage report
npm run test:all         # Run all tests

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier

# Packaging
npm run package          # Package for current platform
npm run package:mac      # Package for macOS
```

### Tech Stack

| Category          | Technology          | Purpose                    |
| ----------------- | ------------------- | -------------------------- |
| Desktop Framework | Electron 33         | Cross-platform desktop app |
| Frontend          | React 19            | UI components              |
| Language          | TypeScript 5.9      | Type safety                |
| Build Tool        | electron-vite       | Fast Vite-based bundling   |
| State Management  | React Hooks + IPC   | Local and persistent state |
| Data Storage      | electron-store      | Encrypted local storage    |
| Validation        | Zod                 | Runtime type validation    |
| Testing           | Vitest + Playwright | Unit and E2E tests         |
| Code Quality      | ESLint + Prettier   | Linting and formatting     |
| API Client        | @elevenlabs/client  | ElevenLabs SDK             |
| Styling           | CSS Modules         | Scoped component styles    |

### Testing

```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:unit        # Unit tests only
npm run test:e2e         # E2E tests only
npm run test:coverage    # With coverage report

# Interactive test UI
npm run test:ui          # Vitest UI
npm run test:e2e:ui      # Playwright UI
npm run test:e2e:debug   # Playwright debug mode
```

**Test Coverage**: ~60% overall (Store modules: 100%, Services: 100%)

- 341 tests passing (100% pass rate)
- 10 test files with comprehensive coverage
- Fast execution: 320ms for all tests

### Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb-inspired config with React hooks rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks (coming soon)
- **Conventional Commits**: Semantic commit messages

### Architecture

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture documentation.

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure tests pass: `npm run test:all`
5. Lint your code: `npm run lint`
6. Commit with conventional commits: `git commit -m "feat: add amazing feature"`
7. Push to your fork: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Good First Issues

Looking to contribute? Check out issues labeled [`good-first-issue`](https://github.com/yourusername/neural-scribe/labels/good-first-issue) for beginner-friendly tasks.

---

## Roadmap

### v1.1.0 (Next Release)

- [ ] Windows support
- [ ] Linux support
- [ ] Multi-language support
- [ ] Cloud sync (optional)
- [ ] Plugin system

### v1.2.0

- [ ] Mobile companion app
- [ ] Team collaboration features
- [ ] Advanced analytics
- [ ] Custom themes

### Future

- [ ] Offline mode
- [ ] Speaker diarization
- [ ] Video transcription
- [ ] Integration with productivity tools (Notion, Obsidian, etc.)

---

## FAQ

### How is my data stored?

All transcriptions are stored locally on your machine using `electron-store`. No data is sent to any server except:

- Audio to ElevenLabs API (for transcription)
- Text to Claude API (if prompt formatting is enabled)

### Do I need Claude Code for formatting?

No! Prompt formatting is completely optional. The app works perfectly fine without it. If you want AI-powered formatting, you'll need Claude Code CLI installed.

### Can I use my own API endpoints?

Not currently, but this is planned for a future release. If you need this feature, please open an issue!

### How much does this cost?

Neural Scribe is free and open source. However, you'll need:

- **ElevenLabs API Key**: Pay-as-you-go pricing (~$0.025/minute of audio)
- **Claude API Key** (optional): For prompt formatting

### Is this production-ready?

Yes! Neural Scribe has undergone extensive refactoring and testing to ensure production readiness:

- **Modular Architecture**: 15 feature modules with clean separation of concerns
- **Service Layer**: Singleton pattern for business logic encapsulation
- **Comprehensive Testing**: 341 tests with 100% pass rate
- **Type Safety**: Full TypeScript coverage with strict mode
- **Security**: Sandbox mode, context isolation, IPC validation with Zod
- **Error Handling**: Graceful degradation and comprehensive error boundaries
- **Documentation**: Complete API docs, architecture guide, and examples

---

## Security

### Reporting Vulnerabilities

Please report security vulnerabilities to [security@yourproject.com](mailto:security@yourproject.com). Do not open public issues for security concerns.

### Security Features

- ✅ Sandbox mode enabled
- ✅ Context isolation
- ✅ Node integration disabled
- ✅ IPC validation with Zod
- ✅ Content Security Policy
- ✅ API keys stored securely with electron-store

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **[ElevenLabs](https://elevenlabs.io)** - For the incredible Scribe v2 API
- **[Anthropic](https://anthropic.com)** - For Claude Code CLI
- **[Electron](https://electronjs.org)** - For the desktop framework
- **[React](https://reactjs.org)** - For the UI framework
- All our [contributors](https://github.com/yourusername/neural-scribe/graphs/contributors)

---

## Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/yourusername/neural-scribe/issues)
- 💬 [Discussions](https://github.com/yourusername/neural-scribe/discussions)
- 📧 [Email](mailto:support@yourproject.com)

---

<div align="center">

**Made with ❤️ by the Neural Scribe Team**

[⬆ Back to Top](#neural-scribe)

</div>
