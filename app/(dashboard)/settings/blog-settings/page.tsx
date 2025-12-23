"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Globe, Target, Lightbulb } from "lucide-react";

import {
  useGetBlogs,
  useGetBlog,
  useUpdateBlog,
} from "../hooks/useBlogSettingsApi";

export default function BlogSettingsPage() {
  const { data: blogs, isLoading: blogsLoading } = useGetBlogs();
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const { data: blog, isLoading: blogLoading } = useGetBlog(selectedBlogId);
  const updateBlog = useUpdateBlog();

  const [formData, setFormData] = useState({
    name: "",
    website_url: "",
    sitemap_url: "",
    product_description: "",
    target_audience: "",
    tone_of_voice: "",
  });

  // Set first blog as selected when blogs load
  useEffect(() => {
    if (blogs && blogs.length > 0 && !selectedBlogId) {
      setSelectedBlogId(blogs[0].id);
    }
  }, [blogs, selectedBlogId]);

  // Update form when blog loads
  useEffect(() => {
    if (blog) {
      setFormData({
        name: blog.name || "",
        website_url: blog.website_url || "",
        sitemap_url: blog.sitemap_url || "",
        product_description: blog.product_description || "",
        target_audience: blog.target_audience || "",
        tone_of_voice: blog.tone_of_voice || "",
      });
    }
  }, [blog]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBlogId) {
      updateBlog.mutate({ id: selectedBlogId, data: formData });
    }
  };

  if (blogsLoading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-poppins font-semibold text-[#0A2918] mb-2">
            Blog Settings
          </h1>
          <p className="font-inter text-gray-600">
            Configure your blogs and content strategy
          </p>
        </div>
        <Card className="p-6 border-none">
          <Skeleton className="h-10 w-full bg-[#f9f4f0] mb-6" />
          <Skeleton className="h-40 w-full bg-[#f9f4f0]" />
        </Card>
      </div>
    );
  }

  if (!blogs || blogs.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-poppins font-semibold text-[#0A2918] mb-2">
            Blog Settings
          </h1>
          <p className="font-inter text-gray-600">
            Configure your blogs and content strategy
          </p>
        </div>
        <Card className="p-6 border-none text-center">
          <p className="text-gray-600 font-inter">
            No blogs found. Create a blog to get started.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-poppins font-semibold text-[#0A2918] mb-2">
              Blog Settings
            </h1>
            <p className="font-inter text-gray-600">
              Configure your blogs and content strategy
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={updateBlog.isPending}
            className="bg-[#104127] hover:bg-[#104127]/90"
          >
            {updateBlog.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Settings Card */}
            <Card className="p-6 border-none">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-[#104127]/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-[#104127]" />
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-lg text-[#0A2918]">
                    General Settings
                  </h3>
                  <p className="text-sm text-gray-500 font-inter">
                    Basic configuration for your blog
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Blog Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="My Tech Blog"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    value={formData.website_url}
                    onChange={(e) =>
                      setFormData({ ...formData, website_url: e.target.value })
                    }
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="sitemap_url">Sitemap URL</Label>
                  <Input
                    id="sitemap_url"
                    value={formData.sitemap_url}
                    onChange={(e) =>
                      setFormData({ ...formData, sitemap_url: e.target.value })
                    }
                    placeholder="https://example.com/sitemap.xml"
                  />
                </div>
              </div>
            </Card>

            {/* Content Strategy Card */}
            <Card className="p-6 border-none">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-lg text-[#0A2918]">
                    Content Strategy
                  </h3>
                  <p className="text-sm text-gray-500 font-inter">
                    Define your content's voice and audience
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product_description">
                    Product / Blog Description
                  </Label>
                  <Textarea
                    id="product_description"
                    value={formData.product_description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        product_description: e.target.value,
                      })
                    }
                    placeholder="Describe your product or service to help AI understand your context"
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target_audience">Target Audience</Label>
                    <Input
                      id="target_audience"
                      value={formData.target_audience}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          target_audience: e.target.value,
                        })
                      }
                      placeholder="e.g. Content marketers, Developers"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tone_of_voice">Tone of Voice</Label>
                    <Input
                      id="tone_of_voice"
                      value={formData.tone_of_voice}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tone_of_voice: e.target.value,
                        })
                      }
                      placeholder="e.g. Professional, Witty, Casual"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Tips Card */}
            <Card className="p-6 border-none bg-[#104127]/5 sticky top-6">
              <div className="flex items-start gap-3 mb-4">
                <Lightbulb className="h-5 w-5 text-[#104127] mt-0.5" />
                <h3 className="font-poppins font-semibold text-[#0A2918]">
                  Best Practices
                </h3>
              </div>
              <ul className="space-y-3">
                <li className="text-sm text-gray-600 font-inter">
                  <span className="font-semibold text-[#0A2918]">
                    Blog Name:
                  </span>{" "}
                  Choose a memorable name that reflects your brand identity
                </li>
                <li className="text-sm text-gray-600 font-inter">
                  <span className="font-semibold text-[#0A2918]">Sitemap:</span>{" "}
                  Keep your sitemap updated to help search engines discover your
                  content
                </li>
                <li className="text-sm text-gray-600 font-inter">
                  <span className="font-semibold text-[#0A2918]">
                    Description:
                  </span>{" "}
                  Be specific about your product to help AI generate relevant
                  content
                </li>
                <li className="text-sm text-gray-600 font-inter">
                  <span className="font-semibold text-[#0A2918]">
                    Audience:
                  </span>{" "}
                  Define your target audience clearly for better content
                  personalization
                </li>
                <li className="text-sm text-gray-600 font-inter">
                  <span className="font-semibold text-[#0A2918]">Tone:</span>{" "}
                  Maintain a consistent voice across all your content
                </li>
              </ul>
            </Card>

            {/* SEO Tips Card */}
            <Card className="p-6 border-none">
              <h3 className="font-poppins font-semibold text-[#0A2918] mb-3">
                SEO Tips
              </h3>
              <p className="text-sm text-gray-600 font-inter leading-relaxed">
                These settings help our AI understand your content better and
                generate SEO-optimized articles that resonate with your target
                audience.
              </p>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
