# Neural Scribe - First Launch Experience Redesign Plan

## 🎯 Overview

Complete redesign of the first-launch onboarding experience to match Neural Scribe's cyberpunk brand identity, support multiple transcription engines, validate configurations, and request all necessary permissions.

---

## 🎨 Design System - Cyberpunk Theme

### Visual Identity
- **Color Palette**: Neon cyan (#00ffff) and neon magenta (#ff00ff) gradients
- **Typography**:
  - Display: Orbitron (headings)
  - Body: Share Tech Mono (monospace)
  - UI: Rajdhani (interface elements)
- **Effects**:
  - Neon glow/shadows on interactive elements
  - Holographic sweep animations
  - Scanline overlays for authenticity
  - Gradient borders with glow effects
- **Backgrounds**: Dark (#0a0a0f, #12121a, #1a1a24) with subtle neon tints

### Branding
- **App Name**: "Neural Scribe" (NOT "ElevenLabs Transcription")
- **Visual Elements**: Cyberpunk-themed icons, neon accents, futuristic UI
- **Tone**: Professional but futuristic, tech-forward

---

## 📋 Multi-Step Onboarding Wizard

### Step 1: Welcome Screen
**Purpose**: Brand introduction and overview

**Content**:
- Large "Neural Scribe" title with neon gradient text effect
- Subtitle: "AI-Powered Voice Transcription"
- Brief description (2-3 lines) about what the app does
- Cyberpunk-themed illustration or logo
- "Get Started" button with neon glow effect

**Technical**:
- Full-screen overlay
- Cyberpunk background with scanlines
- Animated entrance (fade in + slide up)

---

### Step 2: Transcription Engine Selection
**Purpose**: Let user choose their preferred transcription provider

**Content**:
- Title: "Choose Your Transcription Engine"
- Description: "Select your preferred speech-to-text provider"

**Two Option Cards** (side-by-side):

#### Option A: ElevenLabs
- **Icon**: ElevenLabs logo/icon
- **Title**: "ElevenLabs Scribe"
- **Description**:
  - "High-quality transcription with voice cloning support"
  - "Requires ElevenLabs API subscription"
- **Link**: "Get API Key →" (opens https://elevenlabs.io/app/settings/api-keys)
- **Badge**: "Recommended" (optional)

#### Option B: Deepgram
- **Icon**: Deepgram logo/icon
- **Title**: "Deepgram Nova"
- **Description**:
  - "Fast, accurate transcription with multiple models"
  - "Requires Deepgram API subscription"
- **Link**: "Get API Key →" (opens https://console.deepgram.com/)

**Selection State**:
- Cards have hover effect (neon border glow)
- Selected card shows active state (cyan/magenta border with glow)
- "Continue" button appears only after selection

**Technical**:
- Save selection to settings: `transcriptionEngine: 'elevenlabs' | 'deepgram'`
- Conditionally show API key setup based on selection

---

### Step 3: API Key Setup & Validation
**Purpose**: Collect and validate API key for selected engine

**Dynamic Content** (based on Step 2 selection):

#### For ElevenLabs:
- **Title**: "ElevenLabs API Key"
- **Description**:
  - "Enter your ElevenLabs API key to enable transcription"
  - "You can find this in your ElevenLabs dashboard under Settings > API Keys"
- **Help Link**: "Need help? Get your API key →" (opens elevenlabs.io dashboard)
- **Input Field**:
  - Label: "API Key"
  - Placeholder: "xi_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  - Type: password (with show/hide toggle)
  - Monospace font
- **Validation**:
  - Call `window.electronAPI.getScribeToken()` to verify
  - Show loading state: "Validating API key..."
  - Success: Green checkmark with "API key verified ✓"
  - Error: Red error message with specific issue

#### For Deepgram:
- **Title**: "Deepgram API Key"
- **Description**:
  - "Enter your Deepgram API key to enable transcription"
  - "You can find this in your Deepgram console"
- **Help Link**: "Need help? Get your API key →" (opens console.deepgram.com)
- **Input Field**:
  - Label: "API Key"
  - Placeholder: "Enter your Deepgram API key"
  - Type: password (with show/hide toggle)
  - Monospace font
- **Model Selection** (dropdown):
  - Label: "Model"
  - Options: Nova 3, Nova 3 Monolingual, Nova 3 Multilingual, Nova 2, Flux
  - Default: Nova 3
- **Validation**:
  - Test API connection with selected model
  - Show loading state: "Validating API key..."
  - Success: Green checkmark with "API key verified ✓"
  - Error: Red error message with specific issue

**Validation Requirements**:
- ✅ API key is not empty
- ✅ API key format is valid (basic check)
- ✅ API key works (make test API call)
- ❌ BLOCK progression if validation fails
- 💡 Show helpful error messages ("Invalid API key", "No credits remaining", etc.)

**UI States**:
- Default: Input ready
- Loading: Spinner + "Validating..." text
- Success: Checkmark icon + green border glow
- Error: Error icon + red border glow + error message

**Technical**:
- Save to encrypted settings: `apiKey` or `deepgramApiKey`
- Save Deepgram model selection: `deepgramModel`
- Only proceed to next step after successful validation

---

### Step 4: Claude CLI Setup (Optional but Recommended)
**Purpose**: Verify Claude CLI is installed and authenticated for prompt formatting

**Content**:
- **Title**: "Claude CLI Setup"
- **Description**:
  - "Neural Scribe uses Claude CLI for AI-powered prompt formatting"
  - "This feature is optional but highly recommended"

**Status Check** (on screen load):
```typescript
const status = await window.electronAPI.checkClaudeCli()
// Returns: { available: boolean, version: string | null }
```

**Three Possible States**:

#### State A: Claude CLI Installed & Ready ✅
- **Icon**: Green checkmark with neon glow
- **Message**: "Claude CLI is installed and ready (v{version})"
- **Action**: "Continue" button (auto-enabled)

#### State B: Claude CLI Not Installed ⚠️
- **Icon**: Warning icon (amber/yellow)
- **Message**: "Claude CLI is not installed"
- **Instructions**:
  ```
  To enable AI formatting features:
  1. Install Claude CLI: npm install -g @anthropics/claude-cli
  2. Authenticate: claude auth login
  3. Click "Check Again" below
  ```
- **Actions**:
  - "Check Again" button (re-runs checkClaudeCli)
  - "Skip for Now" button (proceed without Claude CLI)
  - "Installation Guide" link (opens documentation)

#### State C: Claude CLI Installed but Not Authenticated ⚠️
- **Icon**: Warning icon (amber/yellow)
- **Message**: "Claude CLI is installed but not authenticated"
- **Instructions**:
  ```
  To complete setup:
  1. Open Terminal
  2. Run: claude auth login
  3. Follow the authentication steps
  4. Click "Check Again" below
  ```
- **Actions**:
  - "Check Again" button
  - "Skip for Now" button
  - "Authentication Guide" link

**User Choice**:
- Users can skip this step if they don't want AI formatting
- App functionality works without Claude CLI (just no prompt formatting)
- Can be configured later in Settings

**Technical**:
- Use existing `checkClaudeCli()` IPC handler
- Set `promptFormattingEnabled` based on availability
- Store preference in settings

---

### Step 5: Permissions Setup
**Purpose**: Request all required macOS permissions upfront

**Content**:
- **Title**: "Grant Permissions"
- **Description**: "Neural Scribe needs the following permissions to function properly"

**Permission Cards** (stacked vertically):

#### Permission 1: Accessibility Access 🔑 (REQUIRED)
- **Icon**: Lock/shield icon
- **Title**: "Accessibility Access"
- **Description**: "Required for auto-paste and keyboard automation features"
- **Why**: "Allows Neural Scribe to paste transcriptions directly into your active application"
- **Status Indicator**:
  - ❌ Red: "Not Granted"
  - ✅ Green: "Granted"
- **Action Button**:
  - If not granted: "Grant Access" (opens System Settings)
  - If granted: Disabled with checkmark

**Check Function** (on screen load + when returning from Settings):
```typescript
const hasAccess = await window.electronAPI.checkAccessibilityPermissions()
```

**Request Function**:
```typescript
await window.electronAPI.requestAccessibilityPermissions()
// Opens System Settings > Privacy & Security > Accessibility
// User must manually add Neural Scribe
```

**Polling** (when permission window is open):
- Check every 2 seconds if permission was granted
- Auto-update UI when permission changes
- Show success animation when granted

#### Permission 2: Microphone Access 🎤 (REQUIRED)
- **Icon**: Microphone icon
- **Title**: "Microphone Access"
- **Description**: "Required for voice recording and transcription"
- **Why**: "Allows Neural Scribe to capture your voice for transcription"
- **Status Indicator**: Same as Accessibility
- **Action**: Same pattern as Accessibility

**Check/Request**:
```typescript
// Request happens on first recording attempt
// But we can check current status:
const hasAccess = await systemPreferences.getMediaAccessStatus('microphone')
```

#### Optional: Show Info Only
Since microphone permission is requested on first recording attempt, we could:
- Just show informational card: "You'll be prompted for microphone access when you start your first recording"
- Or proactively request it here

**Progress Indicator**:
- Show "2 of 2 permissions granted" or "1 of 2 permissions granted"
- "Continue" button enabled only when all REQUIRED permissions are granted
- Visual progress bar at bottom of screen

**Re-check Mechanism**:
- "Refresh Status" button if user granted permissions in System Settings
- Auto-refresh when window regains focus (user came back from Settings)

**Technical**:
- Use IPC handlers: `checkAccessibilityPermissions()`, `requestAccessibilityPermissions()`
- Store permission states in component state (not persistent)
- Block progression until required permissions granted

---

### Step 6: Success / Ready to Go
**Purpose**: Confirm setup complete and launch app

**Content**:
- **Title**: "You're All Set!" or "Setup Complete"
- **Icon**: Large animated checkmark or success icon with neon glow
- **Summary**:
  ```
  ✓ {Engine Name} configured and validated
  ✓ Claude CLI ready (or: ⚠ Claude CLI skipped - can enable in Settings)
  ✓ All permissions granted
  ```
- **Quick Tips** (optional carousel or list):
  - "Use Cmd+Shift+R to start recording"
  - "Use Cmd+Shift+F to record with AI formatting"
  - "Click the menu bar icon to access Neural Scribe anytime"
- **Action**:
  - Large "Start Transcribing" button with neon gradient + glow
  - On click: Mark onboarding complete, close wizard, show main app

**Technical**:
- Call `setFirstLaunchCompleted()` to mark onboarding as done
- Transition to main app UI
- Optional: Show brief tooltip tour of main UI (can be separate feature)

---

## 🔧 Implementation Plan

### Phase 1: Component Architecture
**Files to Create/Modify**:

1. **Create: `src/components/onboarding/OnboardingWizard.tsx`**
   - Main wizard container
   - Step navigation logic
   - State management (current step, user selections)

2. **Create: `src/components/onboarding/steps/WelcomeStep.tsx`**
   - Welcome screen with branding

3. **Create: `src/components/onboarding/steps/EngineSelectionStep.tsx`**
   - Engine selection cards (ElevenLabs vs Deepgram)

4. **Create: `src/components/onboarding/steps/ApiKeyStep.tsx`**
   - Dynamic API key input based on selected engine
   - Validation logic

5. **Create: `src/components/onboarding/steps/ClaudeCliStep.tsx`**
   - Claude CLI check and setup

6. **Create: `src/components/onboarding/steps/PermissionsStep.tsx`**
   - Permission request cards
   - Status polling

7. **Create: `src/components/onboarding/steps/SuccessStep.tsx`**
   - Completion screen

8. **Create: `src/components/onboarding/OnboardingWizard.css`**
   - Cyberpunk-themed styles matching app design
   - Reuse variables from `cyberpunk-theme.css`

9. **Modify: `src/components/ApiKeySetup.tsx`**
   - Replace with OnboardingWizard component
   - Or remove entirely if fully replaced

10. **Modify: `src/App.tsx`**
    - Replace `<ApiKeySetup />` with `<OnboardingWizard />`
    - Update conditional rendering logic

### Phase 2: IPC Handlers
**Files to Modify**:

1. **`electron/main/ipc-handlers.ts`**
   - Ensure all needed handlers exist:
     - ✅ `has-api-key` (exists)
     - ✅ `set-api-key` (exists)
     - ✅ `get-scribe-token` (exists for validation)
     - ✅ `has-deepgram-api-key` (exists)
     - ✅ `set-deepgram-api-key` (exists)
     - ✅ `check-claude-cli` (exists)
     - ✅ `check-accessibility-permissions` (exists)
     - ✅ `request-accessibility-permissions` (exists)
   - Add new if needed:
     - `validate-deepgram-api-key` (test connection with Deepgram API)

2. **`electron/preload/index.ts`**
   - Verify all IPC methods are exposed to renderer

### Phase 3: State Management
**Wizard State**:
```typescript
interface OnboardingState {
  currentStep: number
  selectedEngine: 'elevenlabs' | 'deepgram' | null
  apiKeyValidated: boolean
  claudeCliAvailable: boolean
  claudeCliVersion: string | null
  accessibilityGranted: boolean
  microphoneGranted: boolean
}
```

**Persistence**:
- Only save to settings when user completes each step
- Allow "back" navigation without losing progress
- Save `hasCompletedFirstLaunch` only at final step

### Phase 4: Validation Logic

**API Key Validation**:
```typescript
async function validateElevenLabsKey(apiKey: string): Promise<boolean> {
  try {
    await window.electronAPI.setApiKey(apiKey)
    await window.electronAPI.getScribeToken()
    return true
  } catch (error) {
    await window.electronAPI.setApiKey('') // Clear invalid key
    return false
  }
}

async function validateDeepgramKey(apiKey: string): Promise<boolean> {
  try {
    // Make test API call to Deepgram
    // This might need a new IPC handler
    await window.electronAPI.setDeepgramApiKey(apiKey)
    // Test connection
    const result = await window.electronAPI.testDeepgramConnection()
    return result.success
  } catch (error) {
    await window.electronAPI.setDeepgramApiKey('')
    return false
  }
}
```

**Permission Validation**:
```typescript
async function checkPermissions(): Promise<{
  accessibility: boolean
  microphone: boolean
}> {
  const accessibility = await window.electronAPI.checkAccessibilityPermissions()
  // Microphone check if available
  return { accessibility, microphone: true } // Placeholder
}
```

### Phase 5: Styling & Animation

**Cyberpunk Theming**:
- Use CSS variables from `cyberpunk-theme.css`
- Neon borders with `box-shadow` glow effects
- Gradient backgrounds: `linear-gradient(135deg, #00ffff, #ff00ff)`
- Text glow: `text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff`

**Animations**:
- Step transitions: Slide left/right with fade
- Card hover: Border glow intensifies
- Loading states: Neon pulse animation
- Success states: Checkmark animate-in with glow

**Responsive Layout**:
- Full-screen wizard (100vh)
- Centered content (max-width: 800px)
- Step indicator at top (dots or numbers)
- Navigation buttons at bottom (Back / Continue)

---

## 🎬 Navigation Flow

```
Step 1 (Welcome)
    ↓ [Get Started]
Step 2 (Engine Selection)
    ↓ [Continue] (after selection)
Step 3 (API Key + Validation)
    ↓ [Continue] (only after successful validation)
Step 4 (Claude CLI Check)
    ↓ [Continue] or [Skip]
Step 5 (Permissions)
    ↓ [Continue] (only when required permissions granted)
Step 6 (Success)
    ↓ [Start Transcribing]
Main App
```

**Back Navigation**:
- Steps 2-5: Show "Back" button
- Step 1: No back button
- Step 6: No back button (completion state)

**Skip Options**:
- Step 4 (Claude CLI): Can skip
- All other steps: Required

---

## 🚨 Error Handling

### API Key Validation Errors
- **Invalid Key**: "This API key is not valid. Please check and try again."
- **Network Error**: "Could not connect to {Provider}. Check your internet connection."
- **No Credits**: "This API key has no remaining credits. Please add credits or use a different key."
- **Rate Limited**: "Too many validation attempts. Please wait a moment and try again."

### Permission Errors
- **Already Requested**: "Please grant permission in System Settings"
- **Denied**: "Permission was denied. Neural Scribe needs this to function."

### Claude CLI Errors
- **Not Found**: Clear installation instructions
- **Not Authenticated**: Clear authentication instructions
- **Version Too Old**: "Please update Claude CLI to the latest version"

---

## 📱 User Experience Details

### Visual Feedback
- **Hover States**: Neon glow intensifies on cards/buttons
- **Active States**: Cyan/magenta border glow
- **Loading States**: Pulsing neon animation
- **Success States**: Green checkmark with glow animation
- **Error States**: Red border glow with shake animation

### Accessibility
- **Keyboard Navigation**: Tab through all interactive elements
- **Focus Indicators**: Neon cyan outline on focus
- **Screen Reader**: Proper ARIA labels and roles
- **Skip Links**: Allow skipping optional steps via keyboard

### Progress Indication
- **Step Indicator**: Dots or numbered steps at top
  - Completed: Filled cyan circle
  - Current: Pulsing magenta circle
  - Upcoming: Gray outline circle
- **Progress Bar**: Optional linear progress at very top (0-100%)

---

## ✅ Acceptance Criteria

### Must Have
- ✅ Neural Scribe branding (NOT ElevenLabs Transcription)
- ✅ Cyberpunk theme with cyan/magenta neon colors
- ✅ Engine selection (ElevenLabs or Deepgram)
- ✅ API key validation (blocks progression if fails)
- ✅ Help links to get API keys for both providers
- ✅ Claude CLI setup check
- ✅ Accessibility permission request
- ✅ Success screen with setup summary
- ✅ Mark `hasCompletedFirstLaunch` only after full completion
- ✅ Responsive design

### Nice to Have
- 🎨 Animated transitions between steps
- 🎨 Holographic effects on cards
- 🎨 Scanline overlay for authenticity
- 🎨 Success confetti animation
- 📝 Quick tips on final screen
- ⌨️ Full keyboard navigation

### Testing Checklist
- [ ] First launch shows wizard (fresh install)
- [ ] Can select ElevenLabs and validate key
- [ ] Can select Deepgram and validate key
- [ ] Invalid API key shows error and blocks progression
- [ ] Valid API key allows progression
- [ ] Claude CLI detection works correctly
- [ ] Can skip Claude CLI setup
- [ ] Accessibility permission request opens System Settings
- [ ] Permission status updates when granted
- [ ] Cannot proceed without required permissions
- [ ] Success screen shows correct summary
- [ ] Completing wizard marks `hasCompletedFirstLaunch` as true
- [ ] Subsequent launches skip wizard
- [ ] Test mode shows wizard every time

---

## 🛠️ Technical Notes

### Settings Keys Used
```typescript
{
  transcriptionEngine: 'elevenlabs' | 'deepgram',
  apiKey: string,  // ElevenLabs
  deepgramApiKey: string,  // Deepgram
  deepgramModel: string,  // Deepgram model choice
  promptFormattingEnabled: boolean,  // Based on Claude CLI availability
  hasCompletedFirstLaunch: boolean  // Marks wizard completion
}
```

### New IPC Handlers Needed
1. `test-deepgram-connection` - Validate Deepgram API key with test call
2. `get-media-access-status` - Check microphone permission (optional)

### Reusable Components
- Can reuse `CyberButton` component if it exists
- Can reuse neon card styles from other modals
- Can reuse form input styles with cyberpunk theme

---

## 📦 Files Summary

### New Files (8)
1. `src/components/onboarding/OnboardingWizard.tsx` - Main wizard
2. `src/components/onboarding/steps/WelcomeStep.tsx`
3. `src/components/onboarding/steps/EngineSelectionStep.tsx`
4. `src/components/onboarding/steps/ApiKeyStep.tsx`
5. `src/components/onboarding/steps/ClaudeCliStep.tsx`
6. `src/components/onboarding/steps/PermissionsStep.tsx`
7. `src/components/onboarding/steps/SuccessStep.tsx`
8. `src/components/onboarding/OnboardingWizard.css`

### Modified Files (4)
1. `src/App.tsx` - Replace ApiKeySetup with OnboardingWizard
2. `electron/main/ipc-handlers.ts` - Add Deepgram validation handler
3. `electron/preload/index.ts` - Expose new IPC methods
4. `src/components/ApiKeySetup.tsx` - Remove or deprecate

### Total Lines of Code (Estimated)
- New components: ~800-1000 lines
- Styles: ~300-400 lines
- IPC handlers: ~50-100 lines
- **Total: ~1,200-1,500 lines**

---

## 🎯 Implementation Priority

### Phase 1 - Core Structure (High Priority)
1. Create OnboardingWizard container
2. Create WelcomeStep
3. Create EngineSelectionStep
4. Wire up basic navigation

### Phase 2 - Validation (High Priority)
1. Create ApiKeyStep with validation
2. Add Deepgram test connection handler
3. Implement error handling

### Phase 3 - Additional Setup (Medium Priority)
1. Create ClaudeCliStep
2. Create PermissionsStep
3. Create SuccessStep

### Phase 4 - Polish (Low Priority)
1. Add animations
2. Add holographic effects
3. Refine responsive design
4. Add keyboard navigation

---

## 📝 Open Questions

1. **Microphone Permission**: Should we proactively request it in onboarding, or just show info that it will be requested on first recording?
   - **Recommendation**: Just show info card, request on first use

2. **Back Navigation**: Should users be able to go back and change engine selection after entering API key?
   - **Recommendation**: Allow back navigation, but warn if they've entered a valid key

3. **Skip All**: Should there be an "expert mode" to skip onboarding entirely?
   - **Recommendation**: No, but allow skipping optional steps (Claude CLI)

4. **Testing**: How should test mode interact with onboarding?
   - **Current**: Test mode shows wizard every time (hasCompletedFirstLaunch never set)
   - **Recommendation**: Keep current behavior

5. **Deepgram Models**: Should model selection be in onboarding or moved to Settings?
   - **Recommendation**: Keep in onboarding for immediate configuration

---

## 🎉 Success Metrics

After implementation:
- ✅ Zero confusion about app name/branding
- ✅ Users successfully set up transcription engine on first launch
- ✅ API keys are validated before user can proceed
- ✅ Clear guidance on how to obtain API keys
- ✅ All permissions granted upfront (no surprises later)
- ✅ Claude CLI setup is transparent and optional
- ✅ Cyberpunk theme creates strong brand identity
- ✅ Smooth, guided onboarding experience

---

**Ready for Review** ✨
