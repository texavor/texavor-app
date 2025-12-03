"use client";

import { useState, useEffect } from "react";
import { SettingHeader } from "../components/SettingHeader";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetProfile, useUpdateProfile } from "../hooks/useProfileApi";
import { format } from "date-fns";
import { Pencil } from "lucide-react";

export default function ProfilePage() {
  const { data: profile, isLoading }: any = useGetProfile();
  const updateProfile = useUpdateProfile();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData, {
      onSuccess: () => {
        setEditDialogOpen(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div>
        <SettingHeader title="My Profile" />
        <div className="space-y-6">
          <Card className="p-6 border-none">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full bg-[#f9f4f0]" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48 bg-[#f9f4f0]" />
                <Skeleton className="h-4 w-32 bg-[#f9f4f0]" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const getInitials = () => {
    const first = profile?.first_name?.[0] || "";
    const last = profile?.last_name?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <div>
      <SettingHeader title="My Profile" />

      <div className="space-y-6">
        {/* Profile Header Card */}
        <Card className="p-6 border-none">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="" />
              <AvatarFallback className="bg-[#104127] text-white text-2xl font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-poppins font-semibold text-xl text-[#0A2918]">
                {profile?.first_name} {profile?.last_name}
              </h2>
              <p className="text-gray-600 font-inter text-sm">
                {profile?.subscription_tier === "free"
                  ? "Admin"
                  : profile?.subscription_tier}
              </p>
            </div>
          </div>
        </Card>

        {/* Personal Information Card */}
        <Card className="p-6 border-none">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-poppins font-semibold text-lg text-[#0A2918]">
              Personal Information
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
              className="gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-gray-500 text-sm">First Name</Label>
              <p className="font-inter text-gray-900 mt-1">
                {profile?.first_name || "-"}
              </p>
            </div>
            <div>
              <Label className="text-gray-500 text-sm">Last Name</Label>
              <p className="font-inter text-gray-900 mt-1">
                {profile?.last_name || "-"}
              </p>
            </div>
            <div>
              <Label className="text-gray-500 text-sm">Date of Birth</Label>
              <p className="font-inter text-gray-900 mt-1">
                {profile?.created_at
                  ? format(new Date(profile.created_at), "dd-MM-yyyy")
                  : "-"}
              </p>
            </div>
            <div>
              <Label className="text-gray-500 text-sm">Email Address</Label>
              <p className="font-inter text-gray-900 mt-1">
                {profile?.email || "-"}
              </p>
            </div>
            <div>
              <Label className="text-gray-500 text-sm">Phone Number</Label>
              <p className="font-inter text-gray-900 mt-1">-</p>
            </div>
            <div>
              <Label className="text-gray-500 text-sm">User Role</Label>
              <p className="font-inter text-gray-900 mt-1 capitalize">
                {profile?.subscription_tier || "Admin"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Edit Personal Information</DialogTitle>
            <DialogDescription>
              Update your personal details below
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    placeholder="Natasha"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    placeholder="Khaleira"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="info@binary-fusion.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
