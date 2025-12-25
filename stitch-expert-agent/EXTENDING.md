# Extending the Stitch Expert Agent

This guide shows you how to customize and extend the agent with new capabilities.

## Adding Custom Tools

Tools are the agent's specialized functions. Here's how to add your own.

### Step 1: Create a New Tool

Edit `src/tools/knowledge.ts` and add a new tool:

```typescript
import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const myCustomTool = tool(
  "tool_name",  // Unique identifier
  "Description of what this tool does",  // Shown to Claude
  {
    // Input schema using Zod
    parameter1: z.string().describe("What this parameter is for"),
    parameter2: z.number().optional().describe("Optional parameter")
  },
  async (args) => {
    // Tool logic
    const { parameter1, parameter2 } = args;

    // Do something useful
    const result = processData(parameter1, parameter2);

    // Return result
    return {
      content: [{
        type: "text" as const,
        text: result
      }]
    };
  }
);
```

### Step 2: Register the Tool

Add it to the MCP server:

```typescript
export const stitchKnowledgeServer = createSdkMcpServer({
  name: "stitch_knowledge",
  version: "1.0.0",
  tools: [
    getBestPractices,
    getPromptGuidance,
    // ... existing tools
    myCustomTool  // Add your tool here
  ]
});
```

### Step 3: Update Tool List

Add to the allowed tools list:

```typescript
export const STITCH_TOOLS = [
  "mcp__stitch_knowledge__get_stitch_best_practices",
  // ... existing tools
  "mcp__stitch_knowledge__tool_name"  // Add with mcp__stitch_knowledge__ prefix
];
```

### Step 4: Test It

```bash
npm run dev "Use the new tool to..."
```

## Real Example: Add a Design Critique Tool

Here's a complete example of adding a tool that critiques design prompts:

