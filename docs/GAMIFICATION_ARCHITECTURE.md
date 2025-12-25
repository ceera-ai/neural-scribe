# Gamification System Architecture

**Version:** 2.0
**Status:** Implementation Guide
**Last Updated:** December 2025

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Achievement  │  │  XP Bar &    │  │   Stats      │         │
│  │   Popups     │  │  Level       │  │   Panel      │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ React State & Effects
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RENDERER PROCESS (React)                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  useGamification Hook                                     │ │
│  │  ├─ State Management (stats, level, achievements)        │ │
│  │  ├─ XP Calculations                                      │ │
│  │  ├─ Achievement Detection Logic                         │ │
│  │  ├─ Streak Calculations                                 │ │
│  │  └─ IPC Communication with Main Process                 │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              │ IPC Calls                        │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  App.tsx - Trigger Points                                │ │
│  │  ├─ handleRecordingStopped() → recordSession()           │ │
│  │  ├─ handleVoiceCommand() → recordSession()              │ │
│  │  ├─ handlePasteToTerminal() → recordSession()           │ │
│  │  └─ Other completion handlers                           │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Electron IPC
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MAIN PROCESS (Electron)                     │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  IPC Handlers (electron/main/ipc-handlers.ts)            │ │
│  │  ├─ get-gamification-data                                │ │
│  │  ├─ save-gamification-data                               │ │
│  │  ├─ record-session (words, duration)                     │ │
│  │  ├─ unlock-achievement (id)                              │ │
│  │  ├─ check-daily-login                                    │ │
│  │  └─ reset-gamification                                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Gamification Store (electron/main/store.ts)             │ │
│  │  ├─ getGamificationData()                                │ │
│  │  ├─ updateStats(stats)                                   │ │
│  │  ├─ addXP(amount)                                        │ │
│  │  ├─ unlockAchievement(id, timestamp)                     │ │
│  │  ├─ updateStreak()                                       │ │
│  │  └─ Auto-save to disk                                    │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ File System
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PERSISTENT STORAGE                           │
│  ~/Library/Application Support/neural-scribe/                  │
│  ├─ gamification.json (main data)                              │
│  ├─ gamification.backup.json (automatic backup)                │
│  └─ gamification-history/ (daily snapshots)                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Recording Session Complete → Gamification Update

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User completes recording session                            │
│    (via Stop button, Voice command, Hotkey, or Paste)          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. App.tsx: handleRecordingStopped()                           │
│    - Saves transcription to history                            │
│    - Applies word replacements                                 │
│    - Calculates word count & duration                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. useGamification: recordSession(words, durationMs)           │
│    ├─ Calculate XP earned                                      │
│    ├─ Update stats (words, time, sessions)                     │
│    ├─ Update streak (if new day)                               │
│    └─ Check for new achievement unlocks                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. IPC → Main Process: save-gamification-data                  │
│    - Sends updated stats object                                │
│    - Sends XP changes                                           │
│    - Sends newly unlocked achievement IDs                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Gamification Store: Save to disk                            │
│    ├─ Write gamification.json                                  │
│    ├─ Create backup (gamification.backup.json)                 │
│    └─ Emit 'data-changed' event for other windows              │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. React UI Updates                                            │
│    ├─ XP Bar animates to new value                             │
│    ├─ Level up notification (if applicable)                    │
│    ├─ Achievement popup(s) appear                              │
│    └─ Stats panel refreshes                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Achievement Unlock Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. checkAchievements() triggered after stats update            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Loop through ALL achievements                               │
│    FOR each achievement:                                        │
│      ├─ Skip if already unlocked                                │
│      ├─ Check requirement against current stats                 │
│      │   • words: totalWordsTranscribed >= value               │
│      │   • time_minutes: totalRecordingTimeMs >= value * 60000 │
│      │   • sessions: totalSessions >= value                    │
│      │   • streak_days: currentStreak >= value                 │
│      │   • level: currentLevel >= value                        │
│      └─ If met → Add to newUnlocks[]                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. If newUnlocks.length > 0:                                   │
│    ├─ Update unlockedIds Set                                    │
│    ├─ Add to recentUnlocks (for popup)                         │
│    ├─ Calculate total XP reward                                │
│    └─ Call addXP(totalXP)                                      │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Store unlocked achievements permanently                     │
│    IMPORTANT: Save with current timestamp ONCE                 │
│    achievements.unlocked[id] = {                               │
│      unlockedAt: Date.now(),  // ← NEVER regenerate this       │
│      xpAwarded: achievement.xpReward                           │
│    }                                                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Show achievement popup                                      │
│    - AchievementPopup component receives recentUnlocks[]       │
│    - Displays each achievement for 4 seconds                   │
│    - Auto-dismisses after showing all                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### File Structure

