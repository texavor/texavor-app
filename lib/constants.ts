export const ARTICLE_STATUS_COLORS = {
  draft: {
    bg: "#FFE8A3",
    text: "#C58A00",
    label: "Draft",
    chart: "#EAB308", // Yellow-500
  },
  // review: {
  //   bg: "#BEE7EF",
  //   text: "#0F6C7A",
  //   label: "Review",
  //   chart: "#3B82F6", // Blue-500
  // },
  scheduled: {
    bg: "#E5D5FF",
    text: "#6A32B9",
    label: "Scheduled",
    chart: "#A855F7", // Purple-500
  },
  published: {
    bg: "#C9F3D3",
    text: "#1E7A33",
    label: "Published",
    chart: "#22C55E", // Green-500
  },
} as const;

export type ArticleStatus = keyof typeof ARTICLE_STATUS_COLORS;

export const getStatusColor = (status: string) => {
  const normalizedStatus = status.toLowerCase() as ArticleStatus;
  return (
    ARTICLE_STATUS_COLORS[normalizedStatus] || ARTICLE_STATUS_COLORS.published
  );
};
