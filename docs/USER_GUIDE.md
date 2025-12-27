# 📖 Neural Scribe User Guide

Complete tutorials and walkthroughs for getting the most out of Neural Scribe.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Basic Workflows](#basic-workflows)
- [Advanced Features](#advanced-features)
- [Voice Commands](#voice-commands)
- [Terminal Integration](#terminal-integration)
- [Gamification System](#gamification-system)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Best Practices](#best-practices)
- [Tips & Tricks](#tips--tricks)

---

## Getting Started

### First Time Setup

#### Step 1: Launch the Application

After installation, launch Neural Scribe. On first launch, you'll see the API Key Setup screen.

#### Step 2: Configure ElevenLabs API Key

1. Visit [ElevenLabs](https://elevenlabs.io) and create an account (free tier available)
2. Navigate to your Profile → API Keys
3. Generate a new API key
4. Copy the API key
5. Paste it into Neural Scribe's setup screen
6. Click "Save"

The app will validate your key and confirm connection to ElevenLabs.

#### Step 3: Grant Microphone Permissions

When prompted:

1. Click "Allow" when your browser/OS requests microphone access
2. Select your preferred microphone from the dropdown (optional)
3. You'll see a green checkmark when permissions are granted

#### Step 4: (Optional) Add Anthropic API Key for AI Formatting

1. Visit [Anthropic Console](https://console.anthropic.com)
2. Create an account and generate an API key
3. Open Settings (⚙️ icon) in Neural Scribe
4. Navigate to the "AI Formatting" section
5. Enter your Anthropic API key
6. Click "Save"

AI formatting will now convert your natural language commands into executable code.

#### Step 5: Your First Recording

1. Press `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
2. Speak into your microphone
3. Watch the real-time transcript appear
4. Say **"send it"** to stop recording and paste to terminal
   - OR click the orb to stop recording
   - OR press the hotkey again

**Congratulations!** You've completed your first transcription. 🎉

---

## Basic Workflows

### Workflow 1: Simple Terminal Command

**Goal:** Execute a terminal command using voice.

**Steps:**

1. Ensure your terminal is open and in focus
2. Press `Cmd+Shift+R` to start recording
3. Say: _"list all files in the current directory"_
4. Say: _"send it"_
5. The command `ls -la` is pasted to your terminal
6. Press Enter to execute

**Without AI Formatting:**

- Transcript: "list all files in the current directory"
- Pasted as-is to terminal

**With AI Formatting:**

- Transcript: "list all files in the current directory"
- Claude AI converts to: `ls -la`
- Formatted command pasted to terminal

---

### Workflow 2: Multi-Step Git Workflow

**Goal:** Stage, commit, and push changes.

**Steps:**

1. Start recording with `Cmd+Shift+R`
2. Say: _"Add all files, commit with message 'implement user authentication', and push to origin main"_
3. Say: _"send it"_
4. AI formats to:
   ```bash
   git add . && git commit -m "implement user authentication" && git push origin main
   ```
5. Command is pasted to terminal
6. Press Enter to execute

**Result:** All three Git operations executed in sequence.

---

### Workflow 3: Installing Dependencies

**Goal:** Install NPM packages for a project.

**Steps:**

1. Navigate to your project directory in terminal
2. Start recording
3. Say: _"Install react, typescript, and vite as dev dependencies"_
4. Say: _"send it"_
5. AI formats to:
   ```bash
   npm install --save-dev react typescript vite
   ```
6. Press Enter to execute

---

### Workflow 4: Creating Files and Directories

**Goal:** Set up a new project structure.

**Steps:**

1. Start recording
2. Say: _"Create a directory called source, then create files index dot ts and app dot tsx inside it"_
3. Say: _"send it"_
4. AI formats to:
   ```bash
   mkdir src && touch src/index.ts src/app.tsx
   ```
5. Press Enter to execute

---

## Advanced Features

### Using Word Replacements

Word replacements automatically correct common transcription errors.

**Setting Up Replacements:**

1. Click the Settings icon (⚙️)
2. Navigate to "Word Replacements"
3. Click "Add Replacement"
4. Enter:
   - **From:** "sequel" (what you say)
   - **To:** "SQL" (what you want)
   - **Case Sensitive:** No
   - **Whole Word:** Yes
5. Click "Save"

**Common Replacements to Add:**

| You Say       | Gets Replaced With |
| ------------- | ------------------ |
| sequel        | SQL                |
| jay son       | JSON               |
| react jay ess | React.js           |
| node jay ess  | Node.js            |
| type script   | TypeScript         |
| java script   | JavaScript         |
| sequel lite   | SQLite             |
| postgres      | PostgreSQL         |
| mongo db      | MongoDB            |
| docker file   | Dockerfile         |

**Quick Add from Context Menu:**

1. Right-click any word in a transcript
2. Select "Add Replacement Rule"
3. A modal pre-fills with the selected word
4. Enter the replacement and save

---

### Reformatting Existing Text

Already have a transcript but want to reformat it differently?

**Steps:**

1. Open the History panel
2. Find the transcription you want to reformat
3. Click the "Reformat" button (🔄)
4. Enter custom formatting instructions, e.g.:
   - "Convert to PowerShell syntax"
   - "Make this more concise"
   - "Add error handling"
5. Select the Claude model (Sonnet for balanced, Opus for quality, Haiku for speed)
6. Click "Reformat"
7. Compare original vs. reformatted versions side-by-side
8. Click "Use Reformatted" to save the new version

**Example:**

**Original (formatted for Bash):**

```bash
npm install express cors
```

**Reformatted (for Docker):**

```dockerfile
RUN npm install express cors
```

---

### Using the Recording Overlay

The overlay window provides live feedback without interrupting your workflow.

**Enabling the Overlay:**

1. Open Settings → "Overlay"
2. Toggle "Show Recording Overlay" to ON
3. Configure position, size, and opacity
4. Save settings

**Overlay Features:**

- **Live Transcript:** See your words appear in real-time
- **Timer:** Track recording duration (MM:SS)
- **Word Count:** Monitor transcript length
- **Waveform:** Visual audio feedback
- **Voice Command Hints:** Reminder of available commands
- **Status Indicators:** Connection, formatting, recording state

**Positioning the Overlay:**

- **Drag** the title bar to move
- **Resize** by dragging edges
- **Pin** to keep on top of all windows
- **Click-through** mode for non-intrusive monitoring

**Use Cases:**

- Monitoring transcript during long dictation sessions
- Keeping track of time for productivity
- Visual confirmation when working with headphones
- Multi-monitor setups where main app isn't visible

---

### Managing Transcription History

**Viewing History:**

1. Click the History icon (📚) in the top bar
2. Transcriptions are grouped by day (Today, Yesterday, etc.)
3. Each entry shows:
   - AI-generated title
   - Timestamp
   - Word count
   - Duration
   - Snippet of transcript

**Actions on History Items:**

- **View Details:** Click any entry to see full transcript
- **Copy:** Click copy icon to copy text to clipboard
- **Delete:** Click trash icon to remove entry
- **Show Original:** Toggle to see text before AI formatting
- **Reformat:** Generate new formatted version with custom instructions

**Clearing History:**

1. Click "Clear All" at the bottom of the History panel
2. Confirm the action
3. All transcriptions are permanently deleted

**Exporting History:**

_(Planned feature - coming soon)_

- Export all or selected transcriptions to JSON, Markdown, or plain text

---

### Customizing AI Formatting

**Changing the Claude Model:**

1. Open Settings → "AI Formatting"
2. Select a model:
   - **Sonnet:** Balanced speed and quality (recommended)
   - **Opus:** Highest quality, slower, more expensive
   - **Haiku:** Fastest, cheapest, lower quality
3. Save settings

**Custom Formatting Instructions:**

1. Open Settings → "AI Formatting"
2. Scroll to "Custom Instructions"
3. Enter your preferences, e.g.:
   ```
   Always use long flags (--help instead of -h).
   Prefer pipx over pip for Python tools.
   Use pnpm instead of npm.
   ```
4. Click "Save"
5. All future formatting will follow your custom rules

**Resetting to Default:**

Click "Reset to Default" to restore original formatting instructions.

---

## Voice Commands

Voice commands provide hands-free control over Neural Scribe.

### Available Commands

| Command                     | Action                               | Example                                         |
| --------------------------- | ------------------------------------ | ----------------------------------------------- |
| **"send it"** or **"send"** | Stop recording and paste to terminal | "npm install express" → _say "send it"_ → paste |
| **"clear"**                 | Clear the current transcript         | Start over without saving                       |
| **"cancel"**                | Cancel recording without saving      | Abort the current session                       |

### Configuring Voice Commands

**Enabling/Disabling Commands:**

1. Open Settings → "Voice Commands"
2. Toggle individual commands ON/OFF
3. Disabled commands won't trigger during recording

**Adding Custom Commands:**

_(Planned feature - coming soon)_

- Define your own voice triggers
- Map commands to specific actions
- Create macros for common workflows

### Voice Command Best Practices

**Tips for Reliable Detection:**

1. **Speak clearly** - Enunciate the command words
2. **Pause slightly** - Brief pause before and after the command
3. **Consistent phrasing** - Use exact command words
4. **Avoid background noise** - Reduce distractions for better accuracy

**Example Usage:**

**Good:**

> "Install express and cors... _pause_ ...send it"

**Not Ideal:**

> "Installexpressandcorssenditsenditsend" _(rushed, no pause)_

---

## Terminal Integration

Neural Scribe can paste directly to your terminal applications.

### Supported Terminals

- ✅ **iTerm2** (macOS)
- ✅ **Terminal.app** (macOS)
- ✅ **Warp** (Modern terminal for macOS/Linux)
- ✅ **Hyper** (Cross-platform)
- ✅ **Alacritty** (GPU-accelerated)
- ✅ **VS Code Integrated Terminal**
- ✅ **Cursor Terminal**

### Paste Modes

**Auto Mode (Recommended):**

- Automatically detects the active terminal
- Falls back to clipboard if no terminal detected
- Seamless experience

**Terminal Mode:**

- Always paste directly to terminal via AppleScript/automation
- Requires accessibility permissions
- Most reliable for supported terminals

**Clipboard Mode:**

- Copies transcript to system clipboard
- Paste manually with `Cmd+V`
- Works with any application

**Changing Paste Mode:**

1. Open Settings → "Terminal Integration"
2. Select your preferred mode
3. Save settings

### Granting Accessibility Permissions

For direct terminal paste, macOS requires accessibility permissions.

**Steps:**

1. Open **System Settings** → **Privacy & Security** → **Accessibility**
2. Click the lock icon to make changes
3. Click **"+"** button
4. Navigate to the Neural Scribe app
5. Add it to the list
6. Ensure the checkbox is ON

If paste isn't working, check the [Troubleshooting Guide](TROUBLESHOOTING.md#terminal-integration).

### Multi-Terminal Workflows

**Pasting to Specific Terminal Windows:**

1. Open multiple terminal windows/tabs
2. Start recording in Neural Scribe
3. Say your command
4. Neural Scribe pastes to the **last active** terminal window
5. To target a specific window, focus it before saying "send it"

**Example Workflow:**

1. **Window 1:** Frontend dev server running
2. **Window 2:** Backend API server
3. **Window 3:** Database terminal
4. Focus **Window 3**
5. Say: "show tables" → "send it"
6. Command executes in database terminal (Window 3)

---

## Gamification System

Gamification makes productivity fun and rewarding.

### Understanding XP and Levels

**How to Earn XP:**

- **1 XP per word** transcribed
- **10 XP per minute** of recording
- **25 XP per session** completed
- **50 XP daily login bonus**
- **Bonus XP** from unlocking achievements

**Level Progression:**

- Start at **Level 1 (Initiate)**
- XP required grows exponentially: `100 × 1.5^(level-1)`
- Progress through **10 ranks**:
  1. Initiate (Level 1)
  2. Apprentice (Level 5)
  3. Scribe (Level 10)
  4. Transcriber (Level 15)
  5. Linguist (Level 20)
  6. Oracle (Level 30)
  7. Cyberscribe (Level 40)
  8. Neural Sage (Level 50)
  9. Transcendant (Level 75)
  10. Singularity (Level 100)

**Example Progression:**

- **Level 1 → 2:** 100 XP required
- **Level 2 → 3:** 150 XP required
- **Level 3 → 4:** 225 XP required
- **Level 10 → 11:** ~5,767 XP required

### Achievement Categories

**1. Milestone Achievements**

- Session count milestones
- First session, 10 sessions, 100 sessions, etc.

**2. Words Achievements**

- Word count milestones
- 1,000 words, 10,000 words, 100,000 words, etc.

**3. Streak Achievements**

- Consecutive day streaks
- 3 days, 7 days, 30 days, 100 days

**4. Speed Achievements**

- Words per minute records
- 150 WPM, 200 WPM, 250 WPM

**5. Time Achievements**

- Total recording time
- 1 hour, 10 hours, 50 hours, 100 hours

**6. Level Achievements**

- Reaching specific levels
- Level 10, 25, 50, 100

**7. AI Mastery**

- Using AI formatting features
- Trying different models, reformatting, title generation

**8. Customization**

- Personalizing the app
- Word replacements, settings changes, voice commands

**9. Efficiency**

- Productivity shortcuts
- Keyboard shortcuts, quick workflows

**10. Integration**

- Terminal usage
- Pasting to terminals, multi-terminal usage

**11. Exploration**

- Feature discovery
- Trying new features, switching engines

### Viewing Your Stats

**Gamification Dashboard:**

1. Click the trophy icon (🏆) in the top bar
2. View your stats:
   - Current level and rank
   - XP progress to next level
   - Total words transcribed
   - Total recording time
   - Total sessions
   - Current streak
   - Longest streak

**Achievement Progress:**

1. Scroll to "Achievements" section
2. See all 84 achievements organized by category
3. **Unlocked achievements:** Full color with unlock date
4. **Locked achievements:** Grayed out with progress bar
5. **Recent unlocks:** Highlighted at the top

### Maintaining Streaks

**Daily Streak Rules:**

- Log in and use the app **at least once per day**
- Streak increments if you log in on consecutive days
- Miss a day and the streak resets to 0
- Longest streak is preserved in your stats

**Tips for Maintaining Streaks:**

1. Set a daily reminder to use Neural Scribe
2. Make it part of your morning routine
3. Even a short 1-minute recording counts
4. Enable daily login bonus notifications

**Streak Achievements:**

- 🔥 **Committed:** 3-day streak (75 XP)
- 💪 **Dedicated:** 7-day streak (150 XP)
- ⚡ **Unstoppable:** 30-day streak (500 XP)
- 🌟 **Legendary Streak:** 100-day streak (2,000 XP)

### Sharing Achievements

When you unlock an achievement, share it with the world!

**Generating Shareable Cards:**

1. Unlock an achievement
2. Click the "Share" button on the achievement popup
3. A 1200×630px image is generated
4. Image includes:
   - Achievement icon
   - Achievement name and description
   - Your username/level
   - Rarity and XP reward
5. Save the image to your device
6. Share on Twitter, LinkedIn, Discord, etc.

**Example Share Text:**

> Just unlocked the "Voice Master" achievement in Neural Scribe! 🎙️
> Transcribed 100,000 words with AI-powered voice-to-code. #NeuralScribe #Productivity

---

## Keyboard Shortcuts

Master these shortcuts for maximum productivity.

### Global Shortcuts (Work Anywhere)

| Shortcut                                          | Action               | Customizable |
| ------------------------------------------------- | -------------------- | ------------ |
| `Cmd+Shift+R` (Mac)<br>`Ctrl+Shift+R` (Win/Linux) | Toggle recording     | ✅ Yes       |
| `Cmd+Shift+V` (Mac)<br>`Ctrl+Shift+V` (Win/Linux) | Copy last transcript | ✅ Yes       |

### In-App Shortcuts

| Shortcut            | Action                      |
| ------------------- | --------------------------- |
| `Cmd+,` or `Ctrl+,` | Open Settings               |
| `Cmd+H` or `Ctrl+H` | Open History                |
| `Cmd+K` or `Ctrl+K` | Open Gamification Dashboard |
| `Esc`               | Close current modal/panel   |
| `Cmd+Q` or `Ctrl+Q` | Quit application            |

### Customizing Shortcuts

**Changing Global Hotkeys:**

1. Open Settings → "Keyboard Shortcuts"
2. Click on the shortcut you want to change
3. Press your desired key combination
4. If there's a conflict, you'll be warned
5. Click "Save" to apply changes

**Restrictions:**

- Must include a modifier key (Cmd/Ctrl, Shift, Alt)
- Cannot conflict with system shortcuts
- Cannot use single keys (must be combination)

**Best Practices:**

- Choose shortcuts that don't conflict with your terminal or code editor
- Use memorable combinations (e.g., "R" for Record)
- Test shortcuts to ensure they work globally

---

## Best Practices

### Recording Quality

**1. Speak Clearly and Naturally**

- No need to slow down excessively
- Use natural conversational pace
- Pause briefly between sentences

**2. Minimize Background Noise**

- Use in a quiet environment
- Close windows to reduce outside noise
- Mute notifications on other devices

**3. Use a Quality Microphone**

- Built-in laptop mics work, but external mics are better
- USB microphones provide clearer audio
- Headset mics reduce ambient noise

**4. Optimal Distance**

- Position mic 6-12 inches from your mouth
- Too close: pops and distortion
- Too far: weak signal and noise

### Workflow Optimization

**1. Plan Before Recording**

- Know what command you want to execute
- For complex commands, break into steps
- Use word replacements for technical terms

**2. Use Voice Commands Effectively**

- Learn the available commands by heart
- Pause before saying "send it" or "clear"
- Don't rush through commands

**3. Review Transcripts**

- Quickly scan the transcript before sending
- Catch errors before execution
- Use the overlay for live feedback

**4. Leverage AI Formatting**

- Trust Claude for common commands
- Add custom instructions for your preferences
- Review formatted output for accuracy

### Productivity Tips

**1. Build Habits with Gamification**

- Set a daily goal (e.g., 500 words)
- Maintain your streak for bonus XP
- Unlock all achievements for completionist mindset

**2. Customize for Your Workflow**

- Add word replacements for your tech stack
- Set up custom formatting instructions
- Choose the right Claude model for your needs

**3. Use History Effectively**

- Review past commands for learning
- Copy frequently used commands from history
- Reformat old transcripts with new instructions

**4. Master Keyboard Shortcuts**

- Use global hotkeys to start recording instantly
- Copy last transcript without switching windows
- Minimize mouse usage for speed

---

## Tips & Tricks

### Advanced Transcription Techniques

**1. Dictating Code**

When dictating code, be explicit about syntax:

**Good:**

> "function get user data, open paren, user id, close paren, open brace, return await fetch, open paren, slash api slash users slash dollar sign open brace user id close brace"

**Better Approach:**

- Dictate pseudocode or high-level logic
- Let AI formatting convert to actual code
- Review and refine manually if needed

**2. Multi-Line Commands**

For multi-line bash scripts:

> "Create a for loop that iterates from 1 to 10, echo each number, then done"

AI formats to:

```bash
for i in {1..10}; do echo $i; done
```

**3. Using Technical Terms**

Add word replacements for frequently used terms:

| You Say             | Replacement    |
| ------------------- | -------------- |
| "docker compose"    | docker-compose |
| "kubernetes"        | kubectl        |
| "typescript config" | tsconfig.json  |
| "package dot json"  | package.json   |
| "dot env file"      | .env           |

### Workflow Hacks

**1. Command Chains**

Dictate multiple commands in sequence:

> "Change to desktop directory, create folder called new project, change into it, initialize git, create readme file"

AI formats to:

```bash
cd ~/Desktop && mkdir new-project && cd new-project && git init && touch README.md
```

**2. Quick Notes**

Use Neural Scribe for quick documentation:

1. Start recording
2. Dictate notes, thoughts, or TODO items
3. Don't say "send it" (just stop recording)
4. Find notes in History panel
5. Copy to your note-taking app

**3. Meeting Transcription**

Record meeting discussions:

1. Enable recording at the start of a meeting
2. Speak naturally (or have the meeting audio play)
3. Stop when meeting ends
4. Review transcript in History
5. Generate title for easy reference

**4. Code Review Comments**

Dictate code review feedback:

> "This function looks good but could be optimized. Consider using a map instead of a for loop. Also add error handling for edge cases."

Copy from history and paste into GitHub/GitLab comments.

### Power User Features

**1. Scripting Workflows**

Create reusable command templates:

**Template in History:**

```bash
git checkout -b feature/BRANCH_NAME && git push -u origin feature/BRANCH_NAME
```

When needed:

1. Find template in history
2. Copy to clipboard
3. Paste to terminal
4. Replace `BRANCH_NAME` manually

**2. Batch Operations**

Record complex batch operations:

> "For each markdown file in the docs folder, convert it to HTML and save to the output directory"

AI formats to:

```bash
for file in docs/*.md; do pandoc "$file" -o "output/$(basename "$file" .md).html"; done
```

**3. Custom AI Instructions for Frameworks**

Tailor AI formatting to your stack:

**For Python:**

```
Always use pathlib instead of os.path.
Prefer f-strings over .format().
Use type hints for function signatures.
```

**For JavaScript:**

```
Use ESM imports (import/export), not CommonJS (require).
Prefer const over let, never use var.
Use arrow functions for callbacks.
```

### Troubleshooting Tips

**Transcription Not Accurate?**

1. Check microphone input level in system settings
2. Reduce background noise
3. Speak more clearly and slowly
4. Add word replacements for problem words

**AI Formatting Not Working?**

1. Verify Anthropic API key is valid
2. Check you have API credits remaining
3. Ensure formatting is enabled in settings
4. Try a different Claude model

**Paste Not Working?**

1. Grant accessibility permissions (macOS)
2. Verify terminal app is supported
3. Try clipboard mode as fallback
4. Restart the app and terminal

**Overlay Not Showing?**

1. Check overlay is enabled in settings
2. Verify overlay isn't off-screen (reposition)
3. Try toggling overlay on/off
4. Restart the app

---

## Conclusion

You're now equipped with everything you need to master Neural Scribe!

**Next Steps:**

1. Practice with simple commands
2. Gradually add word replacements
3. Experiment with AI formatting
4. Unlock your first achievements
5. Build a daily streak habit

**Need More Help?**

- Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
- Join the [Community Discussions](https://github.com/yourusername/elevenlabs-transcription/discussions)
- Report bugs or request features on [GitHub Issues](https://github.com/yourusername/elevenlabs-transcription/issues)

**Happy transcribing!** 🎙️✨
