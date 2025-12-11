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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/appStore";
import { Loader2, Plus, Users, Shield } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstace";
import TeamMemberList from "@/components/TeamMemberList";
import InviteMemberSheet from "@/components/InviteMemberSheet";
import { toast } from "sonner";

export default function TeamSettingsPage() {
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
  const { data: usage } = useQuery({
    queryKey: ["subscription-usage"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/v1/subscription");
      return response.data;
    },
  });

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

  if (teamsLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header: Team Selection & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Select
              value={currentTeam?.id}
              onValueChange={(value) => {
                const team = teams?.find((t) => t.id === value);
                if (team) setCurrentTeam(team);
              }}
            >
              <SelectTrigger className="w-auto min-w-[200px] h-9 font-semibold text-xl border-none shadow-none p-0 focus:ring-0 bg-transparent hover:bg-transparent">
                <SelectValue placeholder="Select a team">
                  {currentTeam?.name || "Select a team"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {teams?.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage members and billing for this team
          </p>
        </div>

        <div className="flex items-center gap-3">
          {usage && (
            <div className="flex flex-col items-end mr-2 px-3 py-1.5 bg-muted/40 rounded-lg border">
              <p className="text-sm font-medium">
                {usage.usage.team_members} /{" "}
                {usage.limits.team_members === -1
                  ? "Unlimited"
                  : usage.limits.team_members}{" "}
                Seats
              </p>
            </div>
          )}
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
        </div>
      </div>

      {/* Main Content: Table */}
      <div className="rounded-xl shadow-sm overflow-hidden">
        {currentTeam && <TeamMemberList teamId={currentTeam.id} />}
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
