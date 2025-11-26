"use client";

import { SettingHeader } from "../components/SettingHeader";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetPreferences,
  useUpdatePreferences,
} from "../hooks/usePreferencesApi";

export default function PreferencesPage() {
  const { data: preferences, isLoading } = useGetPreferences();
  const updatePreferences = useUpdatePreferences();

  const handleEmailNotificationChange = (key: string, value: boolean) => {
    updatePreferences.mutate({
      email_notifications: {
        ...preferences?.email_notifications,
        [key]: value,
      },
    });
  };

  const handleUIPreferenceChange = (key: string, value: any) => {
    updatePreferences.mutate({
      ui_preferences: {
        ...preferences?.ui_preferences,
        [key]: value,
      },
    });
  };

  if (isLoading) {
    return (
      <div>
        <SettingHeader
          title="Preferences"
          description="Customize notifications and UI preferences"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border-none">
            <Skeleton className="h-6 w-48 bg-[#f9f4f0] mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-full bg-[#f9f4f0]" />
              <Skeleton className="h-12 w-full bg-[#f9f4f0]" />
              <Skeleton className="h-12 w-full bg-[#f9f4f0]" />
            </div>
          </Card>
          <Card className="p-6 border-none">
            <Skeleton className="h-6 w-48 bg-[#f9f4f0] mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-full bg-[#f9f4f0]" />
              <Skeleton className="h-12 w-full bg-[#f9f4f0]" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SettingHeader
        title="Preferences"
        description="Customize notifications and UI preferences"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email Notifications */}
        <Card className="p-6 border-none">
          <h3 className="font-poppins font-semibold text-lg text-[#0A2918] mb-4">
            Email Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="article_published">Article Published</Label>
                <p className="text-sm text-gray-600">
                  Get notified when your articles are published
                </p>
              </div>
              <Switch
                id="article_published"
                checked={
                  preferences?.email_notifications?.article_published || false
                }
                onCheckedChange={(checked) =>
                  handleEmailNotificationChange("article_published", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly_digest">Weekly Digest</Label>
                <p className="text-sm text-gray-600">
                  Receive weekly summary of your activity
                </p>
              </div>
              <Switch
                id="weekly_digest"
                checked={
                  preferences?.email_notifications?.weekly_digest || false
                }
                onCheckedChange={(checked) =>
                  handleEmailNotificationChange("weekly_digest", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="support_updates">Support Updates</Label>
                <p className="text-sm text-gray-600">
                  Get updates on your support tickets
                </p>
              </div>
              <Switch
                id="support_updates"
                checked={
                  preferences?.email_notifications?.support_updates || false
                }
                onCheckedChange={(checked) =>
                  handleEmailNotificationChange("support_updates", checked)
                }
              />
            </div>
          </div>
        </Card>

        {/* UI Preferences */}
        <Card className="p-6 border-none">
          <h3 className="font-poppins font-semibold text-lg text-[#0A2918] mb-4">
            UI Preferences
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={preferences?.ui_preferences?.theme || "light"}
                onValueChange={(value) =>
                  handleUIPreferenceChange("theme", value)
                }
              >
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={preferences?.ui_preferences?.language || "en"}
                onValueChange={(value) =>
                  handleUIPreferenceChange("language", value)
                }
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sidebar_collapsed">Collapse Sidebar</Label>
                <p className="text-sm text-gray-600">
                  Start with sidebar collapsed
                </p>
              </div>
              <Switch
                id="sidebar_collapsed"
                checked={
                  preferences?.ui_preferences?.sidebar_collapsed || false
                }
                onCheckedChange={(checked) =>
                  handleUIPreferenceChange("sidebar_collapsed", checked)
                }
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
