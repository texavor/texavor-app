"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUpdatePassword } from "../hooks/usePasswordApi";
import { Shield, CheckCircle2, KeyRound, Eye, EyeOff } from "lucide-react";

export default function PasswordPage() {
  const updatePassword = useUpdatePassword();

  const [formData, setFormData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirmation) {
      return;
    }

    updatePassword.mutate(formData, {
      onSuccess: () => {
        // Clear form on success
        setFormData({
          current_password: "",
          password: "",
          password_confirmation: "",
        });
      },
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-poppins font-semibold text-[#0A2918] mb-2">
          Password & Security
        </h1>
        <p className="font-inter text-gray-600">
          Update your password and security settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Section */}
        <Card className="p-6 border-none lg:col-span-2 h-fit shadow-none">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-[#104127]/10 flex items-center justify-center">
              <KeyRound className="h-5 w-5 text-[#104127]" />
            </div>
            <div>
              <h3 className="font-poppins font-semibold text-lg text-[#0A2918]">
                Change Password
              </h3>
              <p className="text-sm text-gray-500 font-inter">
                Ensure your account is using a long, random password to stay
                secure.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="current_password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current_password"
                  type={showPasswords.current ? "text" : "password"}
                  value={formData.current_password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      current_password: e.target.value,
                    })
                  }
                  placeholder="Enter current password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      current: !showPasswords.current,
                    })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPasswords.new ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter new password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        new: !showPasswords.new,
                      })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password_confirmation"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={formData.password_confirmation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password_confirmation: e.target.value,
                      })
                    }
                    placeholder="Confirm new password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm,
                      })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {formData.password !== formData.password_confirmation &&
              formData.password_confirmation && (
                <p className="text-sm text-red-600">Passwords do not match</p>
              )}

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={
                  updatePassword.isPending ||
                  formData.password !== formData.password_confirmation
                }
                className="bg-[#104127] hover:bg-[#104127]/90"
              >
                {updatePassword.isPending ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Side Panel - Security Info */}
        <div className="space-y-6">
          <Card className="p-6 border-none bg-primary/5">
            <div className="flex items-start gap-3 mb-4">
              <Shield className="h-5 w-5 text-[#104127] mt-0.5" />
              <h3 className="font-poppins font-semibold text-[#0A2918]">
                Password Requirements
              </h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-600 font-inter">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Minimum 8 characters long - the more, the better</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600 font-inter">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>At least one lowercase & one uppercase character</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600 font-inter">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  At least one number, symbol, or whitespace character
                </span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 border-none shadow-none">
            <h3 className="font-poppins font-semibold text-[#0A2918] mb-2">
              Security Tips
            </h3>
            <p className="text-sm text-gray-600 font-inter leading-relaxed">
              To keep your account secure, we recommend using a unique password
              that you don't use for other websites. You can use a password
              manager to generate and store strong passwords.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
