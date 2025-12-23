import { useAppStore } from "@/store/appStore";
import { useTeamRoles } from "@/app/(dashboard)/team/hooks/useTeamRoles";

export type Role = "owner" | "admin" | "editor" | "writer" | "viewer";

// Define what each role can do
export const ROLE_PERMISSIONS: Record<
  Role,
  {
    label: string;
    description: string;
    features: {
      team_management: boolean;
      billing: boolean;
      settings: boolean;
      create_content: boolean;
      edit_others_content: boolean;
      delete_content: boolean;
      publish_content: boolean;
      research_tools: boolean;
    };
  }
> = {
  owner: {
    label: "Owner",
    description: "Full access to everything, including billing.",
    features: {
      team_management: true,
      billing: true,
      settings: true,
      create_content: true,
      edit_others_content: true,
      delete_content: true,
      publish_content: true,
      research_tools: true,
    },
  },
  admin: {
    label: "Admin",
    description: "Full access to team and settings.",
    features: {
      team_management: true,
      billing: true, // Assuming admins can manage billing, otherwise false
      settings: true,
      create_content: true,
      edit_others_content: true,
      delete_content: true,
      publish_content: true,
      research_tools: true,
    },
  },
  editor: {
    label: "Editor",
    description: "Can manage all content and blog settings.",
    features: {
      team_management: false,
      billing: false,
      settings: true,
      create_content: true, // Can create
      edit_others_content: true, // Can edit any article
      delete_content: true, // Can delete any article
      publish_content: true,
      research_tools: true,
    },
  },
  writer: {
    label: "Writer",
    description: "Can create and manage their own content.",
    features: {
      team_management: false,
      billing: false,
      settings: false,
      create_content: true,
      edit_others_content: false,
      delete_content: false,
      publish_content: false, // Draft only
      research_tools: true,
    },
  },
  viewer: {
    label: "Viewer",
    description: "Read-only access to content and reports.",
    features: {
      team_management: false,
      billing: false,
      settings: false,
      create_content: false,
      edit_others_content: false,
      delete_content: false,
      publish_content: false,
      research_tools: false,
    },
  },
};

export const usePermissions = () => {
  const { currentTeam } = useAppStore();
  // We reuse the existing logic to find the role in the current team
  const { currentUserRole } = useTeamRoles(currentTeam?.id);

  const role = (currentUserRole as Role) || "viewer"; // Default to viewer if unknown
  const permissions = ROLE_PERMISSIONS[role];

  return {
    role,
    permissions,
    ...permissions.features,
  };
};
