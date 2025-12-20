# Quick Start Guide

Get up and running with the Google Stitch Expert Agent in 5 minutes.

## 1. Prerequisites

- Node.js 18+ installed
- Anthropic API key

Don't have an API key? Get one at [console.anthropic.com](https://console.anthropic.com/)

## 2. Setup (2 minutes)

```bash
# Navigate to the agent directory
cd stitch-expert-agent

# Install dependencies
npm install

# Create .env file with your API key
echo "ANTHROPIC_API_KEY=your-key-here" > .env
```

**Important:** Replace `your-key-here` with your actual Anthropic API key.

## 3. Test It Works

```bash
# Run with default question
npm run dev
```

You should see the agent provide comprehensive best practices for Google Stitch.

## 4. Try Different Modes

### One-Shot Questions

Ask single questions:

```bash
npm run dev "How do I create a modern dashboard design?"
```

### Interactive Conversations

Have a back-and-forth conversation:

```bash
npm run interactive
```

Then type your questions. The agent remembers context!

Example:
```
You: I'm designing a fitness app
Stitch Expert: [gives guidance on fitness app design...]

You: What colors work best for this?
Stitch Expert: [suggests colors based on fitness app context...]
```

Type `exit` to quit.

## 5. Common Use Cases

### Get Help with Prompts

```bash
npm run dev "Help me write a prompt for a login screen"
```

### Fix Problems

```bash
npm run dev "My designs look too generic, how do I fix this?"
```

### Choose the Right Mode

```bash
npm run dev "Should I use Standard or Experimental mode?"
```

### See Examples

```bash
npm run dev "Show me an example prompt for a landing page"
```

## 6. Tips

- **Be specific**: "How do I design a modern mobile login screen?" is better than "Help with design"
- **Use interactive mode** for complex projects where you need to iterate
- **Ask follow-up questions** in interactive mode - context is preserved
- **Check costs** after queries (shown at the end in one-shot mode)

## Next Steps

- Read the [full README](./README.md) for advanced features
- Review the [research document](../docs/google-stitch-research.md) for comprehensive Stitch knowledge
- Run `npm run test` to see example queries
- Check `--help` for all options: `npm run dev --help`

## Need Help?

- **API Key Issues**: Make sure `.env` file exists and contains `ANTHROPIC_API_KEY=your-key`
- **Install Problems**: Delete `node_modules` and run `npm install` again
- **General Questions**: Use the agent itself! `npm run dev "How do I..."`

---

You're all set! Start asking questions and master Google Stitch. 🎨
