import {
  EditorSkeleton,
  InsightsSkeleton,
} from "./components/ArticlePageSkeletons";

export default function Loading() {
  return (
    <div className="flex justify-between gap-2 h-[calc(100vh-100px)]">
      <div className="w-8/12 h-full">
        <EditorSkeleton />
      </div>
      <div className="w-4/12 h-full">
        <InsightsSkeleton />
      </div>
    </div>
  );
}
