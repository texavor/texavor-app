"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What exactly does this platform do?",
    answer:
      "It's an AI-powered content strategist for technical content. It gives you data-driven article titles and structured outlines to help you write content that ranks on Google and gets cited by AI search engines like ChatGPT and Google's AI Overviews.",
  },
  {
    question: "How is this different from AI writers like Jasper or Copy.ai?",
    answer:
      "We don't write the articles for you—and that's our biggest strength. AI writers generate generic content, which can hurt your credibility and E-E-A-T score. Our tool is a copilot that enhances your expertise. We provide the strategic blueprint; you provide the experience and insights that search engines reward.",
  },
  {
    question: "What are GEO and E-E-A-T, and why should I care?",
    answer:
      "GEO (Generative Engine Optimization) is the practice of optimizing your content to be featured in the answers of AI search engines. E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) is Google's framework for evaluating content quality and credibility. They are the future of discoverability. Optimizing for them ensures your content is seen as a trusted source by both people and AI.",
  },
  {
    question: "Can't I just use ChatGPT for content ideas?",
    answer:
      "ChatGPT is a powerful general-purpose tool, but it lacks real-time, specific context. Our platform integrates live competitor data, keyword metrics, and a proprietary analysis engine focused on GEO and E-E-A-T. We provide strategic, actionable recommendations, not just generic ideas.",
  },
  {
    question: "Who is this tool designed for?",
    answer:
      "It's built specifically for anyone creating technical content: developer advocates, technical bloggers, and marketing teams at companies that build developer tools. Our insights are tailored to the unique challenges of reaching a developer audience.",
  },
];

const Faq = () => {
  return (
    <div className="w-full mt-20">
      <div className="text-left">
        <h2 className="text-4xl font-bold text-[#104127]">
          Frequently Answered Questions
        </h2>
      </div>
      <div className="mt-8">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem
              value={`item-${i + 1}`}
              key={i}
              className="border-none"
            >
              <AccordionTrigger className="text-lg text-left font-medium text-gray-800 hover:no-underline cursor-pointer">
                {faq?.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-gray-600 w-full md:w-[80vw]">
                {faq?.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default Faq;
