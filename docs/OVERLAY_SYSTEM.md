# Overlay System Documentation

## Overview

The overlay system provides a full-screen, transparent, always-on-top interface that displays during voice recording sessions. It features a cyberpunk aesthetic with glitch animations, procedural sound effects, and real-time transcript display.

**Location**: Rendered on the user's active display (or main window's display if active display is fullscreen)

**Technology Stack**:
- HTML/CSS for UI (cyberpunk-themed components)
- JavaScript Web Audio API for procedural sound generation
- Electron BrowserWindow with transparent frame
- IPC communication between main app and overlay

---

## What We Built

### Core Features

1. **Focus Mode Transcript Display**
   - Real-time transcript in monospace font (Share Tech Mono)
   - Subtitle-style backgrounds with 70-80% opacity
   - Displays last 4 lines (90 chars per line)
   - Cyan text for previous lines, white for current line
   - Subtle glow effects for readability

2. **Interactive Status Pill**
   - Recording timer with pulsing mic indicator
   - Stop, Paste to Terminal, and Clear buttons
   - Animated shimmer background (cyan→magenta gradient)
   - Hover effects with glow and lift animations

3. **Status Indicators**
   - Connection status badge
   - AI formatting toggle indicator
   - Positioned above status pill with proper spacing

4. **Voice Commands Card**
   - Displays enabled voice commands (bottom right)
   - Shows command phrase and action mapping

5. **Audio Visualizations**
   - AI orb with spectrum visualization
   - Waveform display between indicators
   - Real-time frequency data visualization

---

## Problems Solved

### 1. **Transcript Breaking on Special Characters** ✅
**Problem**: Overlay would stop updating when transcript contained special characters (backticks, backslashes, quotes).

**Solution**:
- Created `escapeForJS()` function handling all special chars
- Separate HTML entity escaping for innerHTML
- Proper escape chain: HTML entities → JS string escaping

```typescript
function escapeForJS(str: string): string {
  return str
    .replace(/\\/g, '\\\\')  // Backslash first
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/`/g, '\\`')
    .replace(/\n/g, '\\n')
    // ... etc
}
```

### 2. **Text Readability Issues** ✅
**Problem**: Gradient text was unreadable against dynamic background.

**Solution**:
- Solid colors instead of gradients (cyan #00e5ff for old, white for current)
- Subtitle-style backgrounds (70-80% opacity) per line
- Individual line backgrounds instead of container background
- Glow effects for atmospheric enhancement without compromising readability

### 3. **Element Centering During Animations** ✅
**Problem**: Shake animations broke CSS centering (`translateX(-50%)` was overwritten).

**Solution**: Created animation-specific keyframes preserving transforms:

```css
/* Centered elements - preserves translateX(-50%) */
@keyframes shakeCentered {
  0% { transform: translateX(-50%) translateY(0); }
  10% { transform: translateX(-50%) translateY(2px); }
  /* ... maintains X centering throughout */
}

/* Focus mode - preserves translate(-50%, -50%) */
@keyframes shakeFocusMode {
  0% { transform: translate(-50%, -50%) scale(1); }
  10% { transform: translate(-50%, -50%) scale(1.01); }
  /* ... uses scale instead of position */
}
```

### 4. **Duplicate Sound Effects** ✅
**Problem**: Power-down sound played twice when stopping recording.

**Solution**: Added `isHiding` flag to prevent duplicate calls:

```javascript
let isHiding = false;

window.hideOverlay = function() {
  if (isHiding) return;
  isHiding = true;
  // ... play sound and animate
};

