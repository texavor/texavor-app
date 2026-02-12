"use client";

import { useEffect, useState, useRef } from "react";
import { useAppStore } from "@/store/appStore";
import { competitorApi, Competitor } from "@/lib/api/competitors";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import AddCompetitorSheet from "./components/AddCompetitorSheet";
import { CustomTable } from "@/components/ui/CustomTable";
import { createColumns } from "./columns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { DEMO_COMPETITORS } from "@/lib/demo-data";

export default function CompetitorAnalysisClient() {
  const { blogs } = useAppStore();
  const router = useRouter();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const pollIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const { isLocked } = useFeatureAccess();
  const locked = isLocked("competitors");

  useEffect(() => {
    if (blogs?.id) {
      loadCompetitors();
    }
  }, [blogs?.id, locked]);

  // Cleanup polling intervals on unmount
  useEffect(() => {
    return () => {
      pollIntervalsRef.current.forEach((interval) => clearInterval(interval));
      pollIntervalsRef.current.clear();
    };
  }, []);

  const loadCompetitors = async () => {
    try {
      setLoading(true);
      if (locked) {
        // Demo mode: simulate delay then load mock data
        await new Promise((resolve) => setTimeout(resolve, 800));
        setCompetitors(DEMO_COMPETITORS as any); // Cast if types don't perfectly match, though they should
        setLoading(false);
        return;
      }

      const data = await competitorApi.list(blogs.id);
      setCompetitors(data.competitors);
    } catch (error) {
      console.error("Failed to load competitors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (competitorId: string) => {
    if (locked) {
      toast.error("This is a demo. Upgrade to analyze real competitors.");
      router.push("/pricing");
      return;
    }
    try {
      setAnalyzingIds((prev) => new Set(prev).add(competitorId));
      await competitorApi.analyze(blogs.id, competitorId);
      toast.success("Analysis started successfully!");

      // Start polling for this competitor
      pollAnalysisStatus(competitorId);
    } catch (error: any) {
      console.error("Failed to start analysis:", error);
      setAnalyzingIds((prev) => {
        const next = new Set(prev);
        next.delete(competitorId);
        return next;
      });
      if (error.response?.status === 429) {
        toast.error(
          error.response.data.message || "Weekly analysis limit reached.",
        );
      } else {
        toast.error("Failed to start analysis. Please try again.");
      }
    }
  };

  // Poll analysis status
  const pollAnalysisStatus = async (competitorId: string) => {
    // Clear any existing interval for this competitor
    const existingInterval = pollIntervalsRef.current.get(competitorId);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    const pollInterval = setInterval(async () => {
      try {
        const statusData = await competitorApi.getAnalysisStatus(
          blogs.id,
          competitorId,
        );

        const status = statusData.analysis_status;

        // Check if analysis is complete
        if (
          status === "completed" ||
          (status as any) === "success" ||
          status === "failed"
        ) {
          // Clear interval and remove from ref
          clearInterval(pollInterval);
          pollIntervalsRef.current.delete(competitorId);

          setAnalyzingIds((prev) => {
            const next = new Set(prev);
            next.delete(competitorId);
            return next;
          });

          // Reload competitors to get updated data
          loadCompetitors();

          if (status === "completed" || (status as any) === "success") {
            toast.success("Analysis completed successfully!");
          } else if (status === "failed") {
            toast.error("Analysis failed. Please try again.");
          }
        }
      } catch (error) {
        console.error("Failed to poll analysis status:", error);
        // Don't stop polling on error, will retry
      }
    }, 3000); // Poll every 3 seconds

    // Store interval in ref
    pollIntervalsRef.current.set(competitorId, pollInterval);

    // Cleanup after 5 minutes (safety timeout)
    setTimeout(() => {
      const interval = pollIntervalsRef.current.get(competitorId);
      if (interval) {
        clearInterval(interval);
        pollIntervalsRef.current.delete(competitorId);
      }
      setAnalyzingIds((prev) => {
        const next = new Set(prev);
        next.delete(competitorId);
        return next;
      });
    }, 300000);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    if (locked) {
      toast.error("Cannot delete demo data.");
      setDeleteId(null);
      return;
    }
    try {
      await competitorApi.delete(blogs.id, deleteId);
      toast.success("Competitor removed successfully");
      setCompetitors((prev) => prev.filter((c) => c.id !== deleteId));
    } catch (error) {
      console.error("Failed to delete competitor:", error);
    } finally {
      setDeleteId(null);
    }
  };

  const columns = createColumns(
    handleAnalyze,
    setDeleteId,
    analyzingIds,
    router,
  );

  if (!blogs?.id) {
    return (
      <div>
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 mx-auto relative">
      {locked && (
        <div className="bg-[#104127] text-white p-4 rounded-xl mb-6 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold font-poppins">Demo Mode</h3>
              <p className="text-sm text-white/80 font-inter">
                You are viewing sample data. Upgrade to track real competitors.
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/pricing")}
            className="bg-white text-[#104127] hover:bg-white/90 font-bold border-none shadow-none"
          >
            Upgrade Plan
          </Button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Competitor Analysis
          </h1>
          <p className="text-muted-foreground mt-2">
            Track and analyze your competitors' content strategy and SEO
            performance.
          </p>
        </div>
        <div
          onClick={() => {
            if (locked) {
              toast.error("Upgrade to add real competitors.");
              router.push("/pricing");
            }
          }}
        >
          <AddCompetitorSheet
            blogId={blogs.id}
            onSuccess={loadCompetitors}
            disabled={locked}
          />
        </div>
      </div>

      <CustomTable
        columns={columns}
        data={competitors}
        isLoading={loading}
        onClick={(row: Competitor) => {
          router.push(`/competitor-analysis/${row.id}`);
        }}
        className="cursor-pointer"
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              competitor and all associated analysis data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
