"use client";

import { useState, useEffect } from "react";
import { SettingHeader } from "../components/SettingHeader";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Globe, Target, Users, Lightbulb } from "lucide-react";

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
    competitors: [] as string[],
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
        competitors:
          blog.competitors && blog.competitors.length > 0
            ? blog.competitors
            : [""],
      });
    }
  }, [blog]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBlogId) {
      updateBlog.mutate({ id: selectedBlogId, data: formData });
    }
  };

  const addCompetitor = () => {
    setFormData({
      ...formData,
      competitors: [...formData.competitors, ""],
    });
  };

  const removeCompetitor = (index: number) => {
    if (formData.competitors.length <= 1) return;
    setFormData({
      ...formData,
      competitors: formData.competitors.filter((_, i) => i !== index),
    });
  };

  const updateCompetitor = (index: number, value: string) => {
    const newCompetitors = [...formData.competitors];
    newCompetitors[index] = value;
    setFormData({ ...formData, competitors: newCompetitors });
  };

  if (blogsLoading) {
    return (
      <div>
        <SettingHeader
          title="Blog Settings"
          description="Configure your blogs and content strategy"
        />
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
        <SettingHeader
          title="Blog Settings"
          description="Configure your blogs and content strategy"
        />
        <Card className="p-6 border-none text-center">
          <p className="text-gray-600 font-inter">
            No blogs found. Create a blog to get started.
          </p>
        </Card>
      </div>
    );
  }

  const getFaviconUrl = (url: string) => {
    try {
      if (!url) return null;
      // Add protocol if missing for URL parsing
      const urlToParse = url.startsWith("http") ? url : `https://${url}`;
      const domain = new URL(urlToParse).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  return (
    <div>
      <SettingHeader
        title="Blog Settings"
        description="Configure your blogs and content strategy"
      >
        <Button
          onClick={handleSubmit}
          disabled={updateBlog.isPending}
          className="bg-[#104127] hover:bg-[#104127]/90"
        >
          {updateBlog.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </SettingHeader>

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
            {/* Competitors Card */}
            <Card className="p-6 border-none sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-poppins font-semibold text-lg text-[#0A2918]">
                      Competitors
                    </h3>
                    <p className="text-sm text-gray-500 font-inter">
                      Track and analyze competitor content
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCompetitor}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              <div className="space-y-3">
                {formData.competitors.map((competitor: any, index) => {
                  const faviconUrl = getFaviconUrl(competitor?.website_url);
                  return (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-md border bg-white flex items-center justify-center overflow-hidden">
                        {faviconUrl && competitor ? (
                          <img
                            src={faviconUrl}
                            alt="Favicon"
                            className="h-6 w-6 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                              (
                                e.target as HTMLImageElement
                              ).nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <Globe
                          className={`h-5 w-5 text-gray-400 ${
                            faviconUrl && competitor ? "hidden" : ""
                          }`}
                        />
                      </div>
                      <Input
                        value={competitor?.website_url}
                        onChange={(e) =>
                          updateCompetitor(index, e.target.value)
                        }
                        placeholder="https://competitor.com"
                        className="font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCompetitor(index)}
                        disabled={formData.competitors.length <= 1}
                        className="text-gray-500 hover:text-red-600 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
                {formData.competitors.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-sm text-gray-500 font-inter">
                      No competitors added yet. Add competitors to track their
                      content strategy.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
