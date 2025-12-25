# Phase 5 Plan: Advanced Refactoring & Polish

**Status**: 📋 **PLANNING**
**Created**: 2025-12-20
**Estimated Duration**: 3-5 days
**Priority**: Medium

---

## Executive Summary

Phase 5 addresses deferred architectural improvements from Phase 2 that were postponed to focus on security hardening and documentation. This phase will complete the refactoring vision by modularizing the store, creating a service layer, and adding final polish for production readiness.

### Why Phase 5?

**Deferred Items from Phase 2:**

- ✅ Phases 1-4 Complete: Foundation, Refactoring, Hardening, Documentation
- ⏸️ **Store Modularization** - `store.ts` still 644 lines (target: <200 lines per module)
- ⏸️ **Service Layer** - Business logic still in IPC handlers
- ⏸️ **Test Coverage** - Only 67.74% on tested files, many files untested
- ⏸️ **Design System** - No centralized design tokens

### Goals

1. **Modularize Store** - Split monolithic store.ts into feature modules
2. **Create Service Layer** - Extract business logic from IPC handlers
3. **Increase Coverage** - Add tests for untested modules
4. **Design Tokens** - Create centralized design system
5. **Performance Optimization** - Improve app startup and runtime performance

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Phase 5 Objectives](#phase-5-objectives)
3. [Task Breakdown](#task-breakdown)
4. [Implementation Plan](#implementation-plan)
5. [Success Criteria](#success-criteria)
6. [Risk Assessment](#risk-assessment)

---

## Current State Analysis

### Store Module (electron/main/store.ts)

**Current Size**: 644 lines
**Problems**:

- All store logic in single file
- Mixes concerns: settings, history, gamification, replacements, voice commands
- Hard to test individual features
- Potential for merge conflicts in team environment

**Breakdown**:

```
Lines 1-60:    Type definitions (60 lines)
Lines 61-150:  Settings management (90 lines)
Lines 151-250: History management (100 lines)
Lines 251-450: Gamification (200 lines)
Lines 451-550: Word replacements (100 lines)
Lines 551-644: Voice commands (94 lines)
```

### IPC Handlers (electron/main/ipc-handlers.ts)

**Current Size**: ~400 lines
**Problems**:

- Business logic mixed with IPC routing
- Difficult to test logic independently
- Violates single responsibility principle
- Formatting logic embedded in handlers

**Needs**:

- Separate service classes for each domain
- IPC handlers should only route and validate
- Business logic should be testable without IPC

### Test Coverage

**Current State**:

- 30 tests written
- 67.74% coverage on tested files
- Many files completely untested

**Untested Modules**:

- `electron/main/store.ts` (0% coverage)
- `electron/main/ipc-handlers.ts` (0% coverage)
- `electron/main/prompt-formatter.ts` (0% coverage)
- `electron/main/terminal-paste.ts` (0% coverage)
- `src/hooks/useGamification.ts` (0% coverage)
- `src/hooks/useAudioAnalyzer.ts` (0% coverage)

### Design System

**Current State**:

- CSS scattered across component files
- Magic numbers in styles
- Inconsistent spacing, colors, typography
- No centralized design tokens

---

## Phase 5 Objectives

### Objective 1: Modularize Store (Day 1-2)

**Goal**: Split `store.ts` (644 lines) into focused modules

**Target Structure**:

```
electron/main/store/
├── index.ts              # Re-exports all modules (50 lines)
├── settings.ts           # Settings management (120 lines)
├── history.ts            # Transcription history (150 lines)
├── gamification/
│   ├── index.ts          # Gamification orchestration (80 lines)
│   ├── stats.ts          # Stats tracking (70 lines)
│   ├── levels.ts         # Level/XP calculations (60 lines)
│   └── achievements.ts   # Achievement logic (90 lines)
├── replacements.ts       # Word replacements (110 lines)
└── voice-commands.ts     # Voice command triggers (100 lines)
```

**Benefits**:

- Each module <150 lines (manageable)
- Easy to test in isolation
- Clear separation of concerns
- Reduced merge conflict risk

---

### Objective 2: Create Service Layer (Day 2-3)

**Goal**: Extract business logic from IPC handlers into service classes

**Target Structure**:

```
electron/main/services/
├── index.ts                    # Service registry
├── FormattingService.ts        # Prompt formatting logic (200 lines)
├── TerminalService.ts          # Terminal automation (150 lines)
├── GamificationService.ts      # Gamification orchestration (180 lines)
├── HistoryService.ts           # History management (120 lines)
└── __tests__/                  # Service tests
    ├── FormattingService.test.ts
    ├── TerminalService.test.ts
    └── ...
```

**Service Responsibilities**:

**FormattingService**:

- Claude API integration
- Prompt formatting
- Title generation
- Text reformatting
- Caching formatted results

**TerminalService**:

- Detect running terminals
- Execute paste operations
- Handle permissions
- Fallback to clipboard

**GamificationService**:

- Calculate XP rewards
- Update stats
- Check achievements
- Manage streaks
- Level progression

**HistoryService**:

- Save transcriptions
- Search/filter history
- Apply history limits
- Generate summaries

**Benefits**:

- Testable without Electron
- Reusable across IPC handlers
- Clear API contracts
- Easier to mock for testing

---

### Objective 3: Increase Test Coverage (Day 3-4)

**Goal**: Achieve 70%+ overall test coverage

**Priority Test Targets**:

1. **Store Modules** (High Priority)
   - `store/settings.test.ts`
   - `store/history.test.ts`
   - `store/gamification/levels.test.ts`
   - `store/replacements.test.ts`

2. **Service Layer** (High Priority)
   - `services/FormattingService.test.ts`
   - `services/TerminalService.test.ts`
   - `services/GamificationService.test.ts`

3. **Hooks** (Medium Priority)
   - `hooks/useGamification.test.ts`
   - `hooks/useAudioAnalyzer.test.ts`

4. **Utilities** (Low Priority)
   - Any utility functions not yet tested

**Target Metrics**:

```
Overall Coverage: 70%+
Statement Coverage: 75%+
Branch Coverage: 65%+
Function Coverage: 80%+
```

---

### Objective 4: Design System (Day 4-5)

**Goal**: Create centralized design tokens and theme system

**Implementation**:

```
src/styles/
├── design-system/
│   ├── tokens.ts          # Design tokens (colors, spacing, typography)
│   ├── theme.ts           # Theme configuration
│   └── utils.ts           # Style utilities
└── global.css             # Global styles with CSS variables
```

**Design Tokens** (`tokens.ts`):

```typescript
export const designTokens = {
  colors: {
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      // ... full scale
      900: '#0d47a1',
    },
    cyber: {
      blue: '#00ffff',
      purple: '#ff00ff',
      green: '#00ff00',
    },
    semantic: {
      success: '#4caf50',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196f3',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, sans-serif',
      mono: 'Fira Code, monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    cyber: '0 0 10px rgba(0, 255, 255, 0.5)',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  transitions: {
    fast: '150ms',
    base: '250ms',
    slow: '350ms',
  },
} as const
```

**Benefits**:

- Consistent visual design
- Easy theme switching
- Type-safe design tokens
- Centralized style management
- Better maintainability

---

### Objective 5: Performance Optimization (Day 5)

**Goal**: Optimize app startup and runtime performance

**Optimizations**:

1. **Lazy Loading**
   - Code-split heavy components
   - Lazy load gamification system
   - Defer non-critical initialization

2. **Memoization**
   - Memo expensive calculations (level calculation, XP progression)
   - useCallback for stable references
   - React.memo for pure components

3. **Virtualization**
   - Virtual scrolling for history list (react-window)
   - Reduce DOM nodes for large lists

4. **Bundle Optimization**
   - Analyze bundle size
   - Remove unused dependencies
   - Optimize imports (tree-shaking)

5. **IPC Optimization**
   - Batch frequent IPC calls
   - Debounce audio level updates
   - Use MessagePorts for streaming data

**Target Metrics**:

```
App Startup: <500ms
Time to Interactive: <800ms
Memory Usage (idle): <100MB
Memory Usage (recording): <150MB
CPU Usage (idle): <1%
CPU Usage (recording): <8%
```

---

## Task Breakdown

### Day 1: Store Modularization Part 1

#### Task 1.1: Create Store Directory Structure

```bash
mkdir -p electron/main/store/gamification
touch electron/main/store/index.ts
touch electron/main/store/settings.ts
touch electron/main/store/history.ts
touch electron/main/store/replacements.ts
touch electron/main/store/voice-commands.ts
touch electron/main/store/gamification/index.ts
touch electron/main/store/gamification/stats.ts
touch electron/main/store/gamification/levels.ts
touch electron/main/store/gamification/achievements.ts
```

#### Task 1.2: Extract Settings Module

- Move settings logic from store.ts to store/settings.ts
- Export: `getSettings()`, `setSettings()`, `getSetting()`, `setSetting()`
- Write tests: `store/settings.test.ts`

#### Task 1.3: Extract History Module

- Move history logic from store.ts to store/history.ts
- Export: `getHistory()`, `saveTranscription()`, `deleteTranscription()`, `clearHistory()`
- Write tests: `store/history.test.ts`

---

### Day 2: Store Modularization Part 2 & Service Layer Start

#### Task 2.1: Extract Replacements Module

- Move word replacement logic to store/replacements.ts
- Export: `getReplacements()`, `addReplacement()`, `updateReplacement()`, `deleteReplacement()`, `applyReplacements()`
- Write tests

#### Task 2.2: Extract Voice Commands Module

- Move voice command logic to store/voice-commands.ts
- Export: `getVoiceCommandTriggers()`, `addVoiceCommandTrigger()`, etc.
- Write tests

#### Task 2.3: Extract Gamification Modules

- Create gamification/stats.ts (stats tracking)
- Create gamification/levels.ts (XP/level calculations)
- Create gamification/achievements.ts (achievement logic)
- Create gamification/index.ts (orchestration)
- Write tests for each module

#### Task 2.4: Update Imports

- Update all imports in ipc-handlers.ts
- Update any other files importing from store.ts
- Verify all tests still pass

---

### Day 3: Service Layer Creation

#### Task 3.1: Create FormattingService

- Extract formatting logic from prompt-formatter.ts
- Implement caching
- Add error handling
- Write comprehensive tests

#### Task 3.2: Create TerminalService

- Extract terminal logic from terminal-paste.ts
- Handle all terminal types
- Implement fallback strategies
- Write tests with mocks

#### Task 3.3: Create GamificationService

- Orchestrate gamification modules
- High-level API for XP, levels, achievements
- Business rules enforcement
- Write tests

#### Task 3.4: Update IPC Handlers

- Refactor handlers to use services
- Handlers should only: validate, route, respond
- All business logic in services
- Verify no regressions

---

### Day 4: Test Coverage & Design System

#### Task 4.1: Write Missing Tests

- Test all store modules
- Test all services
- Test remaining hooks
- Achieve 70%+ coverage

#### Task 4.2: Create Design System

- Create design-system/tokens.ts
- Create design-system/theme.ts
- Export CSS variables
- Document usage

#### Task 4.3: Apply Design Tokens

- Update 2-3 components to use tokens
- Create examples in docs
- Add to EXAMPLES.md

---

### Day 5: Performance & Polish

#### Task 5.1: Performance Audit

- Run Lighthouse audit
- Measure startup time
- Profile memory usage
- Identify bottlenecks

#### Task 5.2: Implement Optimizations

- Add lazy loading
- Add memoization where needed
- Optimize bundle
- Batch IPC calls

#### Task 5.3: Final Verification

- Run all tests
- Check test coverage
- Verify app performance
- Test cross-platform

---

## Implementation Plan

### Prerequisites

- [ ] All Phase 1-4 changes committed
- [ ] Branch: `architecture-review` up to date
- [ ] All tests passing
- [ ] No uncommitted changes

### Execution Strategy

1. **Incremental Refactoring**
   - Refactor one module at a time
   - Test after each change
   - Commit working code frequently

2. **Backward Compatibility**
   - Maintain existing APIs during migration
   - Use deprecation warnings if needed
   - Update documentation

3. **Testing First**
   - Write tests for new modules before refactoring
   - Verify tests pass after refactoring
   - Maintain >70% coverage throughout

4. **Code Review Checkpoints**
   - Review after each major module
   - Verify architectural consistency
   - Check performance impact

---

## Success Criteria

### Code Quality

- [ ] No files >400 lines
- [ ] All modules have single responsibility
- [ ] 70%+ test coverage overall
- [ ] All tests passing
- [ ] No ESLint errors

### Architecture

- [ ] Store split into 7 focused modules
- [ ] Service layer with 4 core services
- [ ] Clear separation of concerns
- [ ] Testable business logic
- [ ] Design system implemented

### Performance

- [ ] App startup <500ms
- [ ] Memory usage <100MB idle
- [ ] No memory leaks
- [ ] Smooth UI (60fps)
- [ ] Fast IPC communication

### Documentation

- [ ] Service APIs documented
- [ ] Design system documented
- [ ] Migration guide created
- [ ] ARCHITECTURE.md updated
- [ ] Examples updated

---

## Risk Assessment

### Medium Risks

**Risk**: Breaking existing functionality during refactoring
**Mitigation**:

- Write tests before refactoring
- Incremental changes
- Frequent manual testing

**Risk**: Performance regression from added abstraction
**Mitigation**:

- Profile before and after
- Benchmark critical paths
- Optimize hot paths

### Low Risks

**Risk**: Incomplete migration of logic
**Mitigation**:

- Checklist for each module
- Code review
- Integration tests

---

## Phase 5 Deliverables

1. **Store Modules** (7 files, ~700 lines total)
   - settings.ts
   - history.ts
   - replacements.ts
   - voice-commands.ts
   - gamification/ (4 files)

2. **Service Layer** (4 services, ~650 lines)
   - FormattingService.ts
   - TerminalService.ts
   - GamificationService.ts
   - HistoryService.ts

3. **Tests** (15+ new test files)
   - Store module tests (7 files)
   - Service tests (4 files)
   - Hook tests (2-3 files)
   - Utility tests (1-2 files)

4. **Design System** (3 files)
   - tokens.ts
   - theme.ts
   - documentation

5. **Documentation**
   - Migration guide
   - Service API docs
   - Design system guide
   - Updated ARCHITECTURE.md
   - Phase 5 completion report

---

## Optional Enhancements (If Time Permits)

1. **Storybook Integration** - Component showcase
2. **E2E Test Suite** - Critical user flows
3. **CI Performance Tests** - Track metrics over time
4. **Bundle Analysis** - Visualize dependencies
5. **Accessibility Audit** - WCAG compliance check

---

## Next Steps

1. **User Approval** - Review and approve Phase 5 plan
2. **Environment Setup** - Ensure dev environment ready
3. **Begin Day 1** - Start store modularization
4. **Daily Check-ins** - Review progress and adjust
5. **Phase Completion** - Comprehensive testing and docs

---

**Plan Version**: 1.0.0
**Created By**: Claude
**Review Status**: Awaiting approval
**Estimated Effort**: 3-5 days
**Risk Level**: Low-Medium
