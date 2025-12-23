"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { axiosInstance } from "@/lib/axiosInstace";
import { toast } from "sonner";
import { Loader2, Mail, Shield } from "lucide-react";
import { RolePermissionsTable } from "@/components/RolePermissionsTable";

interface InviteMemberSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId?: string;
  onSuccess: () => void;
}

export default function InviteMemberSheet({
  open,
  onOpenChange,
  teamId,
  onSuccess,
}: InviteMemberSheetProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const { mutate: inviteMember, isPending } = useMutation({
    mutationFn: async (values: { email: string; role: string }) => {
      await axiosInstance.post(`/api/v1/teams/${teamId}/invitations`, {
        invitation: values,
      });
    },
    onSuccess: (_, variables) => {
      toast.success(`Invitation sent to ${variables.email}`);
      onSuccess();
      onOpenChange(false);
      setEmail("");
      setRole("viewer");
    },
    onError: (error: any) => {
      console.error("Invite failed", error);
      const msg =
        error.response?.data?.error ||
        "Failed to send invitation. Check your plan limits.";
      // toast.error(msg);
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(
      "Submitting invite for:",
      email,
      "Role:",
      role,
      "TeamID:",
      teamId
    );

    if (!teamId) {
      console.error("No team ID provided");
      toast.error("Error: No team selected.");
      return;
    }

    inviteMember({ email, role });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col h-full min-w-[500px] p-0 gap-0 bg-white">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-gray-50 shadow-sm">
              <Mail className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex flex-col gap-1 text-left">
              <SheetTitle className="text-lg font-semibold font-poppins text-[#0A2918]">
                Invite Team Member
              </SheetTitle>
              <SheetDescription className="text-xs font-inter text-gray-500">
                Enter the email and role for the new member
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form
            id="invite-form"
            onSubmit={handleInvite}
            className="flex flex-col gap-6"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-foreground/80 font-inter">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="font-inter"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-foreground/80 font-inter">
                Role
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="font-inter w-full h-10">
                  <span className="text-sm">
                    {role
                      ? role.charAt(0).toUpperCase() + role.slice(1)
                      : "Select a role"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex flex-col items-start py-1">
                      <span className="font-medium font-poppins text-sm">
                        Admin
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex flex-col items-start py-1">
                      <span className="font-medium font-poppins text-sm">
                        Editor
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="writer">
                    <div className="flex flex-col items-start py-1">
                      <span className="font-medium font-poppins text-sm">
                        Writer
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex flex-col items-start py-1">
                      <span className="font-medium font-poppins text-sm">
                        Viewer
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Dynamic Permissions Table */}
            <RolePermissionsTable role={role} />
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2 items-start mt-2">
              <Shield className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-blue-800 font-inter font-semibold mb-1">
                  Note
                </p>
                <p className="text-xs text-blue-700 font-inter leading-relaxed">
                  Members will receive an email invitation. They must accept it
                  to join the team.
                </p>
              </div>
            </div>
          </form>
        </div>

        <SheetFooter className="px-6 py-4 border-t bg-gray-50/50 mt-auto">
          <Button
            type="submit"
            form="invite-form"
            disabled={isPending}
            className="w-full bg-[#0A2918] hover:bg-[#0A2918]/90 text-white font-medium h-10"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Invitation
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
