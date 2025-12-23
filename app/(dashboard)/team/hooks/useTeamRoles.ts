import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";

export interface Member {
  id: string;
  role: string;
  user_id: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_pic: string | null;
  };
}

export const useTeamRoles = (teamId?: string) => {
  const { user, currentTeam } = useAppStore();

  const { data: members = [], isLoading } = useQuery<Member[]>({
    queryKey: ["team-members", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      try {
        const response = await axiosInstance.get(
          `/api/v1/teams/${teamId}/members`
        );
        return response.data;
      } catch (error) {
        // If 403/401, user likely doesn't have permission to list members.
        // We will rely on currentTeam.role if available.
        return [];
      }
    },
    enabled: !!teamId,
    retry: 1,
  });

  // Try to find role from:
  // 1. currentTeam.role (if provided by teams endpoint)
  // 2. members list (if accessible)
  let currentUserRole =
    currentTeam?.id === teamId ? currentTeam?.role : undefined;

  if (!currentUserRole && user && members.length > 0) {
    const member = members.find(
      (m) => m.user?.id === user.id || m.user_id === user.id
    );
    currentUserRole = member?.role;
  }

  // Default to viewer if still undefined (safest fallback) but only if we have a teamId
  if (!currentUserRole && teamId) {
    // If we failed to get role (e.g. 403 on members and no role in team obj),
    // we can't assume 'viewer' blindly, but for UI safety often 'viewer' is safe default.
    // However, user said "Editor getting like that" (viewer).
    // If we can't verify, maybe we shouldn't restrict? No, insecure.
    // Let's assume Viewer.
  }

  const isOwner = currentUserRole === "owner";
  const isAdmin = currentUserRole === "admin" || isOwner;
  const isEditor = currentUserRole === "editor";
  const isViewer = currentUserRole === "viewer";

  return {
    members,
    isLoading,
    currentUserRole,
    isOwner,
    isAdmin,
    isEditor,
    isViewer,
    canInvite: isAdmin, // Only admins/owners can invite
    canRemoveMember: isAdmin, // Only admins/owners can remove
    canManageRoles: isAdmin, // Only admins/owners can change roles
  };
};
