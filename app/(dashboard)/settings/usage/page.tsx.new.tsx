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
  TrendingUp,
  FileText,
  Search,
  Lightbulb,
  ListTree,
  Puzzle,
  Image as ImageIcon,
} from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { format } from "date-fns";
import { CreditTransaction } from "../types";

export default function UsagePage() {
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
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
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
        <Button className="bg-[#104127] hover:bg-[#104127]/90 text-white gap-2 h-11 px-6 rounded-xl shadow-none border-none">
          <Sparkles className="h-4 w-4" />
          Top Up Credits
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
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-inter">Articles</span>
              <span className="font-bold text-[#0A2918]">
                {forecast?.articles || 0}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-inter">Research</span>
              <span className="font-bold text-[#0A2918]">
                {forecast?.deep_research || 0}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-[#104127] bg-[#104127]/5 p-2 rounded-lg mt-2">
              <Info className="h-4 w-4 shrink-0" />
              <p className="text-[10px] leading-tight font-inter">
                Based on your balance of {wallet?.balance}
              </p>
            </div>
          </div>
        </Card>

        {/* Current Month Limit (Legacy Compat) */}
        <Card className="p-6 border-none shadow-none bg-primary/5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FileText className="h-4 w-4" />
            <span className="font-semibold font-poppins text-sm uppercase tracking-wider">
              Monthly Limit
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#0A2918] font-poppins">
              {usage?.current_month?.articles_created || 0}
              <span className="text-sm font-normal text-gray-400 ml-1">
                /{" "}
                {usage?.current_month?.articles_limit === -1
                  ? "∞"
                  : usage?.current_month?.articles_limit}
              </span>
            </p>
            <div className="mt-2">
              <Progress
                value={
                  usage?.current_month?.articles_limit === -1
                    ? 0
                    : (usage?.current_month?.articles_created /
                        usage?.current_month?.articles_limit) *
                      100
                }
                className="h-1.5 bg-gray-200"
              />
            </div>
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
            <Button
              variant="ghost"
              className="text-sm text-gray-500 hover:text-[#104127] gap-1"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {transactions?.length > 0 ? (
              transactions.map((tx: CreditTransaction) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-primary/5 transition-all group border border-transparent hover:border-primary/10"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl ${tx.amount < 0 ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"}`}
                    >
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[#0A2918] capitalize font-poppins">
                        {tx.feature_name.replace(/_/g, " ")}
                      </p>
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
                      className={`font-bold font-poppins ${tx.amount < 0 ? "text-orange-600" : "text-green-600"}`}
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
                <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
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
            <div className="space-y-4">
              {[
                {
                  label: "Standard Article",
                  cost: "10-20",
                  icon: FileText,
                  color: "text-blue-500",
                  bg: "bg-blue-50",
                },
                {
                  label: "Deep Research",
                  cost: "75-150",
                  icon: Search,
                  color: "text-purple-500",
                  bg: "bg-purple-50",
                },
                {
                  label: "Outline Gen",
                  cost: "5",
                  icon: ListTree,
                  color: "text-orange-500",
                  bg: "bg-orange-50",
                },
                {
                  label: "Topic Discovery",
                  cost: "2",
                  icon: Lightbulb,
                  color: "text-yellow-500",
                  bg: "bg-yellow-50",
                },
                {
                  label: "AI Images",
                  cost: "15",
                  icon: ImageIcon,
                  color: "text-pink-500",
                  bg: "bg-pink-50",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-[#0A2918] font-inter">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-500 font-poppins">
                    ~{item.cost} cr.
                  </span>
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
            <Button className="w-full bg-white text-[#104127] hover:bg-white/90 rounded-xl font-bold shadow-none relative z-10">
              Upgrade Plan
            </Button>
            <Sparkles className="absolute bottom-[-10px] right-[-10px] h-24 w-24 text-white/5 rotate-12" />
          </Card>
        </div>
      </div>
    </div>
  );
}
