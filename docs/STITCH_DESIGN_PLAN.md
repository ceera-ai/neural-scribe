# Google Stitch Design Plan for Neural Scribe

**Created**: December 20, 2025
**App**: Neural Scribe - AI-Powered Voice Transcription
**Design Tool**: Google Stitch
**Aesthetic**: Cyberpunk/Neon Futuristic

---

## Executive Summary

This comprehensive plan guides you through designing the complete Neural Scribe UI using Google Stitch. The app has 6 major screens, multiple components, and a distinctive cyberpunk aesthetic. This plan breaks down the design work into manageable phases with specific, ready-to-use prompts for each screen.

**Total Estimated Time**: 4-6 hours across 3 design sessions
**Recommended Mode**: **Standard Mode** (for Figma export and rapid iteration)
**Monthly Quota Usage**: ~80-100 generations (well within 350 limit)

---

## Table of Contents

1. [Strategic Approach](#strategic-approach)
2. [Design Workflow](#design-workflow)
3. [Color System & Brand Guidelines](#color-system--brand-guidelines)
4. [Phase 1: Main Window](#phase-1-main-window)
5. [Phase 2: Modals & Overlays](#phase-2-modals--overlays)
6. [Phase 3: States & Variations](#phase-3-states--variations)
7. [Stitch Prompts Library](#stitch-prompts-library)
8. [Iteration & Refinement Tips](#iteration--refinement-tips)
9. [Export & Implementation](#export--implementation)

---

## Strategic Approach

### Why This Matters

Neural Scribe is a **complex, multi-screen desktop application** with:
- 6 major screens/views
- 15+ unique components
- 5+ interaction states per screen
- Consistent cyberpunk branding
- Animated/interactive elements

### Key Design Challenges

1. **Complexity**: Too many screens to design in one go
2. **Consistency**: Maintaining cyberpunk aesthetic across all screens
3. **States**: Representing animations and interactions in static designs
4. **Stitch Limitations**: Can't generate >2-3 screens at once

### Recommended Strategy

✅ **DO:**
- Design in phases (one major screen per session)
- Establish visual system first (colors, typography, components)
- Use Standard mode for Figma export capability
- Iterate one change at a time
- Save successful generations as reference images

❌ **DON'T:**
- Try to generate all screens at once
- Mix multiple screens in one prompt
- Skip defining the color palette
- Attempt animated states (Stitch creates static designs)

---

## Design Workflow

### Recommended Order

**Phase 1: Core Screens** (Session 1: 2-3 hours)
1. Main Window (idle state)
2. Main Window (recording state)
3. History Sidebar

**Phase 2: Modals** (Session 2: 1-2 hours)
4. Gamification Modal - Stats Tab
5. Gamification Modal - Achievements Tab
6. Settings Modal

**Phase 3: Supporting Screens** (Session 3: 1-2 hours)
7. Overlay Window
8. Achievement Popup
9. API Key Setup Screen
10. Word Replacements Modal

### Mode Recommendation

**Use Standard Mode** because:
- ✅ You need Figma export (only available in Standard mode)
- ✅ High iteration count expected (~80-100 generations)
- ✅ Faster generation for UI screens
- ✅ 350 generations/month is plenty for this project

**Not Experimental Mode** because:
- ❌ No Figma export in Experimental mode
- ❌ Only 50 generations/month (not enough for iteration)
- ❌ You're using text prompts, not image uploads

### Iteration Strategy

For each screen:
1. **Generate initial design** with complete prompt
2. **Review** for component presence and layout
3. **Iterate colors** one change at a time
4. **Refine typography** if needed
5. **Adjust spacing/layout** with specific requests
6. **Export to Figma** once satisfied
7. **Save screenshot** for reference

---

## Color System & Brand Guidelines

### Core Color Palette

Define this ONCE and use consistently in ALL prompts:

```
Primary Cyan: #00e5ff
Secondary Magenta: #ff00aa
Accent Green: #00ff88
Background Dark: #0a0e1a
Card Background: #1a1f2e
Text Primary: #ffffff
Text Secondary: #a0a8b8
Border: #2a3142
Error: #ff4444
Success: #00ff88
Warning: #ffaa00
```

### Typography System

Use in all prompts:

```
Headings:
- Font: "Orbitron" or "Rajdhani" (cyberpunk fonts)
- Weight: Bold (700)
- Sizes: 32px (h1), 24px (h2), 18px (h3)

Body Text:
- Font: "Inter" or "Roboto"
- Weight: Regular (400)
- Size: 14px
- Line height: 1.6

Monospace:
- Font: "Fira Code" or "JetBrains Mono"
- For code/technical content
- Size: 13px
```

### Visual Effects

Mention in prompts when needed:

```
Glow Effects:
- Cyan glow on primary buttons: 0 0 20px rgba(0, 229, 255, 0.5)
- Magenta glow on accents: 0 0 15px rgba(255, 0, 170, 0.4)

Gradients:
- Primary: linear-gradient(135deg, #00e5ff 0%, #ff00aa 100%)
- Secondary: linear-gradient(90deg, #ff00aa 0%, #00ff88 100%)

Borders:
- Neon borders: 1px solid with matching glow
- Card borders: #2a3142 with subtle inner glow

Background:
- Main: #0a0e1a
- Cards/modals: #1a1f2e with slight transparency
- Scan line overlay (mention for cyberpunk effect)
```

---

## Phase 1: Main Window

### Screen 1: Main Window (Idle State)

**Priority**: Highest (this is the core interface)

**Components Needed**:
- Header bar
- AI Orb (center, prominent)
- Recording controls
- Transcript area
- Paste button
- Footer

**Complete Prompt for Stitch**:

```
Design a desktop app main window for "Neural Scribe" - an AI voice transcription tool with a cyberpunk/futuristic aesthetic.

Platform: Desktop application (1280px width × 800px height)
Style: Cyberpunk, neon futuristic, dark theme with glowing accents

HEADER BAR (60px height, top):
- Left: App title "Neural Scribe" in glitch-style text (neon cyan)
- Center: Status indicator dot (green) + text "Ready" (white)
- Right top area:
  - Microphone dropdown selector (icon + dropdown)
  - Analytics icon button (chart icon)
  - Settings icon button (gear icon)
- Background: #1a1f2e with bottom border (#2a3142)
- Header icons: white with cyan glow on hover

MAIN CONTENT AREA (centered):
- Large AI Orb visualization (300px diameter)
  - Circular gradient orb: cyan (#00e5ff) to magenta (#ff00aa)
  - Glowing border effect (20px cyan glow)
  - Center placement
  - Static state (not pulsing)

RECORDING CONTROLS (below orb):
- Button row (left-aligned):
  - "Start Recording" button: Red record icon + text, primary style
  - "New" button: Secondary style, gray
  - Small text below: "Click orb or press Cmd+Shift+R"
- Button row (right-aligned):
  - "Copy" button: Clipboard icon, disabled state (gray)
  - "Clear" button: X icon, disabled state (gray)
  - "History" button: List icon, secondary style

TRANSCRIPT AREA (below controls):
- Empty state placeholder
- Text: "Your transcript will appear here..."
- Text area height: 200px
- Background: #1a1f2e
- Border: 1px solid #2a3142
- Rounded corners: 8px
- Text color: #a0a8b8 (muted)

PASTE TO TERMINAL SECTION:
- Large button: "Paste to Terminal"
- Button style: Full width, cyan (#00e5ff) background
- Icon: Down arrow
- Height: 48px
- Disabled state (no transcript yet)

FOOTER BAR (50px height, bottom):
- Left side: Keyboard shortcuts
  - "<kbd>Cmd+Shift+R</kbd> Toggle Recording"
  - "<kbd>Cmd+Shift+V</kbd> Copy Last"
  - Styled kbd elements with border
- Right side: Toggle switches
  - "Format" switch (OFF, gray)
  - "Voice Commands" switch (OFF, gray)
  - Small text: "Say 'send it' to paste"

COLORS:
- Primary: #00e5ff (cyan)
- Secondary: #ff00aa (magenta)
- Accent: #00ff88 (green)
- Background: #0a0e1a
- Card backgrounds: #1a1f2e
- Text primary: #ffffff
- Text secondary: #a0a8b8
- Borders: #2a3142

VISUAL EFFECTS:
- Cyan glow on primary buttons: box-shadow 0 0 20px rgba(0, 229, 255, 0.5)
- Gradient orb with shimmer
- Neon borders on cards
- Dark background with subtle scan line pattern suggestion

TYPOGRAPHY:
- App title: Bold, 24px, futuristic font
- Buttons: Medium, 14px
- Body text: Regular, 14px
- Monospace for keyboard shortcuts
```

**Expected Iterations**: 3-5
- Initial generation
- Adjust orb glow intensity
- Refine button spacing
- Perfect footer layout

---

### Screen 2: Main Window (Recording State)

**Priority**: High (primary use case)

**Changes from Idle**:
- Status changes to "Recording 0:45"
- AI Orb is pulsing/active
- Start button becomes Stop button
- Transcript area has active text
- Paste button is enabled

**Prompt for Stitch**:

```
Design the RECORDING STATE of the Neural Scribe desktop app (update to previous idle state).

Make these SPECIFIC changes:

HEADER:
- Status indicator: Change to "Recording 0:45" with animated red dot
- Status text color: cyan (#00e5ff)

AI ORB:
- Same size and position (300px)
- Visual change: Add pulsing/glowing effect
- Outer ring: Animated cyan glow (stronger)
- Gradient: More vibrant cyan-to-magenta
- Suggest waveform ring around orb

RECORDING CONTROLS:
- "Start Recording" button BECOMES "Stop" button
  - Square stop icon (instead of record circle)
  - Text: "Stop"
  - Color: Red (#ff4444) with glow
  - Prominent, active state
- "New" button: Keep same (secondary style)
- Add "Continue" button next to New (if transcript exists)

TRANSCRIPT AREA:
- Active state (no longer empty)
- Sample text: "Create a new docker container with nginx and expose port 8080..."
- Text color: White (#ffffff)
- Editable textarea appearance
- Auto-scroll to bottom indicator

PASTE TO TERMINAL BUTTON:
- ENABLED state
- Background: Bright cyan (#00e5ff)
- Cyan glow effect: 0 0 20px rgba(0, 229, 255, 0.6)
- Active hover state

FOOTER:
- Toggle switches: Both ON (cyan color)
- Format switch: ON, cyan
- Voice Commands switch: ON, cyan
- Voice hint text visible: "Say 'send it' to paste"

Keep all other colors, spacing, and layout the same as idle state.
```

**Expected Iterations**: 2-3
- Adjust recording indicator animation
- Refine stop button prominence
- Perfect transcript text contrast

---

### Screen 3: History Sidebar

**Priority**: Medium

**Prompt for Stitch**:

```
Design a SIDEBAR PANEL for the Neural Scribe transcription history feature. Cyberpunk aesthetic.

Platform: Desktop sidebar (350px width × full height)
Style: Cyberpunk, matches main app

SIDEBAR HEADER:
- Title: "Transcription History" (18px, bold, white)
- Close button: X icon (top right)
- Background: #1a1f2e
- Bottom border: #2a3142

SEARCH BAR (below header):
- Search input with magnifying glass icon
- Placeholder: "Search transcripts..."
- Background: #0a0e1a
- Border: 1px solid #2a3142
- Focused state: Cyan border (#00e5ff)
- Height: 40px

HISTORY LIST (scrollable):
- Stack of entry cards (3-4 visible)

ENTRY CARD (for each transcription):
Layout:
- Card background: #1a1f2e
- Border: 1px solid #2a3142
- Rounded: 8px
- Padding: 16px
- Margin between cards: 12px
- Hover: Cyan border glow

Content per card:
- Title: "Create Docker Container" (16px, bold, white)
- Preview: "docker run nginx..." (14px, gray, truncated)
- Timestamp: "2h ago" (12px, cyan, top right)
- Word count badge: "📊 45 words" (12px, right side)
- Action icons (bottom right):
  - Info icon (ℹ️) - view details
  - Delete icon (×) - remove entry
  - Icons: White, hover cyan

EXAMPLE CARDS (show 3):
1. Title: "Fix React State Bug"
   Preview: "I need help with useState..."
   Time: "1d ago" • Words: 120

2. Title: "Git Commands"
   Preview: "git status and show me..."
   Time: "3h ago" • Words: 25

3. Title: "Install Dependencies"
   Preview: "npm install express..."
   Time: "5h ago" • Words: 15

FOOTER (bottom of sidebar):
- "Clear All History" button
- Style: Text button, red text (#ff4444)
- Full width
- Icon: Trash can

COLORS:
- Background: #0a0e1a
- Card background: #1a1f2e
- Text primary: #ffffff
- Text secondary: #a0a8b8
- Accent: #00e5ff (cyan)
- Borders: #2a3142
- Hover: Cyan glow

VISUAL EFFECTS:
- Subtle card shadows
- Hover state: Cyan border glow
- Smooth transitions
```

**Expected Iterations**: 2-4
- Adjust card density/spacing
- Refine hover effects
- Perfect scrollable list appearance

---

## Phase 2: Modals & Overlays

### Screen 4: Gamification Modal - Stats Tab

**Priority**: Medium

**Prompt for Stitch**:

```
Design a MODAL for the Gamification Stats screen in Neural Scribe. Cyberpunk style.

Platform: Desktop modal (600px width × 700px height)
Style: Cyberpunk, dark theme with neon accents

MODAL HEADER:
- Title: "Your Progress" (24px, bold, cyan)
- Tab navigation:
  - "📊 Stats" (active, cyan underline)
  - "🏆 Achievements (12/32)" (inactive, gray)
- Close button: × (top right, white)
- Background: #1a1f2e
- Bottom border: #2a3142

LEVEL SECTION (top):
- Large level badge (circular, 80px):
  - Number: "10" (large, cyan)
  - Border: Cyan glow ring
- Right of badge:
  - Rank name: "Scribe ✍️" (20px, bold, magenta)
  - Current XP: "2,450 XP" (16px, white)

XP PROGRESS BAR (below level):
- Label: "450 XP to Level 11" (12px, cyan, right-aligned)
- Progress bar:
  - Height: 24px
  - Background: #0a0e1a
  - Fill: Gradient cyan-to-green (#00e5ff to #00ff88)
  - Border: 1px solid #2a3142
  - Rounded: 12px
  - Progress: 80% filled
  - Shimmer effect on fill

STATISTICS GRID (below XP):
- Heading: "Statistics" (18px, bold, white)
- 4 stat cards in 2×2 grid

Stat Card 1 (top left):
- Icon: 📝 (32px)
- Number: "5,234" (24px, bold, cyan)
- Label: "Words Transcribed" (12px, gray)
- Background: #1a1f2e
- Border: 1px solid #2a3142
- Padding: 20px

Stat Card 2 (top right):
- Icon: ⏱️
- Number: "2h 15m"
- Label: "Recording Time"

Stat Card 3 (bottom left):
- Icon: 🎙️
- Number: "42"
- Label: "Sessions"

Stat Card 4 (bottom right):
- Icon: 🔥
- Number: "7"
- Label: "Day Streak"

STREAK INFO (bottom section):
- Text: "🔥 7 day streak" (16px, cyan)
- Separator: |
- Text: "Longest: 15 days" (16px, gray)
- Below: "Last active: Today" (14px, gray)

COLORS:
- Primary: #00e5ff (cyan)
- Secondary: #ff00aa (magenta)
- Accent: #00ff88 (green)
- Background: #0a0e1a
- Card background: #1a1f2e
- Text: #ffffff
- Text muted: #a0a8b8
- Borders: #2a3142

VISUAL EFFECTS:
- Gradient XP bar with shimmer
- Cyan glow on level badge
- Card hover: Slight lift effect
- Neon borders
```

**Expected Iterations**: 3-5

---

### Screen 5: Gamification Modal - Achievements Tab

**Priority**: Medium

**Prompt for Stitch**:

```
Design the ACHIEVEMENTS TAB for the Neural Scribe Gamification modal.

Platform: Desktop modal (600px × 700px)
Style: Cyberpunk

MODAL HEADER (same as stats tab):
- Title: "Your Progress"
- Tab navigation:
  - "📊 Stats" (inactive, gray)
  - "🏆 Achievements (12/32)" (ACTIVE, cyan underline)
- Close button: × (top right)

ACHIEVEMENTS GRID:
- Grid layout: 4 columns × 8 rows = 32 achievement badges
- Scrollable content

ACHIEVEMENT BADGE (UNLOCKED example):
- Size: 120px × 120px square
- Background: #1a1f2e
- Border: 2px solid rarity color
- Rounded corners: 12px
- Padding: 16px

Unlocked Badge Content:
- Icon: 🎤 (48px, centered top)
- Name: "First Words" (14px, bold, white, centered)
- Rarity indicator: Color-coded border glow
  - Common: Gray (#a0a0a0)
  - Uncommon: Green (#00ff88)
  - Rare: Blue (#00aaff)
  - Epic: Purple (#aa00ff)
  - Legendary: Orange (#ffaa00)

ACHIEVEMENT BADGE (LOCKED example):
- Same size and layout
- Icon: 🔒 (lock icon, 48px)
- Name: "???" (mystery text)
- Border: Dashed gray (#2a3142)
- Opacity: 0.5
- Grayscale effect
- Progress ring: Circular progress around badge (e.g., 45% complete)

EXAMPLE BADGES (show 8-12):
Row 1:
- "First Words" (unlocked, common, 🎤)
- "Speed Demon" (unlocked, rare, ⚡)
- "Transcriber" (unlocked, uncommon, ✍️)
- "???" (locked, 🔒, 60% progress)

Row 2:
- "Week Warrior" (unlocked, epic, 🔥)
- "???" (locked, 🔒, 20% progress)
- "Marathon" (unlocked, rare, 🏃)
- "???" (locked, 🔒, 5% progress)

BADGE INTERACTIONS (show in design):
- Hover state: Scale 1.05, stronger glow
- Click hint: Cursor pointer

BADGE COUNT (top right of grid):
- "12 / 32 Unlocked" (14px, cyan)
- Progress: 37.5%

COLORS:
- Unlocked badges: Full color with rarity border
- Locked badges: Grayscale, dashed border
- Background: #0a0e1a
- Card background: #1a1f2e
- Rarity colors: As specified above

VISUAL EFFECTS:
- Rarity-colored glows on unlocked badges
- Progress ring animation suggestion
- Grid with consistent spacing (16px gaps)
```

**Expected Iterations**: 2-4

---

### Screen 6: Settings Modal

**Priority**: High

**Prompt for Stitch**:

```
Design a SETTINGS MODAL for Neural Scribe with tabbed navigation and form controls.

Platform: Desktop modal (700px × 600px)
Style: Cyberpunk

MODAL HEADER:
- Title: "Settings" (24px, bold, white)
- Close button: × (top right)
- Background: #1a1f2e
- Bottom border: #2a3142

TAB NAVIGATION (left sidebar):
- Vertical tab list (200px width)
- Tabs (stack vertically):
  1. "General" (active, cyan background)
  2. "Keyboard Shortcuts"
  3. "Voice Commands"
  4. "Formatting & AI"
  5. "Terminal"
  6. "Overlay"
  7. "Privacy"

Active tab style:
- Background: #00e5ff20 (cyan with transparency)
- Left border: 3px solid cyan
- Text: White

Inactive tab style:
- Background: transparent
- Text: Gray (#a0a8b8)
- Hover: Slight cyan tint

CONTENT AREA (right side, 500px):
Show KEYBOARD SHORTCUTS tab as example:

Section: "Recording"
- Label: "Toggle Recording" (14px, white)
- Hotkey display: <kbd>Cmd+Shift+R</kbd>
- "Change" button (small, secondary, right)
- Separator line below

Section: "Clipboard"
- Label: "Copy Last Transcript"
- Hotkey display: <kbd>Cmd+Shift+V</kbd>
- "Change" button

Section: "Conflict Detection"
- Warning box (if conflict exists):
  - Background: #ffaa0020 (warning tint)
  - Icon: ⚠️
  - Text: "Hotkey conflicts with system shortcut"
  - Border: 1px solid #ffaa00

FORM CONTROLS STYLES:
- Input field:
  - Background: #0a0e1a
  - Border: 1px solid #2a3142
  - Focus: Cyan border (#00e5ff)
  - Text: White
  - Height: 40px

- Toggle switch:
  - OFF: Gray background
  - ON: Cyan background with glow
  - Knob: White circle

- Button (primary):
  - Background: Cyan (#00e5ff)
  - Text: Dark (#0a0e1a)
  - Hover: Glow effect

- Button (secondary):
  - Background: Transparent
  - Border: 1px solid #2a3142
  - Text: White
  - Hover: Cyan border

BOTTOM ACTIONS:
- "Restore Defaults" button (left, text button, gray)
- "Cancel" button (right, secondary)
- "Save Changes" button (right, primary cyan)

COLORS:
- Primary: #00e5ff
- Background: #0a0e1a
- Modal background: #1a1f2e
- Text: #ffffff
- Text muted: #a0a8b8
- Borders: #2a3142
- Warning: #ffaa00

VISUAL EFFECTS:
- Section separators (thin lines)
- Neon glow on active elements
- Smooth tab transitions
```

**Expected Iterations**: 3-5

---

## Phase 3: States & Variations

### Screen 7: Overlay Window

**Priority**: High

**Prompt for Stitch**:

```
Design a FLOATING OVERLAY WINDOW for Neural Scribe. Always-on-top, compact design.

Platform: Floating window (320px × 200px)
Style: Cyberpunk, compact, transparent background with blur

WINDOW DESIGN:
- Rounded corners: 16px
- Background: #1a1f2e with 80% opacity and blur effect
- Border: 1px solid #00e5ff (cyan glow)
- Subtle drop shadow
- Draggable appearance hint

TOP SECTION (AI Orb):
- Small AI orb (80px diameter, centered)
- Gradient: Cyan to magenta
- Pulsing glow effect
- Waveform rings around orb (visualize 3 concentric rings)

MIDDLE SECTION (Timer & Count):
- Recording timer: "02:45" (32px, bold, cyan, centered)
- Word count: "156 words" (14px, gray, centered below timer)

BOTTOM SECTION (Voice Commands):
- Pill-shaped status indicators (horizontal row):
  - "🟢 Connected" (green dot + text, 12px)
  - "⚡ Format ON" (cyan, 12px)
- Voice command hints below:
  - "Say 'send it' to paste" (11px, italic, cyan)
  - "Say 'clear' to reset" (11px, italic, gray)

FOCUS MODE BUTTON (top right corner):
- Icon: 🎯 or focus icon
- Small, circular, 24px
- Hover: Cyan glow
- Toggle state indicator

VISUAL STYLE:
- Compact, space-efficient
- Glass morphism effect (blur + transparency)
- Neon cyan accents
- Minimal but informative
- All text: High contrast for readability

COLORS:
- Primary accent: #00e5ff (cyan)
- Background: #1a1f2e (80% opacity)
- Border glow: Cyan
- Status green: #00ff88
- Text: #ffffff
- Text muted: #a0a8b8

EFFECTS:
- Background blur (frosted glass)
- Cyan border glow: 0 0 15px rgba(0, 229, 255, 0.5)
- Orb pulse animation suggestion
- Waveform rings (animated appearance)
- Drop shadow for elevation
```

**Expected Iterations**: 2-3

---

### Screen 8: Achievement Unlock Popup

**Priority**: Low

**Prompt for Stitch**:

```
Design an ACHIEVEMENT UNLOCK POPUP for Neural Scribe. Celebration/reward notification.

Platform: Popup toast (400px × 180px)
Style: Cyberpunk, celebratory, prominent

POPUP CONTAINER:
- Size: 400px width × 180px height
- Position: Bottom right corner
- Background: #1a1f2e
- Border: 3px solid [rarity color] with strong glow
- Rounded corners: 12px
- Drop shadow: Large, prominent

HEADER:
- Text: "🏆 Achievement Unlocked!" (16px, bold, cyan)
- Close button: × (top right, small)

CONTENT LAYOUT:
- Left side: Large icon
  - Achievement icon: 🎤 (80px size)
  - Icon background: Circular, subtle glow matching rarity

- Right side: Achievement details
  - Name: "First Words" (20px, bold, white)
  - Description: "Transcribe your first 10 words" (14px, gray)
  - Rarity badge: "UNCOMMON" (12px, uppercase, green background pill)
  - XP reward: "⭐ +25 XP" (14px, bold, cyan)

RARITY BORDER COLORS (show uncommon example):
- Common: Gray (#a0a0a0)
- Uncommon: Green (#00ff88) ← Use this one
- Rare: Blue (#00aaff)
- Epic: Purple (#aa00ff)
- Legendary: Orange (#ffaa00)

VISUAL EFFECTS:
- Strong rarity-colored border glow
- Icon float/pulse suggestion
- Gradient background: Subtle
- Celebration particles (optional decorative element)

ANIMATION SUGGESTIONS (describe in design):
- Slide in from right
- Glow pulse on border
- Icon slight bounce
- Auto-dismiss after 5 seconds (show timer bar?)

COLORS:
- Background: #1a1f2e
- Border: #00ff88 (uncommon green) with glow
- Text: #ffffff
- Text muted: #a0a8b8
- XP: #00e5ff (cyan)
- Rarity badge: Matching rarity color

EFFECTS:
- Strong border glow: 0 0 30px rgba(0, 255, 136, 0.8)
- Icon glow
- Prominent shadow for depth
```

**Expected Iterations**: 1-2

---

### Screen 9: API Key Setup

**Priority**: High (first-run experience)

**Prompt for Stitch**:

```
Design an API KEY SETUP SCREEN for Neural Scribe first-run experience.

Platform: Desktop (800px × 500px centered card)
Style: Cyberpunk, welcoming, clear instructions

MAIN CARD:
- Centered on dark background
- Card size: 600px × 400px
- Background: #1a1f2e
- Border: 1px solid #2a3142
- Rounded: 16px
- Padding: 48px

HEADER:
- App logo/icon: Neural Scribe symbol (if available) or microphone icon
- Title: "Welcome to Neural Scribe" (28px, bold, cyan)
- Subtitle: "AI-Powered Voice Transcription" (16px, gray)

INSTRUCTION TEXT:
- "To get started, you'll need an ElevenLabs API key"
- Font: 14px, white, centered
- Link: "Get your API key here →" (cyan, underline)

API KEY INPUT:
- Label: "ElevenLabs API Key" (14px, white)
- Input field:
  - Background: #0a0e1a
  - Border: 1px solid #2a3142
  - Placeholder: "sk_..."
  - Type: Password (hidden characters)
  - Width: Full width
  - Height: 48px
  - Rounded: 8px

- Toggle visibility button:
  - Icon: 👁️ (eye icon, right side of input)
  - Shows/hides API key

- Helper text below:
  - "Your API key is stored securely on your device" (12px, gray, italic)
  - Icon: 🔒 (lock, left of text)

VALIDATION FEEDBACK:
- Show SUCCESS state:
  - Green checkmark icon: ✓ (right of input)
  - Text: "Valid API key" (green, small)

ACTION BUTTONS (bottom):
- "Continue" button:
  - Style: Primary, large
  - Background: Cyan (#00e5ff)
  - Text: Dark (#0a0e1a)
  - Width: Full width
  - Height: 48px
  - Rounded: 8px
  - Glow effect

- "Skip for now" link:
  - Text button, centered below
  - Gray text
  - Small (12px)

OPTIONAL ANTHROPIC KEY SECTION (collapsible):
- Expandable section: "Advanced: Add Claude API Key (optional)"
- Same input style
- Explanation: "Enable AI formatting and title generation"

COLORS:
- Primary: #00e5ff (cyan)
- Background: #0a0e1a
- Card: #1a1f2e
- Success: #00ff88
- Text: #ffffff
- Text muted: #a0a8b8
- Borders: #2a3142

VISUAL EFFECTS:
- Cyan glow on Continue button
- Input focus: Cyan border
- Card shadow for elevation
- Smooth transitions
```

**Expected Iterations**: 2-3

---

### Screen 10: Word Replacements Modal

**Priority**: Low

**Prompt for Stitch**:

```
Design a WORD REPLACEMENTS MODAL for Neural Scribe. Manage custom text replacement rules.

Platform: Desktop modal (600px × 500px)
Style: Cyberpunk

MODAL HEADER:
- Title: "Word Replacements" (24px, bold, white)
- Toggle: "Enable Replacements" (switch, top right, ON state cyan)
- Close button: × (top right corner)
- Background: #1a1f2e

DESCRIPTION:
- Text: "Automatically replace words in your transcriptions" (14px, gray)
- Example: "sequel → SQL, jay son → JSON" (12px, cyan, monospace)

ADD NEW RULE SECTION:
- Card background: #0a0e1a
- Padding: 20px
- Rounded: 8px

Form layout:
- Two input fields side by side:
  - "From" input: (left, 40% width)
    - Placeholder: "sequel"
    - Background: #1a1f2e
    - Border: 1px solid #2a3142

  - "To" input: (right, 40% width)
    - Placeholder: "SQL"
    - Same styling

  - Arrow between: → (centered, cyan)

  - "Add" button: (right, 20% width)
    - Primary cyan button
    - Icon: + plus icon

RULES LIST:
- Heading: "Active Rules (4)" (16px, white, margin top)
- Scrollable list

Rule Item (show 4 examples):
Layout per rule:
- Background: #1a1f2e
- Border: 1px solid #2a3142
- Padding: 12px
- Rounded: 8px
- Margin: 8px between

Content:
- "sequel" → "SQL" (monospace, white → cyan)
- Delete button: × icon (right, red on hover)

Example rules to show:
1. "sequel" → "SQL"
2. "jay son" → "JSON"
3. "react jay ess" → "React.js"
4. "docker file" → "Dockerfile"

EMPTY STATE (alternative view):
- If no rules:
  - Icon: 📝 (large, centered)
  - Text: "No replacement rules yet" (gray)
  - Subtext: "Add your first rule above" (smaller gray)

FOOTER:
- "Clear All" button (left, text button, red)
- "Close" button (right, secondary)

COLORS:
- Primary: #00e5ff (cyan)
- Background: #0a0e1a
- Card: #1a1f2e
- Text: #ffffff
- Text muted: #a0a8b8
- Borders: #2a3142
- Delete hover: #ff4444

EFFECTS:
- Rule hover: Slight cyan glow
- Delete button: Red glow on hover
- Input focus: Cyan border
```

**Expected Iterations**: 2-3

---

## Stitch Prompts Library

### Quick Reference: One-Prompt-Per-Screen

Copy and paste these directly into Google Stitch:

1. **Main Window (Idle)**: [See Phase 1, Screen 1](#screen-1-main-window-idle-state)
2. **Main Window (Recording)**: [See Phase 1, Screen 2](#screen-2-main-window-recording-state)
3. **History Sidebar**: [See Phase 1, Screen 3](#screen-3-history-sidebar)
4. **Gamification Stats**: [See Phase 2, Screen 4](#screen-4-gamification-modal---stats-tab)
5. **Gamification Achievements**: [See Phase 2, Screen 5](#screen-5-gamification-modal---achievements-tab)
6. **Settings Modal**: [See Phase 2, Screen 6](#screen-6-settings-modal)
7. **Overlay Window**: [See Phase 3, Screen 7](#screen-7-overlay-window)
8. **Achievement Popup**: [See Phase 3, Screen 8](#screen-8-achievement-unlock-popup)
9. **API Key Setup**: [See Phase 3, Screen 9](#screen-9-api-key-setup)
10. **Word Replacements**: [See Phase 3, Screen 10](#screen-10-word-replacements-modal)

---

## Iteration & Refinement Tips

### Common Refinement Patterns

After initial generation, you'll likely need to adjust:

**1. Color Intensity**
```
"Make the cyan glow on the primary button stronger, increase to 30px blur"
```

**2. Spacing**
```
"Increase spacing between stat cards from 16px to 24px"
```

**3. Typography**
```
"Make the app title larger, change from 24px to 32px"
```

**4. Component Positioning**
```
"Move the AI orb up by 40px to center it better"
```

**5. State Variations**
```
"Show the hover state for the Copy button with cyan border glow"
```

### Stitch Best Practices for This Project

✅ **DO:**
- Reference exact hex colors in every prompt
- Specify pixel measurements for consistency
- Mention "cyberpunk" aesthetic in each prompt
- Save screenshots after successful generations
- Use Standard mode for Figma export
- Make ONE change per iteration

❌ **DON'T:**
- Try to generate animations (Stitch creates static designs)
- Combine multiple screens in one prompt
- Use vague color names like "blue" or "dark gray"
- Request complex interactions (show static states instead)
- Skip defining typography in prompts

### Maintaining Consistency

**Strategy**: Create a "Brand Prompt Snippet" and prepend to every prompt:

```
BRAND GUIDELINES FOR ALL DESIGNS:
Colors: Cyan #00e5ff, Magenta #ff00aa, Green #00ff88, Background #0a0e1a
Typography: Headings bold 18-32px, Body 14px, Monospace for code
Effects: Cyan glows (20px blur), Neon borders, Card backgrounds #1a1f2e
Style: Cyberpunk, futuristic, dark theme with neon accents

[Your specific screen prompt follows...]
```

---

## Export & Implementation

### From Stitch to Figma

**Standard Mode Workflow**:

1. Generate screen in Stitch Standard mode
2. Review and iterate until satisfied
3. Click "Copy to Figma" button in Stitch
4. Open Figma file
5. Paste (Cmd+V)
6. Organize into frames/pages

**Figma Organization**:
```
Figma File Structure:
├── 📄 Main Screens
│   ├── Main Window - Idle
│   ├── Main Window - Recording
│   └── History Sidebar
├── 📄 Modals
│   ├── Gamification - Stats
│   ├── Gamification - Achievements
│   ├── Settings
│   └── Word Replacements
├── 📄 Overlays & Popups
│   ├── Overlay Window
│   ├── Achievement Popup
│   └── API Key Setup
└── 📄 Components
    ├── Buttons
    ├── Inputs
    ├── Cards
    └── Icons
```

### HTML/CSS Export

Stitch also provides HTML/CSS code (Tailwind):

1. Click design preview in Stitch
2. Select "Code" tab
3. Copy HTML/CSS
4. Use as reference for implementation

**Note**: Code is a starting point, not production-ready. Use it for:
- Layout structure reference
- CSS class names
- Component hierarchy
- Spacing/sizing values

### Implementation Notes

**For Your Electron App**:

1. **Extract Design Tokens**:
   - Colors → CSS variables or theme file
   - Spacing → Tailwind config or spacing tokens
   - Typography → Font stack and size scale

2. **Component Mapping**:
   - Stitch designs → React components
   - Maintain same visual hierarchy
   - Add interactions and animations in code

3. **States & Animations**:
   - Stitch shows static states
   - Implement state transitions in React
   - Add animations with CSS/Framer Motion
   - Reference designs for target states

---

## Troubleshooting Common Issues

### Issue: Generic/Similar Output

**Problem**: Designs look too similar to generic templates

**Solution**:
- Be MORE specific about cyberpunk aesthetic
- Include exact hex colors in every prompt
- Reference "neon glow effects" explicitly
- Mention "scan lines" and "glitch text"
- Add visual effect descriptions

### Issue: Wrong Colors

**Problem**: Colors don't match brand palette

**Solution**:
- Use HEX values, not color names
- Specify color for EACH element
- Example: "Button background: #00e5ff (exact hex)"
- Iterate colors ONE AT A TIME

### Issue: Layout Breaks

**Problem**: Changing one thing destroys the layout

**Solution**:
- Make ONE major change per prompt
- Don't combine multiple requests
- Save screenshot before making changes
- If broken, regenerate from scratch

### Issue: Missing Components

**Problem**: Some elements not appearing

**Solution**:
- Check prompt length (<5,000 characters)
- List components in bullet points
- Generate in sections if too complex
- Regenerate with simplified prompt

### Issue: Slow Generation

**Problem**: Taking >3 minutes to generate

**Solution**:
- Normal for Stitch (expect 2-3 minutes)
- Simplify prompt if too complex
- Try during off-peak hours
- Use Standard mode (faster than Experimental)

---

## Checklist: Pre-Design Preparation

Before starting in Stitch:

- [ ] Read Google Stitch research document
- [ ] Review all Neural Scribe features
- [ ] Understand cyberpunk brand guidelines
- [ ] Have color palette ready (hex values)
- [ ] Know your generation quota (350 Standard mode)
- [ ] Plan session time (2-3 hours per phase)
- [ ] Have Figma account ready for export
- [ ] Prepare reference images (optional)

## Checklist: Per-Screen Workflow

For each screen:

- [ ] Copy prompt from this document
- [ ] Paste into Stitch Standard mode
- [ ] Review initial generation
- [ ] Iterate on colors (1 change at a time)
- [ ] Iterate on spacing/layout (1 change at a time)
- [ ] Iterate on typography if needed
- [ ] Export to Figma when satisfied
- [ ] Save screenshot for reference
- [ ] Document any custom changes

## Checklist: Post-Design

After completing all screens:

- [ ] All screens exported to Figma
- [ ] Organized into frames/pages
- [ ] Color tokens extracted
- [ ] Typography system documented
- [ ] Component library created in Figma
- [ ] Design handoff notes written
- [ ] Accessibility review completed
- [ ] Developer implementation plan created

---

## Estimated Timeline

**Session 1: Main Window** (2-3 hours)
- Main Window Idle: 45 min (5 iterations)
- Main Window Recording: 30 min (3 iterations)
- History Sidebar: 45 min (4 iterations)

**Session 2: Modals** (1.5-2 hours)
- Gamification Stats: 40 min (4 iterations)
- Gamification Achievements: 30 min (3 iterations)
- Settings Modal: 50 min (5 iterations)

**Session 3: Supporting Screens** (1-1.5 hours)
- Overlay Window: 20 min (2 iterations)
- Achievement Popup: 15 min (2 iterations)
- API Key Setup: 25 min (3 iterations)
- Word Replacements: 20 min (2 iterations)

**Total: 4.5-6.5 hours across 3 sessions**

**Generation Usage**:
- Estimated: 80-100 generations total
- Well within Standard mode limit (350/month)

---

## Next Steps

1. **Review this plan** - Understand the strategy
2. **Set up Stitch** - Go to stitch.withgoogle.com, sign in
3. **Prepare workspace** - Open Figma, create new file "Neural Scribe UI"
4. **Start Phase 1** - Begin with Main Window (Idle State)
5. **Follow prompts** - Copy/paste from this document
6. **Iterate & refine** - One change at a time
7. **Export to Figma** - After each screen
8. **Move to Phase 2** - Once main screens complete
9. **Document learnings** - Note what works well
10. **Implement in React** - Use designs as reference

---

## Additional Resources

**Google Stitch**:
- URL: https://stitch.withgoogle.com
- Prompt Guide: https://discuss.ai.google.dev/t/stitch-prompt-guide/83844
- Mode comparison: Use Standard for this project

**Cyberpunk Design Inspiration**:
- Look at Cyberpunk 2077 UI
- Blade Runner interface aesthetics
- Neon noir color palettes
- Tron visual language

**Design Tools**:
- Figma (for organizing designs)
- Color contrast checker (for accessibility)
- Font pairing tools (for typography)

**Implementation**:
- Tailwind CSS (Stitch exports use this)
- Framer Motion (for animations)
- React component patterns
- CSS custom properties (for theming)

---

## Questions or Issues?

If you encounter problems:

1. **Review troubleshooting section** above
2. **Check Stitch prompt guide** for best practices
3. **Simplify prompt** if getting poor results
4. **Ask for help** in Stitch community forum
5. **Experiment** with variations

Remember: Iteration is key. Don't expect perfect results on first try!

---

**Good luck designing Neural Scribe! 🎨🤖**

This plan should take you from zero to complete UI designs in 3 focused sessions. The key is following the prompts closely, iterating methodically, and maintaining consistency across screens.

Each prompt is ready to copy/paste directly into Stitch with all necessary details. Just follow the phases in order, and you'll have a complete design system for your app.

---

**Document Version**: 1.0
**Created**: December 20, 2025
**For**: Neural Scribe UI Design with Google Stitch
