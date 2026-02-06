# Smart Link API Guide & Frontend Implementation

## API Endpoints

### 1. Get Link Suggestions (Cached)

**Endpoint**: `GET /api/v1/blogs/:blog_id/articles/:article_id/link_suggestions`

**Description**: Retrieves cached link suggestions if available.

**Response**:

```json
{
  "suggestions": {
    "internal": [
      {
        "id": "uuid",
        "anchor_text": "exact text from article",
        "url": "/target-article-slug",
        "reason": "why this link is relevant",
        "is_applied": false,
        "position": 1234,
        "exact_match": "exact text from article",
        "match_type": "exact"
      }
    ],
    "external": [
      {
        "id": "uuid",
        "anchor_text": "authoritative source",
        "url": "https://example.com",
        "reason": "citation needed",
        "is_applied": false,
        "position": 5678,
        "exact_match": "authoritative source",
        "match_type": "exact"
      }
    ]
  },
  "cached": true
}
```

**New Fields** (Added in Backend Fix):

- `position`: Character position in article where anchor text starts
- `exact_match`: The actual text found in article (may differ in case from `anchor_text`)
- `match_type`: Either `"exact"` or `"case_insensitive"`

---

### 2. Generate Link Suggestions

**Endpoint**: `POST /api/v1/blogs/:blog_id/articles/:article_id/link_suggestions`

**Description**: Generates new link suggestions using AI.

**Request Body**:

```json
{
  "force_refresh": true,
  "include_external": false
}
```

**Parameters**:

- `force_refresh` (boolean): Force regeneration even if cached suggestions exist
- `include_external` (boolean): Include external link suggestions (Wikipedia, docs, etc.)

**Response**: Same as GET endpoint

---

### 3. Update Link Status

**Endpoint**: `PATCH /api/v1/blogs/:blog_id/articles/:article_id/link_suggestions`

**Description**: Mark suggestions as applied or unapplied.

**Request Body** (Single Update):

```json
{
  "id": "suggestion-uuid",
  "is_applied": true
}
```

**Request Body** (Apply All):

```json
{
  "apply_all": true
}
```

**Response**:

```json
{
  "success": true,
  "suggestions": {
    /* updated suggestions */
  }
}
```

---

## Frontend Implementation Guide

### Overview

The backend now provides:

1. **Exact text matching** with word boundaries
2. **Position tracking** for precise text location
3. **Case-insensitive fallback** when exact match fails

Your frontend needs to:

1. Find the anchor text using the provided `position` and `exact_match`
2. Replace it with markdown link syntax
3. Handle edge cases (multiple occurrences, already linked text)

---

### Implementation Steps

#### Step 1: Find the Editor Reference

Locate where your markdown editor is initialized. You need access to:

- `getValue()` - get current content
- `setValue()` - set new content
- Optionally: `getSelection()`, `replaceSelection()` for cursor-aware replacement

**Example** (assuming CodeMirror or similar):

```typescript
// In your article page component
const editorRef = useRef<EditorInstance>(null);

// Pass to InsightsPanel
<InsightsPanel
  editorRef={editorRef}
  onApplyLink={handleApplyLink}
  onRemoveLink={handleRemoveLink}
  // ... other props
/>
```

---

#### Step 2: Implement `handleApplyLink`

```typescript
const handleApplyLink = (suggestion: LinkSuggestion) => {
  if (!editorRef.current) {
    toast.error("Editor not ready");
    return;
  }

  const content = editorRef.current.getValue();
  const { anchor_text, url, position, exact_match } = suggestion;

  // Use exact_match (actual text in article) instead of anchor_text
  const textToReplace = exact_match || anchor_text;

  // Verify the text at the position matches
  const actualText = content.substring(
    position,
    position + textToReplace.length,
  );

  if (actualText !== textToReplace) {
    toast.error(
      `Text mismatch: expected "${textToReplace}" at position ${position}, found "${actualText}"`,
    );
    console.error("Link application failed:", {
      expected: textToReplace,
      found: actualText,
      position,
      suggestion,
    });
    return;
  }

  // Check if already linked
  const beforeText = content.substring(Math.max(0, position - 1), position);
  const afterText = content.substring(
    position + textToReplace.length,
    position + textToReplace.length + 2,
  );

  if (beforeText === "[" || afterText.startsWith("](")) {
    toast.warning("This text is already part of a link");
    return;
  }

  // Create markdown link
  const markdownLink = `[${textToReplace}](${url})`;

  // Replace text
  const newContent =
    content.substring(0, position) +
    markdownLink +
    content.substring(position + textToReplace.length);

  editorRef.current.setValue(newContent);

  // Update backend status
  updateLinkStatus.mutate({
    blogId,
    articleId,
    suggestionId: suggestion.id,
    isApplied: true,
  });

  toast.success("Link applied successfully");
};
```

