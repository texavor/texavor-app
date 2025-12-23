import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import { Permission, Role, hasPermission } from "@/lib/permissions";

export interface Member {
  id: string;
  role: Role;
  user_id: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_pic: string | null;
  };
}

interface MembersResponse {
  members: Member[];
  meta: {
    current_user_permissions: Permission[];
  };
}

export const useTeamRoles = (teamId?: string) => {
  const { user, currentTeam, teamMembers } = useAppStore();

  // If teamId matches currentTeam (or is undefined), use global store
  const isCurrentTeam = !teamId || teamId === currentTeam?.id;

  // We still might need to fetch if it's a DIFFERENT team, but for current team use store.
  // The global fetch is handled in AuthChecker.

  const members = isCurrentTeam ? teamMembers : [];
  // For permissions, we might need to store them in appStore too if we want full parity,
  // but for now useTeamRoles relies on members list often.
  // The 'can' function below uses 'currentUserRole' which is derived from store currentTeam usually.

  // Note: if viewing another team, this hook now returns empty members unless we keep the query active for non-current teams.
  // Assuming mostly used for current team context.
  // Let's keep the query for "other" teams just in case, but skip for current.
  const { data: fetchedData, isLoading: isFetchingOther } =
    useQuery<MembersResponse>({
      queryKey: ["team-members", teamId],
      queryFn: async () => {
        const response = await axiosInstance.get(
          `/api/v1/teams/${teamId}/members`
        );
        return Array.isArray(response.data)
          ? { members: response.data, meta: { current_user_permissions: [] } }
          : response.data;
      },
      enabled: !!teamId && !isCurrentTeam,
    });

  const activeMembers = isCurrentTeam
    ? teamMembers
    : fetchedData?.members || [];
  const isLoading = isCurrentTeam ? false : isFetchingOther;

  // Re-map 'members' variable used below
  // const members = activeMembers; // name clash with destructured return

  const serverPermissions = isCurrentTeam
    ? []
    : fetchedData?.meta?.current_user_permissions;

  // Derive role
  let currentUserRole: Role | undefined =
    currentTeam?.id === teamId ? (currentTeam?.role as Role) : undefined;

  if (!currentUserRole && user && activeMembers.length > 0) {
    const member = activeMembers.find(
      (m) => m.user?.id === user.id || m.user_id === user.id
    );
    currentUserRole = member?.role;
  }

  // Fallback to local permission logic if server doesn't send them (or if we want optimistic check)
  // Converting string action to strict Action type is needed
  const can = (action: Permission) => {
    if (serverPermissions && serverPermissions.length > 0) {
      return serverPermissions.includes(action);
    }
    // Fallback based on role
    return currentUserRole ? hasPermission(currentUserRole, action) : false;
  };

  const isOwner = currentUserRole === "owner";
  const isAdmin = currentUserRole === "admin" || isOwner;
  const isEditor = currentUserRole === "editor";
  const isViewer = currentUserRole === "viewer";

  return {
    members: activeMembers,
    isLoading,
    currentUserRole,
    isOwner,
    isAdmin,
    isEditor,
    isViewer,
    can,
    // Deprecated helpers maintained for backward compat until refactor complete
    canInvite: can("manage_team"),
    canRemoveMember: can("manage_team"),
    canManageRoles: can("manage_team"),
  };
};
