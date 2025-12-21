# Neural Scribe Usage Examples

This document provides practical examples for common use cases and workflows in Neural Scribe.

**Version**: 1.0.0
**Last Updated**: 2025-12-20

---

## Table of Contents

1. [Basic Recording Workflow](#basic-recording-workflow)
2. [Custom Word Replacements](#custom-word-replacements)
3. [Prompt Formatting Configuration](#prompt-formatting-configuration)
4. [Terminal Automation](#terminal-automation)
5. [History Management](#history-management)
6. [Gamification Integration](#gamification-integration)
7. [Voice Commands](#voice-commands)
8. [Custom Hotkeys](#custom-hotkeys)
9. [Advanced Integration](#advanced-integration)

---

## Basic Recording Workflow

### Example 1: Simple Voice-to-Text Recording

The most common use case: record voice, get text, copy to clipboard.

```typescript
import { useElevenLabsScribe } from './hooks/useElevenLabsScribe'

function RecordingComponent() {
  const {
    isRecording,
    transcriptSegments,
    startRecording,
    stopRecording,
    clearTranscript
  } = useElevenLabsScribe({
    selectedMicrophoneId: 'default',
    voiceCommandsEnabled: false,
    onRecordingStopped: (text, duration) => {
      console.log(`Recorded ${duration}s: "${text}"`)
    }
  })

  // Display final transcript
  const finalText = transcriptSegments
    .map(seg => seg.text)
    .join(' ')

  return (
    <div>
      <button onClick={startRecording} disabled={isRecording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop Recording
      </button>
      <button onClick={clearTranscript}>Clear</button>

      <div className="transcript">
        {finalText}
      </div>
    </div>
  )
}
```

---

### Example 2: Recording with Real-Time Display

Show partial transcripts as they arrive in real-time.

```typescript
function LiveTranscriptDisplay() {
  const { transcriptSegments } = useElevenLabsScribe({
    selectedMicrophoneId: 'default',
    voiceCommandsEnabled: true,
    onRecordingStopped: (text, duration) => {
      saveToHistory(text, duration)
    }
  })

  return (
    <div className="live-transcript">
      {transcriptSegments.map((segment, index) => (
        <span
          key={segment.id}
          className={segment.isFinal ? 'final' : 'partial'}
        >
          {segment.text}
          {index < transcriptSegments.length - 1 && ' '}
        </span>
      ))}
    </div>
  )
}
```

**CSS:**

```css
.live-transcript .partial {
  color: #888;
  font-style: italic;
}

.live-transcript .final {
  color: #000;
  font-weight: normal;
}
```

---

## Custom Word Replacements

### Example 3: Setting Up Common Replacements

Replace frequently misheard phrases with correct text.

```typescript
async function setupCommonReplacements() {
  const replacements = [
    {
      id: crypto.randomUUID(),
      from: 'docker compose',
      to: 'docker-compose',
      caseSensitive: false,
      wholeWord: true,
      enabled: true,
    },
    {
      id: crypto.randomUUID(),
      from: 'NPM',
      to: 'npm',
      caseSensitive: true,
      wholeWord: true,
      enabled: true,
    },
    {
      id: crypto.randomUUID(),
      from: 'get hub',
      to: 'GitHub',
      caseSensitive: false,
      wholeWord: false,
      enabled: true,
    },
    {
      id: crypto.randomUUID(),
      from: 'type script',
      to: 'TypeScript',
      caseSensitive: false,
      wholeWord: false,
      enabled: true,
    },
  ]

  for (const replacement of replacements) {
    await window.electronAPI.addReplacement(replacement)
  }

  console.log('✅ Common replacements configured')
}

// Usage
await setupCommonReplacements()
```

---

### Example 4: Applying Replacements to Transcript

```typescript
async function processTranscript(originalText: string) {
  // Apply all enabled replacements
  const processedText = await window.electronAPI.applyReplacements(originalText)

  console.log('Original:', originalText)
  // "run docker compose up in my project"

  console.log('Processed:', processedText)
  // "run docker-compose up in my project"

  return processedText
}
```

---

## Prompt Formatting Configuration

### Example 5: Enable AI Formatting for Shell Commands

Configure Claude AI to format voice commands into proper shell syntax.

```typescript
async function enableShellCommandFormatting() {
  // Enable formatting
  await window.electronAPI.setPromptFormattingEnabled(true)

  // Set model (haiku = fast/cheap, sonnet = balanced, opus = best quality)
  await window.electronAPI.setPromptFormattingModel('haiku')

  // Set custom instructions
  const instructions = `
You are an expert at formatting voice-to-text transcriptions into proper shell commands.

Rules:
1. Convert natural language to exact shell syntax
2. Use standard Unix command names and flags
3. Add proper escaping for special characters
4. Keep commands concise and idiomatic
5. Return ONLY the command, no explanations

Examples:
- "list all files" → "ls -la"
- "make a directory called my project" → "mkdir my-project"
- "install express and cors" → "npm install express cors"
- "search for TODO in all JavaScript files" → "grep -r 'TODO' *.js"
  `.trim()

  await window.electronAPI.setPromptFormattingInstructions(instructions)

  console.log('✅ Shell command formatting enabled')
}
```

---

### Example 6: Format Transcript with Custom Instructions

```typescript
async function formatWithCustomContext() {
  const transcript = 'create a react component called user profile with name email and avatar'

  // Use custom instructions for this specific formatting
  const result = await window.electronAPI.reformatText(
    transcript,
    `Convert this to a React TypeScript functional component with props interface.
     Use modern React hooks and best practices.`
  )

  if (result.success) {
    console.log(result.formatted)
    /*
    interface UserProfileProps {
      name: string
      email: string
      avatar: string
    }

    export function UserProfile({ name, email, avatar }: UserProfileProps) {
      return (
        <div className="user-profile">
          <img src={avatar} alt={name} />
          <h3>{name}</h3>
          <p>{email}</p>
        </div>
      )
    }
    */
  }
}
```

---

## Terminal Automation

### Example 7: Auto-Paste to Active Terminal

Detect the active terminal and paste transcription automatically.

```typescript
async function pasteToActiveTerminal(text: string) {
  const result = await window.electronAPI.pasteToLastActiveTerminal(text)

  if (result.success) {
    console.log(`✅ Pasted to ${result.targetApp}`)
  } else if (result.needsPermission) {
    alert(
      'Accessibility permissions required. ' +
        'Please enable in System Preferences → Security & Privacy → Accessibility'
    )
  } else if (result.copied) {
    console.log('⚠️ Terminal paste failed, text copied to clipboard')
  } else {
    console.error('❌ Paste failed')
  }
}
```

---

### Example 8: Select Terminal Application

Let users choose which terminal to paste to.

```typescript
function TerminalSelector() {
  const [terminals, setTerminals] = useState<TerminalApp[]>([])
  const [selectedTerminal, setSelectedTerminal] = useState<string | null>(null)

  useEffect(() => {
    loadTerminals()
  }, [])

  async function loadTerminals() {
    // Get currently running terminals
    const running = await window.electronAPI.getRunningTerminals()
    setTerminals(running)

    if (running.length > 0) {
      setSelectedTerminal(running[0].bundleId)
    }
  }

  async function pasteToSelected(text: string) {
    if (!selectedTerminal) return

    const result = await window.electronAPI.pasteToTerminal(
      text,
      selectedTerminal
    )

    if (result.success) {
      console.log('✅ Pasted successfully')
    }
  }

  return (
    <div>
      <select
        value={selectedTerminal || ''}
        onChange={(e) => setSelectedTerminal(e.target.value)}
      >
        {terminals.map(term => (
          <option key={term.bundleId} value={term.bundleId}>
            {term.displayName}
          </option>
        ))}
      </select>

      <button onClick={() => pasteToSelected('echo "Hello"')}>
        Paste to Terminal
      </button>
    </div>
  )
}
```

---

## History Management

### Example 9: Save Transcription with Metadata

Save transcriptions with formatting and titles.

```typescript
async function saveTranscriptionWithFormatting(originalText: string, duration: number) {
  // Apply word replacements
  const replacedText = await window.electronAPI.applyReplacements(originalText)

  // Format with AI (if enabled)
  const formatResult = await window.electronAPI.formatPrompt(replacedText)

  // Generate title
  const titleResult = await window.electronAPI.generateTitle(formatResult.formatted)

  // Create record
  const record: TranscriptionRecord = {
    id: crypto.randomUUID(),
    text: formatResult.formatted,
    originalText: originalText,
    formattedText: formatResult.formatted,
    wasFormatted: formatResult.success && !formatResult.skipped,
    title: titleResult.success ? titleResult.title : 'Untitled',
    timestamp: Date.now(),
    wordCount: formatResult.formatted.split(/\s+/).length,
    duration: duration,
  }

  // Save to history
  await window.electronAPI.saveTranscription(record)

  console.log(`✅ Saved: "${record.title}"`)

  return record
}
```

---

### Example 10: Search and Filter History

```typescript
function HistoryPanel() {
  const [history, setHistory] = useState<TranscriptionRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadHistory()

    // Listen for history changes
    window.electronAPI.onHistoryChanged(() => {
      loadHistory()
    })
  }, [])

  async function loadHistory() {
    const records = await window.electronAPI.getHistory()
    setHistory(records)
  }

  // Filter by search query
  const filteredHistory = history.filter(record =>
    record.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  async function deleteRecord(id: string) {
    await window.electronAPI.deleteTranscription(id)
    // History will auto-reload via onHistoryChanged event
  }

  async function copyRecord(text: string) {
    await window.electronAPI.copyToClipboard(text)
    console.log('✅ Copied to clipboard')
  }

  return (
    <div className="history-panel">
      <input
        type="search"
        placeholder="Search history..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="history-list">
        {filteredHistory.map(record => (
          <div key={record.id} className="history-item">
            <h4>{record.title}</h4>
            <p>{record.text}</p>
            <div className="metadata">
              {record.wordCount} words · {record.duration.toFixed(1)}s
              {record.wasFormatted && ' · Formatted'}
            </div>
            <div className="actions">
              <button onClick={() => copyRecord(record.text)}>
                Copy
              </button>
              <button onClick={() => deleteRecord(record.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## Gamification Integration

### Example 11: Display User Level and XP

```typescript
import { useEffect, useState } from 'react'

function GamificationDisplay() {
  const [gamData, setGamData] = useState<GamificationData | null>(null)

  useEffect(() => {
    loadGamificationData()

    // Listen for updates
    window.electronAPI.onGamificationDataChanged(() => {
      loadGamificationData()
    })
  }, [])

  async function loadGamificationData() {
    const data = await window.electronAPI.getGamificationData()
    setGamData(data)
  }

  if (!gamData) return <div>Loading...</div>

  const { level, stats } = gamData
  const progressPercent = (level.currentXP / level.xpToNextLevel) * 100

  return (
    <div className="gamification-display">
      <div className="level-badge">
        <span className="level-number">{level.level}</span>
        <span className="rank-name">{level.rank}</span>
      </div>

      <div className="xp-bar">
        <div className="xp-fill" style={{ width: `${progressPercent}%` }} />
        <span className="xp-text">
          {level.currentXP} / {level.xpToNextLevel} XP
        </span>
      </div>

      <div className="stats">
        <div className="stat">
          <span className="stat-value">{stats.totalWordsTranscribed.toLocaleString()}</span>
          <span className="stat-label">Words</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.totalSessions}</span>
          <span className="stat-label">Sessions</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.currentStreak} 🔥</span>
          <span className="stat-label">Day Streak</span>
        </div>
      </div>
    </div>
  )
}
```

---

### Example 12: Record Session and Award XP

```typescript
async function completeRecordingSession(transcript: string, durationMs: number) {
  const wordCount = transcript.split(/\s+/).length

  // Record the session (awards XP automatically)
  await window.electronAPI.recordGamificationSession({
    words: wordCount,
    durationMs: durationMs,
  })

  console.log(`✅ +${wordCount * 1}XP (words) + ${Math.floor(durationMs / 60000) * 10}XP (minutes)`)
}
```

---

### Example 13: Achievement System

```typescript
function AchievementPopup() {
  const [newAchievement, setNewAchievement] = useState<string | null>(null)

  useEffect(() => {
    window.electronAPI.onAchievementUnlocked((achievementId) => {
      setNewAchievement(achievementId)

      // Auto-hide after 5 seconds
      setTimeout(() => {
        setNewAchievement(null)
      }, 5000)
    })
  }, [])

  if (!newAchievement) return null

  const achievement = getAchievementById(newAchievement)

  return (
    <div className="achievement-popup">
      <div className="achievement-icon">{achievement.icon}</div>
      <div className="achievement-content">
        <h3>Achievement Unlocked!</h3>
        <h4>{achievement.name}</h4>
        <p>{achievement.description}</p>
        <span className="xp-reward">+{achievement.xpReward} XP</span>
      </div>
    </div>
  )
}
```

---

## Voice Commands

### Example 14: Custom Voice Command Triggers

Add custom phrases for voice commands.

```typescript
async function setupCustomVoiceCommands() {
  // Add custom "send" triggers
  await window.electronAPI.addVoiceCommandTrigger({
    id: crypto.randomUUID(),
    phrase: 'execute it',
    command: 'send',
    enabled: true,
    isCustom: true,
  })

  await window.electronAPI.addVoiceCommandTrigger({
    id: crypto.randomUUID(),
    phrase: 'run that',
    command: 'send',
    enabled: true,
    isCustom: true,
  })

  // Add custom "clear" trigger
  await window.electronAPI.addVoiceCommandTrigger({
    id: crypto.randomUUID(),
    phrase: 'delete everything',
    command: 'clear',
    enabled: true,
    isCustom: true,
  })

  console.log('✅ Custom voice commands configured')
}
```

---

### Example 15: Voice Command Handler

```typescript
function VoiceCommandHandler() {
  const { transcriptSegments } = useElevenLabsScribe({
    selectedMicrophoneId: 'default',
    voiceCommandsEnabled: true,
    onVoiceCommand: async (command) => {
      const finalText = transcriptSegments
        .filter(seg => seg.isFinal)
        .map(seg => seg.text)
        .join(' ')

      switch (command) {
        case 'send':
          console.log('🚀 Sending command...')
          await window.electronAPI.pasteToLastActiveTerminal(finalText)
          break

        case 'clear':
          console.log('🗑️ Clearing transcript...')
          clearTranscript()
          break

        case 'cancel':
          console.log('❌ Cancelling...')
          clearTranscript()
          stopRecording()
          break
      }
    },
    onRecordingStopped: (text, duration) => {
      console.log(`Recording stopped: ${text}`)
    }
  })

  return <div>Recording with voice commands enabled...</div>
}
```

---

## Custom Hotkeys

### Example 16: Update Global Hotkeys

```typescript
async function updateHotkeys() {
  // Update record hotkey
  const recordResult = await window.electronAPI.updateHotkey('record', 'CommandOrControl+Shift+R')

  if (recordResult.success) {
    console.log('✅ Record hotkey updated')
  } else {
    console.error('❌ Failed:', recordResult.error)
  }

  // Update paste hotkey
  const pasteResult = await window.electronAPI.updateHotkey('paste', 'CommandOrControl+Shift+V')

  if (pasteResult.success) {
    console.log('✅ Paste hotkey updated')
  }
}
```

---

## Advanced Integration

### Example 17: Complete Workflow with All Features

A complete example showing all features working together.

```typescript
function CompleteWorkflow() {
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const {
    isRecording,
    transcriptSegments,
    startRecording,
    stopRecording,
    clearTranscript
  } = useElevenLabsScribe({
    selectedMicrophoneId: 'default',
    voiceCommandsEnabled: true,
    onVoiceCommand: async (command) => {
      if (command === 'send') {
        await processAndPaste()
      } else if (command === 'clear') {
        clearTranscript()
      }
    },
    onRecordingStopped: async (text, duration) => {
      await processTranscript(text, duration)
    }
  })

  async function processTranscript(originalText: string, duration: number) {
    setIsProcessing(true)

    try {
      // Step 1: Apply word replacements
      const replaced = await window.electronAPI.applyReplacements(originalText)

      // Step 2: AI formatting (if enabled)
      const formatted = await window.electronAPI.formatPrompt(replaced)

      // Step 3: Generate title
      const title = await window.electronAPI.generateTitle(formatted.formatted)

      // Step 4: Save to history
      await window.electronAPI.saveTranscription({
        id: crypto.randomUUID(),
        text: formatted.formatted,
        originalText: originalText,
        wasFormatted: formatted.success,
        title: title.title,
        timestamp: Date.now(),
        wordCount: formatted.formatted.split(/\s+/).length,
        duration: duration
      })

      // Step 5: Record gamification
      await window.electronAPI.recordGamificationSession({
        words: formatted.formatted.split(/\s+/).length,
        durationMs: duration * 1000
      })

      // Step 6: Check daily login
      await window.electronAPI.checkGamificationDailyLogin()

      setTranscript(formatted.formatted)

      console.log('✅ Transcript processed successfully')
    } catch (error) {
      console.error('❌ Processing failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  async function processAndPaste() {
    if (!transcript) return

    setIsProcessing(true)

    try {
      const result = await window.electronAPI.pasteToLastActiveTerminal(transcript)

      if (result.success) {
        console.log(`✅ Pasted to ${result.targetApp}`)
      } else {
        console.error('❌ Paste failed')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="complete-workflow">
      <div className="controls">
        <button onClick={startRecording} disabled={isRecording || isProcessing}>
          {isRecording ? 'Recording...' : 'Start Recording'}
        </button>
        <button onClick={stopRecording} disabled={!isRecording}>
          Stop
        </button>
        <button onClick={clearTranscript}>Clear</button>
      </div>

      <div className="transcript-display">
        {transcriptSegments.map(seg => (
          <span key={seg.id} className={seg.isFinal ? 'final' : 'partial'}>
            {seg.text}
          </span>
        ))}
      </div>

      {transcript && (
        <div className="processed-output">
          <h4>Processed Transcript:</h4>
          <pre>{transcript}</pre>
          <button onClick={processAndPaste} disabled={isProcessing}>
            Paste to Terminal
          </button>
        </div>
      )}

      {isProcessing && <div className="spinner">Processing...</div>}
    </div>
  )
}
```

---

## Best Practices

### Error Handling

Always handle errors from IPC calls:

```typescript
try {
  const result = await window.electronAPI.formatPrompt(text)
  if (!result.success) {
    console.error('Formatting failed:', result.error)
    // Fall back to original text
    return text
  }
  return result.formatted
} catch (error) {
  console.error('IPC error:', error)
  return text
}
```

### Memory Management

Remove event listeners when components unmount:

```typescript
useEffect(() => {
  const handleHistoryChanged = () => {
    loadHistory()
  }

  window.electronAPI.onHistoryChanged(handleHistoryChanged)

  return () => {
    window.electronAPI.removeAllListeners('history-changed')
  }
}, [])
```

### Performance Optimization

Debounce frequent updates:

```typescript
import { debounce } from 'lodash'

const sendAudioLevelDebounced = debounce((level: number) => {
  window.electronAPI.sendAudioLevel(level)
}, 100) // Update overlay max 10 times per second
```

---

## See Also

- [API.md](./API.md) - Complete API reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Development guide
