# Designing UI from Ideas: Stitch as Your Design Partner

**Use Case**: You have a PRD and feature list, but NO specific UI design yet
**Goal**: Use Google Stitch to explore, ideate, and create UI from scratch
**Approach**: Progressive refinement from vague ideas to polished designs

---

## The Real-World Scenario

Most product development looks like this:

```
✅ You Have:
- Product requirements (PRD)
- Feature list
- User stories
- Business goals
- Maybe a vague aesthetic direction

❌ You DON'T Have:
- Wireframes
- Mockups
- Color palette
- Specific component designs
- Layout structure
```

**The Question**: How do you go from requirements to UI using Stitch?

**The Answer**: Progressive Design Exploration (vague → specific)

---

## The Progressive Design Method

### Phase 1: High-Level Exploration (Broad Strokes)

Start with VERY general prompts based on PRD

### Phase 2: Concept Refinement (Pick Direction)

Generate 3-4 variations, choose best

### Phase 3: Detail Development (Specificity)

Add specific elements and refinements

### Phase 4: Polish & Consistency (Production Ready)

Finalize colors, spacing, states

---

## Example: Designing Neural Scribe from Scratch

Let's pretend we DON'T have the existing UI. We only have:

- PRD (requirements document)
- Feature inventory
- General idea: "AI voice transcription app for developers"

### Step 1: Extract Design Intent from PRD

**From PRD, identify**:

1. **Core Function**: Real-time voice transcription
2. **Primary Users**: Developers, tech-savvy users
3. **Key Feature**: Terminal integration
4. **Aesthetic**: Mentioned "cyberpunk" or "futuristic" (or not!)
5. **Platform**: Desktop app (Electron)
6. **Mood**: Professional but engaging

**Convert to Design Keywords**:

- Modern, technical
- Developer-focused
- Command-line aesthetic
- Real-time/live feeling
- Trust and precision
- Gamified elements

---

## Step 2: Initial Exploration Prompt (Very Broad)

**Goal**: Get Stitch to propose initial layouts and directions

### Exploration Prompt #1: Minimalist Direction

```
Design a desktop application for voice transcription targeted at developers.

Platform: Desktop app (1200px wide)
Purpose: Real-time speech-to-text with terminal integration
Users: Software developers, technical users

Key features to include:
- Voice recording control (start/stop)
- Live transcript display area
- Button to send transcript to terminal
- Visual indicator of recording status

Style direction: Clean, modern, developer-focused
Color preference: Dark mode friendly
Feel: Professional, efficient, technical

Generate a main screen layout showing these core features.
```

**What Stitch Will Do**:

- Propose a layout structure
- Suggest component arrangement
- Choose a color scheme
- Create initial visual direction

**Expected Output**:

- You'll get a full screen design
- It might not be perfect, but it shows POSSIBILITIES
- Use this to evaluate direction

---

### Exploration Prompt #2: Bold Direction

```
Design a desktop application for voice transcription with a bold, futuristic aesthetic.

Platform: Desktop app (1200px wide)
Purpose: Real-time speech-to-text for developers
Users: Tech enthusiasts, early adopters

Key features:
- Recording visualization (make it prominent and eye-catching)
- Live transcript area
- Terminal paste action
- Gamification elements (level, progress)

Style direction: Futuristic, cyberpunk-inspired, neon accents
Color preference: Dark theme with vibrant highlights
Feel: Exciting, cutting-edge, engaging

Show a main screen with these elements arranged creatively.
```

**What This Explores**:

- Different aesthetic approach
- More visual prominence
- Emphasis on engagement vs. efficiency

---

### Exploration Prompt #3: Balanced Direction

```
Design a desktop voice transcription app balancing professionalism and visual appeal.

Platform: Desktop app
Purpose: Speech-to-text for developers with AI formatting

Core elements needed:
- Recording control (prominent but not overwhelming)
- Transcript editor (primary focus area)
- Terminal integration button
- Status indicators

Style: Modern professional with subtle tech aesthetic
Theme: Dark mode with tasteful accent colors
Priority: Clarity and usability over flashiness

Create a main window layout.
```

---

## Step 3: Compare and Choose Direction

**Generate all 3 prompts** (uses ~3 generations)

**Evaluation Criteria**:

- Which feels right for your brand?
- Which layout makes most sense?
- Which color direction resonates?
- Which would users prefer?

**Decision Example**:
"Prompt #2 (bold/cyberpunk) resonates best, but the layout from Prompt #1 is clearer. Let's combine: cyberpunk aesthetic with clean layout."

