# Google Stitch Expert Agent

An intelligent AI agent powered by the Claude Agent SDK that provides expert guidance on using Google Stitch, the AI-powered UI design tool. This agent helps you craft better prompts, choose the right approach, troubleshoot issues, and master Google Stitch.

## Features

- **Expert Prompt Guidance**: Get help crafting effective prompts for your specific design needs
- **Best Practices**: Access comprehensive best practices from real user experiences and research
- **Mode Recommendations**: Intelligent suggestions for choosing between Standard and Experimental modes
- **Troubleshooting**: Diagnose and solve common issues with actionable solutions
- **Example Library**: High-quality example prompts for common scenarios (login screens, dashboards, landing pages, etc.)
- **Interactive Mode**: Multi-turn conversations that remember context
- **Research-Backed**: Powered by comprehensive research on Stitch capabilities and user experiences

## Prerequisites

- Node.js 18 or higher
- Anthropic API key ([get one here](https://console.anthropic.com/))

## Installation

1. **Navigate to the agent directory:**

```bash
cd stitch-expert-agent
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your API key
# ANTHROPIC_API_KEY=your-api-key-here
```

## Quick Start

### One-Shot Query Mode

Ask a single question and get an expert response:

```bash
# Default query
npm run dev

# Custom query
npm run dev "How do I design a modern login screen with Stitch?"

# With specific model
npm run dev --model opus "Best practices for e-commerce product pages"

# Verbose mode (shows thinking process)
npm run dev --verbose "Why are my designs looking generic?"
```

### Interactive Conversation Mode

Have a multi-turn conversation with context retention:

```bash
npm run interactive
```

In interactive mode:
- Type your questions naturally
- Context is preserved across messages
- Type `new` or `reset` to start fresh conversation
- Type `exit` or `quit` to exit

Example conversation:
```
You: I need to design a dashboard for a SaaS app

Stitch Expert: [Provides detailed guidance...]

You: What colors should I use for a professional look?

Stitch Expert: [Suggests colors based on previous context...]

You: Generate an example prompt for this

Stitch Expert: [Creates specific prompt for SaaS dashboard...]
```

### Run Tests

Test the agent with various scenarios:

```bash
npm run test
```

## Usage Examples

### Get Best Practices

```bash
npm run dev "What are the best practices for using Google Stitch?"
```

### Craft a Prompt

```bash
npm run dev "Help me create a prompt for a mobile fitness app home screen with a modern, energetic style"
```

### Choose a Mode

```bash
npm run dev "I have a sketch wireframe and need Figma export. Which mode should I use?"
```

### Troubleshoot Issues

```bash
npm run dev "My designs keep coming out looking the same. How can I get more variety?"
```

### Get Example Prompts

```bash
npm run dev "Show me an example prompt for an e-commerce product page"
```

### Iterate on Designs

```bash
npm run dev "I generated a dashboard but the colors are wrong. How should I fix it without breaking the layout?"
```

## Agent Capabilities

The agent has access to five specialized knowledge tools:

### 1. Best Practices Tool
Provides comprehensive best practices organized by category:
- Prompting techniques
- Mode selection (Standard vs Experimental)
- Export workflows
- Limitations and considerations

### 2. Prompt Guidance Tool
Expert help crafting prompts with:
- Analysis of your design goals
- Recommended prompt templates
- Essential elements checklist
- Current prompt analysis and improvement suggestions
- Real examples

### 3. Mode Recommendation Tool
Intelligent recommendations for choosing between modes based on:
- Whether you have a sketch/wireframe
- Need for Figma export
- Design complexity
- Expected iteration count
- Monthly generation limits

### 4. Troubleshooting Tool
Diagnose and solve common issues:
- Generic output designs
- Accessibility problems
- Wrong colors
- Broken layouts
- Missing components
- Slow generation
- Export problems

### 5. Example Prompts Tool
Generate high-quality example prompts for:
- Login screens
- Dashboards
- Landing pages
- E-commerce product pages
- Mobile app home screens
- Settings pages
- Custom scenarios

## Configuration

### Environment Variables

Create a `.env` file:

```bash
# Required
ANTHROPIC_API_KEY=your-api-key-here

# Optional
STITCH_RESEARCH_DOC=../docs/google-stitch-research.md
LOG_LEVEL=info
MODEL=sonnet
```

### Model Selection

Choose between different Claude models:

- **sonnet** (default): Best balance of speed and quality
- **opus**: Highest quality, more expensive
- **haiku**: Fastest, most cost-effective

```bash
npm run dev --model opus "Your question here"
```

## Project Structure

```
stitch-expert-agent/
├── src/
│   ├── agent.ts                  # One-shot query agent
│   ├── conversation-agent.ts     # Interactive conversation agent
│   ├── test.ts                   # Test suite
│   ├── tools/
│   │   └── knowledge.ts          # Specialized Stitch knowledge tools
│   └── data/
│       └── research-loader.ts    # Research document integration
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Research Document

The agent is powered by a comprehensive research document (`../docs/google-stitch-research.md`) that includes:

- Complete feature descriptions for both Stitch modes
- Proven prompting best practices
- Real user reviews and experiences
- Common pitfalls and solutions
- Export workflows and limitations
- Example prompts and templates
- Official resources and references

The agent automatically loads this document to provide accurate, research-backed guidance.

## How It Works

1. **Knowledge Base**: The agent has built-in expertise about Google Stitch encoded in specialized tools
2. **Research Integration**: Loads comprehensive research document for accurate, detailed information
3. **Tool-Augmented**: Uses 5 specialized tools to provide targeted, expert guidance
4. **Context-Aware**: In interactive mode, maintains conversation context for natural follow-up questions
5. **Claude-Powered**: Leverages Claude's reasoning capabilities to provide thoughtful, nuanced advice

## Advanced Usage

### Custom Research Document Path

```bash
npm run dev --research /path/to/custom/research.md "Your question"
```

### Programmatic Usage

```typescript
import { runStitchAgent } from "./src/agent.js";

await runStitchAgent("How do I design a login screen?", {
  model: "sonnet",
  researchDocPath: "./custom-research.md",
  verbose: true
});
```

### Interactive Mode with Options

```bash
npm run interactive --model opus --research ./my-research.md
```

## Cost Considerations

- **Sonnet**: ~$3 per million input tokens, ~$15 per million output tokens
- **Opus**: ~$15 per million input tokens, ~$75 per million output tokens
- **Haiku**: ~$0.25 per million input tokens, ~$1.25 per million output tokens

Each query typically uses:
- Simple questions: 2-5k tokens
- Complex guidance: 5-15k tokens
- Interactive conversations: Grows with context

The agent shows cost after each query in one-shot mode.

## Limitations

- Requires internet connection for API calls
- Costs money per query (see pricing above)
- Research document must be accessible (automatic fallback to built-in knowledge)
- Cannot directly interact with Google Stitch (provides guidance only)
- English language only

## Troubleshooting

### "ANTHROPIC_API_KEY not set"

Set your API key:
```bash
export ANTHROPIC_API_KEY=your-key-here
```

Or add to `.env` file.

### "Failed to load research document"

The agent will work with built-in knowledge. To fix:
1. Check the path in `STITCH_RESEARCH_DOC` environment variable
2. Ensure `../docs/google-stitch-research.md` exists
3. Provide custom path with `--research` flag

### TypeScript/Module Errors

Make sure you've installed dependencies:
```bash
npm install
```

### "Cannot find module"

The project uses ES modules. Ensure `"type": "module"` is in `package.json`.

## Development

### Build

```bash
npm run build
```

Compiles TypeScript to `dist/` directory.

### Run Built Version

```bash
npm start "Your question here"
```

### Add Custom Tools

Edit `src/tools/knowledge.ts` to add new tools:

```typescript
const myCustomTool = tool(
  "tool_name",
  "Description of what the tool does",
  { /* zod schema */ },
  async (args) => {
    // Tool implementation
    return {
      content: [{
        type: "text" as const,
        text: "Result"
      }]
    };
  }
);

// Add to server
export const stitchKnowledgeServer = createSdkMcpServer({
  name: "stitch_knowledge",
  version: "1.0.0",
  tools: [
    // ... existing tools,
    myCustomTool
  ]
});
```

## Resources

### Google Stitch
- [Google Stitch](https://stitch.withgoogle.com)
- [Official Prompt Guide](https://discuss.ai.google.dev/t/stitch-prompt-guide/83844)
- [Google Developers Blog Announcement](https://developers.googleblog.com/en/stitch-a-new-way-to-design-uis/)

### Claude Agent SDK
- [Documentation](https://platform.claude.com/docs/en/agent-sdk/overview.md)
- [TypeScript SDK](https://platform.claude.com/docs/en/agent-sdk/typescript.md)
- [GitHub](https://github.com/anthropics/anthropic-sdk-typescript)

### Related
- [Research Document](../docs/google-stitch-research.md) - Comprehensive Stitch research

## License

MIT

## Contributing

Contributions welcome! Areas for improvement:
- Additional example prompts for different scenarios
- More specialized tools (design system integration, accessibility checker, etc.)
- Support for other languages
- Enhanced research document with more user experiences
- Integration with Stitch API (if available)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the research document
3. Open an issue on GitHub
4. Consult [Claude Agent SDK docs](https://platform.claude.com/docs/en/agent-sdk/overview.md)

---

Built with [Claude Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview.md) by Anthropic
