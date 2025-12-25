import fs from "fs";
import path from "path";

/**
 * Load the Google Stitch research document
 */
export async function loadResearchDocument(docPath: string): Promise<string> {
  try {
    const absolutePath = path.resolve(docPath);
    const content = fs.readFileSync(absolutePath, "utf-8");
    return content;
  } catch (error) {
    throw new Error(`Failed to load research document from ${docPath}: ${error}`);
  }
}

/**
 * Embed research content into system prompt
 */
export function embedResearchInPrompt(researchContent: string): string {
  return `

## Google Stitch Research Document

You have access to comprehensive research about Google Stitch below. Use this information to provide expert, accurate guidance.

<research_document>
${researchContent}
</research_document>

This research document contains:
- Complete feature descriptions for Standard and Experimental modes
- Proven prompting best practices from user experiences
- Common pitfalls and how to avoid them
- Export workflows and limitations
- Real user reviews and feedback
- Troubleshooting guides
- Example prompts and templates

Always reference this research when providing advice to ensure accuracy and alignment with Stitch's actual capabilities.
`;
}

/**
 * Load research with fallback
 */
export async function loadResearchWithFallback(
  preferredPath?: string
): Promise<string> {
  const paths = [
    preferredPath,
    process.env.STITCH_RESEARCH_DOC,
    "../docs/google-stitch-research.md",
    "../../docs/google-stitch-research.md",
    "../../../docs/google-stitch-research.md"
  ].filter(Boolean) as string[];

  for (const docPath of paths) {
    try {
      return await loadResearchDocument(docPath);
    } catch (error) {
      // Try next path
      continue;
    }
  }

  console.warn("⚠️  Could not load research document. Agent will work with built-in knowledge only.");
  return "";
}
