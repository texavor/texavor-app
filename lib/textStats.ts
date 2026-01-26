export interface ArticleStats {
  wordCount: number;
  readingTime: number; // minutes
  headingCount: number;
  paragraphCount: number;
}

export function calculateArticleStats(content: string): ArticleStats {
  if (!content) {
    return {
      wordCount: 0,
      readingTime: 0,
      headingCount: 0,
      paragraphCount: 0,
    };
  }

  // Word Count
  // Split by whitespace and filter out empty strings
  const words = content
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const wordCount = words.length;

  // Reading Time (Average 200 words per minute)
  // Ensure at least 1 min if there are words
  const readingTime =
    wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 200)) : 0;

  // Headings
  // Matches markdown headings (# Heading) at start of line
  const headingCount = (content.match(/^#{1,6}\s/gm) || []).length;

  // Paragraphs
  // Split by double newlines which typically separate paragraphs in Markdown
  // Also filter out empty paragraphs
  const paragraphCount = content
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0).length;

  return {
    wordCount,
    readingTime,
    headingCount,
    paragraphCount,
  };
}
