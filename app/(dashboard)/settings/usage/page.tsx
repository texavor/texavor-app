"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  useGetUsage,
  useGetWallet,
  useGetTransactions,
} from "../hooks/useUsageApi";
import {
  Sparkles,
  Wallet,
  ArrowUpRight,
  History,
  Info,
  ChevronRight,
  BarChart3,
  FileText,
  Search,
  Lightbulb,
  ListTree,
  Puzzle,
  Zap,
  Target,
  Image as ImageIcon,
  Users,
  TrendingUp,
} from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { format } from "date-fns";
import { CreditTransaction } from "../types";
import { useRouter } from "next/navigation";

export default function UsagePage() {
  const router = useRouter();
  const { blogs } = useAppStore();
  const { data: usage, isLoading: isUsageLoading } = useGetUsage(blogs?.id);
  const { data: wallet, isLoading: isWalletLoading } = useGetWallet(blogs?.id);
  const { data: transactions, isLoading: isTxLoading } = useGetTransactions(
    blogs?.id,
  );

  const isLoading = isUsageLoading || isWalletLoading || isTxLoading;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 bg-primary/5" />
            <Skeleton className="h-4 w-64 bg-primary/5" />
          </div>
          <Skeleton className="h-10 w-32 bg-primary/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full bg-primary/5 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full bg-primary/5 rounded-xl" />
      </div>
    );
  }

  const forecast = usage?.credits?.usage_forecast;

  return (
    <div className="pb-4 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-[#0A2918]">
            Credits & Usage
          </h1>
          <p className="text-gray-500 font-inter mt-1">
            Manage your AI credits, view forecasts, and track your consumption.
          </p>
        </div>
        <Button
          onClick={() => router.push("/pricing")}
          className="bg-[#104127] hover:bg-[#104127]/90 text-white gap-2 h-11 px-6 rounded-xl shadow-none border-none"
        >
          <ArrowUpRight className="h-4 w-4" />
          Upgrade Plan
        </Button>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Wallet Balance */}
        <Card className="col-span-1 md:col-span-2 p-6 bg-[#104127] text-white border-none shadow-none rounded-2xl overflow-hidden relative">
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-white/10 rounded-lg">
                <Wallet className="h-6 w-6" />
              </div>
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-none shadow-none font-inter">
                Current Balance
              </Badge>
            </div>
            <div>
              <p className="text-4xl font-bold font-poppins">
                {wallet?.balance?.toLocaleString() || 0}
              </p>
              <p className="text-white/70 text-sm font-inter mt-1">
                {wallet?.predicted_usage || "Available for all AI tasks"}
              </p>
            </div>
          </div>
          {/* Decorative Circles */}
          <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute bottom-[-10%] left-[-5%] w-32 h-32 bg-white/5 rounded-full" />
        </Card>

        {/* Quick Forecasts */}
        <Card className="p-6 border-none shadow-none bg-primary/5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[#104127] mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="font-semibold font-poppins text-sm uppercase tracking-wider">
              Forecast
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600 font-inter">Articles</span>
              <span className="font-bold text-[#0A2918]">
                {forecast?.articles || 0}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600 font-inter">Research</span>
              <span className="font-bold text-[#0A2918]">
                {forecast?.detailed_research || 0}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600 font-inter">Comp. Analysis</span>
              <span className="font-bold text-[#0A2918]">
                {forecast?.competitor_analysis || 0}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600 font-inter">Images</span>
              <span className="font-bold text-[#0A2918]">
                {forecast?.image_generations || 0}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-[#104127] bg-[#104127]/5 p-2 rounded-lg mt-1">
              <Info className="h-3 w-3 shrink-0" />
              <p className="text-[9px] leading-tight font-inter">
                Estimates based on current balance
              </p>
            </div>
          </div>
        </Card>

        {/* Consumption Snapshot */}
        <Card className="p-6 border-none shadow-none bg-primary/5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[#104127]/60 mb-3">
            <BarChart3 className="h-4 w-4" />
            <span className="font-semibold font-poppins text-xs uppercase tracking-widest">
              Consumption
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {[
              {
                label: "Articles",
                value: usage?.current_month?.articles_created,
                icon: FileText,
              },
              {
                label: "Outlines",
                value: usage?.current_month?.outlines_created,
                icon: ListTree,
              },
              {
                label: "Research",
                value: usage?.current_month?.keyword_queries,
                icon: Search,
              },
              {
                label: "Images",
                value: usage?.current_month?.image_generations,
                icon: ImageIcon,
              },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <stat.icon className="h-2.5 w-2.5 text-gray-400" />
                  <span className="text-[10px] text-gray-500 font-inter uppercase tracking-tighter">
                    {stat.label}
                  </span>
                </div>
                <span className="text-xl font-bold text-[#0A2918] font-poppins tabular-nums">
                  {stat.value || 0}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Consumption Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Transaction History */}
        <Card className="lg:col-span-2 p-8 border-none shadow-none bg-white rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/5 rounded-xl">
                <History className="h-5 w-5 text-[#104127]" />
              </div>
              <h3 className="text-xl font-bold font-poppins text-[#0A2918]">
                Transaction History
              </h3>
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto no-scrollbar space-y-3 pr-2">
            {transactions?.transactions?.length > 0 ? (
              transactions.transactions.map((tx: CreditTransaction) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#104127]/5 hover:bg-[#104127]/10 transition-all group border-none shadow-none"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl border-none shadow-none bg-white text-[#104127] flex items-center justify-center`}
                    >
                      {tx.feature_name.toLowerCase().includes("keyword") ? (
                        <Search className="h-5 w-5" />
                      ) : tx.feature_name
                          .toLowerCase()
                          .includes("competitor") ? (
                        <Users className="h-5 w-5" />
                      ) : (
                        <Sparkles className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[#0A2918] capitalize font-poppins text-base">
                          {tx.feature_name.replace(/_/g, " ")}
                        </p>
                        {tx.metadata?.competitor_name && (
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 h-4 border-[#10412720] text-[#104127] font-inter"
                          >
                            {tx.metadata.competitor_name}
                          </Badge>
                        )}
                        {tx.metadata?.keyword && (
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 h-4 border-[#10412720] text-[#104127] font-inter"
                          >
                            {tx.metadata.keyword}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 font-inter">
                        {format(
                          new Date(tx.created_at),
                          "MMM d, yyyy • h:mm a",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold font-poppins text-lg ${tx.amount < 0 ? "text-orange-600" : "text-green-600"}`}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount}
                    </p>
                    <p className="text-[10px] text-gray-400 font-inter">
                      Balance: {tx.balance_after}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-none shadow-none">
                  <History className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-inter">
                  No transactions found yet.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Right: Breakdown & Info */}
        <div className="space-y-8">
          <Card className="p-8 border-none shadow-none bg-white rounded-3xl">
            <h3 className="text-lg font-bold font-poppins text-[#0A2918] mb-6 flex items-center gap-2">
              <Info className="h-5 w-5 text-[#104127]" />
              Credit Cost Guide
            </h3>

            <div className="space-y-6">
              {[
                {
                  category: "Content Creation",
                  items: [
                    { label: "Article Writing", cost: 10, icon: FileText },
                    { label: "Outline Gen", cost: 1, icon: ListTree },
                    { label: "Topic Gen", cost: 5, icon: Lightbulb },
                    { label: "Images (Flux)", cost: 40, icon: ImageIcon },
                  ],
                },
                {
                  category: "SEO Research",
                  items: [
                    { label: "Keyword Research", cost: 25, icon: Search },
                    { label: "Keyword Discovery", cost: 350, icon: Target },
                    { label: "Comp. Analysis", cost: 75, icon: Users },
                  ],
                },
                {
                  category: "Optimization",
                  items: [
                    { label: "AEO Analysis", cost: 5, icon: Puzzle },
                    { label: "Freshness Guard", cost: 1, icon: Zap },
                  ],
                },
                {
                  category: "Workflows",
                  items: [
                    { label: "Authority Article", cost: 91, icon: Sparkles },
                  ],
                },
              ].map((cat) => (
                <div key={cat.category} className="space-y-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-inter px-1">
                    {cat.category}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {cat.items.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-primary/5 border-none shadow-none"
                      >
                        <div className="flex items-center gap-2.5">
                          <item.icon className="h-3.5 w-3.5 text-[#104127]" />
                          <span className="text-xs font-medium text-[#0A2918] font-inter">
                            {item.label}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#104127] font-poppins">
                          {item.cost} cr.
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8 border-none shadow-none bg-[#104127] text-white rounded-3xl overflow-hidden relative">
            <h3 className="text-lg font-bold font-poppins mb-2 relative z-10">
              Need more?
            </h3>
            <p className="text-white/70 text-sm font-inter mb-6 relative z-10">
              Upgrade to a professional plan for lower credit costs and higher
              limits.
            </p>
            <Button
              onClick={() => router.push("/pricing")}
              className="w-full bg-white text-[#104127] hover:bg-white/90 rounded-xl font-bold border-none shadow-none relative z-10"
            >
              Upgrade Plan
            </Button>
            <Sparkles className="absolute bottom-[-10px] right-[-10px] h-24 w-24 text-white/5 rotate-12" />
          </Card>
        </div>
      </div>
    </div>
  );
}
