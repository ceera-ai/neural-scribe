# 🤝 Contributing to Neural Scribe

Thank you for your interest in contributing to Neural Scribe! We welcome contributions from the community and are grateful for your support.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Documentation](#documentation)

---

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to conduct@ceera.ai.

**Key Principles:**

- Be respectful and inclusive
- Welcome newcomers and beginners
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** 18+ or 20+ (LTS recommended)
- **npm** 9+ or 10+
- **Git** for version control
- A code editor (VS Code recommended)
- Basic knowledge of:
  - TypeScript
  - React
  - Electron

### Finding Good First Issues

We label beginner-friendly issues with `good-first-issue`. These are great starting points for new contributors.

**Browse Issues:**

- [Good First Issues](https://github.com/yourusername/elevenlabs-transcription/labels/good-first-issue)
- [Help Wanted](https://github.com/yourusername/elevenlabs-transcription/labels/help-wanted)
- [Bug Reports](https://github.com/yourusername/elevenlabs-transcription/labels/bug)

**Claiming an Issue:**

1. Comment on the issue expressing interest
2. Wait for assignment or approval
3. Start working once assigned

---

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub (click "Fork" button)

# Clone your fork
git clone https://github.com/YOUR_USERNAME/elevenlabs-transcription.git
cd elevenlabs-transcription

# Add upstream remote
git remote add upstream https://github.com/original/elevenlabs-transcription.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create API keys for development:

1. **ElevenLabs API Key**
   - Sign up at [elevenlabs.io](https://elevenlabs.io)
   - Generate API key from dashboard
   - No .env file needed - enter in app on first launch

2. **Anthropic API Key** (optional)
   - Sign up at [console.anthropic.com](https://console.anthropic.com)
   - Generate API key
   - Enter in app Settings → AI Formatting

### 4. Start Development Server

```bash
npm run dev
```

The app should launch in development mode with hot reload enabled.

### 5. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## Project Structure

```
elevenlabs-transcription/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── gamification/         # Gamification UI
│   │   ├── orb/                  # AI Orb visualizer
│   │   ├── cyberpunk/            # Theme components
│   │   └── ...
│   ├── hooks/                    # React hooks
│   │   ├── transcription/        # Transcription engine hooks
│   │   ├── useGamification.ts    # Gamification hook
│   │   └── ...
│   ├── types/                    # TypeScript type definitions
│   ├── App.tsx                   # Main app component
│   └── main.tsx                  # React entry point
│
├── electron/                     # Electron backend
│   ├── main/                     # Main process
│   │   ├── services/             # Service layer
│   │   │   ├── FormattingService.ts
│   │   │   └── TerminalService.ts
│   │   ├── store/                # Data persistence
│   │   │   ├── gamification/     # Gamification store
│   │   │   ├── settings.ts       # App settings
│   │   │   ├── history.ts        # Transcription history
│   │   │   └── replacements.ts   # Word replacements
│   │   ├── ipc-handlers.ts       # IPC communication
│   │   └── index.ts              # Main process entry
│   ├── preload/                  # Preload scripts
│   └── renderer/                 # Renderer utilities
│
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md           # Technical architecture
│   ├── FEATURE_INVENTORY.md      # All features
│   ├── PRD.md                    # Product requirements
│   ├── USER_GUIDE.md             # User tutorials
│   └── TROUBLESHOOTING.md        # Common issues
│
├── tests/                        # Test suites
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── e2e/                      # End-to-end tests
│
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── vite.config.ts                # Vite config
└── README.md                     # Main documentation
```

---

## Development Workflow

### 1. Create a Feature Branch

```bash
# Sync with upstream
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

**Branch Naming:**

- Features: `feature/short-description`
- Bug fixes: `fix/bug-description`
- Documentation: `docs/what-changed`
- Refactoring: `refactor/what-changed`

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run all tests
npm test

# Run linter
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Type check
npm run type-check
```

**Ensure:**

- All tests pass
- No TypeScript errors
- No ESLint warnings
- Test coverage doesn't decrease

### 4. Commit Your Changes

```bash
# Stage changes
git add .

# Commit with meaningful message
git commit -m "feat: add voice command customization"
```

See [Commit Guidelines](#commit-guidelines) for commit message format.

### 5. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# Use the PR template provided
```

---

## Coding Standards

### TypeScript

**Use TypeScript for all new code:**

```typescript
// Good: Explicit types
interface UserSettings {
  microphoneId: string | null
  formattingEnabled: boolean
}

function updateSettings(settings: UserSettings): void {
  // ...
}

// Avoid: Any types
function updateSettings(settings: any) {
  // ❌ Don't use 'any'
  // ...
}
```

**Type Everything:**

- Function parameters
- Return types
- Component props
- State variables

### React

**Functional Components with Hooks:**

```typescript
// Good: Functional component with TypeScript
interface ButtonProps {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}

export function Button({ onClick, disabled, children }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

// Avoid: Class components (legacy style)
class Button extends React.Component { }  // ❌
```

**Hook Best Practices:**

```typescript
// Good: Memoize expensive computations
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.timestamp - b.timestamp)
}, [items])

// Good: Cleanup side effects
useEffect(() => {
  const timer = setInterval(() => {}, 1000)
  return () => clearInterval(timer) // Cleanup
}, [])
```

### Naming Conventions

**Variables and Functions:**

```typescript
// camelCase for variables and functions
const userName = 'John'
function getUserData() {}

// PascalCase for components and types
interface UserProfile {}
function UserCard() {}

// UPPER_CASE for constants
const MAX_RETRY_COUNT = 3
const API_BASE_URL = 'https://api.example.com'
```

**Files:**

- Components: `PascalCase.tsx` (e.g., `UserCard.tsx`)
- Hooks: `camelCase.ts` (e.g., `useGamification.ts`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Types: `camelCase.ts` (e.g., `electron.d.ts`)

### Code Style

**Formatting:**

- Use Prettier for auto-formatting (config in `.prettierrc`)
- 2 spaces for indentation
- Semicolons required
- Single quotes for strings
- Trailing commas

**Comments:**

```typescript
// Good: Explain WHY, not WHAT
// Debounce to avoid excessive API calls during typing
const debouncedSearch = useMemo(() => debounce(search, 300), [])

// Avoid: Obvious comments
const count = 0 // Initialize count to 0  ❌
```

**Import Order:**

```typescript
// 1. External libraries
import React, { useState, useEffect } from 'react'
import { ipcRenderer } from 'electron'

// 2. Internal modules
import { useGamification } from './hooks/useGamification'
import { formatDate } from './utils/formatDate'

// 3. Types
import type { UserStats } from './types/gamification'

// 4. Styles (last)
import './App.css'
```

---

## Testing Requirements

### Test Coverage

All new code should have tests:

- **Unit tests** for utilities and pure functions
- **Component tests** for React components
- **Integration tests** for features

**Minimum Coverage:**

- 80% overall coverage
- 100% for critical paths (API calls, data persistence)

### Writing Tests

**Unit Tests (Vitest):**

```typescript
import { describe, it, expect } from 'vitest'
import { calculateLevelFromXP } from './levels'

describe('calculateLevelFromXP', () => {
  it('should return level 1 for 0 XP', () => {
    expect(calculateLevelFromXP(0)).toBe(1)
  })

  it('should return level 2 for 100 XP', () => {
    expect(calculateLevelFromXP(100)).toBe(2)
  })

  it('should handle large XP values', () => {
    expect(calculateLevelFromXP(100000)).toBeGreaterThan(50)
  })
})
```

**Component Tests (React Testing Library):**

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('should render with text', () => {
    render(<Button onClick={() => {}}>Click Me</Button>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click Me</Button>)
    fireEvent.click(screen.getByText('Click Me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button onClick={() => {}} disabled>Click Me</Button>)
    expect(screen.getByText('Click Me')).toBeDisabled()
  })
})
```

### Running Tests

```bash
# All tests
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm test -- UserCard.test.tsx
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clear commit history.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring (no feature or bug change)
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Tooling, dependencies, etc.

**Examples:**

```bash
# Feature
git commit -m "feat(gamification): add achievement sharing"

# Bug fix
git commit -m "fix(transcription): resolve microphone permission error"

# Documentation
git commit -m "docs(readme): add installation instructions"

# Refactoring
git commit -m "refactor(ui): extract orb component"

# Multiple lines
git commit -m "feat(voice-commands): add custom command support

- Allow users to define custom voice triggers
- Store commands in settings
- Validate command uniqueness

Closes #123"
```

---

## Pull Request Process

### Before Submitting

**Checklist:**

- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Added/updated tests for changes
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow guidelines
- [ ] Branch is up-to-date with `main`

### Creating a Pull Request

1. **Push your branch to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open Pull Request on GitHub**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill out the PR template

3. **PR Template Structure:**

   ```markdown
   ## Description

   Brief description of changes

   ## Type of Change

   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Refactoring

   ## Testing

   How have you tested this?

   ## Screenshots (if UI changes)

   Add screenshots here

   ## Checklist

   - [ ] Tests pass
   - [ ] Documentation updated
   - [ ] No breaking changes
   ```

### PR Review Process

1. **Automated Checks**
   - CI runs tests and linting
   - All checks must pass

2. **Code Review**
   - Maintainer reviews code
   - May request changes
   - Address feedback promptly

3. **Approval and Merge**
   - Once approved, maintainer merges
   - Branch is deleted automatically

**Response Time:**

- We aim to review PRs within 48 hours
- Complex PRs may take longer

---

## Reporting Bugs

### Before Reporting

1. **Check existing issues** - Bug may already be reported
2. **Update to latest version** - May be fixed already
3. **Search discussions** - Community may have solution

### Creating a Bug Report

Use the bug report template on GitHub Issues.

**Include:**

- **Clear title** describing the issue
- **Steps to reproduce** (detailed)
- **Expected behavior** vs. **actual behavior**
- **Screenshots/videos** (if applicable)
- **System information:**
  - OS and version
  - Node.js version
  - App version
  - Browser (if dev mode)
- **Console logs** (if any errors)

**Example:**

```markdown
**Title:** Microphone not detected on macOS Ventura

**Description:**
After granting microphone permissions, the dropdown shows "No microphones found".

**Steps to Reproduce:**

1. Launch app on macOS 13.5
2. Grant microphone permissions when prompted
3. Open Settings → Microphone
4. Dropdown is empty

**Expected:** Should show list of available microphones

**Actual:** "No microphones found" message

**System:**

- macOS 13.5 (Ventura)
- Node.js 20.10.0
- App version 1.2.3

**Console Logs:**
```

Error: Could not enumerate devices
at getDevices (...)

```

```

---

## Suggesting Features

### Feature Request Process

1. **Check existing requests** - May already be planned
2. **Open a discussion** (not an issue) for big features
3. **Use feature request template** for smaller features

**Include:**

- **Problem description** - What pain point does this solve?
- **Proposed solution** - How should it work?
- **Alternatives considered** - Other ways to solve it?
- **Use cases** - Who benefits and how?

**Example:**

```markdown
**Title:** Add export to Markdown format

**Problem:**
Currently, transcriptions can only be copied individually. I want to export my entire history as a single Markdown file for documentation purposes.

**Proposed Solution:**
Add an "Export All" button in the History panel with format options (Markdown, JSON, TXT).

**Use Cases:**

- Generating meeting notes documentation
- Creating changelogs from voice notes
- Archiving transcriptions for backup

**Alternatives:**

- Manual copy-paste (tedious for many entries)
- JSON export (less readable than Markdown)
```

---

## Documentation

### Updating Documentation

**When to Update:**

- New features added
- Existing behavior changed
- Bug fixes that affect user-facing features
- New configuration options
- Breaking changes

**Documentation Files:**

- `README.md` - Main marketing/overview
- `docs/USER_GUIDE.md` - Detailed tutorials
- `docs/TROUBLESHOOTING.md` - Common issues
- `docs/ARCHITECTURE.md` - Technical details
- `CONTRIBUTING.md` - This file

### Writing Good Documentation

**Principles:**

- **Clear and concise** - Short sentences
- **User-focused** - Explain "why" not just "what"
- **Examples included** - Show, don't just tell
- **Up-to-date** - Test all examples
- **Well-structured** - Use headers and lists

**Example:**

```markdown
# Good Documentation

## How to Add Word Replacements

Word replacements automatically correct common transcription errors.

**Steps:**

1. Click Settings (⚙️ icon)
2. Navigate to "Word Replacements"
3. Click "Add Replacement"
4. Enter:
   - **From:** sequel
   - **To:** SQL
5. Click "Save"

**Example:**

- You say: "Install sequel"
- Gets transcribed as: "Install SQL"

**Common Replacements:**
| Say | Gets Replaced |
|-----|---------------|
| sequel | SQL |
| jay son | JSON |
```

---

## Questions?

**Need Help?**

- Join [GitHub Discussions](https://github.com/yourusername/elevenlabs-transcription/discussions)
- Ask in issue comments
- Email: contribute@ceera.ai

**Thank You!**

Your contributions make Neural Scribe better for everyone. We appreciate your time and effort! 🎉

---

**Happy Coding!** 💻✨
