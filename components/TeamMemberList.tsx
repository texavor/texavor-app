"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Mail, Clock } from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstace";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore } from "@/store/appStore";
import { CustomTable } from "@/components/ui/CustomTable";
import { ColumnDef } from "@tanstack/react-table";

interface Member {
  id: string; // Member ID (join table)
  role: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_pic: string | null;
  };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
}

export default function TeamMemberList({ teamId }: { teamId: string }) {
  const { user } = useAppStore();
  const queryClient = useQueryClient();

  // Fetch Members
  const { data: members = [], isLoading: membersLoading } = useQuery<Member[]>({
    queryKey: ["team-members", teamId],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/api/v1/teams/${teamId}/members`
      );
      return response.data;
    },
    enabled: !!teamId,
  });

  // Fetch Invitations
  const { data: invitations = [], isLoading: invitationsLoading } = useQuery<
    Invitation[]
  >({
    queryKey: ["team-invitations", teamId],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/api/v1/teams/${teamId}/invitations`
      );
      return response.data;
    },
    enabled: !!teamId,
  });

  // Remove Member Mutation
  const { mutate: removeMember } = useMutation({
    mutationFn: async (memberId: string) => {
      await axiosInstance.delete(`/api/v1/teams/${teamId}/members/${memberId}`);
    },
    onSuccess: () => {
      toast.success("Member removed");
      queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });
      queryClient.invalidateQueries({ queryKey: ["subscription-usage"] });
    },
    onError: (error) => {
      console.error("Failed to remove member", error);
      toast.error("Failed to remove member");
    },
  });

  // Revoke Invitation Mutation
  const { mutate: revokeInvitation } = useMutation({
    mutationFn: async (invitationId: string) => {
      await axiosInstance.delete(
        `/api/v1/teams/${teamId}/invitations/${invitationId}`
      );
    },
    onSuccess: () => {
      toast.success("Invitation revoked");
      queryClient.invalidateQueries({ queryKey: ["team-invitations", teamId] });
    },
    onError: (error) => {
      console.error("Failed to revoke invitation", error);
      toast.error("Failed to revoke invitation");
    },
  });

  // Resend Invitation Mutation
  const { mutate: resendInvitation } = useMutation({
    mutationFn: async (invitationId: string) => {
      await axiosInstance.post(
        `/api/v1/teams/${teamId}/invitations/${invitationId}/resend`
      );
    },
    onSuccess: () => {
      toast.success("Invitation resent successfully");
    },
    onError: (error) => {
      console.error("Failed to resend invitation", error);
      //   toast.error("Failed to resend invitation");
    },
  });

  const memberColumns: ColumnDef<Member>[] = [
    {
      accessorKey: "user",
      header: "Member",
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={member.user.profile_pic || ""} />
              <AvatarFallback>
                {member.user.first_name?.[0] ||
                  member.user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {member.user.first_name} {member.user.last_name}
                {user?.id === member.user.id && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (You)
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {member.user.email}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize text-xs">
          {row.original.role}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const member = row.original;
        // Only show actions if not self (usually) or if admin checking others
        if (user?.id === member.user.id) return null;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer"
                  onClick={() => removeMember(member.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Member
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const invitationColumns: ColumnDef<Invitation>[] = [
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <span>{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge variant="secondary" className="capitalize text-xs">
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: "expires_at",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            Expires{" "}
            {new Date(row.original.expires_at).toLocaleDateString("en-GB")}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => resendInvitation(row.original.id)}
              >
                <Mail className="mr-2 h-4 w-4" />
                Resend Invitation
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 cursor-pointer"
                onClick={() => revokeInvitation(row.original.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Revoke Invitation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  if (membersLoading && !members.length) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Active Members Table */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">
          Team Members
        </h4>
        <CustomTable
          columns={memberColumns}
          data={members}
          isLoading={membersLoading}
          className="max-h-[500px]"
          onClick={() => {}}
        />
      </div>

      {/* Pending Invitations Table */}
      {invitations.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            Pending Invitations
          </h4>
          <CustomTable
            columns={invitationColumns}
            data={invitations}
            isLoading={invitationsLoading}
            className="max-h-[300px]"
            onClick={() => {}}
          />
        </div>
      )}
    </div>
  );
}