---

## Step 4: Refine Chosen Direction

Now that you have a direction, get MORE specific:

### Refinement Prompt (Adding Details)

```
Design the main window for Neural Scribe, an AI voice transcription desktop app.

Platform: Desktop (1200px × 800px)
Style: Cyberpunk-inspired with neon accents, dark theme
Users: Developers

LAYOUT STRUCTURE (from exploration):
- Top: Header bar with app branding and controls
- Center: Large visual element for recording status
- Middle: Transcript editing area
- Bottom: Action buttons and keyboard shortcuts

SPECIFIC REQUIREMENTS:
Visual Recording Indicator:
- Make this prominent and animated-looking
- Should be the focal point when recording
- Suggest: Circular orb or waveform visualization
- Use bright accent color

Transcript Area:
- Editable text area
- Show both live updates and final text
- Dark background, light text
- Monospace or code-friendly font

Action Buttons:
- "Start Recording" (primary action)
- "Paste to Terminal" (secondary)
- Clear/copy utilities

Header Elements:
- App name/logo
- Microphone selector
- Settings access

Color Palette:
- Primary accent: Bright cyan or electric blue
- Secondary: Complementary accent (suggest options)
- Background: Very dark (near black)
- Text: High contrast white

Generate this screen with these specifications.
```

**What Changed**:

- Much more specific layout
- Exact feature placement
- Still lets Stitch make design decisions
- You're collaborating, not dictating

---

## Step 5: Iterative Detailing

Based on the refined design:

### Detail Iteration Examples

**If the orb looks wrong**:

```
"Make the recording orb larger (300px), add a gradient from cyan to purple, increase the glow effect"
```

**If colors need adjustment**:

```
"Change the primary accent from blue to cyan (#00e5ff), add a secondary magenta accent (#ff00aa) for highlights"
```

**If layout needs tweaking**:

```
"Move the transcript area down by 50px, increase its height to 250px"
```

**If missing elements**:

```
"Add a footer bar showing keyboard shortcuts: 'Cmd+Shift+R to record, Cmd+Shift+V to paste'"
```

---

## The Key Differences: Ideas vs. Specifications

### When You Have Existing UI (Specifications Approach)

```
Prompt Style: DESCRIPTIVE (recreating what exists)

"Design a mobile login screen with:
- Logo at top (centered, 80px)
- Email input at y-position 200px
- Password input below with eye icon
- Blue button (#0066CC) at bottom, 48px height, rounded 8px
- 'Forgot password' link, 12px, gray
..."
```

You're giving Stitch **exact instructions** to recreate a design.

---

### When Starting from Ideas (Exploration Approach)

```
Prompt Style: COLLABORATIVE (exploring possibilities)

"Design a mobile login screen for a fitness app.

Users: Health-conscious millennials
Feel: Motivational, energetic, friendly

Must include:
- Email and password login
- Social login options
- Forgot password recovery

Style direction: Modern, clean with vibrant energy
Color preference: Warm, motivating colors

Let Stitch suggest the layout and visual treatment."
```

You're giving Stitch **intent and requirements**, letting it propose solutions.

---

## Real Example: Designing a Feature from Scratch

**Scenario**: You need to design the "Gamification Stats" screen, but you have NO existing design. Only the PRD feature requirements.

### From PRD:

```
Feature: Gamification System
- Track user stats (words, time, sessions, streak)
- Show current level and XP
- Display unlockable achievements
- Motivate continued usage
```

### Exploration Prompt (Very Open)

```
Design a gamification stats screen for a desktop app showing user progress.

Platform: Modal window (600px × 700px)
Style: [Match your app's aesthetic - e.g., "cyberpunk" or "modern minimal"]

Information to display:
- Current level and experience points
- Progress to next level (visual progress bar)
- Key statistics: total words transcribed, recording time, number of sessions, daily streak
- Achievement count

User goal: Feel proud of progress, motivated to continue

Make this visually engaging and celebratory (but not childish).
Show statistics in an organized, scannable way.
```

**What Stitch Will Propose**:

- A layout structure (cards, grid, vertical flow?)
- Visual hierarchy (what's prominent?)
- Color scheme for data visualization
- Progress indicator design

**You Receive**:

- Complete design to evaluate
- May love it as-is, or iterate
- Now you have a starting point

---

### Refinement After Seeing Initial

```
"I like the layout, but make these changes:
- Make the level badge circular instead of rectangular
- Move the XP progress bar to directly below the level (more prominent)
- Arrange the 4 stat cards in a 2×2 grid instead of horizontal row
- Add icons to each stat card (emoji or simple icons)
- Use a gradient on the XP progress bar (cyan to green)"
```

---

## Template: PRD Feature → Stitch Prompt

**For ANY feature**, use this formula:

```
Design a [screen type] for [app name] - [app purpose].

Platform: [Mobile/Desktop, size]
Style: [Aesthetic direction from brand]

FEATURE PURPOSE:
[What this screen accomplishes]

MUST INCLUDE:
- [Required element 1]
- [Required element 2]
- [Required element 3]

USER CONTEXT:
- Who uses this: [user persona]
- When they use it: [usage scenario]
- What they need: [user goal]

DESIGN DIRECTION:
- Feel: [adjectives - e.g., trustworthy, exciting, minimal]
- Priority: [what matters most - e.g., clarity, speed, emotion]
- Constraints: [any limitations - e.g., must work on small screens]

[Optional: visual reference]
Similar to: [reference apps/sites if helpful]
```

---

## Examples for Different Features

### Example 1: Settings Screen (No Existing Design)

**From PRD**: "Users can configure hotkeys, enable/disable features, manage API keys"

**Exploration Prompt**:

```
Design a settings screen for a developer tool desktop app.

Platform: Modal (700px × 600px)
Style: Technical, organized, professional

Settings categories needed:
- Keyboard shortcuts configuration
- Feature toggles (formatting, voice commands)
- API key management
- Privacy options

Users: Developers who value efficiency
Priority: Quick navigation, clear organization

Design approach: Use tabs or sidebar for categories, form controls for settings

Make it feel organized and trustworthy (handling sensitive data).
```

---

### Example 2: Dashboard (No Existing Design)

**From PRD**: "Show user their transcription activity, recent history, quick actions"

**Exploration Prompt**:

```
Design a dashboard home screen for a voice transcription app.

Platform: Desktop main window (1200px × 800px)
Style: Modern, clean, efficient

Key information to show:
- Quick start recording button (prominent)
- Recent transcriptions (list or cards)
- Activity summary (words transcribed today/week)
- Quick access to settings

User need: Jump into recording quickly, see recent work

Layout priority:
1. Easy access to start recording
2. Glanceable recent activity
3. Quick navigation to other features

Feel: Productive, uncluttered, welcoming
```

---

## Advanced Technique: Mood Board Prompting

If you don't even have an aesthetic direction:

### Prompt for Style Exploration

```
Design the main screen of a voice transcription app in THREE different styles.

Core features (same for all):
- Recording control
- Live transcript area
- Action buttons

STYLE 1: Minimalist Professional
- Clean, minimal, lots of white space
- Neutral colors
- Clear hierarchy

STYLE 2: Vibrant Modern
- Bold colors, gradients
- Playful but professional
- Energetic feel

STYLE 3: Dark Technical
- Dark theme, neon accents
- Developer/hacker aesthetic
- Futuristic elements

Generate one screen showing Style [1/2/3].
```

**Run this 3 times** (once per style) to compare directions.

---

## What Stitch CAN Figure Out for You

When you start from ideas, Stitch can propose:

✅ **Layout Structure**:

- Where components should go
- Visual hierarchy
- Spacing and proportions

✅ **Color Palette**:

- Harmonious color combinations
- Accent colors
- Text contrast

✅ **Component Design**:

- Button styles
- Input fields
- Card designs
- Icons (emoji or simple graphics)

✅ **Visual Style**:

- Modern vs. classic
- Minimal vs. rich
- Formal vs. playful

✅ **Information Architecture**:

- How to organize content
- What to emphasize
- Grouping related items

---

## What You Still Need to Provide

Even when exploring, you should specify:

🎯 **Platform & Size**: Mobile? Desktop? Dimensions?

🎯 **Core Features**: What MUST be on the screen?

🎯 **User Context**: Who uses this and why?

🎯 **General Aesthetic**: At least a direction (modern, playful, serious, etc.)

🎯 **Constraints**: Any technical or brand limitations

---

## Iterative Discovery Process

**The reality of designing from ideas**:

```
Round 1: "Design a stats dashboard"
→ Get initial layout, evaluate

Round 2: "I like the card layout but make stats more prominent"
→ Refine emphasis

Round 3: "Add data visualization (progress bars and charts)"
→ Enhance with details

Round 4: "Adjust colors to match brand (cyan and magenta)"
→ Apply branding

Round 5: "Increase spacing between cards, add icons"
→ Polish
```

This is **NORMAL** and **EXPECTED**. You're collaborating with Stitch to discover the design.

---

## Example: Complete Flow from PRD to Design

### Starting Point: PRD Excerpt

```
Feature: Overlay Window
Users need a floating window that shows recording status without switching apps.

Requirements:
- Always on top of other windows
- Shows live transcript preview
- Displays recording timer
- Shows voice command hints
- Minimal, non-intrusive design
```

### Step 1: Initial Exploration

**Prompt**:

```
Design a floating overlay window for a voice transcription app.

Platform: Small floating window (300px × 200px)
Users: Developers working in terminal/IDE

Must show:
- Recording status indicator
- Live word count
- Recording timer
- Voice command hints

Design goals:
- Non-intrusive but visible
- Quick glanceability
- Works over dark and light backgrounds

Style: Minimal, compact, efficient
```

**Result**: Initial design with layout proposal

---

### Step 2: Evaluate and Refine

**Feedback**: "Too cluttered, make it simpler. Timer should be most prominent."

**Refinement Prompt**:

```
Simplify the overlay design:
- Make timer LARGE and centered (focus point)
- Reduce voice command hints to small text at bottom
- Add subtle recording pulse indicator
- Use frosted glass background effect
```

---

### Step 3: Add Visual Polish

**Refinement Prompt**:

```
Enhance the visual design:
- Add a small animated orb/waveform at the top
- Use cyan accent color for timer
- Make background semi-transparent with blur
- Add subtle neon glow to border
```

---

### Final Result

Complete overlay design created through 3-4 iterations, starting from just requirements!

---

## Common Patterns for Different Screen Types

### Main Application Screen

**Formula**:

```
"Design a [app type] main screen for [purpose].

Core actions:
- [Primary action - make prominent]
- [Secondary actions]

Information display:
- [Key data 1]
- [Key data 2]

Users prioritize: [user goal]
Style: [aesthetic direction]"
```

---

### Modal/Dialog

**Formula**:

```
"Design a modal for [specific task].

Size: [dimensions]
Users need to:
- [Task 1]
- [Task 2]

Form elements: [inputs, buttons, etc.]
Outcome: [what happens after]
Feel: [emotional tone]"
```

---

### List/Feed Screen

**Formula**:

```
"Design a [list/feed] screen showing [content type].

Platform: [size]
Each item displays:
- [Field 1]
- [Field 2]
- [Actions available]

Sorting/filtering: [if applicable]
Empty state: [what shows when no items]
Style: [visual direction]"
```

---

### Settings/Configuration

**Formula**:

```
"Design a settings screen with [number] categories.

Categories:
1. [Category 1] - [what it controls]
2. [Category 2] - [what it controls]

Controls needed:
- Toggles, inputs, dropdowns, etc.

Organization: [tabs, sidebar, accordion]
Priority: [clarity, quick access, safety]"
```

---

## Dos and Don'ts: Designing from Ideas

### ✅ DO:

**Start Broad**:

- Let Stitch propose initial directions
- Don't over-specify initially
- Explore multiple approaches

**Provide Context**:

- Explain user needs
- Describe use cases
- Set emotional tone

**Iterate Progressively**:

- Rough layout first
- Then colors
- Then details
- Then polish

**Generate Variations**:

- Try 3-4 different approaches
- Compare and combine best parts

**Trust the Process**:

- First generation won't be perfect
- Plan for 4-6 iterations per screen

---

### ❌ DON'T:

**Over-Specify Too Early**:

- Don't dictate exact pixel positions initially
- Don't lock in colors before seeing layout
- Don't detail every element in first prompt

**Combine Everything**:

- Don't try to design multiple screens at once
- Don't request 10 features in one prompt
- Focus on one screen at a time

**Expect Perfection**:

- First design will need refinement
- Some elements may not work
- Iteration is necessary

**Ignore User Context**:

- Don't just list features
- Explain WHY users need them
- Describe WHEN they're used

---

## Measuring Success: From Ideas to Designs

**You've succeeded when**:

✅ Layout makes sense for user workflows
✅ Visual hierarchy guides attention correctly
✅ All required features are present
✅ Aesthetic matches brand direction
✅ Design feels cohesive and intentional
✅ You're excited to implement it

**You may need more iteration if**:

⚠️ Layout feels cramped or unbalanced
⚠️ Colors clash or lack harmony
⚠️ Important features are de-emphasized
⚠️ Design feels generic/templated
⚠️ Missing required functionality
⚠️ Doesn't match user needs

---

## Real-World Timeline: Ideas to Designs

**Realistic Expectations**:

**Week 1: Exploration Phase**

- Day 1-2: Generate 3-4 style directions for main screen
- Day 3-4: Choose direction, refine main screen
- Day 5: Apply chosen style to 2-3 key screens

**Week 2: Development Phase**

- Day 1-2: Design remaining screens with established style
- Day 3-4: Iterate on details and consistency
- Day 5: Polish and create design system documentation

**Total**: ~10 days of design exploration with Stitch

**Generations Used**: ~100-150 (well within Standard mode limit)

---

## Example Session: Designing a Feature You Don't Have

Let's say your PRD mentions a "Smart Templates" feature you haven't designed:

**PRD Says**:

```
Feature: Smart Templates
Allow users to save frequently used prompts as templates.
Users can create, edit, delete templates.
Quick access during recording.
```

**You Have**: Just these requirements

**Session Plan**:

**Iteration 1: Explore Layout**

```
"Design a template management screen for a voice transcription app.

Users need to:
- View saved templates
- Create new templates
- Edit existing templates
- Quickly insert templates during recording

Make this efficient and organized.
Platform: Desktop modal (600px × 500px)"
```

**Iteration 2: Refine Based on Output**

```
"Adjust the template list to use cards instead of rows.
Add a search/filter bar at top.
Make the 'Create New' button more prominent.
Show template preview on hover."
```

**Iteration 3: Add Details**

```
"Add these elements to each template card:
- Template name (editable inline)
- Preview of template text (first 50 characters)
- Usage count badge
- Edit and delete icons

Use [your brand colors]."
```

**Iteration 4: Polish**

```
"Refine spacing between cards (increase to 20px).
Add a subtle hover effect (lift and shadow).
Make the search bar autofocus when modal opens.
Add empty state: 'No templates yet. Create your first template!'"
```

**Result**: Complete feature design in 4 iterations from just requirements!

---

## Key Insight: Stitch as Design Partner

**Think of it this way**:

Traditional Design:

```
You (Designer) → Think → Sketch → Mockup → Iterate
```

With Stitch from Ideas:

```
You (Product) → Describe → Stitch Proposes → You Evaluate → Refine Together
```

**Stitch becomes your design collaborator**, not just a tool.

You bring:

- Requirements
- User knowledge
- Strategic vision
- Feature priorities

Stitch brings:

- Layout expertise
- Visual design skills
- Color theory
- UI patterns

Together you create the UI.

---

## Conclusion: Yes, You Can Start from Just Ideas!

**The Answer**: Absolutely YES, you can design with Stitch starting from just a PRD and feature list.

**The Approach**: Progressive refinement

1. Start with broad exploration prompts
2. Generate variations to compare
3. Choose a direction
4. Iterate with increasing specificity
5. Polish and perfect

**The Mindset**: Collaboration, not dictation

- You guide the direction
- Stitch proposes solutions
- You evaluate and refine
- Together you discover the design

**The Reality**: Plan for iteration

- First try won't be perfect
- 4-6 iterations per screen is normal
- Total timeline: 1-2 weeks for full app
- Generation usage: 100-200 for complex app

**The Power**: Democratized Design

- No need for design skills
- No need for existing mockups
- Start from requirements
- End with polished UI

---

## Quick Reference: PRD to Prompt Translation

| PRD Says                        | Your Prompt Should Include                                                 |
| ------------------------------- | -------------------------------------------------------------------------- |
| "Users can configure settings"  | "Design a settings screen with [categories]. Users need to [actions]."     |
| "Dashboard shows user activity" | "Design a dashboard displaying [metrics]. Prioritize [key info]."          |
| "Gamification motivates users"  | "Design a progress screen showing [stats]. Feel: motivating, celebratory." |
| "Mobile-first responsive"       | "Design a mobile screen (375px). Must work on small screens."              |
| "Professional brand image"      | "Style: Professional, trustworthy, modern. Avoid playful elements."        |
| "Target: developers"            | "Users: Developers. Use technical aesthetic, monospace fonts."             |

---

**Bottom Line**: Stitch excels at transforming vague ideas into concrete designs through iterative collaboration. You don't need detailed specifications - just clear requirements and willingness to iterate!

---

**Document Version**: 1.0
**Created**: December 20, 2025
**Purpose**: Guide for designing UI from ideas using Google Stitch
