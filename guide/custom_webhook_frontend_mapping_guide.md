# Custom Webhook Field Mapping Guide (Frontend)

This guide details the variables available for **Custom Webhook Field Mapping**, specifically for configuring the "Field Mapping" UI in the integration settings.

## 1. Available Variables

When the user configures "Field Mapping", they can map your internal article data to the keys required by their destination API using these variables.

| Variable                 | Description                                     | Example Value         |
| :----------------------- | :---------------------------------------------- | :-------------------- |
| `{{title}}`              | Article Title                                   | "My New Post"         |
| `{{content}}`            | Article Content (Markdown/HTML)                 | "# Hello World..."    |
| `{{slug}}`               | Slug                                            | "my-new-post"         |
| `{{tags}}`               | Tags Array                                      | `["react", "webdev"]` |
| `{{canonical_url}}`      | Canonical URL                                   | "https://..."         |
| `{{author.name}}`        | Article Author Name                             | "John Doe"            |
| `{{author.external_id}}` | **Selected Platform Author ID** (Raw)           | "user_123" OR 123     |
| `{{author_id_numeric}}`  | **Selected Platform Author ID** (Forced Number) | 123                   |

---

## 2. Frontend Configuration

To support **Author ID** mapping in the UI (e.g., in `IntegrationSettingsDialog.tsx` or similar), add the following entry to your field mapping configuration list:

```typescript
// Add this to your available mapping fields constant
{
  label: "Author ID",
  variable: "{{author.external_id}}",
  key: "authorId", // Default key suggestion for the user
  description: "The unique ID of the selected author from the platform"
}
```

### Advanced: Numeric IDs

If the destination API **requires** a number for the author ID and fails with strings (e.g., `expected number, got string`), suggest using `{{author_id_numeric}}` instead.

```typescript
// Optional: For strict numeric APIs
{
  label: "Author ID (Numeric)",
  variable: "{{author_id_numeric}}",
  key: "authorId",
  description: "Forces the Author ID to be a number (removes non-digits)"
}
```

## 3. Usage Examples

### Scenario A: Destination expects `userId` (String)

- **User sees:** Author ID
- **User maps to key:** `userId`
- **Result Payload:**
  ```json
  { "userId": "user_abc123" }
  ```

### Scenario B: Destination expects `author_id` (Integer)

- **User sees:** Author ID (Numeric)
- **User maps to key:** `author_id`
- **Result Payload:**
  ```json
  { "author_id": 456 }
  ```
