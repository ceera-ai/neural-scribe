# Contributing to Neural Scribe

First off, thank you for considering contributing to Neural Scribe! It's people like you that make Neural Scribe such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Style Guides](#style-guides)
  - [Git Commit Messages](#git-commit-messages)
  - [TypeScript Style Guide](#typescript-style-guide)
  - [React Component Style Guide](#react-component-style-guide)
  - [Testing Style Guide](#testing-style-guide)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Release Process](#release-process)

---

## Code of Conduct

This project and everyone participating in it is governed by the [Neural Scribe Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@yourproject.com](mailto:conduct@yourproject.com).

---

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report for Neural Scribe. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

**Before Submitting A Bug Report**:

- Check the [FAQ](README.md#faq) for a list of common questions and problems
- Perform a cursory search of [existing issues](https://github.com/yourusername/neural-scribe/issues) to see if the problem has already been reported
- Determine which repository the problem should be reported in
- Collect information about the bug:
  - Stack trace (if applicable)
  - OS version
  - Neural Scribe version
  - Steps to reproduce
  - Expected vs actual behavior
  - Screenshots (if applicable)

**How Do I Submit A Good Bug Report?**

Bugs are tracked as [GitHub issues](https://github.com/yourusername/neural-scribe/issues). Create an issue using the **Bug Report** template and provide the following information:

- **Use a clear and descriptive title** for the issue to identify the problem
- **Describe the exact steps which reproduce the problem** in as much detail as possible
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs** if relevant
- **If the problem is related to performance or memory**, include a CPU/memory profile capture
- **Include details about your configuration and environment**:
  - Neural Scribe version
  - OS and version
  - Electron version
  - Node.js version

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for Neural Scribe, including completely new features and minor improvements to existing functionality.

**Before Submitting An Enhancement Suggestion**:

- Check the [roadmap](README.md#roadmap) to see if the feature is already planned
- Perform a cursory search of [existing issues](https://github.com/yourusername/neural-scribe/issues) to see if the enhancement has already been suggested
- Determine if your idea fits with the scope and aims of the project

**How Do I Submit A Good Enhancement Suggestion?**

Enhancement suggestions are tracked as [GitHub issues](https://github.com/yourusername/neural-scribe/issues). Create an issue using the **Feature Request** template and provide the following information:

- **Use a clear and descriptive title** for the issue to identify the suggestion
- **Provide a step-by-step description of the suggested enhancement** in as much detail as possible
- **Provide specific examples to demonstrate the steps** or provide mockups/wireframes
- **Describe the current behavior** and **explain which behavior you expected to see instead** and why
- **Explain why this enhancement would be useful** to most Neural Scribe users
- **List some other applications where this enhancement exists**, if applicable

### Your First Code Contribution

Unsure where to begin contributing to Neural Scribe? You can start by looking through these `good-first-issue` and `help-wanted` issues:

- [Good First Issues](https://github.com/yourusername/neural-scribe/labels/good-first-issue) - issues which should only require a few lines of code and a test or two
- [Help Wanted Issues](https://github.com/yourusername/neural-scribe/labels/help%20wanted) - issues which should be a bit more involved than `good-first-issue` issues

**Working on your first Pull Request?** You can learn how from this free series:

- [How to Contribute to an Open Source Project on GitHub](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github)
- [First Timers Only](https://www.firsttimersonly.com/)

### Pull Requests

The process described here has several goals:

- Maintain Neural Scribe's quality
- Fix problems that are important to users
- Engage the community in working toward the best possible Neural Scribe
- Enable a sustainable system for Neural Scribe's maintainers to review contributions

Please follow these steps to have your contribution considered by the maintainers:

1. **Fork the repository** and create your branch from `main`
2. **Follow the [style guides](#style-guides)**
3. **Write tests** for your changes (unit + E2E where applicable)
4. **Ensure the test suite passes** (`npm run test:all`)
5. **Ensure your code lints** (`npm run lint`)
6. **Update documentation** if you're changing functionality
7. **Write a good commit message** following [conventional commits](#git-commit-messages)
8. **Open a Pull Request** using the PR template

**After you submit your pull request**, verify that all status checks are passing.

#### What if the status checks are failing?

If a status check is failing, and you believe that the failure is unrelated to your change, please leave a comment on the pull request explaining why you believe the failure is unrelated. A maintainer will re-run the status check for you. If we conclude that the failure was a false positive, then we will open an issue to track that problem with our status check suite.

While the prerequisites above must be satisfied prior to having your pull request reviewed, the reviewer(s) may ask you to complete additional design work, tests, or other changes before your pull request can be ultimately accepted.

---

## Development Setup

### Prerequisites

- **Node.js**: 18.x or 20.x (LTS versions)
- **npm**: 9.x or higher
- **Git**: Latest version
- **macOS**: 12.0+ (for macOS development)
- **Windows**: Windows 10+ (for Windows development)
- **Linux**: Ubuntu 20.04+ (for Linux development)

### Setup Steps

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/neural-scribe.git
cd neural-scribe

# 3. Add upstream remote
git remote add upstream https://github.com/yourusername/neural-scribe.git

# 4. Install dependencies
npm install

# 5. Create a branch for your changes
git checkout -b feature/my-amazing-feature

# 6. Start the development server
npm run dev

# 7. Make your changes and test them

# 8. Run tests
npm run test:all

# 9. Lint your code
npm run lint

# 10. Commit your changes
git commit -m "feat: add my amazing feature"

# 11. Push to your fork
git push origin feature/my-amazing-feature

# 12. Open a Pull Request
```

### Development Workflow

```bash
# Start development server
npm run dev

# Run tests in watch mode
npm test

# Run specific test file
npm test -- src/components/MyComponent.test.tsx

# Run E2E tests
npm run test:e2e

# Run linter
npm run lint

# Fix linting issues automatically
npm run lint -- --fix

# Run type checker
npx tsc --noEmit

# Build for production
npm run build

# Package for current platform
npm run package
```

### Environment Variables

Create a `.env` file in the root directory (never commit this file):

```bash
# Required for testing transcription features
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

---

## Style Guides

### Git Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

#### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

#### Examples

```bash
feat(transcription): add voice command support for custom triggers

Added ability for users to define custom voice command triggers in settings.
Users can now add, edit, and delete custom phrases that trigger send, clear,
or cancel actions.

Closes #123

---

fix(overlay): prevent overlay from appearing on external displays

The recording overlay was incorrectly appearing on external displays. Now
properly detects the main window's display and shows overlay only there.

Fixes #456

---

docs(readme): update installation instructions for Windows

---

refactor(ipc): extract validation logic into separate module

---

test(hooks): add tests for useElevenLabsScribe hook
```

### TypeScript Style Guide

- **Use TypeScript strict mode** - No implicit `any`, strict null checks
- **Prefer interfaces over types** for object shapes
- **Use explicit return types** for functions
- **Avoid `any`** - Use `unknown` if type is truly unknown
- **Use `const` assertions** for literal types
- **Prefer functional components** over class components (React)
- **Use named exports** over default exports

#### Example

```typescript
// ✅ Good
interface UserSettings {
  apiKey: string
  selectedMicrophoneId: string | null
  recordHotkey: string
}

export function getSettings(): UserSettings {
  // ...
}

export const updateSettings = (settings: Partial<UserSettings>): void => {
  // ...
}

// ❌ Bad
type UserSettings = {
  apiKey: any
  selectedMicrophoneId: string
}

function getSettings() {
  // ...
}

export default getSettings
```

### React Component Style Guide

- **Use functional components** with hooks
- **Extract custom hooks** for complex logic
- **Use TypeScript for props** with interfaces
- **Memoize expensive computations** with `useMemo`
- **Memoize callbacks** with `useCallback` when passing to children
- **Keep components small** - Single Responsibility Principle
- **Use descriptive prop names**
- **Document complex components** with JSDoc

#### Example

```typescript
// ✅ Good
interface TranscriptDisplayProps {
  text: string
  isRecording: boolean
  onClear: () => void
  className?: string
}

/**
 * Displays the current transcript with formatting and controls
 */
export function TranscriptDisplay({
  text,
  isRecording,
  onClear,
  className,
}: TranscriptDisplayProps): JSX.Element {
  const formattedText = useMemo(() => formatTranscript(text), [text])

  return (
    <div className={className}>
      <p>{formattedText}</p>
      {isRecording && <RecordingIndicator />}
      <button onClick={onClear}>Clear</button>
    </div>
  )
}

// ❌ Bad
export function TranscriptDisplay(props: any) {
  return <div>{props.text}</div>
}
```

### Testing Style Guide

- **Write tests for all new features**
- **Maintain or improve test coverage**
- **Use descriptive test names** - describe behavior, not implementation
- **Follow AAA pattern** - Arrange, Act, Assert
- **Mock external dependencies** (API calls, IPC, etc.)
- **Test edge cases** and error conditions
- **Use data-testid** for E2E selectors, not CSS classes

#### Example

```typescript
// ✅ Good
describe('TranscriptDisplay', () => {
  it('should display formatted text when provided', () => {
    // Arrange
    const text = 'Hello, world!'
    const { getByText } = render(
      <TranscriptDisplay text={text} isRecording={false} onClear={vi.fn()} />
    )

    // Act & Assert
    expect(getByText('Hello, world!')).toBeInTheDocument()
  })

  it('should show recording indicator when recording', () => {
    // Arrange
    const { getByTestId } = render(
      <TranscriptDisplay text="" isRecording={true} onClear={vi.fn()} />
    )

    // Act & Assert
    expect(getByTestId('recording-indicator')).toBeVisible()
  })

  it('should call onClear when clear button is clicked', () => {
    // Arrange
    const onClear = vi.fn()
    const { getByRole } = render(
      <TranscriptDisplay text="test" isRecording={false} onClear={onClear} />
    )

    // Act
    fireEvent.click(getByRole('button', { name: /clear/i }))

    // Assert
    expect(onClear).toHaveBeenCalledTimes(1)
  })
})
```

---

## Project Structure

```
neural-scribe/
├── electron/
│   ├── main/                 # Electron main process
│   │   ├── index.ts          # App entry point
│   │   ├── ipc-handlers.ts   # IPC message handlers
│   │   ├── overlay.ts        # Recording overlay window
│   │   ├── store.ts          # Persistent data store
│   │   ├── validation.ts     # Zod IPC validation schemas
│   │   ├── hotkeys.ts        # Global hotkey registration
│   │   ├── tray.ts           # System tray menu
│   │   ├── terminal.ts       # Terminal integration (AppleScript)
│   │   └── prompt-formatter.ts # Claude CLI integration
│   └── preload/              # Preload scripts (context bridge)
│       └── index.ts
├── src/                      # Renderer process (React)
│   ├── components/           # React components
│   │   ├── ErrorBoundary.tsx
│   │   ├── RecordingButton.tsx
│   │   ├── TranscriptDisplay.tsx
│   │   ├── SettingsModal.tsx
│   │   └── ...
│   ├── hooks/                # Custom React hooks
│   │   ├── useElevenLabsScribe.ts
│   │   ├── useVoiceCommands.ts
│   │   └── ...
│   ├── styles/               # CSS modules
│   ├── types/                # TypeScript types
│   ├── constants/            # Constants and configs
│   ├── App.tsx               # Main app component
│   └── main.tsx              # React entry point
├── docs/                     # Documentation
├── resources/                # Icons and assets
├── tests/                    # E2E test files
└── .github/                  # GitHub Actions workflows
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm run test:all

# Run unit tests
npm run test:unit

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage

# Run in watch mode
npm test

# Run specific test file
npm test -- src/components/MyComponent.test.tsx

# Run tests matching pattern
npm test -- --grep "TranscriptDisplay"
```

### Writing Tests

#### Unit Tests

- Use Vitest for unit tests
- Place test files next to the code they test (e.g., `MyComponent.test.tsx`)
- Mock external dependencies (IPC, APIs, etc.)

```typescript
// src/components/MyComponent.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { MyComponent } from './MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    const { getByText } = render(<MyComponent />)
    expect(getByText('Hello')).toBeInTheDocument()
  })
})
```

#### E2E Tests

- Use Playwright for E2E tests
- Place test files in `tests/` directory
- Test critical user flows

```typescript
// tests/transcription.spec.ts
import { test, expect } from '@playwright/test'

test('should start and stop recording', async ({ page }) => {
  await page.goto('/')
  await page.click('[data-testid="record-button"]')
  await expect(page.locator('[data-testid="recording-indicator"]')).toBeVisible()
  await page.click('[data-testid="record-button"]')
  await expect(page.locator('[data-testid="recording-indicator"]')).not.toBeVisible()
})
```

---

## Release Process

Releases are automated using semantic-release. When commits are merged to `main`:

1. **Semantic-release analyzes commits** using conventional commit messages
2. **Determines next version** (major, minor, or patch) based on commit types
3. **Generates changelog** from commit messages
4. **Creates a GitHub release** with changelog
5. **Builds and uploads binaries** for all platforms

### Version Bumps

- **Major** (`feat!:` or `BREAKING CHANGE:`) - Breaking changes
- **Minor** (`feat:`) - New features
- **Patch** (`fix:`) - Bug fixes

---

## Questions?

Feel free to open an issue with the `question` label, or reach out to the maintainers directly.

---

## Attribution

This Contributing guide is adapted from the open-source contribution guidelines for [Atom](https://github.com/atom/atom/blob/master/CONTRIBUTING.md) and [VS Code](https://github.com/microsoft/vscode/blob/main/CONTRIBUTING.md).
