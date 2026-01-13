import { Metadata } from "next";
import ArticleClientPage from "./ArticleClientPage";
// import { axiosInstance } from "@/lib/axiosInstace";
// Note: axiosInstance is configured for client-side (interceptor uses localStorage/cookies maybe?)
// For server side, we might need a different approach or fetch directly if we know the URL.
// But for now, we will assume we can try to fetch or fallback.

// Since we cannot easily access the AUTH token on server side without cookies helper
// and the API might require auth, implementing fully dynamic metadata for *private* articles
// might be tricky without moving auth logic to Next.js middleware or server actions.

// However, if the user just wants the "Idea" of dynamic metadata, we can structure it.
// If actual fetching fails (due to auth), we can fallback to "Article Editor".

type Props = {
  params: { article_id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // TODO: Fetch article data securely on server.
  // const id = params.article_id;

  // For now, since we don't have a server-side auth client ready,
  // we will return a generic but slightly more specific title, or try to fetch if public.
  // If the user *needs* the actual title, we'd need to implementing server-side fetching with cookies.

  return {
    title: "Article Editor",
  };
}

export default function Page() {
  return <ArticleClientPage />;
}
