"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/store/appStore";
import { Loader2, Plus, Users, Shield } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstace";
import TeamMemberList from "@/components/TeamMemberList";
import InviteMemberSheet from "@/components/InviteMemberSheet";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
import { useTeamRoles } from "./hooks/useTeamRoles";

export default function TeamSettingsClientPage() {
  const { user, currentTeam, setCurrentTeam, teams, setTeams, blogs } =
    useAppStore();
  const [inviteOpen, setInviteOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch Teams
  const { data: teamsData, isLoading: teamsLoading } = useQuery({
    queryKey: ["teams", blogs?.id],
    queryFn: async () => {
      if (!blogs?.id) return [];
      const response = await axiosInstance.get(
        `/api/v1/blogs/${blogs.id}/teams`
      );
      return response.data;
    },
    enabled: !!blogs?.id,
  });

  // Fetch Usage
  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ["subscription-usage"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/v1/subscription");
      return response.data;
    },
  });

  // Get permissions
  const { can } = useTeamRoles(currentTeam?.id);

  // Sync teams to store and set default
  useEffect(() => {
    if (teamsData) {
      setTeams(teamsData);
      // If no current team is selected, or the selected team is not in the list (e.g. deleted), select the first one
      if (
        !currentTeam ||
        !teamsData.find((t: any) => t.id === currentTeam.id)
      ) {
        if (teamsData.length > 0) {
          setCurrentTeam(teamsData[0]);
        }
      }
    }
  }, [teamsData, currentTeam, setTeams, setCurrentTeam]);

  const isLoading = teamsLoading || !currentTeam;

  return (
    <div className="space-y-6">
      {/* Header: Team Name & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </>
          ) : (
            <>
              <h1 className="text-2xl font-poppins font-semibold text-[#0A2918]">
                {blogs?.name ? `${blogs.name} Team` : "Team"}
              </h1>
              <p className="text-sm text-muted-foreground font-inter">
                Manage team members and their roles
              </p>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {usageLoading || isLoading ? (
            <Skeleton className="h-9 w-32 rounded-lg" />
          ) : (
            usage && (
              <div className="flex flex-col items-end mr-2 px-3 py-1.5 bg-white rounded-lg">
                <p className="text-sm font-medium font-poppins">
                  {usage.usage.team_members} /{" "}
                  {usage.limits.team_members === -1
                    ? "Unlimited"
                    : usage.limits.team_members}{" "}
                  Team Members
                </p>
              </div>
            )
          )}

          {isLoading ? (
            <Skeleton className="h-10 w-32 rounded-md" />
          ) : (
            can("manage_team") && (
              <Button
                onClick={() => {
                  if (!currentTeam) {
                    toast.error("Please select a team first");
                    return;
                  }
                  setInviteOpen(true);
                }}
                className="bg-[#0A2918] hover:bg-[#0A2918]/90 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            )
          )}
        </div>
      </div>

      {/* Main Content: Table */}
      <div className="border-none shadow-none overflow-hidden">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          currentTeam && <TeamMemberList teamId={currentTeam.id} />
        )}
      </div>

      <InviteMemberSheet
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        teamId={currentTeam?.id}
        onSuccess={() => {
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({
            queryKey: ["team-members", currentTeam?.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["team-invitations", currentTeam?.id],
          });
          queryClient.invalidateQueries({ queryKey: ["subscription-usage"] });
        }}
      />
    </div>
  );
}
