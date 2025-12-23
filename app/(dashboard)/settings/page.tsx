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
    switch (category.id) {
      case "subscription":
        return billing;
      case "authors":
        // Visible to Owner, Admin, Editor (View only for editor)
        // Hidden for Writer, Viewer
        return role !== "writer" && role !== "viewer";
      case "blog-settings":
        return settings;
      default:
        // Profile, Password, Usage are visible to all (or at least all internal users)
        return true;
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