window.showOverlay = function() {
  isHiding = false; // Reset
  // ... show overlay
};
```

---

## Architecture

### Component Hierarchy

```
overlay.html
├── overlay-container (animation wrapper)
│   ├── scan-line (hidden - removed in favor of shake)
│   ├── Background Layers
│   │   ├── shadow-layer
│   │   ├── cloud-overlay
│   │   ├── highlight-layer
│   │   ├── gradient-animation
│   │   └── glow-spots
│   ├── AI Orb (centered, bottom)
│   │   ├── orb-glow
│   │   ├── orb-rings
│   │   ├── orb-core
│   │   └── orb-spectrum (frequency bars)
│   ├── Focus Mode (center, 58% from top)
│   │   └── focus-lines (individual backgrounds)
│   ├── Status Indicators (centered, bottom 90px)
│   │   ├── connection-status
│   │   └── formatting-badge
│   ├── Waveform Container (centered, bottom 56px)
│   ├── Status Pill (centered, bottom 24px)
│   │   ├── Recording time
│   │   ├── Stop button
│   │   ├── Paste button
│   │   └── Clear button
│   └── Voice Commands Card (bottom right)
```

### IPC Communication Flow

```
Main App (App.tsx)
    ↓ (sends via IPC)
Main Process (overlay.ts)
    ↓ (executeJavaScript)
Overlay Window (overlay.html)
    ↓ (updates DOM)
User Interface
```

**Key IPC Channels**:
- `recording-time`: Updates timer every second
- `transcript-preview`: Sends text + word count
- `overlay-status`: Connection & formatting status
- `voice-commands-update`: Enabled command list
- `audio-level`: Audio amplitude (0-1)
- `frequency-data`: Spectrum data (24 frequency bins)

### Animation System

**Entrance Animation (650ms)**:
1. Container glitch effect (horizontal shake + blur + scale)
2. Component-level shake starts simultaneously
3. Electricity crackle sound plays with power-up tone

**Exit Animation (350ms)**:
1. Container fade out with blur
2. Power-down sound plays once
3. Window hides after animation completes

**Key Timing**:
- Entrance: 650ms (was 1000ms - optimized for snappiness)
- Exit: 350ms
- Sound prevents: 0ms (immediate flag check)

---

## Sound Design

### Power-Up Sound (150ms)
**Purpose**: Recording start feedback

**Implementation**:
```javascript
// Main rising tone: 200Hz → 800Hz
oscillator.type = 'sine';
oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.15);