```typescript
const critiquePrompt = tool(
  "critique_design_prompt",
  "Analyze and critique a design prompt, providing specific improvement suggestions",
  {
    prompt: z.string().describe("The design prompt to critique"),
    design_type: z.enum(["mobile", "web", "dashboard", "landing_page"])
      .describe("Type of design")
  },
  async (args) => {
    const { prompt, design_type } = args;

    let critique = `# Prompt Critique\n\n`;
    critique += `**Type**: ${design_type}\n\n`;
    critique += `**Your Prompt**:\n${prompt}\n\n`;

    // Check for platform specification
    const hasPlatform = prompt.toLowerCase().includes("mobile") ||
                       prompt.toLowerCase().includes("web");

    critique += `## Strengths\n`;
    const strengths = [];
    if (hasPlatform) strengths.push("✓ Platform specified");
    if (prompt.length > 100) strengths.push("✓ Good level of detail");
    if (prompt.match(/#[0-9a-fA-F]{6}/)) strengths.push("✓ Specific color values");

    critique += strengths.length > 0
      ? strengths.join("\n") + "\n\n"
      : "No major strengths detected\n\n";

    critique += `## Areas for Improvement\n`;
    const improvements = [];
    if (!hasPlatform) {
      improvements.push("- Add platform specification (mobile/web)");
    }
    if (prompt.length < 50) {
      improvements.push("- Add more detail about components and layout");
    }
    if (!prompt.match(/#[0-9a-fA-F]{6}/)) {
      improvements.push("- Include specific hex color values");
    }

    critique += improvements.join("\n") + "\n\n";

    critique += `## Suggested Revision\n\`\`\`\n`;
    critique += `Design a ${design_type} [screen/page] with [style] aesthetic.\n\n`;
    critique += `Components:\n- [List key components]\n\n`;
    critique += `Colors:\n- Primary: #[hex]\n- Background: #[hex]\n\n`;
    critique += `Layout: [Describe arrangement]\n\`\`\``;

    return {
      content: [{
        type: "text" as const,
        text: critique
      }]
    };
  }
);

// Don't forget to add to server and STITCH_TOOLS!
```

## Customizing the System Prompt

Edit `src/agent.ts` to change how the agent behaves:

```typescript
const STITCH_EXPERT_PROMPT = `You are an expert Google Stitch AI design assistant...

// Add new capabilities:
You also specialize in:
- Design system creation
- Brand identity guidelines
- Accessibility-first design
- Mobile-first responsive design

// Add new behavior:
When users ask about accessibility:
1. Always reference WCAG 2.1 standards
2. Provide specific tools for testing
3. Include code examples when relevant
`;
```

## Adding External Data Sources

### Load Custom Research

```typescript
// In src/data/research-loader.ts
export async function loadCustomResearch(topic: string): Promise<string> {
  const dataPath = path.join(__dirname, `research/${topic}.md`);
  return fs.readFileSync(dataPath, "utf-8");
}
```

### Use in Tools

```typescript
const getAdvancedGuidance = tool(
  "get_advanced_guidance",
  "Get advanced guidance on specific topics",
  { topic: z.string() },
  async (args) => {
    const research = await loadCustomResearch(args.topic);
    return {
      content: [{
        type: "text" as const,
        text: research
      }]
    };
  }
);
```

## Adding Web Search

Enable web search for latest information:

```typescript
// In src/agent.ts
const agentOptions: ClaudeAgentOptions = {
  // ... existing options

  allowed_tools: [
    ...STITCH_TOOLS,
    "WebSearch",  // Add web search
    "WebFetch"    // Add web fetch
  ]
};
```

Update system prompt:

```typescript
const STITCH_EXPERT_PROMPT = `...

You can also search the web for:
- Latest Stitch updates and features
- Real-world examples and case studies
- Community discussions and tips
- Official documentation changes

Use WebSearch when you need current information beyond your training data.
`;
```

## Creating Specialized Agents

Create a version focused on specific use cases:

### E-Commerce Specialist

```typescript
// src/agents/ecommerce-specialist.ts
const ECOMMERCE_PROMPT = `${STITCH_EXPERT_PROMPT}

You specialize in e-commerce design with Stitch. Focus on:
- Product pages
- Shopping carts
- Checkout flows
- Category pages
- Search and filtering UIs

Always consider:
- Conversion optimization
- Mobile shopping experience
- Trust indicators
- Product imagery best practices
`;

export async function runEcommerceAgent(prompt: string) {
  return runStitchAgent(prompt, {
    customPrompt: ECOMMERCE_PROMPT
  });
}
```

### Accessibility Specialist

```typescript
// src/agents/accessibility-specialist.ts
const ACCESSIBILITY_PROMPT = `${STITCH_EXPERT_PROMPT}

You specialize in accessibility-first design with Stitch. Always:
- Check WCAG 2.1 compliance
- Verify color contrast ratios
- Ensure keyboard navigation
- Recommend ARIA labels
- Suggest touch target sizes
- Consider screen reader experience

Provide specific testing tools and code examples.
`;
```

## Adding Hooks

Monitor and customize tool execution:

```typescript
import { HookCallback } from "@anthropic-ai/claude-agent-sdk";

const logToolUsage: HookCallback = async (input, toolUseId, context) => {
  console.log(`[Tool] ${input.tool_name} called`);

  // Track usage
  trackTool(input.tool_name);

  // Could modify input here
  return {};
};

// In agent options:
const agentOptions: ClaudeAgentOptions = {
  // ... other options
  hooks: {
    PostToolUse: [
      { matcher: "mcp__stitch_knowledge", hooks: [logToolUsage] }
    ]
  }
};
```

## Testing Custom Tools

Create tests in `src/test.ts`:

```typescript
async function testCustomTools() {
  console.log("Testing custom critique tool...");

  await runStitchAgent(
    "Critique this prompt: Design a login screen",
    { verbose: true }
  );

  // Add assertions, logging, etc.
}
```

## Best Practices

### Tool Design
- Make tools focused and single-purpose
- Use descriptive names and clear descriptions
- Validate inputs with Zod schemas
- Return structured, formatted text
- Handle errors gracefully

### System Prompts
- Be specific about capabilities
- Provide clear instructions
- Include examples
- Define boundaries
- Update as you add tools

### Data Sources
- Cache frequently accessed data
- Use async loading for large files
- Provide fallbacks for missing data
- Version your data files

### Testing
- Test each tool independently
- Test with real user queries
- Check edge cases
- Monitor costs

## Example: Complete Custom Tool

Here's a complete example combining multiple concepts:

```typescript
// src/tools/design-validator.ts
import { tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import fs from "fs";

// Load validation rules from file
const validationRules = JSON.parse(
  fs.readFileSync("./data/validation-rules.json", "utf-8")
);

const validateDesignPrompt = tool(
  "validate_design_prompt",
  "Validate a design prompt against best practices and provide a score",
  {
    prompt: z.string(),
    strict_mode: z.boolean().optional()
      .describe("Enable strict validation rules")
  },
  async (args) => {
    const { prompt, strict_mode = false } = args;

    let score = 100;
    const issues = [];
    const suggestions = [];

    // Check each rule
    for (const rule of validationRules) {
      const passed = rule.check(prompt);

      if (!passed) {
        score -= rule.weight;
        issues.push(rule.issue);
        suggestions.push(rule.suggestion);

        if (strict_mode && rule.critical) {
          break; // Stop on first critical issue in strict mode
        }
      }
    }

    // Generate report
    let report = `# Prompt Validation Report\n\n`;
    report += `**Score**: ${Math.max(0, score)}/100\n\n`;

    if (issues.length > 0) {
      report += `## Issues Found (${issues.length})\n`;
      report += issues.map((i, idx) => `${idx + 1}. ${i}`).join("\n") + "\n\n";

      report += `## Suggestions\n`;
      report += suggestions.map((s, idx) => `${idx + 1}. ${s}`).join("\n") + "\n\n";
    } else {
      report += `✅ No issues found! This prompt follows all best practices.\n`;
    }

    return {
      content: [{
        type: "text" as const,
        text: report
      }]
    };
  }
);

export const designValidatorServer = createSdkMcpServer({
  name: "design_validator",
  version: "1.0.0",
  tools: [validateDesignPrompt]
});
```

Add to agent:

```typescript
import { designValidatorServer } from "./tools/design-validator.js";

const agentOptions: ClaudeAgentOptions = {
  // ... other options
  mcp_servers: {
    stitch_knowledge: stitchKnowledgeServer,
    design_validator: designValidatorServer  // Add new server
  },
  allowed_tools: [
    ...STITCH_TOOLS,
    "mcp__design_validator__validate_design_prompt"
  ]
};
```

## Resources

- [Claude Agent SDK Docs](https://platform.claude.com/docs/en/agent-sdk/overview.md)
- [Zod Documentation](https://zod.dev/)
- [MCP Protocol](https://modelcontextprotocol.io/)

## Need Help?

Open an issue or ask the agent itself:
```bash
npm run dev "How do I add a custom tool that does X?"
```

---

Happy extending! 🚀
