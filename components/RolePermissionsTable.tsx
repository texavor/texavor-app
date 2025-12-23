import React from "react";
import { ROLE_PERMISSIONS, Role } from "@/hooks/usePermissions";
import { Check, X } from "lucide-react";

interface RolePermissionsTableProps {
  role: string;
}

export const RolePermissionsTable = ({ role }: RolePermissionsTableProps) => {
  const roleKey = (role?.toLowerCase() as Role) || "viewer";
  const permissions = ROLE_PERMISSIONS[roleKey];

  if (!permissions) return null; // Should not happen

  const featuresList = [
    { label: "Team Management", key: "team_management" },
    { label: "Billing & Subscription", key: "billing" },
    { label: "Blog Settings", key: "settings" },
    { label: "Create Content", key: "create_content" },
    { label: "Edit Others' Content", key: "edit_others_content" },
    { label: "Publish Content", key: "publish_content" },
    { label: "Delete Content", key: "delete_content" },
    { label: "Research Tools", key: "research_tools" },
  ] as const;

  return (
    <div className="bg-white border rounded-lg overflow-hidden mt-4">
      <div className="bg-gray-50 px-4 py-3 border-b">
        <h4 className="font-medium text-sm text-gray-900 font-poppins">
          {permissions.label} Permissions
        </h4>
        <p className="text-xs text-gray-500 font-inter">
          {permissions.description}
        </p>
      </div>
      <div className="p-2 space-y-1">
        {featuresList.map((item) => {
          const isEnabled =
            permissions.features[item.key as keyof typeof permissions.features];

          return (
            <div
              key={item.key}
              className={`flex items-center justify-between px-3 py-2 rounded-md text-sm ${
                isEnabled ? "bg-green-50/50" : "bg-red-50/50"
              }`}
            >
              <span
                className={`font-medium ${
                  isEnabled ? "text-[#0A2918]" : "text-red-700"
                }`}
              >
                {item.label}
              </span>
              {isEnabled ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
