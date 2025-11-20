// In-memory store for articles.
// NOTE: This is for demonstration purposes only and will not persist data between server restarts.
export const articles: { [key: string]: { id: string; title: string; content: string } } = {};
