import { tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import fs from "fs";
import path from "path";

// Comprehensive Google Stitch knowledge base extracted from research
const STITCH_KNOWLEDGE = {
  modes: {
    standard: {
      name: "Standard Mode (Gemini 2.5 Flash)",
      features: [
        "Fast, lightweight design generation",
        "Up to 350 generations per month",
        "Text-to-UI conversion",
        "Figma export available",
        "Ideal for quick iterations"
      ],
      bestFor: "Quick iterations and basic UI concepts"
    },
    experimental: {
      name: "Experimental Mode (Gemini 2.5 Pro)",
      features: [
        "Higher-quality, detailed designs",
        "Up to 50 generations per month",
        "Image input support (sketches, wireframes)",
        "Better for complex designs",
        "More accurate interpretation"
      ],
      bestFor: "Complex, visually-guided designs"
    }
  },

  promptingBestPractices: [
    {
      category: "Essential Prompt Elements",
      tips: [
        "Platform Specification: Specify 'mobile app' or 'web interface'",
        "Design Style: Use descriptors like minimalistic, modern, corporate, playful",
        "Screen Purpose: Clearly state (login, dashboard, homepage, checkout)",
        "Core Components: List specific UI elements needed",
        "Layout Details: Describe arrangement and hierarchy"
      ]
    },
    {
      category: "Key Principles",
      tips: [
        "Be clear & concise - Avoid ambiguity in requests",
        "Use UI/UX keywords like 'navigation bar', 'call-to-action', 'card layout'",
        "One major change at a time - Prevents layout destruction",
        "Be specific about changes with exact colors and measurements",
        "Describe imagery style clearly",
        "Reference real-world examples from known apps",
        "Iterate & experiment - Design is iterative",
        "Avoid prompts over 5,000 characters"
      ]
    },
    {
      category: "Theme Control",
      tips: [
        "Colors: Use specific hex values or mood-based descriptions",
        "Typography: Specify font families and weights",
        "Elements: Define border radius, shadows, spacing",
        "Images: Describe style and coordinate with theme"
      ]
    }
  ],

  commonPitfalls: [
    "Vague prompts lead to generic results",
    "Multiple changes in one prompt destroys previous layout",
    "Prompts over 5,000 characters cause component omissions",
    "Not saving screenshots after successful iterations",
    "Forgetting to specify platform (mobile vs web)"
  ],

  perfectUseCases: [
    "Rapid prototyping and early-stage ideation",
    "Design exploration and testing variations",
    "Client presentations with visual mockups",
    "Developer handoff with starter code",
    "Learning and education in UI/UX design",
    "Wireframe to digital design conversion"
  ],

  limitations: [
    "Generic visual design - designs look similar",
    "Accessibility issues requiring manual review",
    "Limited to 2-3 screens per generation",
    "Static layouts (not responsive by default)",
    "No interactive prototypes",
    "Performance: 2-3 minute generation time"
  ],

  exportOptions: {
    figma: {
      availability: "Standard mode only",
      process: "Click 'Copy to Figma' → Paste in Figma",
      benefits: "Editable layers, not flattened",
      limitations: "Not available in Experimental mode"
    },
    htmlCss: {
      availability: "Both modes",
      technology: "Tailwind CSS via CDN",
      process: "Click design → Code tab → Copy",
      limitations: "Static code, single viewport, no interactivity"
    }
  },

  promptTemplates: {
    basic: "Design a [platform] [screen type] for [purpose]. Use [style] aesthetic with [color] as primary color. Include: [components list]",
    detailed: "Create a [platform] [screen type] for [audience/use case]. Style: [adjectives]. Layout: [description]. Components: [detailed list]. Colors: [palette]. Ensure [requirements].",
    iteration: "Update the [element] by [specific change]. Make [measurement/color] exactly [value]."
  }
};

// Tool 1: Get comprehensive best practices
const getBestPractices = tool(
  "get_stitch_best_practices",
  "Get comprehensive best practices for using Google Stitch effectively based on research and user experiences",
  {
    category: z.enum(["all", "prompting", "modes", "export", "limitations"]).optional()
      .describe("Filter by specific category")
  },
  async (args) => {
    const { category = "all" } = args;

    let response = "# Google Stitch Best Practices\n\n";

    if (category === "all" || category === "modes") {
      response += "## Modes\n";
      response += `**${STITCH_KNOWLEDGE.modes.standard.name}**\n`;
      response += `Best for: ${STITCH_KNOWLEDGE.modes.standard.bestFor}\n`;
      response += "Features:\n" + STITCH_KNOWLEDGE.modes.standard.features.map(f => `- ${f}`).join("\n") + "\n\n";
      response += `**${STITCH_KNOWLEDGE.modes.experimental.name}**\n`;
      response += `Best for: ${STITCH_KNOWLEDGE.modes.experimental.bestFor}\n`;
      response += "Features:\n" + STITCH_KNOWLEDGE.modes.experimental.features.map(f => `- ${f}`).join("\n") + "\n\n";
    }

    if (category === "all" || category === "prompting") {
      response += "## Prompting Best Practices\n\n";
      for (const section of STITCH_KNOWLEDGE.promptingBestPractices) {
        response += `### ${section.category}\n`;
        response += section.tips.map(t => `- ${t}`).join("\n") + "\n\n";
      }
    }

    if (category === "all" || category === "export") {
      response += "## Export Options\n\n";
      response += `**Figma Export**: ${STITCH_KNOWLEDGE.exportOptions.figma.availability}\n`;
      response += `Process: ${STITCH_KNOWLEDGE.exportOptions.figma.process}\n\n`;
      response += `**HTML/CSS Export**: ${STITCH_KNOWLEDGE.exportOptions.htmlCss.availability}\n`;
      response += `Technology: ${STITCH_KNOWLEDGE.exportOptions.htmlCss.technology}\n\n`;
    }

    if (category === "all" || category === "limitations") {
      response += "## Limitations & Considerations\n";
      response += STITCH_KNOWLEDGE.limitations.map(l => `- ${l}`).join("\n") + "\n\n";
      response += "## Common Pitfalls to Avoid\n";
      response += STITCH_KNOWLEDGE.commonPitfalls.map(p => `- ${p}`).join("\n") + "\n";
    }

    return {
      content: [{
        type: "text" as const,
        text: response
      }]
    };
  }
);

// Tool 2: Get expert prompt guidance
const getPromptGuidance = tool(
  "get_prompt_guidance",
  "Get expert advice on crafting effective design prompts for Google Stitch with examples and templates",
  {
    design_goal: z.string().describe("What design do you want Stitch to create?"),
    current_prompt: z.string().optional().describe("Your current prompt (if any)"),
    complexity: z.enum(["simple", "moderate", "complex"]).optional()
      .describe("Complexity level of the design")
  },
  async (args) => {
    const { design_goal, current_prompt, complexity = "moderate" } = args;

    let guidance = `# Prompt Guidance for: "${design_goal}"\n\n`;

    // Analyze design goal
    guidance += "## Analysis\n";
    const platform = design_goal.toLowerCase().includes("mobile") || design_goal.toLowerCase().includes("app")
      ? "mobile" : "web";
    guidance += `- Detected platform: ${platform}\n`;
    guidance += `- Complexity level: ${complexity}\n\n`;

    // Provide template
    guidance += "## Recommended Prompt Template\n";
    const template = complexity === "simple"
      ? STITCH_KNOWLEDGE.promptTemplates.basic
      : STITCH_KNOWLEDGE.promptTemplates.detailed;
    guidance += `\`\`\`\n${template}\n\`\`\`\n\n`;

    // Essential checklist
    guidance += "## Essential Elements Checklist\n";
    guidance += "- [ ] Platform specified (mobile/web)\n";
    guidance += "- [ ] Design style described (minimalist, modern, etc.)\n";
    guidance += "- [ ] Screen purpose clear\n";
    guidance += "- [ ] Core components listed\n";
    guidance += "- [ ] Layout structure described\n";
    guidance += "- [ ] Color palette specified\n";
    guidance += "- [ ] Target audience mentioned (if relevant)\n\n";

    // Analyze current prompt if provided
    if (current_prompt) {
      guidance += "## Current Prompt Analysis\n";
      guidance += `Your current prompt: "${current_prompt}"\n\n`;
      guidance += "### Identified Strengths:\n";
      const strengths = [];
      if (current_prompt.toLowerCase().includes("mobile") || current_prompt.toLowerCase().includes("web")) {
        strengths.push("✓ Platform specified");
      }
      if (current_prompt.match(/#[0-9a-fA-F]{6}/)) {
        strengths.push("✓ Specific color values included");
      }
      if (current_prompt.split(" ").length > 15) {
        strengths.push("✓ Good level of detail");
      }
      guidance += strengths.length > 0 ? strengths.join("\n") + "\n\n" : "No major strengths detected\n\n";

      guidance += "### Improvement Suggestions:\n";
      const improvements = [];
      if (!current_prompt.toLowerCase().includes("mobile") && !current_prompt.toLowerCase().includes("web")) {
        improvements.push("- Add platform specification (mobile app or web interface)");
      }
      if (!current_prompt.match(/#[0-9a-fA-F]{6}/)) {
        improvements.push("- Include specific color hex values instead of color names");
      }
      if (!current_prompt.toLowerCase().match(/minimalist|modern|playful|corporate|bold/)) {
        improvements.push("- Add style descriptors (minimalist, modern, playful, etc.)");
      }
      if (current_prompt.split(" ").length < 10) {
        improvements.push("- Add more specific details about components and layout");
      }
      if (current_prompt.length > 5000) {
        improvements.push("⚠️ WARNING: Prompt too long (>5000 chars) - may cause component omissions");
      }
      guidance += improvements.join("\n") + "\n\n";
    }

    // Best practices reminder
    guidance += "## Key Best Practices\n";
    guidance += "1. Be specific with measurements and colors\n";
    guidance += "2. Use UI/UX terminology (navbar, CTA, hero section)\n";
    guidance += "3. Reference real-world examples when possible\n";
    guidance += "4. Make one major change at a time when iterating\n";
    guidance += "5. Save screenshots after successful generations\n\n";

    // Example
    guidance += "## Example Prompt (Based on Your Goal)\n";
    guidance += `\`\`\`\nDesign a ${platform} ${design_goal.toLowerCase().includes("login") ? "login screen" : "interface"} `;
    guidance += "with a modern, minimalist aesthetic. ";
    guidance += "Primary color: #0066CC (blue). ";
    guidance += "Include: top navigation bar, hero section, ";
    guidance += platform === "mobile" ? "bottom tab navigation. " : "sidebar navigation. ";
    guidance += "Use clean white background with subtle card shadows (4px blur).\n\`\`\`\n";

    return {
      content: [{
        type: "text" as const,
        text: guidance
      }]
    };
  }
);

// Tool 3: Mode recommendation
const recommendMode = tool(
  "recommend_stitch_mode",
  "Recommend whether to use Standard or Experimental mode based on design requirements",
  {
    has_sketch: z.boolean().describe("Do you have a sketch or wireframe to upload?"),
    needs_figma: z.boolean().describe("Do you need Figma export?"),
    design_complexity: z.enum(["simple", "moderate", "complex"])
      .describe("How complex is the design?"),
    iteration_count: z.number().optional()
      .describe("How many iterations do you expect to make?")
  },
  async (args) => {
    const { has_sketch, needs_figma, design_complexity, iteration_count = 5 } = args;

    let recommendation = "# Mode Recommendation\n\n";

    // Decision logic
    let recommendedMode = "standard";
    const reasons = [];

    if (has_sketch) {
      recommendedMode = "experimental";
      reasons.push("You have a sketch/wireframe - Experimental mode supports image input");
    }

    if (needs_figma) {
      if (recommendedMode === "experimental") {
        recommendation += "⚠️ **Conflict Detected**: You need Figma export but also have a sketch.\n";
        recommendation += "- Figma export is ONLY available in Standard mode\n";
        recommendation += "- Experimental mode is needed for sketch input\n\n";
        recommendation += "**Suggested Workflow**:\n";
        recommendation += "1. Use Experimental mode to convert sketch to design\n";
        recommendation += "2. Note the design details\n";
        recommendation += "3. Switch to Standard mode and recreate with text prompt\n";
        recommendation += "4. Export to Figma\n\n";
      } else {
        recommendedMode = "standard";
        reasons.push("Figma export needed - ONLY available in Standard mode");
      }
    }

    if (design_complexity === "complex" && recommendedMode !== "experimental") {
      if (iteration_count < 10) {
        reasons.push("Complex design benefits from Experimental mode's higher quality");
        recommendation += "💡 **Consider**: Complex designs may benefit from Experimental mode's better quality\n\n";
      }
    }

    if (iteration_count > 20) {
      if (recommendedMode === "experimental") {
        recommendation += "⚠️ **Monthly Limit Warning**: Experimental mode has only 50 generations/month\n";
        recommendation += `With ${iteration_count} expected iterations, you may want to use Standard mode (350/month)\n\n`;
      } else {
        reasons.push(`High iteration count (${iteration_count}) - Standard mode has 350 generations/month`);
      }
    }

    // Final recommendation
    recommendation += `## Recommended Mode: **${recommendedMode.toUpperCase()}**\n\n`;
    recommendation += "### Reasons:\n";
    recommendation += reasons.map(r => `- ${r}`).join("\n") + "\n\n";

    // Mode details
    const modeInfo = recommendedMode === "standard"
      ? STITCH_KNOWLEDGE.modes.standard
      : STITCH_KNOWLEDGE.modes.experimental;

    recommendation += `### ${modeInfo.name}\n`;
    recommendation += `**Best for**: ${modeInfo.bestFor}\n\n`;
    recommendation += "**Features**:\n";
    recommendation += modeInfo.features.map(f => `- ${f}`).join("\n") + "\n\n";

    // Monthly allowance tracking
    recommendation += "### Monthly Allowance\n";
    recommendation += `- Standard mode: 350 generations/month\n`;
    recommendation += `- Experimental mode: 50 generations/month\n`;
    recommendation += `\nWith ${iteration_count} iterations, you'll use ${(iteration_count/350*100).toFixed(1)}% (Standard) or ${(iteration_count/50*100).toFixed(1)}% (Experimental) of monthly quota.\n`;

    return {
      content: [{
        type: "text" as const,
        text: recommendation
      }]
    };
  }
);

// Tool 4: Troubleshoot common issues
const troubleshootIssue = tool(
  "troubleshoot_stitch_issue",
  "Help troubleshoot common Google Stitch issues and provide solutions",
  {
    issue_description: z.string().describe("Describe the issue you're experiencing"),
    issue_category: z.enum([
      "generic_output",
      "accessibility",
      "colors_wrong",
      "layout_broken",
      "missing_components",
      "slow_generation",
      "export_problems",
      "other"
    ]).optional().describe("Category of issue if known")
  },
  async (args) => {
    const { issue_description, issue_category } = args;

    let response = "# Troubleshooting Guide\n\n";
    response += `**Issue**: ${issue_description}\n\n`;

    // Known issues and solutions
    const solutions: Record<string, { diagnosis: string; solutions: string[] }> = {
      generic_output: {
        diagnosis: "Stitch is generating designs that look too similar or generic",
        solutions: [
          "Add more specific style descriptors beyond basic terms",
          "Include reference examples from real apps/websites",
          "Specify unique visual elements (custom icons, illustrations)",
          "Use exact color hex values instead of color names",
          "Describe specific typography choices (font families, weights)",
          "Include brand personality descriptors (playful, sophisticated, energetic)",
          "Note: This is a known limitation - Stitch tends toward common patterns"
        ]
      },
      accessibility: {
        diagnosis: "Generated designs have accessibility issues",
        solutions: [
          "ALWAYS manually review for WCAG compliance",
          "Check color contrast with WebAIM Contrast Checker",
          "Verify touch target sizes (minimum 44x44px for mobile)",
          "Add ARIA labels in exported code",
          "Ensure keyboard navigation support",
          "Include alt text for images",
          "Note: Accessibility review is REQUIRED - Stitch doesn't ensure compliance"
        ]
      },
      colors_wrong: {
        diagnosis: "Colors don't match requirements or brand guidelines",
        solutions: [
          "Use specific hex values: 'Primary color: #0066CC' not 'blue'",
          "Specify secondary and accent colors explicitly",
          "Mention color application: 'Use #0066CC for all CTA buttons'",
          "Include color contrast requirements",
          "Reference color palette in every iteration",
          "Make color changes one at a time to avoid layout reset"
        ]
      },
      layout_broken: {
        diagnosis: "Layout gets destroyed or components disappear",
        solutions: [
          "Make ONE major change at a time - this is critical",
          "Don't combine multiple requests in a single prompt",
          "Save screenshot before making changes",
          "Use specific element targeting: 'Update the header button' not 'improve the design'",
          "If layout breaks, start fresh with a complete prompt",
          "Avoid prompts over 5,000 characters"
        ]
      },
      missing_components: {
        diagnosis: "Some components are missing or omitted from the design",
        solutions: [
          "Check prompt length - over 5,000 characters causes omissions",
          "Break complex requests into sequential prompts",
          "List components explicitly in bullet points",
          "Verify component names are clear UI terms",
          "Use Standard mode for better component consistency",
          "Generate multiple variations to compare"
        ]
      },
      slow_generation: {
        diagnosis: "Generation is taking too long (>3 minutes)",
        solutions: [
          "This is normal - expect 2-3 minutes per generation",
          "Use Standard mode for faster results",
          "Simplify complex prompts",
          "Check internet connection stability",
          "Try generating during off-peak hours",
          "Note: Generation speed is a current limitation"
        ]
      },
      export_problems: {
        diagnosis: "Issues exporting to Figma or HTML/CSS",
        solutions: [
          "Figma export: ONLY available in Standard mode",
          "HTML/CSS export: Available in both modes",
          "For Figma: Click 'Copy to Figma' → Paste in Figma file",
          "For code: Click design → Code tab → Copy",
          "Exported code uses Tailwind CSS CDN",
          "Code is static - add JavaScript for interactivity"
        ]
      }
    };

    // Auto-detect issue category if not provided
    let detectedCategory = issue_category;
    if (!detectedCategory) {
      const lowerIssue = issue_description.toLowerCase();
      if (lowerIssue.includes("similar") || lowerIssue.includes("generic") || lowerIssue.includes("same")) {
        detectedCategory = "generic_output";
      } else if (lowerIssue.includes("color") || lowerIssue.includes("palette")) {
        detectedCategory = "colors_wrong";
      } else if (lowerIssue.includes("layout") || lowerIssue.includes("broken") || lowerIssue.includes("destroyed")) {
        detectedCategory = "layout_broken";
      } else if (lowerIssue.includes("missing") || lowerIssue.includes("omit") || lowerIssue.includes("disappeared")) {
        detectedCategory = "missing_components";
      } else if (lowerIssue.includes("export") || lowerIssue.includes("figma") || lowerIssue.includes("html")) {
        detectedCategory = "export_problems";
      } else if (lowerIssue.includes("slow") || lowerIssue.includes("long") || lowerIssue.includes("time")) {
        detectedCategory = "slow_generation";
      } else if (lowerIssue.includes("accessibility") || lowerIssue.includes("contrast") || lowerIssue.includes("wcag")) {
        detectedCategory = "accessibility";
      }
    }

    if (detectedCategory && solutions[detectedCategory]) {
      const solution = solutions[detectedCategory];
      response += `## Diagnosis\n${solution.diagnosis}\n\n`;
      response += "## Solutions\n";
      response += solution.solutions.map((s, i) => `${i + 1}. ${s}`).join("\n") + "\n\n";
    } else {
      response += "## General Troubleshooting Steps\n";
      response += "1. Check if prompt is clear and specific\n";
      response += "2. Verify you're using appropriate mode for task\n";
      response += "3. Try simplifying the prompt\n";
      response += "4. Generate multiple variations\n";
      response += "5. Review limitations documentation\n";
      response += "6. Consider if task is suited for Stitch's capabilities\n\n";
    }

    // Common limitations reminder
    response += "## Known Stitch Limitations\n";
    response += STITCH_KNOWLEDGE.limitations.map(l => `- ${l}`).join("\n") + "\n\n";

    response += "## Still Having Issues?\n";
    response += "- Review the official prompt guide: https://discuss.ai.google.dev/t/stitch-prompt-guide/83844\n";
    response += "- Check Google AI Developers Forum for community solutions\n";
    response += "- Consider if your use case matches Stitch's strengths\n";

    return {
      content: [{
        type: "text" as const,
        text: response
      }]
    };
  }
);

// Tool 5: Generate example prompts
const generateExamplePrompt = tool(
  "generate_example_prompt",
  "Generate example prompts for common design scenarios to help users learn effective prompting",
  {
    scenario: z.enum([
      "login_screen",
      "dashboard",
      "landing_page",
      "e_commerce_product",
      "mobile_app_home",
      "settings_page",
      "custom"
    ]).describe("Type of screen to generate example for"),
    custom_description: z.string().optional()
      .describe("If scenario is 'custom', describe what you want")
  },
  async (args) => {
    const { scenario, custom_description } = args;

    const examples: Record<string, { title: string; prompt: string; tips: string[] }> = {
      login_screen: {
        title: "Login Screen Example",
        prompt: `Design a mobile login screen for a fitness app. Modern, energetic aesthetic with emphasis on motivation.

Platform: Mobile app (iOS/Android)
Style: Modern, clean, motivational

Components:
- Top: App logo centered
- Email input field with icon
- Password input field with icon and show/hide toggle
- Large primary CTA button "Log In"
- "Forgot Password?" link (subtle, small text)
- Divider with "OR" text
- Social login buttons (Google, Apple) with icons
- "Don't have an account? Sign Up" link at bottom

Colors:
- Primary: #FF6B35 (energetic orange)
- Secondary: #004E89 (deep blue)
- Background: #F7F9FB (light gray)
- Text: #2D3748 (dark gray)

Layout:
- Centered vertical layout with generous spacing
- Card-style container with subtle shadow (4px blur, 0.1 opacity)
- Bottom navigation safe area padding

Typography:
- Headings: Bold, 24px
- Input labels: 14px
- CTA button: Bold, 16px`,
        tips: [
          "Notice how platform is specified first",
          "Style descriptors set the visual tone",
          "Components listed with hierarchy (top to bottom)",
          "Exact hex color values provided",
          "Layout includes technical details (shadow, padding)",
          "Typography specifications included"
        ]
      },
      dashboard: {
        title: "Dashboard Example",
        prompt: `Design a web dashboard for a project management app. Professional, data-focused aesthetic.

Platform: Web interface (desktop, 1440px width)
Style: Professional, modern, clean with data visualization focus

Layout:
- Left sidebar navigation (240px width, #2D3748 background)
- Top header bar (60px height) with search, notifications, profile
- Main content area with 12-column grid

Components:
- Sidebar: Logo, nav items with icons, collapsed state option
- Header: Global search (center), notification bell, user avatar (right)
- Main area:
  - Welcome header with user name and current date
  - Stats row: 4 cards showing KPIs (total projects, active tasks, team members, completion rate)
  - Recent activity timeline (left 2/3)
  - Upcoming deadlines widget (right 1/3)
  - Bottom: Recent projects table with status tags

Colors:
- Primary: #4F46E5 (indigo)
- Success: #10B981 (green)
- Warning: #F59E0B (amber)
- Danger: #EF4444 (red)
- Background: #F9FAFB
- Card background: #FFFFFF
- Sidebar: #2D3748
- Text primary: #111827
- Text secondary: #6B7280

Data Visualization:
- Use line charts for trends with smooth curves
- Bar charts for comparisons
- Status badges: pill-shaped with subtle backgrounds
- Progress bars: 8px height, rounded, gradient fills

Interactions (note for design):
- Hover states on all clickable elements
- Card shadows increase on hover (2px to 4px elevation)
- Smooth transitions (0.2s ease)`,
        tips: [
          "Desktop width specified for proper proportions",
          "Layout system defined (grid, measurements)",
          "Multiple color purposes defined (success, warning, etc.)",
          "Data visualization styles specified",
          "Interaction hints provided (though Stitch creates static designs)",
          "Hierarchical component breakdown"
        ]
      },
      landing_page: {
        title: "Landing Page Example",
        prompt: `Design a web landing page for a SaaS productivity tool. Modern, trustworthy, conversion-focused.

Platform: Web (responsive desktop, 1440px)
Style: Modern SaaS aesthetic, professional yet approachable, emphasis on clarity and trust

Hero Section:
- Full-width background with subtle gradient (#F8FAFC to #E0E7FF)
- Centered content layout
- Headline: "Boost Your Team's Productivity by 10x" (48px, bold, #0F172A)
- Subheadline: Value proposition (20px, #475569)
- Primary CTA: "Start Free Trial" button (large, #4F46E5, white text, 48px height, rounded)
- Secondary CTA: "Watch Demo" (ghost button, outline style)
- Hero image/illustration: Modern 3D illustration of team collaboration (right side, 50% width)
- Trust indicators: "No credit card required • 14-day free trial • Cancel anytime"

Social Proof Section:
- Light background (#F8FAFC)
- "Trusted by 50,000+ teams" heading
- Logo cloud: 6 well-known company logos in grayscale
- Single-line testimonial carousel

Features Section:
- White background
- Heading: "Everything you need to supercharge productivity"
- 3-column grid of feature cards
- Each card: Icon (top), title, description, "Learn more" link
- Feature icons: Outlined style, #4F46E5 color
- Card styling: Subtle border, hover effect with slight shadow

Pricing Section:
- Light background (#F8FAFC)
- Heading: "Simple, transparent pricing"
- 3 pricing tiers (cards side by side)
- Highlight middle tier with colored border and "Most Popular" badge
- Include: Plan name, price (large), feature list (checkmarks), CTA button

Footer:
- Dark background (#0F172A)
- 4-column layout: Product links, Company links, Resources, Newsletter signup
- Copyright and social media icons

Colors:
- Primary: #4F46E5 (indigo)
- Primary hover: #4338CA
- Text primary: #0F172A
- Text secondary: #475569
- Background: #FFFFFF
- Background alt: #F8FAFC
- Border: #E2E8F0
- Success/checkmark: #10B981

Typography:
- Headlines: Inter font, bold, 48px
- Subheadings: Inter, semi-bold, 24px
- Body: Inter, regular, 16px, 1.6 line-height
- CTA buttons: Inter, medium, 16px`,
        tips: [
          "Broken into logical sections (Hero, Social Proof, Features, etc.)",
          "Each section has layout, content, and style details",
          "Multiple CTA styles specified (primary vs secondary)",
          "Typography system defined (font, weights, sizes, line-height)",
          "Hover states mentioned for interactive elements",
          "Color system covers all use cases"
        ]
      },
      e_commerce_product: {
        title: "E-Commerce Product Page Example",
        prompt: `Design a mobile e-commerce product detail page for a fashion brand. Premium, modern, shopping-focused.

Platform: Mobile app (iOS/Android, 375px width)
Style: Premium fashion aesthetic, clean, image-focused

Layout (top to bottom):

Header:
- Fixed top bar: Back arrow (left), Share icon (right), Wishlist heart icon (right)
- Transparent background overlaying product image initially

Product Images:
- Full-width carousel/swipeable gallery
- Main product photo fills screen (1:1.2 aspect ratio)
- Pagination dots below images
- Pinch-to-zoom capability (note for interaction)

Quick Info Bar:
- Brand name (uppercase, 12px, #6B7280)
- Product name (20px, bold, #111827)
- Star rating + review count: "4.8 ★ (2,847 reviews)"
- Price: "$129.00" (large, bold, #111827) with strikethrough compare-at "$199.00"

Color Selector:
- Label: "Color: Midnight Blue"
- Row of color swatches (circular, 32px diameter)
- Selected state: thicker border, slight shadow
- 5-6 color options

Size Selector:
- Label: "Size"
- Size guide link (underlined, small)
- Grid of size buttons (S, M, L, XL)
- Selected state: filled background (#111827), white text
- Out of stock sizes: grayed out with diagonal line

Product Details Accordion:
- Expandable sections: Description, Materials, Care Instructions, Shipping & Returns
- Each section: Title with chevron icon
- Description: 2-3 sentences highlighting key features

Similar Products:
- "You May Also Like" heading
- Horizontal scroll of 4-5 product cards
- Each card: Image, brand, name, price

Bottom CTA Bar:
- Fixed to bottom, elevated shadow
- Two buttons:
  - "Add to Bag" (primary, #111827, full width)
  - Optional: "Buy with Apple Pay" (if applicable)
- Above buttons: Small text "Free shipping on orders over $100"

Colors:
- Primary: #111827 (near black)
- Secondary: #6B7280 (gray)
- Background: #FFFFFF
- Card borders: #E5E7EB
- Sale/discount: #DC2626 (red)
- Success: #059669 (green, for "In Stock")

Typography:
- Brand: 12px, uppercase, tracking 1px
- Product name: 20px, bold
- Price: 24px, bold
- Body text: 14px, line-height 1.5`,
        tips: [
          "Mobile-first with width specified",
          "Describes interactive elements (swipe, expand) even though output is static",
          "Premium brand aesthetic through typography and spacing",
          "Multiple states described (selected, out of stock)",
          "Complete user flow from product view to purchase",
          "Accordion pattern for content organization"
        ]
      },
      mobile_app_home: {
        title: "Mobile App Home Screen Example",
        prompt: `Design a mobile app home screen for a meditation and wellness app. Calming, minimalist, wellness-focused.

Platform: Mobile app (iOS/Android)
Style: Minimalist, calm, wellness-focused with nature-inspired elements

Top Section:
- Greeting: "Good evening, Sarah" (18px, #2D3748)
- Current streak badge: Small pill with "🔥 7 day streak" (12px)
- Profile icon (top right, 32px circle)

Daily Card:
- Large featured card with gradient background (#E0F2F1 to #B2DFDB)
- "Today's Practice" label (12px, uppercase)
- Session title: "Evening Wind Down" (24px, semi-bold)
- Duration badge: "15 min" with clock icon
- Illustration: Minimal line art of sunset/calm scene
- Large play button (center, 60px, white with subtle shadow)
- Card has rounded corners (16px) and subtle shadow

Quick Stats Row:
- 3 small stat cards in horizontal row
- Each card: Icon, number, label
  1. Total sessions: "45" + "Sessions"
  2. Time meditated: "8h" + "This week"
  3. Mood: "😊" + "Calm"
- Cards have light background (#F7FAFC), minimal style

Collections Section:
- Section heading: "Continue Your Journey" (18px, semi-bold)
- 2x2 grid of category cards
- Each card:
  - Background color (different for each: soft blue, green, purple, pink)
  - Category icon (simple line icons)
  - Category name: "Sleep", "Focus", "Anxiety", "Gratitude"
  - Small arrow icon indicating expandable

Recent Activity:
- Section heading: "Recent"
- List of 3 recent sessions
- Each item:
  - Session title
  - Date completed (small, gray text)
  - Completion checkmark icon (green)
- Minimal divider lines between items

Bottom Navigation:
- Fixed bottom tab bar
- 5 tabs: Home (filled), Explore, Timer, Journal, Profile
- Icons: Simple line icons, filled for active state
- Label below each icon (11px)
- Background: White with top border
- Active state: #00796B (teal) color

Colors:
- Primary: #00796B (teal)
- Secondary: #B2DFDB (light teal)
- Accent: #FF7043 (warm coral for alerts/streaks)
- Background: #FFFFFF
- Card backgrounds: #F7FAFC (cool gray)
- Text primary: #2D3748
- Text secondary: #718096
- Success: #48BB78

Typography:
- Headings: 18-24px, semi-bold, #2D3748
- Body: 14px, regular, #4A5568
- Labels: 12px, uppercase, tracking 0.5px
- Font style: Rounded, friendly sans-serif

General Design Notes:
- Generous spacing between elements (16-24px)
- Rounded corners throughout (8-16px)
- Soft shadows, never harsh (0.05-0.1 opacity)
- Illustrations: Minimal, line-art style
- Icons: Outlined, consistent weight`,
        tips: [
          "Wellness aesthetic through color and spacing choices",
          "Personalization mentioned (user name, streak)",
          "Multiple section types (featured, stats, categories, list)",
          "Detailed component specs (shadow opacity, border radius)",
          "Bottom navigation pattern",
          "Design principles stated (generous spacing, soft shadows)"
        ]
      },
      settings_page: {
        title: "Settings Page Example",
        prompt: `Design a web settings page for a team collaboration app. Professional, organized, form-focused.

Platform: Web interface (desktop)
Style: Professional, organized, form-heavy layout

Layout:
- Left sidebar navigation (200px): Settings categories with icons
- Main content area (remaining width): Selected settings panel
- Top breadcrumb: "Settings > Profile"

Sidebar Categories:
- Profile
- Account & Security
- Notifications
- Team Settings
- Billing & Plans
- Integrations
- Preferences
Active state: Highlighted background (#F3F4F6), left border accent (#4F46E5)

Main Content - Profile Settings:
Header:
- Page title: "Profile Settings" (28px, bold)
- Description: "Manage your personal information and preferences" (14px, gray)
- Divider line

Form Sections (use clear visual separation):

1. Profile Photo Section:
- Current avatar (80px circle)
- "Upload Photo" button (secondary style)
- "Remove" link (red, subtle)
- Allowed formats note: "JPG, PNG, max 5MB"

2. Personal Information:
- Input group: First Name (left) + Last Name (right) in 2-column
- Email field (with verified badge/icon)
- Job Title field
- Department dropdown
- All inputs: 40px height, rounded corners (6px), border (#D1D5DB)
- Labels: Above inputs, 14px, semi-bold, #374151

3. Display Settings:
- Username field (with availability indicator)
- Bio textarea (4 rows, resizable)
- Timezone dropdown (searchable)

4. Contact Preferences:
- Toggle switches for:
  - "Show email to team members"
  - "Allow others to message me directly"
  - "Display online status"
- Each toggle: Label (left), description below (small, gray), switch (right)

Bottom Actions:
- Primary "Save Changes" button (right)
- Secondary "Cancel" button (right, before Save)
- Success state: Brief "Saved successfully ✓" message appears top-right

Visual Design:
- Section spacing: 32px between major sections
- Input spacing: 16px between fields
- Card-style container: White background, subtle border, slight shadow
- Form layout: Max-width 600px to prevent overly wide inputs

Colors:
- Primary action: #4F46E5
- Success: #10B981
- Danger/remove: #DC2626
- Background: #F9FAFB
- Card background: #FFFFFF
- Border: #D1D5DB
- Text primary: #111827
- Text secondary: #6B7280
- Toggle active: #4F46E5

Input States:
- Default: #D1D5DB border
- Focus: #4F46E5 border, subtle glow
- Error: #DC2626 border with error message below
- Disabled: #F3F4F6 background, grayed text

Typography:
- Page title: 28px, bold
- Section headings: 18px, semi-bold
- Labels: 14px, medium
- Body/inputs: 14px, regular
- Helper text: 12px, regular`,
        tips: [
          "Sidebar navigation pattern for settings",
          "Form-focused with detailed input specifications",
          "Multiple input types shown (text, dropdown, toggle, textarea)",
          "States defined (default, focus, error, disabled)",
          "Success feedback mentioned",
          "Max-width specified for form usability"
        ]
      }
    };

    let response = "";

    if (scenario === "custom" && custom_description) {
      response += `# Custom Scenario Prompt Template\n\n`;
      response += `For your scenario: "${custom_description}"\n\n`;
      response += `## Recommended Structure:\n\n`;
      response += `\`\`\`\nDesign a [platform] [screen/page type] for [purpose/audience].\n\n`;
      response += `Platform: [Mobile app / Web interface with width]\n`;
      response += `Style: [Adjectives describing aesthetic]\n\n`;
      response += `[For each major section/component]:\n`;
      response += `Section Name:\n`;
      response += `- Component descriptions\n`;
      response += `- Layout details\n`;
      response += `- Measurements if relevant\n\n`;
      response += `Colors:\n`;
      response += `- Primary: #[hex]\n`;
      response += `- Secondary: #[hex]\n`;
      response += `- Background: #[hex]\n`;
      response += `- Text: #[hex]\n\n`;
      response += `Typography:\n`;
      response += `- Headings: [size]px, [weight]\n`;
      response += `- Body: [size]px, [weight]\n`;
      response += `\`\`\`\n\n`;
      response += `## Tips for Your Scenario:\n`;
      response += `1. Start with platform and overall style\n`;
      response += `2. Break down into logical sections\n`;
      response += `3. Specify exact colors with hex values\n`;
      response += `4. Include typography specifications\n`;
      response += `5. Describe layout and spacing\n`;
      response += `6. Use UI/UX terminology\n`;
    } else if (scenario !== "custom") {
      const example = examples[scenario];
      response += `# ${example.title}\n\n`;
      response += `## Example Prompt\n\n`;
      response += `\`\`\`\n${example.prompt}\n\`\`\`\n\n`;
      response += `## Why This Works\n\n`;
      response += example.tips.map((tip, i) => `${i + 1}. ${tip}`).join("\n") + "\n\n";
      response += `## How to Use This Example\n\n`;
      response += `1. Copy the prompt structure\n`;
      response += `2. Replace specific values with your requirements\n`;
      response += `3. Adjust complexity based on your needs\n`;
      response += `4. Iterate one change at a time\n`;
      response += `5. Save screenshots of successful generations\n`;
    }

    return {
      content: [{
        type: "text" as const,
        text: response
      }]
    };
  }
);

// Create MCP server with all tools
export const stitchKnowledgeServer = createSdkMcpServer({
  name: "stitch_knowledge",
  version: "1.0.0",
  tools: [
    getBestPractices,
    getPromptGuidance,
    recommendMode,
    troubleshootIssue,
    generateExamplePrompt
  ]
});

// Export tool names for allowed_tools configuration
export const STITCH_TOOLS = [
  "mcp__stitch_knowledge__get_stitch_best_practices",
  "mcp__stitch_knowledge__get_prompt_guidance",
  "mcp__stitch_knowledge__recommend_stitch_mode",
  "mcp__stitch_knowledge__troubleshoot_stitch_issue",
  "mcp__stitch_knowledge__generate_example_prompt"
];
