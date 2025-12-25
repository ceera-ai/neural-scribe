#!/usr/bin/env node
import { runStitchAgent } from "./agent.js";

/**
 * Test the Stitch Expert Agent with various queries
 */
async function testAgent() {
  const testPrompts = [
    {
      name: "Best Practices",
      prompt: "What are the key best practices for using Google Stitch?"
    },
    {
      name: "Login Screen Prompt",
      prompt: "I need to design a modern mobile login screen. Help me craft an effective prompt for Stitch."
    },
    {
      name: "Troubleshooting",
      prompt: "My Stitch designs keep looking generic and similar. What am I doing wrong?"
    },
    {
      name: "Mode Selection",
      prompt: "Should I use Standard or Experimental mode? I have a wireframe sketch and need to export to Figma."
    },
    {
      name: "Iteration Help",
      prompt: "I generated a dashboard design but the colors are wrong. How should I iterate on it?"
    }
  ];

  console.log("🧪 Testing Google Stitch Expert Agent");
  console.log("=" .repeat(60));
  console.log();

  for (const { name, prompt } of testPrompts) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📋 Test: ${name}`);
    console.log(`${"=".repeat(60)}`);
    console.log(`Question: ${prompt}`);
    console.log(`${"-".repeat(60)}\n`);

    try {
      await runStitchAgent(prompt, { model: "sonnet", verbose: false });
    } catch (error) {
      console.error(`❌ Test "${name}" failed:`, error);
    }

    console.log();
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ All tests completed");
  console.log("=".repeat(60));
}

// Run tests
testAgent().catch((error) => {
  console.error("Fatal test error:", error);
  process.exit(1);
});