```
src/
├── hooks/
│   └── useGamification.ts                   # Main gamification logic
├── components/
│   └── gamification/
│       ├── GamificationModal.tsx            # Stats & achievements modal
│       ├── AchievementsModal.tsx            # Full achievement browser
│       ├── AchievementBadge.tsx             # Single badge display
│       ├── AchievementPopup.tsx             # Unlock notification
│       ├── AchievementDetailModal.tsx       # NEW: Detailed view
│       ├── AchievementShareCard.tsx         # NEW: Shareable export
│       ├── StatsPanel.tsx                   # Statistics display
│       └── XPBar.tsx                        # Progress bar
├── types/
│   └── gamification.ts                      # Type definitions
└── utils/
    └── gamification/
        ├── xpCalculator.ts                  # XP formulas
        ├── achievementChecker.ts            # Achievement logic
        ├── streakManager.ts                 # Streak calculations
        └── shareGenerator.ts                # NEW: PNG export

electron/
└── main/
    ├── store.ts                             # MODIFIED: Add gamification
    └── ipc-handlers.ts                      # MODIFIED: Add handlers
```

### Component Hierarchy

```
App.tsx
├── <AchievementPopup>                       # Floating notification
│   ├── achievement.icon                     # Emoji
│   ├── achievement.name                     # Title
│   ├── achievement.description              # Description
│   ├── achievement.xpReward                 # "+100 XP"
│   └── achievement.rarity                   # Color/badge
│
├── <GamificationModal>                      # Main progress view
│   ├── Tabs: Stats | Achievements
│   │
│   ├── Stats Tab:
│   │   ├── <LevelDisplay>
│   │   │   ├── Level number badge
│   │   │   ├── Rank name
│   │   │   └── Current XP
│   │   ├── <XPBar>
│   │   │   ├── Progress fill
│   │   │   └── XP to next level
│   │   └── <StatsGrid>
│   │       ├── Words transcribed
│   │       ├── Recording time
│   │       ├── Total sessions
│   │       └── Current streak
│   │
│   └── Achievements Tab:
│       └── <AchievementBadge>[] × N
│           ├── Icon (emoji or 🔒)
│           ├── Name
│           ├── Progress bar (if locked)
│           └── XP reward
│           └── onClick → <AchievementDetailModal>
│
└── <AchievementDetailModal>                 # NEW: Click on badge
    ├── Large icon
    ├── Name & description
    ├── Progress bar (if locked)
    ├── Requirements list
    ├── Unlock date (if unlocked)
    ├── XP reward & rarity
    └── [Share] button → <AchievementShareCard>
```

---

## State Management

### React State (useGamification.ts)

```typescript
interface GamificationState {
  // Core stats
  stats: UserStats;
  level: LevelSystem;
  unlockedIds: Set<string>;
  recentUnlocks: Achievement[];

  // Derived/computed
  achievements: Achievement[];       // All achievements with progress
  unlockedAchievements: Achievement[]; // Only unlocked
  xpProgress: number;               // 0-1, progress to next level

  // Refs (don't trigger re-renders)
  isInitialized: Ref<boolean>;
}
```

