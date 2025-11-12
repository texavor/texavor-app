"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { ArticleContent } from "./ArticleContent";
import Link from "next/link";
import Image from "next/image";
import { ShareButtons } from "./ShareButtons";
import { TableOfContents } from "./TableOfContents";

// Interfaces
interface Heading {
  id: string;
  level: number;
  text: string;
  children?: Heading[];
}

interface ArticleData {
  image: string;
  title: string;
  profile_pic: string;
  created_at: string;
  updated_at: string;
  description: string;
  tags: Array<String>;
  relatedArticles: any;
  easywrite_author: {
    username: string;
    name: string;
    profile_pic: string;
  };
}

interface ArticleViewProps {
  articleData: ArticleData;
  html: string;
}

export function ArticleView({ articleData, html }: ArticleViewProps) {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [showFloatingShare, setShowFloatingShare] = useState(false);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [isTocLoaded, setIsTocLoaded] = useState(false);
  const articleContentRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    if (docHeight > 0) {
      const scrolled = (scrollTop / docHeight) * 100;
      setScrollPercentage(scrolled);
    } else {
      setScrollPercentage(0);
    }

    if (articleContentRef.current && isTocLoaded) {
      const { top, bottom } = articleContentRef.current.getBoundingClientRect();
      if (top < window.innerHeight && bottom > 800) {
        setShowFloatingShare(true);
      } else {
        setShowFloatingShare(false);
      }
    }
  }, [isTocLoaded]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [handleScroll]);

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-1.5 z-[200] backdrop-blur-sm">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 origin-left transition-transform duration-250 ease-out"
          style={{ transform: `scaleX(${scrollPercentage / 100})` }}
        />
      </div>

      <div className="container mx-auto lg:w-[1200px] md:w-8/12 w-11/12 mt-10">
        <div className="flex flex-col lg:flex-row lg:gap-12">
          <div className="lg:w-[72%] xl:w-3/4">
            <div className="relative w-full max-w-4xl aspect-[1000/420] rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-zinc-900 flex justify-center items-center z-0">
                <p className="font-raleway text-gray-200 font-semibold text-center text-xl md:text-3xl px-4">
                  {articleData?.title}
                </p>
              </div>
              {articleData?.image && (
                <Image
                  src={articleData?.image}
                  alt={`Cover image for ${articleData?.title}`}
                  fill
                  className="object-cover z-10"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 900px"
                />
              )}
            </div>

            <h1 className="font-arcade heading1 mt-6 text-3xl font-medium">
              {articleData.title}
            </h1>
            <div className="flex flex-wrap">
              {articleData?.tags?.map((item, index) => (
                <span
                  className="font-raleway underline mr-2 decoration-purple-300 decoration-2"
                  key={index}
                >
                  #{item}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <div>
                <Image
                  src={articleData?.easywrite_author?.profile_pic}
                  alt={articleData?.easywrite_author?.name || "Author"}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <p className="font-raleway text-base">
                  {articleData?.easywrite_author?.name ||
                    articleData?.easywrite_author?.username}
                </p>
                <p className="font-raleway text-sm text-gray-400">
                  Updated on{` `}
                  {format(
                    new Date(articleData.updated_at || new Date()),
                    "dd MMM, yyyy",
                  )}
                </p>
              </div>
            </div>

            <hr className="border-gray-300 mt-6 mb-8" />
            {headings.length > 0 && <TableOfContents headings={headings} />}
            <div ref={articleContentRef}>
              <ArticleContent
                html={html}
                relatedArticles={articleData.relatedArticles}
                setHeadings={setHeadings}
                setIsTocLoaded={setIsTocLoaded}
              />
            </div>
            <div
              className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all ease-out duration-300 ${
                showFloatingShare
                  ? "opacity-100 scale-100 bottom-10"
                  : "opacity-0 scale-0 bottom-0"
              }`}
            >
              <ShareButtons
                title={articleData.title}
                url={typeof window !== "undefined" ? window.location.href : ""}
                description={articleData.description}
              />
            </div>
          </div>

          <div className="mt-8 lg:mt-0 lg:sticky lg:top-28 self-start h-fit">
            <div className="lg:max-w-[260px]">
              <div className="bg-[#EEDED3] p-4 rounded-2xl border-none shadow-sm">
                {" "}
                <h2 className="font-raleway text-lg font-semibold text-gray-800 mb-4">
                  EasyWrite
                </h2>
                <a
                  href="https://gum.co/u/5trlznje"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
                >
                  <Image
                    src="/article_easywrite.png"
                    alt="EasyWrite"
                    width={260}
                    height={260}
                    className="w-full h-auto shadow-sm object-cover mb-4 rounded-2xl"
                  />
                </a>
                <h4 className="font-raleway text-base font-medium text-gray-900">
                  Built for the New Era of Search
                </h4>
                <p className="font-raleway text-sm text-gray-600 mt-2">
                  Generic AI writers and outdated SEO tools are losing the
                  battle for visibility. We focus on what's next.
                </p>
                <div className="flex items-center gap-2 mt-4">
                  {false && (
                    <p className="inline-block border-[1px] px-8 border-purple-600 text-purple-600 font-semibold py-2 px-4 rounded-full text-sm bg-white">
                      Free
                    </p>
                  )}
                  <Link
                    href="/"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#104127] text-white font-semibold py-2 px-4 rounded-full hover:[#104127] transition-colors duration-200 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
                  >
                    Join Waitlist 🚀
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 lg:mt-[80px] border-t-[1px] border-gray-400 pt-4 md:transform">
          <p className="font-raleway text-[24px] font-semibold text-gray-800 mb-4">
            Related Articles
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6 pt-4">
            {articleData?.relatedArticles
              ?.slice(2, 5)
              ?.map((relatedArticle: any) => (
                <Link
                  key={relatedArticle?.slug}
                  href={`/${relatedArticle?.slug}`}
                  passHref
                >
                  <div className="bg-[#EEDED3] rounded-2xl overflow-hidden h-full">
                    <div className="relative overflow-hidden h-[150px] lg:h-[200px]">
                      <Image
                        src={relatedArticle?.image}
                        alt={relatedArticle?.title}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-[1.1]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <p className="font-arcade text-[24px] text-black font-medium px-2 pb-2">
                      {relatedArticle?.title}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
