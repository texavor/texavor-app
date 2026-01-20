"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, X, Globe } from "lucide-react";
import { Toaster, toast } from "sonner";
import { axiosInstance } from "@/lib/axiosInstace";
import { useSearchParams } from "next/navigation";

function OnboardingLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-8">
      <Loader2 className="h-14 w-14 animate-spin text-[#104127] opacity-30" />
      <p className="text-lg text-[#104127] font-poppins">Loading...</p>
    </div>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Step 1 fields
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [productDescription, setProductDescription] = useState("");

  // Step 2 fields
  const [targetAudience, setTargetAudience] = useState("");
  const [toneOfVoice, setToneOfVoice] = useState("");
  const [competitors, setCompetitors] = useState([""]);

  // Polling function to check processing status
  const pollStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await axiosInstance.get(`/api/v1/blogs/${id}`);
        if (res.data.status === "active") {
          clearInterval(interval);
          // Invalidate auth-check query to ensure AuthChecker sees the new blog status
          queryClient.invalidateQueries({ queryKey: ["auth-check"] });
          toast.success("Onboarding complete! Redirecting to dashboard...");
          setTimeout(() => {
            router.push("/dashboard");
          }, 10000);
        }
      } catch (err) {
        clearInterval(interval);
        console.log("Error checking onboarding status.");
      }
    }, 5000); // poll every 5 seconds
  };

  useEffect(() => {
    const blogId = searchParams.get("blog");
    if (blogId) {
      setJobId(blogId);
      setProcessing(true);
      pollStatus(blogId);
    }
  }, [searchParams]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: {
      name: string;
      website_url: string;
      sitemap_url: string;
      product_description: string;
      target_audience: string;
      tone_of_voice: string;
      competitors: string[];
    }) => axiosInstance.post("/api/v1/blogs", data),
    onSuccess: (res) => {
      const { id } = res.data;
      if (id) {
        setJobId(id);
        // Start processing immediately after Step 2
        setProcessing(true);
        pollStatus(id);
      } else {
        console.log("Invalid response from server.");
      }
    },
    onError: () => {
      console.log("Failed to save onboarding information.");
    },
  });

  const handleAddCompetitor = () => {
    setCompetitors([...competitors, ""]);
  };

  const handleRemoveCompetitor = (index: number) => {
    const newCompetitors = [...competitors];
    newCompetitors.splice(index, 1);
    setCompetitors(newCompetitors);
  };

  const handleCompetitorChange = (index: number, value: string) => {
    const newCompetitors = [...competitors];
    newCompetitors[index] = value;
    setCompetitors(newCompetitors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({
      name,
      website_url: websiteUrl,
      sitemap_url: sitemapUrl,
      product_description: productDescription,
      target_audience: targetAudience,
      tone_of_voice: toneOfVoice,
      competitors,
    });
  };

  // --- Processing Loader Screen ---
  if (processing) {
    const faviconUrl =
      websiteUrl && websiteUrl.length > 0
        ? new URL("/favicon.ico", websiteUrl).href
        : "/favicon.ico";

    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-8">
        {/* Rotating favicon loader */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-14 w-14 animate-spin text-[#104127] opacity-30" />
          </div>
          <img
            src={faviconUrl}
            alt="Website icon"
            className="h-10 w-10 rounded-full border border-gray-200 shadow-md animate-pulse"
            onError={(e) =>
              ((e.target as HTMLImageElement).src = "/favicon.ico")
            }
          />
        </div>

        {/* Text feedback */}
        <div>
          <p className="text-lg text-[#104127] font-poppins">
            Processing your data...
          </p>
          <p className="text-sm text-gray-500 font-inter">
            We’re analyzing <span className="font-medium">{websiteUrl}</span>
          </p>
          <p className="text-sm text-gray-400 mt-1 font-inter">
            This may take a few minutes
          </p>
        </div>
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
    <div className="mx-auto grid w-[450px] gap-6 p-10 transition-all duration-500">
      <Toaster richColors />
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold text-[#0A2918] font-poppins">
          Onboarding
        </h1>
        <p className="text-balance text-[#7A7A7A] font-inter">
          {step === 1
            ? "Tell us about your website."
            : "Help us understand your brand and market. We'll analyze your website after this."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {step === 1 && (
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="font-inter text-[#7A7A7A] font-medium"
              >
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name or company name"
                required
                className="bg-white text-black font-inter px-3"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="websiteUrl"
                className="font-inter text-[#7A7A7A] font-medium"
              >
                Website URL
              </Label>
              <Input
                id="websiteUrl"
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                required
                className="bg-white text-black font-inter px-3"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="sitemapUrl"
                className="font-inter text-[#7A7A7A] font-medium"
              >
                Sitemap URL
              </Label>
              <Input
                id="sitemapUrl"
                type="url"
                value={sitemapUrl}
                onChange={(e) => setSitemapUrl(e.target.value)}
                placeholder="https://example.com/sitemap.xml"
                className="bg-white text-black font-inter px-3"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="productDescription"
                className="font-inter text-[#7A7A7A] font-medium"
              >
                Product Description
              </Label>
              <Textarea
                id="productDescription"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Describe your product in a few sentences."
                className="w-full p-3 border rounded-md bg-white text-black font-inter"
                rows={4}
                required
              />
            </div>
            <Button
              onClick={() => setStep(2)}
              className="w-full bg-[#104127] text-white hover:bg-[#104127] font-poppins"
            >
              Next
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="targetAudience"
                className="font-inter text-[#7A7A7A] font-medium"
              >
                Target Audience
              </Label>
              <Textarea
                id="targetAudience"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Who are you trying to reach?"
                className="w-full p-3 border rounded-md bg-white text-black font-inter"
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="toneOfVoice"
                className="font-inter text-[#7A7A7A] font-medium"
              >
                Tone of Voice
              </Label>
              <Input
                id="toneOfVoice"
                value={toneOfVoice}
                onChange={(e) => setToneOfVoice(e.target.value)}
                placeholder="e.g., Formal, Casual, Humorous"
                required
                className="bg-white text-black font-inter px-3"
              />
            </div>
            {false && (
              <div className="space-y-4">
                <Label className="font-inter text-[#7A7A7A] font-medium">
                  Competitors
                </Label>
                {competitors.map((competitor, index) => {
                  const faviconUrl = getFaviconUrl(competitor);
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-10 w-10 flex-shrink-0 rounded-md border bg-white flex items-center justify-center overflow-hidden no-scrollbar">
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
                        type="url"
                        value={competitor}
                        onChange={(e) =>
                          handleCompetitorChange(index, e.target.value)
                        }
                        placeholder="https://competitor.com"
                        className="bg-white text-black font-inter px-3"
                      />
                      {competitors.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="hover:bg-transparent"
                          onClick={() => handleRemoveCompetitor(index)}
                        >
                          <X className="h-4 w-4 text-black" />
                        </Button>
                      )}
                    </div>
                  );
                })}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCompetitor}
                  className="bg-white text-black font-inter hover:bg-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Competitor
                </Button>
              </div>
            )}
            <div className="flex gap-4 justify-between w-full">
              <Button
                onClick={() => setStep(1)}
                className="w-[50%] bg-white text-black hover:bg-white"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="w-[50%] bg-[#104127] text-white hover:bg-[#104127]"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingLoading />}>
      <OnboardingContent />
    </Suspense>
  );
}