### Electron Store Schema (store.ts)

```typescript
interface GamificationData {
  version: string;  // "2.0" - for future migrations

  stats: {
    totalWordsTranscribed: number;
    totalRecordingTimeMs: number;
    totalSessions: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string;  // "YYYY-MM-DD"
    firstSessionDate: string; // "YYYY-MM-DD"
  };

  level: {
    currentXP: number;
    level: number;
    rank: string;
  };

  achievements: {
    unlocked: {
      [achievementId: string]: {
        unlockedAt: number;  // Timestamp - NEVER regenerate
        xpAwarded: number;   // How much XP this gave
      };
    };
  };

  metadata: {
    lastSaved: number;     // Timestamp of last save
    totalSaves: number;    // Save count (for debugging)
    backupCount: number;   // Number of backups created
  };
}
```

---

## IPC Communication API

### Renderer → Main

```typescript
// Get all gamification data (on app start)
window.electronAPI.getGamificationData(): Promise<GamificationData>

// Record a completed session
window.electronAPI.recordSession(params: {
  words: number;
  durationMs: number;
}): Promise<{
  xpGained: number;
  newAchievements: string[]; // IDs of newly unlocked
  leveledUp: boolean;
  newLevel?: number;
}>

// Check daily login (on app start)
window.electronAPI.checkDailyLogin(): Promise<{
  bonusAwarded: boolean;
  xpGained: number;
  streakUpdated: boolean;
  currentStreak: number;
}>

// Manually unlock achievement (for testing)
window.electronAPI.unlockAchievement(id: string): Promise<boolean>

// Reset all progress (danger zone)
window.electronAPI.resetGamification(): Promise<boolean>

// Save current data (manual backup)
window.electronAPI.saveGamificationData(data: GamificationData): Promise<boolean>
```

### Main → Renderer

```typescript
// Notify all windows when data changes
ipcRenderer.on('gamification-data-changed', (event, data: GamificationData) => {
  // Refresh React state from new data
});

// Notify when achievement unlocked (from another window)
ipcRenderer.on('achievement-unlocked', (event, achievementId: string) => {
  // Show popup for this achievement
});
```

---

## Implementation Details

### 1. Centralized Recording Completion

**File:** `src/App.tsx`

```typescript
// NEW: Single source of truth for recording completion
const handleRecordingComplete = useCallback(async (
  transcript: string,
  duration: number,
  source: 'stop_button' | 'voice_send' | 'voice_clear' | 'voice_cancel' | 'hotkey' | 'paste' | 'error'
) => {
  console.log(`[Gamification] Recording complete via: ${source}`);

  // Apply word replacements
  let processedTranscript = transcript;
  if (window.electronAPI) {
    processedTranscript = await window.electronAPI.applyReplacements(transcript);
  }

  // Calculate metrics
  const wordCount = processedTranscript.trim().split(/\s+/).length;

  // CRITICAL: Always record session BEFORE any other action
  // Exception: "cancel" command means user doesn't want to save
  if (source !== 'voice_cancel' && processedTranscript.trim() && wordCount > 0) {
    try {
      await recordSession(wordCount, duration * 1000);
      console.log(`[Gamification] Recorded: ${wordCount} words, ${duration}s`);
    } catch (err) {
      console.error('[Gamification] Failed to record session:', err);
    }
  }

  // Then handle source-specific actions
  switch (source) {
    case 'stop_button':
      // Just save to history
      await saveTranscription(processedTranscript, duration);
      break;

    case 'voice_send':
    case 'paste':
      // Format and paste to terminal
      await formatAndPaste(processedTranscript, true, duration);
      break;

    case 'voice_clear':
      // Clear transcript without saving
      clearTranscript();
      break;

    case 'voice_cancel':
      // Do nothing - user explicitly cancelled
      clearTranscript();
      break;

    case 'hotkey':
    case 'error':
      // Save to history
      await saveTranscription(processedTranscript, duration);
      break;
  }

  return processedTranscript;
}, [recordSession, saveTranscription, formatAndPaste, clearTranscript]);
```

