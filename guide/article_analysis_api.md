# Article Analysis API Guide (AEO & SEO Overhaul)

We have completely reimagined the Article Analysis to focus on **AEO (Answer Engine Optimization)** and actionable **SEO insights**, removing generic "scores" like Sentiment and Plagiarism.

## Endpoint

`GET /api/v1/blogs/:blog_id/articles/:article_id/article_analyses`
`POST /api/v1/blogs/:blog_id/articles/:article_id/article_analyses`

## Response Structure

The response now includes a rich `insight_data` object containing specific issues to display to the user.

```json
{
  "stats": {
    "word_count": 1250,
    "reading_time": 5,
    "keyword_count": 12,
    "difficulty": 45,
    "headings_count": 8,
    "paragraphs_count": 22
  },

  "insight_data": {
    "aeo": {
      "score": 85,
      "issues": [
        {
          "type": "missing_answer_target",
          "message": "Intro doesn't explicitly define 'solar power'. Try starting with 'Solar power is...'."
        }
      ]
    },
    "seo": {
      "score": 90,
      "issues": [
        {
          "type": "keyword_h1_mismatch",
          "message": "Main keyword missing from H1 tag."
        }
      ]
    },
    "readability": {
      "score": 75,
      "issues": [
        {
          "type": "long_sentences",
          "message": "3 sentences are extremely long (>25 words). Shorten them for retention.",
          "examples": ["This sentence goes on forever and ever..."]
        }
      ]
    }
  },

  "grammar": {
    "score": 88,
    "issues": [
      {
        "type": "passive_voice",
        "severity": "warning",
        "message": "Passive voice detected: 'was created'.",
        "context": "This report was created by the team yesterday when...",
        "suggestion": "Try rewriting this so the subject performs the action."
      },
      {
        "type": "weak_adverb",
        "severity": "info",
        "message": "Weak adverb used: 'really'.",
        "context": "It is really important to check this.",
        "suggestion": "Remove 'really' and use a stronger verb."
      }
    ]
  },

  "seo_score": 85, // Aggregate score (keep for high-level display)

  // DEPRECATED / REMOVED (Will be 0 or null)
  "sentiment": 0,
  "plagiarism": 0,
  "readability": 0 // Use insight_data.readability.score instead
}
```

## Frontend Implementation Guidelines

### 1. Visualization

Instead of showing a radial progress bar for "Sentiment", create **"Insight Cards"** for AEO, SEO, and Readability.

- **AEO Card**:
  - **Score**: `insight_data.aeo.score` (Color: Purple/AI-themed)
  - **Issues List**: iterate through `insight_data.aeo.issues`.
    - Display `message` with an warning icon.

- **SEO Card**:
  - **Score**: `insight_data.seo.score` (Color: Blue)
  - **Issues List**: iterate through `insight_data.seo.issues`.

- **Readability Card**:
  - **Score**: `insight_data.readability.score` (Color: Green)
  - **Issues List**: iterate through `insight_data.readability.issues`.
    - If `examples` array exists, show them in a collapsible "Show Examples" section.

### 2. Grammar Section

- **Score**: `grammar.score`
- **Issues**: Iterate through `grammar.issues`.
  - **Display**: Use a "Diff" style or "Highlight" card.
  - **Context**: Show the `context` string.
  - **Highlight**: Bold or highlight the problematic phrase within the `message`.
  - **Suggestion**: Show `suggestion` clearly below the issue.
  - **Severity**: Use badges (Warning/Error/Info) based on `severity`.

### 3. Removals

- **Remove** the "Sentiment Analysis" widget entirely.
- **Remove** the "Plagiarism Check" widget entirely.
- **Update** the "Readability" widget to use the new `insight_data` source which provides specific reasons (long sentences, complex vocab) rather than just a Flesch-Kincaid number.
