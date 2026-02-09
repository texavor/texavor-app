export interface PlatformScores {
  gemini: number;
  perplexity: number;
  chatgpt: number;
  [key: string]: number;
}

export interface PlatformBlockers {
  chatgpt: string[];
  perplexity: string[];
  gemini: string[];
  [key: string]: string[];
}

export interface PlatformRecommendations {
  chatgpt: string;
  perplexity: string;
  gemini: string;
  [key: string]: string;
}

export interface AeoIssue {
  message: string;
}

export interface Breakdown {
  definitions: number;
  lists: number;
  quotes: number;
}

export interface Examples {
  best_definition: string;
  best_list: string;
  best_quote: string;
}

export interface Answerability {
  score: number;
  definition_ready_sections: number;
  list_ready_sections: number;
  quote_ready_sentences: number;
  breakdown: Breakdown;
  examples: Examples;
}

export interface RetrievableChunk {
  text: string;
  score: number;
  type: string;
  reason: string;
}

export interface ScoreBreakdown {
  structure: number;
  retrievability: number;
  information_density: number;
  platform_alignment: number;
  authority_signals: number;
}

export interface AeoData {
  score: number;
  platform_scores: PlatformScores;
  platform_blockers: PlatformBlockers;
  platform_recommendations: PlatformRecommendations;
  issues: AeoIssue[];
  answerability: Answerability;
  retrievable_chunks: RetrievableChunk[];
  score_breakdown: ScoreBreakdown;
}

export interface ReadabilityIssue {
  type: string;
  message: string;
  examples?: string[];
}

export interface ReadabilityData {
  score: number;
  issues: ReadabilityIssue[];
}

export interface SeoIssue {
  type: string;
  message: string;
}

export interface SeoData {
  score: number;
  issues: SeoIssue[];
}

export interface StatsData {
  word_count: number;
  reading_time: number;
  keyword_count: number;
  difficulty: number;
  headings_count: number;
  paragraphs_count: number;
}

export interface SimulationData {
  snippet: string;
  style: string;
  aeo_readiness: number;
}

export interface EntityGapsData {
  score: number;
  missing: string[];
  message: string;
}

export interface CitationPotentialData {
  score: number;
  prediction: "high" | "medium" | "low";
  content_type: string;
  citation_rate: number;
  factors: {
    content_type_score: number;
    word_count_score: number;
    information_density_score: number;
    structure_score: number;
  };
  recommendations: Array<{
    type: string;
    message: string;
    priority: string;
  }>;
  insights: string[];
}

export interface InsightsData {
  stats: StatsData;
  grammar: {
    score: number;
    issues: any[];
  };
  aeo: AeoData;
  seo: SeoData;
  readability: ReadabilityData;
  simulation: SimulationData;
  entity_gaps: EntityGapsData;
  citation_potential: CitationPotentialData;
  live_benchmark: any[];
  seo_score: number;
  authority: number;
  created_at: string;
}