// + 8 electricity crackle bursts
// White noise → high-pass filter (2000-5000Hz)
// Random timing (0.02s intervals)
// Random intensity (0.05-0.15)
```

**Character**: Futuristic activation with crispy electric arcing

### Power-Down Sound (200ms)
**Purpose**: Recording stop feedback

**Implementation**:
```javascript
// Soft descending tone: 600Hz → 150Hz
oscillator.type = 'sine';
oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.2);
```

**Character**: Smooth power-down, closure feeling

### Why Procedural Audio?
- No audio files to manage
- Tiny bundle size
- Dynamic generation each time (organic feel)
- Electricity crackle has natural randomness
- Web Audio API support is universal

---

## Lessons Learned

### 1. **Transform Composition is Critical**
When animating elements with CSS positioning transforms, you **must preserve** the original transform in every animation keyframe.

❌ **Wrong**:
```css
.centered-element { transform: translateX(-50%); }
@keyframes shake {
  0% { transform: translateY(0); }  /* Lost translateX! */
}
```

✅ **Right**:
```css
.centered-element { transform: translateX(-50%); }
@keyframes shake {
  0% { transform: translateX(-50%) translateY(0); }  /* Preserved! */
}
```

### 2. **String Escaping Order Matters**
When injecting text into JavaScript strings within HTML:
1. First: Escape HTML entities (`&`, `<`, `>`, `"`, `'`)
2. Then: Escape JavaScript string literals (`\`, `'`, `"`, `` ` ``, `\n`)
3. Finally: Inject into script

Reversing this order will fail.

### 3. **Animation Duration Sweet Spot**
- Too fast (<400ms): Feels abrupt, details missed
- Too slow (>800ms): Feels sluggish, annoying
- Sweet spot: 600-700ms for entrance, 300-400ms for exit
- Exit should always be faster than entrance

### 4. **Prevent Duplicate Event Handlers**
When triggering animations via IPC:
- Main process may call function multiple times
- Use boolean flags to prevent duplicate execution
- Reset flags on opposite action (hide → show resets flag)

### 5. **Subtle is Better for Continuous Effects**
- Shimmer background: 5% opacity (was too bright at 20%)
- Shake amplitude: 2-3px max (was jarring at 5px+)
- Glow effects: Multiple layers with low opacity > single bright glow
- Users notice motion more than color

---

## Future Enhancements

### Potential Improvements

1. **Animation Customization**
   - User-configurable animation speed
   - Enable/disable shake effects
   - Alternative animation styles (fade, slide, zoom)

2. **Sound Customization**
   - Volume control for sound effects
   - Alternative sound themes (minimal, retro, sci-fi)
   - Option to disable sounds

3. **Display Management**
   - Remember preferred display per recording session
   - Handle multi-monitor setups more intelligently
   - Detect display resolution and scale UI accordingly

4. **Accessibility**
   - Reduce motion mode (respects `prefers-reduced-motion`)
   - High contrast mode
   - Larger text options

5. **Performance**
   - Throttle frequency data updates (currently on every frame)
   - Use CSS `will-change` for animated properties
   - Lazy load overlay window (create on first use)

### Technical Debt

1. **Scan Line Removal**
   - Currently hidden with `display: none`
   - Should be removed from DOM entirely
   - Clean up related CSS and JavaScript

2. **Animation Class Management**
   - Consider using CSS animation states vs class toggling
   - Could simplify with CSS custom properties

3. **Sound Effect Caching**
   - Pre-generate noise buffers for electricity effect
   - Reuse buffers instead of regenerating each time

---

## Quick Reference

### Adding a New Overlay Element

1. **Add HTML** in `electron/overlay.html`:
```html
<div class="my-new-element">
  Content here
</div>
```

2. **Style with positioning** in `<style>` section:
```css
.my-new-element {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);  /* Center it */
  z-index: 100;
}
```

3. **Add shake animation** (if needed):
```css
.overlay-container.show .my-new-element {
  animation: shakeCentered 650ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}
```

4. **Update from main process** via IPC:
```typescript
// In overlay.ts
export function updateMyElement(data: string): void {
  overlayWindow.webContents.executeJavaScript(`
    const el = document.getElementById('my-element');
    if (el) el.textContent = '${data}';
  `).catch(err => console.error('Update failed:', err));
}
```

### Debugging Overlay Issues

**Can't see overlay**:
```bash
# Check if overlay window exists
console.log('[Overlay] Window created')  # Should appear in logs

# Verify positioning
overlayWindow.getBounds()  # Check x, y, width, height
```

**Animations not working**:
```javascript
// Check if classes are applied
document.getElementById('overlay-container').classList
// Should show 'show' or 'hide'

// Verify animation runs
getComputedStyle(document.getElementById('overlay-container')).animation
```

**Sounds not playing**:
```javascript
// Check AudioContext state
audioContext.state  // Should be 'running', not 'suspended'

// Resume if suspended (Chrome requirement)
audioContext.resume()
```

**Text not updating**:
```typescript
// Check IPC is sending data
console.log('[Overlay] Sending update:', text)

// Check JavaScript injection
overlayWindow.webContents.executeJavaScript(`console.log('Test')`)
```

---

## File Structure

```
electron/
├── main/
│   └── overlay.ts          # Overlay window management, IPC handlers
├── overlay.html             # Overlay UI, animations, sounds
└── preload/
    └── index.ts            # IPC channel definitions

src/
└── App.tsx                 # Main app, sends data to overlay

docs/
└── OVERLAY_SYSTEM.md       # This file
```

---

## Resources

- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **CSS Animations**: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations
- **Electron Transparency**: https://www.electronjs.org/docs/latest/api/browser-window#transparent-windows
- **Transform Composition**: https://developer.mozilla.org/en-US/docs/Web/CSS/transform

---

**Last Updated**: December 2025
**Version**: 1.0
**Authors**: Khaled Fakharany, Claude Code
