# 🐛 Neural Scribe Troubleshooting Guide

Common issues and solutions for Neural Scribe.

---

## Table of Contents

- [Installation Issues](#installation-issues)
- [Microphone Issues](#microphone-issues)
- [API Key Issues](#api-key-issues)
- [Transcription Issues](#transcription-issues)
- [AI Formatting Issues](#ai-formatting-issues)
- [Terminal Integration Issues](#terminal-integration)
- [Overlay Issues](#overlay-issues)
- [Performance Issues](#performance-issues)
- [Gamification Issues](#gamification-issues)
- [General Issues](#general-issues)

---

## Installation Issues

### Problem: `npm install` Fails

**Symptoms:**

- Error messages during `npm install`
- Missing dependencies
- Build failures

**Solutions:**

1. **Check Node.js Version**

   ```bash
   node --version  # Should be 18+ or 20+
   npm --version   # Should be 9+ or 10+
   ```

   If outdated, install the latest LTS from [nodejs.org](https://nodejs.org)

2. **Clear npm Cache**

   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Use Correct Package Manager**
   - This project uses npm (not yarn or pnpm)
   - If you have lockfiles for other managers, delete them

4. **Check for Native Module Issues (macOS)**

   ```bash
   # Install Xcode Command Line Tools
   xcode-select --install
   ```

5. **Windows-Specific Issues**
   ```bash
   # Run as Administrator
   # Install windows-build-tools
   npm install --global windows-build-tools
   ```

---

### Problem: `npm run dev` Fails to Start

**Symptoms:**

- App doesn't launch
- Console errors about missing modules
- Port already in use

**Solutions:**

1. **Ensure All Dependencies Installed**

   ```bash
   npm install
   ```

2. **Check for Port Conflicts**
   - Vite dev server uses port 5173 by default
   - Kill any process using that port:

   ```bash
   # macOS/Linux
   lsof -ti:5173 | xargs kill -9

   # Windows
   netstat -ano | findstr :5173
   taskkill /PID <PID> /F
   ```

3. **Clear Vite Cache**

   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

4. **Check TypeScript Compilation**
   ```bash
   npm run build  # Check for type errors
   ```

---

### Problem: Build Errors in Production

**Symptoms:**

- `npm run build` fails
- TypeScript errors
- Missing assets

**Solutions:**

1. **Fix Type Errors**

   ```bash
   npm run lint  # Check for errors
   ```

   Address any TypeScript type errors

2. **Clear Build Cache**

   ```bash
   rm -rf dist
   rm -rf .next
   npm run build
   ```

3. **Check Environment Variables**
   - Ensure no hardcoded API keys in source
   - Verify all imports are correct

---

## Microphone Issues

### Problem: Microphone Not Detected

**Symptoms:**

- No microphone shown in dropdown
- "Requesting microphone access..." message stuck
- Permission denied errors

**Solutions:**

#### macOS:

1. **Check System Permissions**
   - Go to **System Settings** → **Privacy & Security** → **Microphone**
   - Ensure your browser (if running in dev mode) or Neural Scribe app is checked
   - If not listed, click **"+"** and add it

2. **Restart the App**
   - Quit Neural Scribe completely (`Cmd+Q`)
   - Relaunch the app
   - Grant permissions when prompted

3. **Check Microphone Hardware**
   - Test mic in another app (e.g., QuickTime, Voice Memos)
   - If not working elsewhere, it's a hardware issue

4. **Reset Permissions**
   ```bash
   # Terminal command to reset mic permissions (macOS)
   tccutil reset Microphone
   ```
   Then relaunch the app and grant permissions again

#### Windows:

1. **Check Windows Settings**
   - Go to **Settings** → **Privacy** → **Microphone**
   - Enable "Allow apps to access your microphone"
   - Enable for specific apps if listed

2. **Check Device Manager**
   - Open **Device Manager**
   - Expand **Audio inputs and outputs**
   - Ensure microphone is enabled (no red X or yellow warning)

3. **Update Audio Drivers**
   - Right-click microphone device → **Update driver**
   - Or visit manufacturer website for latest drivers

#### Linux:

1. **Check PulseAudio/PipeWire**

   ```bash
   # List audio devices
   arecord -l

   # Test microphone
   arecord -d 5 test.wav
   aplay test.wav
   ```

2. **Check Permissions**

   ```bash
   # Add user to audio group
   sudo usermod -a -G audio $USER
   # Logout and login again
   ```

3. **Install Missing Packages**

   ```bash
   # Ubuntu/Debian
   sudo apt-get install pulseaudio pavucontrol

   # Fedora
   sudo dnf install pulseaudio pavucontrol
   ```

---

### Problem: Microphone Level Too Low

**Symptoms:**

- Transcription doesn't start
- Very poor accuracy
- Waveform barely visible

**Solutions:**

1. **Increase System Mic Volume**
   - **macOS:** System Settings → Sound → Input → Adjust input volume slider
   - **Windows:** Settings → System → Sound → Input device properties → Adjust level
   - **Linux:** `pavucontrol` → Input Devices → Adjust volume

2. **Check Mic Position**
   - Position mic 6-12 inches from your mouth
   - Avoid touching or bumping the mic
   - Reduce background noise

3. **Use External Mic**
   - Built-in laptop mics are often low quality
   - USB microphones provide better input levels
   - Headset mics reduce ambient noise

4. **Enable Noise Suppression**
   - Open Settings in Neural Scribe
   - Enable "Noise Suppression" option
   - Enable "Echo Cancellation" if applicable

---

### Problem: "Microphone in Use by Another App"

**Symptoms:**

- Error message about mic being unavailable
- Can't select microphone in dropdown

**Solutions:**

1. **Close Other Apps Using Mic**
   - Zoom, Discord, Skype, OBS, etc.
   - QuickTime, Voice Memos, etc.

2. **Check Browser Tabs**
   - Other tabs with mic access (Google Meet, etc.)
   - Close unused tabs with permissions

3. **Restart App**
   - Quit all apps using microphone
   - Restart Neural Scribe

4. **Reboot System**
   - If issue persists, reboot your computer
   - Microphone handles should be released

---

## API Key Issues

### Problem: "Invalid API Key" Error

**Symptoms:**

- Error message when entering API key
- Can't validate ElevenLabs key
- Connection fails on first use

**Solutions:**

1. **Verify Key Format**
   - ElevenLabs keys start with `sk_`
   - Anthropic keys start with `sk-ant-`
   - No extra spaces before/after key
   - No newline characters

2. **Check Key Validity**
   - Log into ElevenLabs dashboard
   - Verify key is still active (not revoked)
   - Generate a new key if needed

3. **Test Key Manually**

   ```bash
   # Test ElevenLabs key
   curl -H "xi-api-key: YOUR_KEY" https://api.elevenlabs.io/v1/user

   # Test Anthropic key
   curl -H "x-api-key: YOUR_KEY" https://api.anthropic.com/v1/models
   ```

   If these fail, the key is invalid

4. **Copy-Paste Carefully**
   - Copy key from dashboard
   - Paste into Neural Scribe settings
   - Avoid typing manually (typos common)

---

### Problem: "API Rate Limit Exceeded"

**Symptoms:**

- Transcription fails mid-recording
- Error about rate limits
- Temporary service unavailability

**Solutions:**

1. **Check Usage Quota**
   - Log into ElevenLabs dashboard
   - View current usage vs. plan limits
   - Upgrade plan if needed

2. **Wait and Retry**
   - Rate limits reset after a time period
   - Wait 60 seconds and try again

3. **Reduce Usage**
   - Shorten recording sessions
   - Avoid rapid consecutive recordings
   - Clear queue/retry later

---

### Problem: "Insufficient API Credits"

**Symptoms:**

- Transcription doesn't start
- Error about credits or billing

**Solutions:**

1. **Add Credits**
   - Log into ElevenLabs dashboard
   - Navigate to Billing
   - Add payment method and purchase credits

2. **Check Billing Status**
   - Ensure payment method is valid
   - Verify no failed charges
   - Update card if expired

3. **Switch to Free Tier (if available)**
   - Check if free tier is still available
   - Downgrade temporarily if needed

---

## Transcription Issues

### Problem: Poor Transcription Accuracy

**Symptoms:**

- Many incorrect words
- Missing words or phrases
- Nonsensical transcription

**Solutions:**

1. **Improve Audio Quality**
   - Speak clearly and at normal pace
   - Reduce background noise
   - Use a better microphone
   - Ensure mic is positioned correctly

2. **Add Word Replacements**
   - Create rules for commonly misheard words
   - Technical terms (e.g., "sequel" → "SQL")
   - Proper nouns, brand names

3. **Check Internet Connection**
   - ElevenLabs requires stable internet
   - Weak connection causes poor accuracy
   - Test with speed test: [fast.com](https://fast.com)

4. **Speak More Clearly**
   - Avoid mumbling or rushing
   - Pronounce words fully
   - Pause between sentences
   - Avoid filler words ("um", "uh")

---

### Problem: Transcription Lag/Delay

**Symptoms:**

- Words appear 1-2 seconds after speaking
- Noticeable delay in real-time updates
- Sluggish UI

**Solutions:**

1. **Check Internet Speed**
   - Minimum recommended: 5 Mbps upload
   - Test at [speedtest.net](https://speedtest.net)
   - Upgrade connection if too slow

2. **Reduce Network Load**
   - Pause large downloads
   - Close bandwidth-heavy apps (YouTube, Netflix)
   - Disconnect other devices on network

3. **Close Other Apps**
   - Free up system resources
   - Close unnecessary browser tabs
   - Quit other Electron apps

4. **Check Server Status**
   - ElevenLabs may have issues
   - Check [status.elevenlabs.io](https://status.elevenlabs.io)
   - Try again later if degraded performance

---

### Problem: Transcription Stops Mid-Recording

**Symptoms:**

- Recording cuts off unexpectedly
- Connection lost errors
- Partial transcript only

**Solutions:**

1. **Check Internet Connection**
   - Connection dropped during recording
   - Switch to wired connection if on WiFi
   - Move closer to router

2. **Extend Session Timeout**
   - Long pauses may trigger timeout
   - Speak continuously (no >30 second pauses)
   - Stop and restart for long sessions

3. **Check API Limits**
   - May have hit API rate limit
   - Wait and retry

4. **Update the App**
   - Check for latest version
   - Bug may be fixed in newer release

---

### Problem: Voice Commands Not Detected

**Symptoms:**

- Saying "send it" doesn't work
- "clear" or "cancel" ignored
- Commands transcribed as text

**Solutions:**

1. **Verify Commands Are Enabled**
   - Open Settings → Voice Commands
   - Check that commands are toggled ON

2. **Speak Commands Clearly**
   - Pause slightly before command
   - Say command distinctly: "send it" (not "sendit")
   - Avoid background noise during command

3. **Check Command Phrasing**
   - Use exact phrases: "send it", "send", "clear", "cancel"
   - Case doesn't matter, but wording does
   - Avoid variations like "send that" or "sent it"

4. **Test in Isolation**
   - Record just the command word
   - See if it's transcribed correctly
   - If not, it's an accuracy issue

---

## AI Formatting Issues

### Problem: AI Formatting Not Working

**Symptoms:**

- Commands pasted as-is (not formatted)
- No Claude processing
- Original transcript used

**Solutions:**

1. **Check Anthropic API Key**
   - Open Settings → AI Formatting
   - Verify API key is entered
   - Test key validity:

   ```bash
   curl -H "x-api-key: YOUR_KEY" https://api.anthropic.com/v1/models
   ```

2. **Ensure Formatting Is Enabled**
   - Settings → AI Formatting
   - Toggle "Enable AI Formatting" to ON

3. **Check Transcript Length**
   - Very short prompts (<15 words) may be skipped
   - "Skip short prompts" setting may be enabled
   - Try with longer, more complex commands

4. **Select Correct Model**
   - Ensure a model is selected (Sonnet/Opus/Haiku)
   - Sonnet is recommended default

---

### Problem: AI Formatting Is Incorrect

**Symptoms:**

- Wrong command generated
- Syntax errors in output
- Unexpected formatting

**Solutions:**

1. **Add Custom Instructions**
   - Settings → AI Formatting → Custom Instructions
   - Specify your preferences:
     ```
     Always use long flags (--help not -h).
     Prefer pnpm over npm.
     Use absolute paths.
     ```

2. **Try Different Model**
   - **Opus:** Highest quality, more accurate
   - **Sonnet:** Balanced (recommended)
   - **Haiku:** Fastest, less accurate

3. **Review Formatted Output**
   - Always check before executing
   - Edit manually if needed
   - Report consistently wrong patterns

4. **Use More Context**
   - Instead of: "install express"
   - Say: "install express as an npm dependency"
   - More context = better formatting

---

### Problem: AI Formatting Is Slow

**Symptoms:**

- Long wait after "send it"
- "Formatting..." status for >10 seconds
- UI freezes during formatting

**Solutions:**

1. **Switch to Haiku Model**
   - Settings → AI Formatting → Model → Haiku
   - Haiku is 10x faster than Opus
   - Slight quality tradeoff

2. **Check Internet Speed**
   - Claude API requires good connection
   - Test at [speedtest.net](https://speedtest.net)

3. **Reduce Transcript Length**
   - Long transcripts take longer to process
   - Break into smaller recordings

4. **Skip Formatting for Simple Commands**
   - Disable "Enable AI Formatting" for basic usage
   - Enable only when needed

---

## Terminal Integration

### Problem: Paste Not Working (macOS)

**Symptoms:**

- "send it" command doesn't paste
- No text appears in terminal
- Permission errors

**Solutions:**

1. **Grant Accessibility Permissions**
   - **System Settings** → **Privacy & Security** → **Accessibility**
   - Click lock icon to unlock
   - Click **"+"** button
   - Add Neural Scribe app
   - Ensure checkbox is ON
   - **Restart the app after granting permissions**

2. **Check Terminal App Is Supported**
   - Supported: iTerm2, Terminal.app, Warp, Hyper, Alacritty, VS Code, Cursor
   - If unsure, switch to "Clipboard Mode" in settings

3. **Try Clipboard Fallback**
   - Settings → Terminal Integration → Paste Mode → **Clipboard**
   - Text is copied to clipboard
   - Manually paste with `Cmd+V`

4. **Verify Terminal Is Running**
   - Terminal app must be open
   - At least one window must exist
   - Window must not be minimized

5. **Update macOS**
   - Some older macOS versions have permission bugs
   - Update to latest macOS version

---

### Problem: Paste Goes to Wrong Terminal

**Symptoms:**

- Text pastes to wrong window/tab
- Unexpected behavior with multiple terminals

**Solutions:**

1. **Focus Correct Terminal Before "send it"**
   - Click the terminal window you want
   - Ensure it's in the foreground
   - Then say "send it"

2. **Use Window-Specific Paste**
   - (Feature planned - coming soon)
   - Will allow targeting specific windows

3. **Close Unused Terminal Windows**
   - Reduce ambiguity
   - Keep only needed windows open

---

### Problem: Paste Includes Unwanted Characters

**Symptoms:**

- Extra newlines
- Special characters
- Quotes around text

**Solutions:**

1. **Check Word Replacements**
   - May be adding characters unintentionally
   - Review and edit replacement rules

2. **Check Custom Formatting Instructions**
   - May be instructing Claude to add formatting
   - Adjust or remove instructions

3. **Use Clipboard Mode to Inspect**
   - Switch to clipboard mode
   - Inspect exactly what's copied
   - Identify source of extra characters

---

### Problem: Terminal Not Detected

**Symptoms:**

- "No terminal found" error
- Paste falls back to clipboard
- Detection fails

**Solutions:**

1. **Ensure Terminal Is Open**
   - Open your terminal app
   - Create at least one window

2. **Check Supported Terminals**
   - Neural Scribe supports:
     - iTerm2, Terminal.app, Warp, Hyper, Alacritty, VS Code, Cursor
   - If using another terminal, use clipboard mode

3. **Restart Terminal App**
   - Quit terminal completely
   - Relaunch
   - Try again

4. **Update Terminal App**
   - Ensure using latest version
   - Older versions may have compatibility issues

---

## Overlay Issues

### Problem: Overlay Not Showing

**Symptoms:**

- Overlay window doesn't appear
- Only main app visible

**Solutions:**

1. **Enable Overlay in Settings**
   - Settings → Overlay
   - Toggle "Show Recording Overlay" to ON

2. **Check Overlay Position**
   - May be off-screen if you changed monitor setup
   - Reset position to default in settings

3. **Restart the App**
   - Quit (`Cmd+Q` or `Ctrl+Q`)
   - Relaunch app
   - Overlay should appear on recording

4. **Check Window Management Permissions (macOS)**
   - Some screen recording permissions may block overlay
   - Grant all requested permissions

---

### Problem: Overlay Blocks Other Windows

**Symptoms:**

- Overlay always on top
- Can't click through overlay
- Interferes with workflow

**Solutions:**

1. **Enable Click-Through Mode**
   - Settings → Overlay
   - Enable "Click-Through Mode"
   - Overlay becomes non-interactive

2. **Reduce Opacity**
   - Settings → Overlay
   - Lower opacity slider (e.g., 50%)
   - Makes overlay less obtrusive

3. **Reposition Overlay**
   - Drag overlay to screen corner
   - Keep it out of main work area

4. **Disable Overlay**
   - If not needed, toggle OFF in settings

---

### Problem: Overlay Not Updating

**Symptoms:**

- Transcript frozen
- Waveform not animating
- Timer stuck

**Solutions:**

1. **Restart Recording**
   - Stop recording
   - Start again
   - Overlay should update

2. **Check Connection Status**
   - Look for connection indicator
   - Red = disconnected
   - Green = connected

3. **Close and Reopen Overlay**
   - Settings → Overlay → Toggle OFF
   - Wait 2 seconds
   - Toggle ON
   - Restart recording

---

## Performance Issues

### Problem: High CPU Usage

**Symptoms:**

- Fan spinning loudly
- System feels sluggish
- Battery drains quickly

**Solutions:**

1. **Disable Overlay**
   - Overlay rendering uses CPU
   - Turn off if not needed

2. **Reduce Waveform Quality**
   - (Setting planned - coming soon)
   - Lower frequency bin count

3. **Close Other Apps**
   - Free up CPU resources
   - Close unnecessary browser tabs
   - Quit other Electron apps

4. **Update App**
   - Performance improvements in newer versions
   - Check for updates

---

### Problem: High Memory Usage

**Symptoms:**

- RAM usage over 500MB
- System swapping to disk
- Slowdowns

**Solutions:**

1. **Clear Transcription History**
   - Old transcriptions stored in memory
   - History panel → Clear All

2. **Restart the App**
   - Fresh start releases memory
   - Quit and relaunch

3. **Check for Memory Leaks**
   - If persists, report as bug
   - Include steps to reproduce

---

### Problem: App Crashes

**Symptoms:**

- Unexpected quits
- Freeze and force quit required
- Error dialogs

**Solutions:**

1. **Check Console Logs**
   - **macOS:** `Console.app` → Filter for "Neural Scribe"
   - **Windows:** Event Viewer
   - **Linux:** `journalctl` or check log files

2. **Clear App Data**

   ```bash
   # macOS
   rm -rf ~/Library/Application\ Support/neural-scribe

   # Windows
   del /s /q %APPDATA%\neural-scribe

   # Linux
   rm -rf ~/.config/neural-scribe
   ```

   **Warning:** This deletes all settings and history

3. **Reinstall App**
   - Uninstall completely
   - Download latest version
   - Fresh install

4. **Report Bug**
   - Include crash logs
   - Describe steps to reproduce
   - System info (OS version, Node version)

---

## Gamification Issues

### Problem: Achievements Not Unlocking

**Symptoms:**

- Met requirements but no unlock
- Stats update but no achievement
- Missing achievements

**Solutions:**

1. **Check Achievement Requirements**
   - Open gamification dashboard
   - View locked achievement details
   - Ensure you've met all criteria

2. **Wait for Sync**
   - Achievements check on session end
   - Complete a recording to trigger check

3. **Restart App**
   - Stats may need recalculation
   - Quit and relaunch

4. **Clear Cache and Recalculate**
   - (Feature planned - manual recalculation)
   - May require reinstall

---

### Problem: Stats Not Updating

**Symptoms:**

- Word count frozen
- Session count incorrect
- Time not accumulating

**Solutions:**

1. **Complete Recording Properly**
   - Don't force quit mid-recording
   - Use "send it", "clear", or "cancel"
   - Stats update on session end

2. **Check for Errors**
   - Console may show errors
   - Report if consistent

3. **Manually Refresh**
   - Close and reopen gamification panel

---

### Problem: Streak Not Incrementing

**Symptoms:**

- Daily login but streak stays same
- Streak reset unexpectedly

**Solutions:**

1. **Understand Streak Logic**
   - Requires using app on consecutive days
   - Logging in isn't enough (must record)
   - Resets if you miss a day

2. **Check System Date**
   - Ensure system date/time is correct
   - Wrong date breaks streak logic

3. **Time Zone Issues**
   - Streak checks use local time
   - Traveling across time zones may affect

---

## General Issues

### Problem: App Won't Start

**Symptoms:**

- Clicking app does nothing
- Splash screen appears then closes
- No window opens

**Solutions:**

1. **Check for Running Instances**

   ```bash
   # macOS/Linux
   ps aux | grep neural-scribe
   kill -9 <PID>

   # Windows Task Manager
   # End all neural-scribe processes
   ```

2. **Delete Lock Files**

   ```bash
   # macOS
   rm ~/Library/Application\ Support/neural-scribe/*.lock

   # Windows
   del %APPDATA%\neural-scribe\*.lock

   # Linux
   rm ~/.config/neural-scribe/*.lock
   ```

3. **Check Logs**
   - Look for startup errors
   - Address any missing dependencies

4. **Reinstall**
   - Complete uninstall
   - Fresh install

---

### Problem: Settings Not Saving

**Symptoms:**

- Changes revert on restart
- API keys disappear
- Preferences reset

**Solutions:**

1. **Check File Permissions**

   ```bash
   # macOS/Linux
   ls -la ~/Library/Application\ Support/neural-scribe
   # Ensure you have write permissions
   ```

2. **Disable Read-Only Mode**
   - Settings file may be read-only
   - Check and change permissions

3. **Clear Corrupt Settings**
   ```bash
   # Backup first!
   mv config.json config.json.backup
   # Restart app to regenerate
   ```

---

### Problem: Update Fails

**Symptoms:**

- Auto-update errors
- Can't install new version
- Stuck on old version

**Solutions:**

1. **Manual Update**
   - Download latest release from GitHub
   - Install over existing version

2. **Check Permissions**
   - May need admin/root access
   - Right-click → Run as Administrator (Windows)

3. **Disable Auto-Update Temporarily**
   - Install manually
   - Re-enable after successful update

---

## Still Having Issues?

If your problem isn't listed here or solutions don't work:

1. **Search Existing Issues**
   - [GitHub Issues](https://github.com/yourusername/elevenlabs-transcription/issues)
   - Someone may have reported the same problem

2. **Check Discussions**
   - [GitHub Discussions](https://github.com/yourusername/elevenlabs-transcription/discussions)
   - Community may have solutions

3. **Report a Bug**
   - Create a new issue with:
     - Detailed description
     - Steps to reproduce
     - Expected vs. actual behavior
     - System info (OS, Node version, app version)
     - Console logs (if applicable)

4. **Contact Support**
   - Email: support@ceera.ai
   - Include troubleshooting steps you've tried

---

**Last Updated:** 2024-12-27

**Version:** 1.0.0
