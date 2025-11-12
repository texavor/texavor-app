// components/article/InjectedRelatedArticles.tsx
import Link from "next/link";
import React from "react";

interface RelatedArticle {
  slug: string;
  image: string;
  title: string;
}

interface InjectedRelatedArticlesProps {
  article: RelatedArticle;
}

export const InjectedRelatedArticles: React.FC<
  InjectedRelatedArticlesProps
> = ({ article }) => {
  if (!article) {
    return null;
  }

  return (
    <div className="border-t-[1px] border-b-[1px] border-gray-600 pb-10 w-full">
      <h3
        className="font-raleway text-xl font-medium text-gray-800"
        style={{ margin: "16px 0px" }}
      >
        You might also like...
      </h3>
      <div className="w-full">
        <Link
          href={`/${article.slug}`}
          key={article.slug}
          className="no-underline"
          passHref
        >
          <div
            className="bg-[#EEDED3] rounded-xl overflow-hidden w-full md:flex gap-4"
            style={{ margin: "0px" }}
          >
            <div className="overflow-hidden md:w-[50%]">
              <img
                src={article.image}
                alt={article.title}
                className="object-cover w-full m-0 transition-transform duration-300 hover:scale-[1.1]"
                loading="lazy"
                style={{ margin: "0px" }}
              />
            </div>
            <div className="md:w-[50%] mt-4 px-2 pb-4 md:p-0">
              <p
                className="font-arcade text-2xl no-underline font-medium text-gray-900 md:pr-4"
                style={{ margin: "0px" }}
              >
                {article.title}
              </p>
              <p
                className="font-raleway text-sm no-underline font-medium text-gray-700 pt-2 md:pr-4"
                style={{ margin: "0px" }}
              >
                {/* @ts-ignore */}
                {article?.description}
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};
