#!/usr/bin/env node
import { ClaudeSDKClient, ClaudeAgentOptions, TextBlock } from "@anthropic-ai/claude-agent-sdk";
import { stitchKnowledgeServer, STITCH_TOOLS } from "./tools/knowledge.js";
import { loadResearchWithFallback, embedResearchInPrompt } from "./data/research-loader.js";
import { STITCH_EXPERT_PROMPT } from "./agent.js";
import * as readline from "readline";

/**
 * Run the Stitch Expert Agent in interactive conversation mode
 */
export async function runConversationAgent(options?: {
  model?: "sonnet" | "opus" | "haiku";
  researchDocPath?: string;
}): Promise<void> {
  const {
    model = "sonnet",
    researchDocPath
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

    mcp_servers: {
      stitch_knowledge: stitchKnowledgeServer
    },
    allowed_tools: STITCH_TOOLS,

    permission_mode: "bypassPermissions",

    thinking: {
      type: "enabled",
      budget_tokens: 10000
    }
  };

  console.log("🎨 Google Stitch Expert Agent - Interactive Mode");
  console.log("━".repeat(50));
  console.log();
  console.log("Commands:");
  console.log("  Type your question or request");
  console.log("  'new' or 'reset' - Start a new conversation");
  console.log("  'exit' or 'quit' - Exit the agent");
  console.log();
  console.log("━".repeat(50));
  console.log();

  const client = new ClaudeSDKClient(agentOptions);
  await client.connect();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "You: "
  });

  const askQuestion = (query: string): Promise<string> =>
    new Promise((resolve) => {
      rl.question(query, resolve);
    });

  try {
    while (true) {
      const userInput = await askQuestion("You: ");

      if (!userInput.trim()) {
        continue;
      }

      const lowerInput = userInput.toLowerCase().trim();

      // Handle commands
      if (lowerInput === "exit" || lowerInput === "quit") {
        console.log("\n👋 Goodbye! Happy designing with Stitch!");
        break;
      }

      if (lowerInput === "new" || lowerInput === "reset") {
        await client.disconnect();
        await client.connect();
        console.log("\n✨ Started new conversation session\n");
        continue;
      }

      // Send message to agent
      try {
        await client.query(userInput);

        // Collect and display response
        let responseText = "";
        for await (const message of client.receive_response()) {
          if (message.type === "assistant") {
            for (const block of message.message?.content || []) {
              if ("text" in block) {
                responseText += (block as TextBlock).text;
              }
            }
          } else if (message.type === "result") {
            if (message.subtype === "error_during_execution" && message.errors) {
              console.log("\n❌ Error:", message.errors.join(", "));
            }
          }
        }

        if (responseText) {
          console.log(`\n🎨 Stitch Expert:\n${responseText}\n`);
          console.log("━".repeat(50));
          console.log();
        }
      } catch (error) {
        console.error("\n❌ Error processing request:", error);
        console.log();
      }
    }
  } finally {
    await client.disconnect();
    rl.close();
  }
}

/**
 * Main CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);

  let model: "sonnet" | "opus" | "haiku" = "sonnet";
  let researchDocPath: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "--model" || arg === "-m") {
      model = args[++i] as "sonnet" | "opus" | "haiku";
    } else if (arg === "--research" || arg === "-r") {
      researchDocPath = args[++i];
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
Google Stitch Expert Agent - Interactive Mode

Usage:
  npm run interactive [options]

Options:
  --model, -m <model>       Model to use: sonnet, opus, haiku (default: sonnet)
  --research, -r <path>     Path to research document
  --help, -h                Show this help

Commands (during conversation):
  new, reset                Start a new conversation
  exit, quit                Exit the agent

Environment Variables:
  ANTHROPIC_API_KEY        Your Anthropic API key (required)
  STITCH_RESEARCH_DOC      Default path to research document
      `);
      process.exit(0);
    }
  }

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ Error: ANTHROPIC_API_KEY environment variable not set");
    console.error("   Set it with: export ANTHROPIC_API_KEY=your-key-here");
    process.exit(1);
  }

  await runConversationAgent({ model, researchDocPath });
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
