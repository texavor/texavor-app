// app/articles/page.tsx

import React from "react";
import { baseURL } from "@/lib/axiosInstace";
import PageTransition from "@/components/PageTransition";
import Image from "next/image";

import ArticleCard from "./ArticleCard";

interface ArticlePreview {
  slug: string;
  title: string;
  description: string;
  updatedAt: string;
  tag: string[];
  image: string;
}

// Create SSR-safe axios instance
const getServerAxiosInstance = () => {
  const axios = require("axios");
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Fetch articles at the server level
const getArticles = async (): Promise<ArticlePreview[]> => {
  try {
    const axiosInstance = getServerAxiosInstance();
    const response = await axiosInstance.get(`${baseURL}/easywrite_articles`);

    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
};

export default async function ArticleListPage() {
  const articleData = await getArticles();

  return (
    <PageTransition>
      <div className="w-full md:max-w-[1200px] mx-auto py-2 px-4">
        <h1 className="font-raleway text-[32px] font-medium">
          Stories by EasyWrite
        </h1>
        {articleData?.length === 0 ? (
          <div className="w-full justify-center flex">
            <Image
              src="/not_found_article.png"
              alt="not_found"
              width={500}
              height={500}
            />
          </div>
        ) : (
          <div className="flex my-4">
            <ArticleCard
              key={articleData?.[0]?.slug}
              title={articleData?.[0]?.title}
              description={articleData?.[0]?.description}
              date={articleData?.[0]?.updatedAt}
              tag={articleData?.[0]?.tag}
              slug={articleData?.[0]?.slug}
              image={articleData?.[0]?.image}
              type="normal"
            />
            <div className="flex flex-col gap-4">
              {articleData?.length > 1 && (
                <ArticleCard
                  key={articleData?.[1]?.slug}
                  title={articleData?.[1]?.title}
                  description={articleData?.[1]?.description}
                  date={articleData?.[1]?.updatedAt}
                  tag={articleData?.[1]?.tag}
                  slug={articleData?.[1]?.slug}
                  image={articleData?.[1]?.image}
                  type="flex"
                />
              )}
              {articleData?.length > 2 && (
                <ArticleCard
                  key={articleData?.[2]?.slug}
                  title={articleData?.[2]?.title}
                  description={articleData?.[2]?.description}
                  date={articleData?.[2]?.updatedAt}
                  tag={articleData?.[2]?.tag}
                  slug={articleData?.[2]?.slug}
                  image={articleData?.[2]?.image}
                  type="flex"
                />
              )}
            </div>
          </div>
        )}
        {articleData.length > 2 && (
          <>
            <p className="font-raleway text-[24px] font-medium">
              More Articles...
            </p>
            <div className="grid md:grid-cols-3 grid-cols-1 gap-x-4 gap-y-6 py-4">
              {articleData?.slice(3)?.map((item) => (
                <ArticleCard
                  key={item.slug}
                  title={item.title}
                  description={item.description}
                  date={item.updatedAt}
                  tag={item.tag}
                  slug={item.slug}
                  image={item?.image}
                  type="normal"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}
