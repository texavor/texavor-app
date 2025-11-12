"use client";

import { useState } from "react";
import { Twitter, Linkedin, Link } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url: string;
  description: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [rotated, setRotated] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setRotated(true);
    setTimeout(() => setRotated(false), 1000);
  };

  const shareText = `${title} 🚀 by @surajondev\n\n`;

  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    url,
  )}&text=${encodeURIComponent(shareText)}`;
  const linkedinShareUrl = `https://www.linkedin.com/shareArticle?url=${encodeURIComponent(
    url,
  )}`;

  return (
    <div className="flex items-center gap-4 bg-[#EEDED3] bg-opacity-50 backdrop-blur-lg rounded-full px-4 py-2 shadow-sm">
      <a
        href={twitterShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-black"
      >
        <Twitter size={20} />
      </a>
      <div className="border-l border-gray-700 h-5"></div>
      <a
        href={linkedinShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-black"
      >
        <Linkedin size={20} />
      </a>
      <div className="border-l border-gray-700 h-5"></div>
      <button onClick={copyToClipboard} className="text-black">
        <Link
          size={20}
          className={`transition-transform duration-700 ${
            rotated ? "rotate-180" : ""
          }`}
        />
      </button>
    </div>
  );
}