**Hook into all stop scenarios:**

```typescript
// 1. Stop button
const handleStopRecording = () => {
  const transcript = getFullTranscript();
  const duration = recordingTime;
  stopRecording();
  handleRecordingComplete(transcript, duration, 'stop_button');
};

// 2. Voice command
const handleVoiceCommand = useCallback(async (
  command: 'send' | 'clear' | 'cancel',
  transcript: string
) => {
  const duration = recordingTime;
  stopRecording();
  handleRecordingComplete(
    transcript,
    duration,
    command === 'send' ? 'voice_send' :
    command === 'clear' ? 'voice_clear' : 'voice_cancel'
  );
}, [handleRecordingComplete, recordingTime]);

// 3. Paste to terminal button (overlay)
window.handleOverlayPaste = async () => {
  const transcript = getFullTranscript();
  const duration = recordingTime;
  stopRecording();
  handleRecordingComplete(transcript, duration, 'paste');
};

// 4. Hotkey toggle (while recording)
window.electronAPI.onToggleRecording(async () => {
  if (isRecording) {
    const transcript = getFullTranscript();
    const duration = recordingTime;
    stopRecording();
    handleRecordingComplete(transcript, duration, 'hotkey');
  } else {
    startRecording();
  }
});
```

### 2. Electron Store Implementation

**File:** `electron/main/store.ts`

```typescript
import Store from 'electron-store';
import { ACHIEVEMENTS } from './gamification-config';

interface GamificationData {
  version: string;
  stats: UserStats;
  level: LevelSystem;
  achievements: {
    unlocked: Record<string, {
      unlockedAt: number;
      xpAwarded: number;
    }>;
  };
  metadata: {
    lastSaved: number;
    totalSaves: number;
    backupCount: number;
  };
}

const store = new Store<{
  gamification: GamificationData;
}>();

const DEFAULT_GAMIFICATION_DATA: GamificationData = {
  version: '2.0',
  stats: {
    totalWordsTranscribed: 0,
    totalRecordingTimeMs: 0,
    totalSessions: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    firstSessionDate: new Date().toISOString().split('T')[0],
  },
  level: {
    currentXP: 0,
    level: 1,
    rank: 'Initiate',
  },
  achievements: {
    unlocked: {},
  },
  metadata: {
    lastSaved: Date.now(),
    totalSaves: 0,
    backupCount: 0,
  },
};

export function getGamificationData(): GamificationData {
  return store.get('gamification', DEFAULT_GAMIFICATION_DATA);
}

export function saveGamificationData(data: Partial<GamificationData>): void {
  const current = getGamificationData();
  const updated = {
    ...current,
    ...data,
    metadata: {
      ...current.metadata,
      lastSaved: Date.now(),
      totalSaves: current.metadata.totalSaves + 1,
    },
  };

  store.set('gamification', updated);

  // Create backup every 10 saves
  if (updated.metadata.totalSaves % 10 === 0) {
    createBackup(updated);
  }

  // Notify all windows
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('gamification-data-changed', updated);
  });
}

function createBackup(data: GamificationData): void {
  // Implementation: Save to backup file
  // Could also implement daily snapshots
}

export function recordSession(words: number, durationMs: number): {
  xpGained: number;
  newAchievements: string[];
  leveledUp: boolean;
  newLevel?: number;
} {
  const data = getGamificationData();

  // Update stats
  const updatedStats = {
    ...data.stats,
    totalWordsTranscribed: data.stats.totalWordsTranscribed + words,
    totalRecordingTimeMs: data.stats.totalRecordingTimeMs + durationMs,
    totalSessions: data.stats.totalSessions + 1,
  };

  // Update streak
  const today = new Date().toISOString().split('T')[0];
  if (data.stats.lastActiveDate !== today) {
    const lastDate = new Date(data.stats.lastActiveDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      updatedStats.currentStreak += 1;
      updatedStats.longestStreak = Math.max(
        updatedStats.currentStreak,
        updatedStats.longestStreak
      );
    } else if (diffDays > 1) {
      updatedStats.currentStreak = 1;
    }

    updatedStats.lastActiveDate = today;
  }

  // Calculate XP
  const wordXP = words * 1;
  const timeXP = Math.floor(durationMs / 60000) * 10;
  const sessionXP = 25;
  const totalXP = wordXP + timeXP + sessionXP;

  // Update level
  const oldXP = data.level.currentXP;
  const newXP = oldXP + totalXP;
  const newLevel = calculateLevelFromXP(newXP);
  const leveledUp = newLevel > data.level.level;

  const updatedLevel = {
    currentXP: newXP,
    level: newLevel,
    rank: getRankForLevel(newLevel).name,
  };

  // Check achievements
  const newAchievements: string[] = [];
  for (const achievement of ACHIEVEMENTS) {
    if (data.achievements.unlocked[achievement.id]) continue;

    if (shouldUnlockAchievement(achievement, updatedStats, newLevel)) {
      data.achievements.unlocked[achievement.id] = {
        unlockedAt: Date.now(),
        xpAwarded: achievement.xpReward,
      };
      newAchievements.push(achievement.id);
      updatedLevel.currentXP += achievement.xpReward;
    }
  }

  // Save everything
  saveGamificationData({
    stats: updatedStats,
    level: updatedLevel,
    achievements: data.achievements,
  });

  return {
    xpGained: totalXP,
    newAchievements,
    leveledUp,
    newLevel: leveledUp ? newLevel : undefined,
  };
}
```

