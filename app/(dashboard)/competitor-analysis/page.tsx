"use client";

import { useEffect, useState } from "react";
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

export default function CompetitorAnalysisPage() {
  const { blogs } = useAppStore();
  const router = useRouter();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (blogs?.id) {
      loadCompetitors();
    }
  }, [blogs?.id]);

  const loadCompetitors = async () => {
    try {
      setLoading(true);
      const data = await competitorApi.list(blogs.id);
      setCompetitors(data.competitors);
    } catch (error) {
      console.error("Failed to load competitors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (competitorId: string) => {
    try {
      setAnalyzingIds((prev) => new Set(prev).add(competitorId));
      await competitorApi.analyze(blogs.id, competitorId);
      toast.success("Analysis started. Results will be available shortly.");
      loadCompetitors();
    } catch (error: any) {
      console.error("Failed to start analysis:", error);
    } finally {
      setAnalyzingIds((prev) => {
        const next = new Set(prev);
        next.delete(competitorId);
        return next;
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
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

  const columns = createColumns(handleAnalyze, setDeleteId, analyzingIds);

  if (!blogs?.id) {
    return (
      <div>
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 mx-auto">
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
        <AddCompetitorSheet blogId={blogs.id} onSuccess={loadCompetitors} />
      </div>

      {competitors.length === 0 && !loading ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground mb-4">
            You haven't added any competitors yet.
          </p>
          <AddCompetitorSheet blogId={blogs.id} onSuccess={loadCompetitors} />
        </div>
      ) : (
        <CustomTable
          columns={columns}
          data={competitors}
          isLoading={loading}
          onClick={(row: Competitor) => {
            router.push(`/competitor-analysis/${row.id}`);
          }}
          className=""
        />
      )}

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
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
