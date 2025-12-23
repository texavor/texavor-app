"use client";

import { SettingCard } from "./components/SettingCard";
import {
  User,
  Lock,
  Sliders,
  Globe,
  Key,
  BarChart3,
  CreditCard,
  Palette,
} from "lucide-react";

const settingsCategories = [
  {
    id: "profile",
    title: "Profile",
    description: "Manage your personal information and account details",
    icon: <User className="h-6 w-6" />,
    href: "/settings/profile",
  },
  {
    id: "password",
    title: "Password & Security",
    description: "Update your password and security settings",
    icon: <Lock className="h-6 w-6" />,
    href: "/settings/password",
  },
  // {
  //   id: "preferences",
  //   title: "Preferences",
  //   description: "Customize notifications and UI preferences",
  //   icon: <Sliders className="h-6 w-6" />,
  //   href: "/settings/preferences",
  // },
  {
    id: "blog-settings",
    title: "Blog Settings",
    description: "Configure your blogs and content strategy",
    icon: <Globe className="h-6 w-6" />,
    href: "/settings/blog-settings",
  },
  // {
  //   id: "thumbnail-styles",
  //   title: "Thumbnail Styles",
  //   description: "Manage your blog's visual identity and thumbnail templates",
  //   icon: <Palette className="h-6 w-6" />,
  //   href: "/settings/thumbnail-styles",
  // },
  {
    id: "authors",
    title: "Authors",
    description: "Manage blog authors and contributors",
    icon: <User className="h-6 w-6" />,
    href: "/settings/authors",
  },
  // {
  //   id: "api-keys",
  //   title: "API Keys",
  //   description: "Create and manage your API access keys",
  //   icon: <Key className="h-6 w-6" />,
  //   href: "/settings/api-keys",
  // },
  {
    id: "usage",
    title: "Usage & Statistics",
    description: "View your usage metrics and limits",
    icon: <BarChart3 className="h-6 w-6" />,
    href: "/settings/usage",
  },
  {
    id: "subscription",
    title: "Subscription",
    description: "Manage your subscription and billing",
    icon: <CreditCard className="h-6 w-6" />,
    href: "/settings/subscription",
  },
];

import { usePermissions } from "@/hooks/usePermissions";

export default function SettingsPage() {
  const { role, billing, settings } = usePermissions();

  const filteredCategories = settingsCategories.filter((category) => {
    // Owner and Admin see everything (except maybe some specific logic if needed)
    if (role === "owner" || role === "admin") return true;

    // For other roles (Editor, Writer, Viewer), strictly control visibility
    // User requested "editor password and below should not be there"
    // This implies they should only see "Profile" if "Password" is the second item.

    switch (category.id) {
      case "profile":
        return true; // Everyone sees profile
      case "password":
        return false; // Hidden for non-admins
      case "blog-settings":
        return false; // Hidden for non-admins
      case "authors":
        return false; // Hidden for non-admins
      case "usage":
        return false; // Hidden for non-admins
      case "subscription":
        return false; // Hidden for non-admins
      default:
        return false;
    }
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <SettingCard key={category.id} {...category} />
        ))}
      </div>
    </div>
  );
}