### 3. Achievement Detail Modal

**File:** `src/components/gamification/AchievementDetailModal.tsx`

```typescript
import { Achievement } from '../../types/gamification';
import { getRarityColor } from '../../types/gamification';
import './AchievementDetailModal.css';

interface AchievementDetailModalProps {
  achievement: Achievement;
  isUnlocked: boolean;
  onClose: () => void;
  onShare?: () => void;
}

export function AchievementDetailModal({
  achievement,
  isUnlocked,
  onClose,
  onShare,
}: AchievementDetailModalProps) {
  const rarityColor = getRarityColor(achievement.rarity);

  // Format requirement text
  const getRequirementText = () => {
    const { type, value } = achievement.requirement;
    switch (type) {
      case 'words':
        return `Transcribe ${value.toLocaleString()} words`;
      case 'time_minutes':
        return `Record for ${value} ${value === 1 ? 'minute' : 'minutes'} total`;
      case 'sessions':
        return `Complete ${value} ${value === 1 ? 'session' : 'sessions'}`;
      case 'streak_days':
        return `Maintain a ${value}-day streak`;
      case 'level':
        return `Reach level ${value}`;
      default:
        return 'Unknown requirement';
    }
  };

  return (
    <div className="achievement-detail-overlay" onClick={onClose}>
      <div
        className="achievement-detail-card"
        onClick={e => e.stopPropagation()}
        style={{ '--rarity-color': rarityColor } as React.CSSProperties}
      >
        <div className="achievement-detail-icon">
          {isUnlocked ? achievement.icon : '🔒'}
        </div>

        <h2 className="achievement-detail-name">
          {isUnlocked ? achievement.name : '??? ????????'}
        </h2>

        <p className="achievement-detail-description">
          {isUnlocked ? achievement.description : 'Locked achievement'}
        </p>

        {achievement.progress !== undefined && achievement.progress < 1 && (
          <div className="achievement-detail-progress">
            <div className="achievement-detail-progress-bar">
              <div
                className="achievement-detail-progress-fill"
                style={{ width: `${achievement.progress * 100}%` }}
              />
            </div>
            <span className="achievement-detail-progress-text">
              {Math.round(achievement.progress * 100)}% Complete
            </span>
          </div>
        )}

        <div className="achievement-detail-requirements">
          <h3>Requirements</h3>
          <ul>
            <li>{getRequirementText()}</li>
          </ul>
        </div>

        {isUnlocked && achievement.unlockedAt && (
          <div className="achievement-detail-unlock-info">
            <p>Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}</p>
          </div>
        )}

        <div className="achievement-detail-meta">
          <span className="achievement-detail-xp">+{achievement.xpReward} XP</span>
          <span className={`achievement-detail-rarity achievement-detail-rarity--${achievement.rarity}`}>
            {achievement.rarity}
          </span>
        </div>

        <div className="achievement-detail-actions">
          {isUnlocked && onShare && (
            <button className="btn btn-primary" onClick={onShare}>
              📤 Share Achievement
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Migration Strategy

### Automatic Migration from localStorage

**File:** `src/hooks/useGamification.ts`

```typescript
useEffect(() => {
  async function migrateIfNeeded() {
    // Check if Electron store has data
    const electronData = await window.electronAPI.getGamificationData();

    if (electronData.stats.totalSessions > 0) {
      // Already migrated or has data
      setStats(electronData.stats);
      setLevel(electronData.level);
      setUnlockedIds(new Set(Object.keys(electronData.achievements.unlocked)));
      return;
    }

    // Check localStorage for old data
    const localData = localStorage.getItem('neural_scribe_gamification');
    if (localData) {
      const parsed = JSON.parse(localData);

      // Migrate to Electron store
      await window.electronAPI.saveGamificationData({
        stats: parsed.stats,
        level: parsed.level,
        achievements: {
          unlocked: Object.fromEntries(
            parsed.unlockedAchievementIds.map((id: string) => [
              id,
              {
                unlockedAt: Date.now(),
                xpAwarded: ACHIEVEMENTS.find(a => a.id === id)?.xpReward || 0,
              },
            ])
          ),
        },
      });

      // Clear localStorage
      localStorage.removeItem('neural_scribe_gamification');

      console.log('[Migration] Successfully migrated gamification data');
    }
  }

  migrateIfNeeded();
}, []);
```

---

## Testing Plan

### Unit Tests

```typescript
// src/utils/gamification/xpCalculator.test.ts
describe('XP Calculator', () => {
  it('calculates correct XP for session', () => {
    const result = calculateSessionXP(100, 300000); // 100 words, 5 min
    expect(result).toBe(100 + 50 + 25); // word + time + session
  });
});

// src/utils/gamification/achievementChecker.test.ts
describe('Achievement Checker', () => {
  it('unlocks achievement when threshold met', () => {
    const stats = { totalWordsTranscribed: 1000 };
    const achievement = ACHIEVEMENTS.find(a => a.id === 'wordsmith')!;
    expect(shouldUnlock(achievement, stats)).toBe(true);
  });
});
```

### Integration Tests

1. Complete recording → Stop → Verify XP gained
2. Complete recording → Voice command → Verify XP gained
3. Unlock achievement → Verify saved to store
4. Restart app → Verify data persists

---

## Performance Considerations

### Optimization Strategies

1. **Debounced Saves**
   - Don't save to disk on every XP change
   - Batch updates every 5 seconds

2. **Lazy Achievement Checking**
   - Only check relevant achievements (filter by category first)
   - Use early returns for already unlocked

3. **Memoization**
   - Cache XP-to-level calculations
   - Memoize achievement progress calculations

4. **Background Operations**
   - Generate backup files in background thread
   - Don't block UI during save operations

---

**Status:** Ready for implementation
**Next Steps:** Begin Phase 1 (Electron Store Migration)
