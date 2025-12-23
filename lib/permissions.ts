export type Action =
  | "manage_team"
  | "manage_billing"
  | "manage_blog_settings"
  | "create_content"
  | "edit_content"
  | "delete_content"
  | "publish_content"
  | "publish_content"
  | "view_integrations";

export type Permission = Action;
export type Role = "owner" | "admin" | "editor" | "writer" | "viewer";

export const PERMISSIONS: Record<Role, Action[]> = {
  owner: [
    "manage_team",
    "manage_billing",
    "manage_blog_settings",
    "create_content",
    "edit_content",
    "delete_content",
    "publish_content",
    "view_integrations",
  ],
  admin: [
    "manage_team",
    "manage_billing",
    "manage_blog_settings",
    "create_content",
    "edit_content",
    "delete_content",
    "publish_content",
    "view_integrations",
  ],
  editor: [
    "create_content",
    "edit_content",
    "delete_content",
    "publish_content",
    "view_integrations",
  ],
  writer: ["create_content", "edit_content"],
  viewer: [],
};

export function hasPermission(role: Role, action: Action): boolean {
  return PERMISSIONS[role]?.includes(action) ?? false;
}
