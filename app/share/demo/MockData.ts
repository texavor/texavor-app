export const MOCK_DASHBOARD_STATS = {
  total_articles: 124,
  total_words: 156000,
  traffic_growth: 345,
  keyword_rankings: [
    { position: 1, count: 12 },
    { position: 3, count: 45 },
    { position: 10, count: 128 },
  ],
  recent_activity: [
    {
      id: 1,
      action: "Article Published",
      title: "Future of SEO",
      date: "2 mins ago",
    },
    {
      id: 2,
      action: "Keyword Research",
      title: "SaaS Marketing",
      date: "1 hour ago",
    },
  ],
};

// --- AEO Metrics (Brand Authority) ---
export const MOCK_AEO_METRICS = {
  current_score: {
    total_mentions: 1250,
    total_prompts_tested: 50,
    platforms_count: 4,
    best_platform: "ChatGPT",
    cross_model_consistency: 85.5,
    presence_rate: 92.0,
    average_sentiment: 0.8,
    average_position: 1.2,
  },
  summary: {
    platforms_tracked: 5,
    total_prompts: 50,
  },
  historical_scores: [
    { date: "2024-01-01", score: 65 },
    { date: "2024-01-08", score: 70 },
    { date: "2024-01-15", score: 72 },
    { date: "2024-01-22", score: 78 },
    { date: "2024-01-29", score: 82 },
    { date: "2024-02-01", score: 85 },
  ],
  platform_breakdown: {
    ChatGPT: { score: 95.0, avg_position: 1.0 },
    Claude: { score: 88.5, avg_position: 1.5 },
    Gemini: { score: 82.0, avg_position: 2.1 },
    Perplexity: { score: 91.0, avg_position: 1.2 },
    Grok: { score: 70.5, avg_position: 3.5 },
  },
};

export const MOCK_AEO_PROMPTS = {
  prompts: [
    {
      id: 1,
      text: "Best AI writing tools for SEO",
      frequency: 150,
      sentiment: "Positive",
      avg_position: 1.2,
      platforms: ["ChatGPT", "Claude"],
    },
    {
      id: 2,
      text: "How to automate content marketing",
      frequency: 95,
      sentiment: "Neutral",
      avg_position: 2.5,
      platforms: ["Gemini"],
    },
  ],
};

export const MOCK_COMPETITIVE_RANKINGS = {
  rankings: [
    { name: "Texavor", rank: 1, score: 92 },
    { name: "Competitor A", rank: 2, score: 78 },
    { name: "Competitor B", rank: 3, score: 65 },
  ],
};

export const MOCK_ARTICLE = {
  id: "demo-id",
  title: "The Future of AI in Content Marketing",
  content:
    "<h2>Introduction</h2><p>Artificial Intelligence is rapidly transforming...</p>",
  score: 85,
  status: "published",
  keywords: ["ai content", "marketing automation"],
  slug: "future-of-ai-content-marketing",
};

export const MOCK_KEYWORDS = [
  { term: "ai writing assistant", volume: 12000, difficulty: 45, cpc: 2.5 },
  { term: "content marketing tools", volume: 5400, difficulty: 60, cpc: 5.1 },
];

export const DEMO_USER = {
  id: "demo",
  email: "demo@texavor.com",
  first_name: "Demo",
  last_name: "User",
  role: "admin",
  avatar: null,
};

export const DEMO_BLOG = {
  id: "demo-blog",
  name: "Texavor Demo",
  website_url: "https://texavor.com",
  niche: "SaaS Marketing",
  status: "active",
};
