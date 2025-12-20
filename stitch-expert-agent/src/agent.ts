#!/usr/bin/env node
import { query, ClaudeAgentOptions } from "@anthropic-ai/claude-agent-sdk";
import { stitchKnowledgeServer, STITCH_TOOLS } from "./tools/knowledge.js";
import { loadResearchWithFallback, embedResearchInPrompt } from "./data/research-loader.js";

// Base expert system prompt
const STITCH_EXPERT_PROMPT = `You are an expert Google Stitch AI design assistant and coach. Your mission is to help users create exceptional designs using Google Stitch by providing expert guidance on prompting, best practices, and design principles.

## Your Role

You help users:
1. **Craft Effective Prompts**: Guide users to write clear, specific, actionable prompts that produce great results
2. **Apply Best Practices**: Share proven techniques from research and user experiences
3. **Troubleshoot Issues**: Diagnose problems and provide concrete solutions
4. **Choose the Right Mode**: Help users decide between Standard and Experimental modes
5. **Iterate Strategically**: Coach users on refining designs through smart iterations
6. **Understand Limitations**: Set realistic expectations about what Stitch can and cannot do

## Your Expertise

You have deep knowledge of:
- Google Stitch's capabilities across both Standard and Experimental modes
- Effective prompt engineering techniques specific to AI design tools
- UI/UX design principles and terminology
- Common pitfalls and how to avoid them
- Export workflows (Figma and HTML/CSS)
- Accessibility considerations
- Real-world user experiences and reviews

## Your Approach

**Always:**
- Ask clarifying questions about design goals and context
- Provide specific, actionable advice with examples
- Reference relevant best practices from your knowledge base
- Explain the reasoning behind recommendations
- Help users think strategically about their designs
- Use your specialized tools to provide comprehensive guidance

**Never:**
- Give vague or generic advice
- Recommend approaches that don't match Stitch's capabilities
- Ignore known limitations or accessibility issues
- Assume user expertise - explain terminology when needed

## Available Tools

You have access to specialized knowledge tools:
1. **get_stitch_best_practices**: Comprehensive best practices by category
2. **get_prompt_guidance**: Expert advice on crafting specific prompts
3. **recommend_stitch_mode**: Help choose between Standard and Experimental modes
4. **troubleshoot_stitch_issue**: Diagnose and solve common problems
5. **generate_example_prompt**: Show high-quality example prompts for different scenarios

Use these tools proactively to provide thorough, accurate guidance.

## Response Style

- Be conversational but professional
- Use clear structure (headings, lists, code blocks)
- Provide examples wherever possible
- Highlight critical warnings (accessibility, limitations)
- End with actionable next steps when appropriate`;

/**
 * Run the Stitch Expert Agent for a single query
 */
export async function runStitchAgent(userPrompt: string, options?: {
  model?: "sonnet" | "opus" | "haiku";
  researchDocPath?: string;
  verbose?: boolean;
}): Promise<void> {
  const {
    model = "sonnet",
    researchDocPath,
    verbose = false
  } = options || {};

  // Load research document
  const researchContent = await loadResearchWithFallback(researchDocPath);
  const fullSystemPrompt = researchContent
    ? STITCH_EXPERT_PROMPT + embedResearchInPrompt(researchContent)
    : STITCH_EXPERT_PROMPT;

  const agentOptions: ClaudeAgentOptions = {
    model,

    system_prompt: {
      type: "preset",
      preset: "claude_code",
      append: fullSystemPrompt
    },

    // Custom knowledge tools
    mcp_servers: {
      stitch_knowledge: stitchKnowledgeServer
    },
    allowed_tools: STITCH_TOOLS,

    // Permission mode - no file access needed
    permission_mode: "bypassPermissions",

    // Enable thinking for better reasoning
    thinking: {
      type: "enabled",
      budget_tokens: 10000
    }
  };

  console.log("🎨 Google Stitch Expert Agent");
  console.log("━".repeat(50));
  console.log();

  try {
    let responseText = "";

    for await (const message of query({
      prompt: userPrompt,
      options: agentOptions
    })) {
      if (message.type === "assistant") {
        // Process assistant message
        if (message.message?.content) {
          for (const block of message.message.content) {
            if ("text" in block) {
              responseText += block.text;
              if (!verbose) {
                console.log(block.text);
              }
            } else if ("thinking" in block && verbose) {
              console.log("💭 [Thinking]:", (block as any).thinking);
            }
          }
        }
      } else if (message.type === "tool_use" && verbose) {
        console.log(`🔧 Using tool: ${(message as any).tool_name}`);
      } else if (message.type === "result") {
        // Final result
        console.log();
        console.log("━".repeat(50));

        if (message.subtype === "success") {
          console.log("✅ Query completed successfully");
          if (message.total_cost_usd) {
            console.log(`💰 Cost: $${message.total_cost_usd.toFixed(4)}`);
          }
        } else {
          console.log("❌ Query failed");
          if (message.errors) {
            console.log("Errors:", message.errors.join("\n"));
          }
        }
      }
    }

  } catch (error) {
    console.error("❌ Agent error:", error);
    throw error;
  }
}

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let prompt = "";
  let model: "sonnet" | "opus" | "haiku" = "sonnet";
  let verbose = false;
  let researchDocPath: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--model" || arg === "-m") {
      model = args[++i] as "sonnet" | "opus" | "haiku";
    } else if (arg === "--verbose" || arg === "-v") {
      verbose = true;
    } else if (arg === "--research" || arg === "-r") {
      researchDocPath = args[++i];
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
Google Stitch Expert Agent

Usage:
  npm run dev [options] "<prompt>"

Options:
  --model, -m <model>       Model to use: sonnet, opus, haiku (default: sonnet)
  --verbose, -v             Enable verbose output with thinking
  --research, -r <path>     Path to research document
  --help, -h                Show this help

Examples:
  npm run dev "How do I create a modern login screen?"
  npm run dev --model opus "Best practices for prompting Stitch"
  npm run dev --verbose "Troubleshoot generic output issue"

Environment Variables:
  ANTHROPIC_API_KEY        Your Anthropic API key (required)
  STITCH_RESEARCH_DOC      Default path to research document
      `);
      process.exit(0);
    } else {
      prompt = arg;
    }
  }

  if (!prompt) {
    prompt = "What are the best practices for using Google Stitch effectively?";
    console.log("ℹ️  No prompt provided, using default query\n");
  }

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ Error: ANTHROPIC_API_KEY environment variable not set");
    console.error("   Set it with: export ANTHROPIC_API_KEY=your-key-here");
    process.exit(1);
  }

  await runStitchAgent(prompt, { model, verbose, researchDocPath });
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}

export { STITCH_EXPERT_PROMPT };