---

#### Step 3: Implement `handleRemoveLink`

```typescript
const handleRemoveLink = (anchorText: string, url: string) => {
  if (!editorRef.current) {
    toast.error("Editor not ready");
    return;
  }

  const content = editorRef.current.getValue();

  // Escape special regex characters
  const escapeRegex = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  // Find markdown link pattern: [anchor_text](url)
  const escapedAnchor = escapeRegex(anchorText);
  const escapedUrl = escapeRegex(url);
  const regex = new RegExp(`\\[${escapedAnchor}\\]\\(${escapedUrl}\\)`, "g");

  const matches = content.match(regex);

  if (!matches || matches.length === 0) {
    toast.error(`Link not found: [${anchorText}](${url})`);
    return;
  }

  if (matches.length > 1) {
    console.warn(
      `Multiple matches found for link, removing all ${matches.length} occurrences`,
    );
  }

  // Replace all occurrences
  const newContent = content.replace(regex, anchorText);

  editorRef.current.setValue(newContent);

  toast.success(
    `Link removed (${matches.length} occurrence${matches.length > 1 ? "s" : ""})`,
  );
};
```

---

#### Step 4: Handle Edge Cases

**Multiple Occurrences**:

```typescript
// If you want to let user choose which occurrence to link
const findAllOccurrences = (content: string, text: string) => {
  const occurrences = [];
  let index = 0;

  while ((index = content.indexOf(text, index)) !== -1) {
    // Check word boundaries
    const before = index > 0 ? content[index - 1] : " ";
    const after =
      index + text.length < content.length ? content[index + text.length] : " ";

    const isWordBoundary = /\W/.test(before) && /\W/.test(after);

    if (isWordBoundary) {
      occurrences.push({
        position: index,
        context: content.substring(
          Math.max(0, index - 50),
          Math.min(content.length, index + text.length + 50),
        ),
      });
    }

    index += text.length;
  }

  return occurrences;
};
```

**Already Linked Text**:

```typescript
const isAlreadyLinked = (content: string, position: number, length: number) => {
  // Check if text is inside markdown link syntax
  const before = content.substring(Math.max(0, position - 100), position);
  const after = content.substring(position + length, position + length + 100);

  // Check for [text](url) pattern
  const openBracket = before.lastIndexOf("[");
  const closeBracket = after.indexOf("]");
  const openParen = after.indexOf("(");
  const closeParen = after.indexOf(")");

  if (
    openBracket !== -1 &&
    closeBracket !== -1 &&
    openParen !== -1 &&
    closeParen !== -1 &&
    closeBracket < openParen &&
    openParen < closeParen
  ) {
    return true;
  }

  return false;
};
```

---

### Step 5: Update SmartLinkingPanel

```typescript
// In SmartLinkingPanel.tsx
const handleApply = (item: LinkSuggestion) => {
  // Pass the full suggestion object instead of just anchor_text and url
  onApplyLink(item);
};

// Update prop types
interface SmartLinkingPanelProps {
  articleId: string;
  blogId: string;
  onApplyLink: (suggestion: LinkSuggestion) => void;
  onRemoveLink: (anchorText: string, url: string) => void;
}
```

---

## Testing Checklist

- [ ] Apply link with exact match
- [ ] Apply link with case-insensitive match
- [ ] Apply link to text with special characters
- [ ] Apply link to text that appears multiple times
- [ ] Try to apply link to already-linked text
- [ ] Remove link successfully
- [ ] Remove link that doesn't exist (should show error)
- [ ] Apply all links at once
- [ ] Verify backend status updates correctly

---

## Common Issues & Solutions

### Issue: "Text not found at position"

**Cause**: Article content changed after suggestions were generated

**Solution**:

- Show warning to user
- Offer to regenerate suggestions
- Implement content change detection

### Issue: Wrong text gets linked

**Cause**: Multiple occurrences of same text

**Solution**:

- Use `position` field to target exact occurrence
- Verify text at position before applying
- Consider showing context to user for confirmation

### Issue: Links break markdown formatting

**Cause**: Text already part of another markdown element

**Solution**:

- Check for existing markdown syntax before/after
- Validate markdown after link application
- Offer to undo if validation fails

---

## Future Enhancements

1. **Visual Highlighting**: Highlight suggested anchor texts in editor
2. **Inline Application**: Click anchor text in editor to apply link
3. **Undo/Redo**: Track link applications for easy reversal
4. **Conflict Detection**: Warn if text is inside code blocks, headings, etc.
5. **Batch Operations**: Apply/remove multiple links with one action
6. **Analytics**: Track which suggestions get applied vs dismissed
