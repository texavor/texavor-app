import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { Info, ChevronDown, ChevronUp } from "lucide-react";

interface MediumFormProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function MediumForm({ formData, handleChange }: MediumFormProps) {
  const [showUserIdHelp, setShowUserIdHelp] = useState(false);

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="token" className="text-foreground/80 font-inter">
          Integration Token
        </Label>
        <Input
          id="token"
          name="token"
          value={formData.token || ""}
          onChange={handleChange}
          required
          placeholder="Your Medium Integration Token"
          className="font-inter"
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="user_id" className="text-foreground/80 font-inter">
            User ID <span className="text-gray-400">(Optional)</span>
          </Label>
          <button
            type="button"
            onClick={() => setShowUserIdHelp(!showUserIdHelp)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            How to find?
            {showUserIdHelp ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        <Input
          id="user_id"
          name="user_id"
          value={formData.user_id || ""}
          onChange={handleChange}
          placeholder="Optional User ID"
          className="font-inter"
        />

        {showUserIdHelp && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 space-y-3">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 font-inter">
                Method 1: View Page Source
              </p>
              <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1.5 list-decimal list-inside font-inter">
                <li>
                  Go to your Medium profile:{" "}
                  <code className="bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded text-[11px]">
                    https://medium.com/@your-username
                  </code>
                </li>
                <li>
                  Right-click on the page and select{" "}
                  <strong>"View Page Source"</strong> (or press{" "}
                  <kbd className="bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded text-[11px]">
                    Ctrl+U
                  </kbd>{" "}
                  /{" "}
                  <kbd className="bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded text-[11px]">
                    Cmd+Option+U
                  </kbd>
                  )
                </li>
                <li>
                  Press{" "}
                  <kbd className="bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded text-[11px]">
                    Ctrl+F
                  </kbd>{" "}
                  /{" "}
                  <kbd className="bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded text-[11px]">
                    Cmd+F
                  </kbd>{" "}
                  and search for <strong>"userId"</strong>
                </li>
                <li>
                  Copy the long alphanumeric string (e.g.,{" "}
                  <code className="bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded text-[11px]">
                    1a2b3c4d5e6f...
                  </code>
                  )
                </li>
                <li>Paste it in the User ID field above</li>
              </ol>
            </div>

            <div className="border-t border-blue-200 dark:border-blue-800 pt-3 space-y-2">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 font-inter">
                Method 2: Use Medium API
              </p>
              <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1.5 list-decimal list-inside font-inter">
                <li>
                  Visit{" "}
                  <a
                    href="https://api.medium.com/v1/me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    https://api.medium.com/v1/me
                  </a>{" "}
                  with your integration token in the Authorization header
                </li>
                <li>
                  The response will contain your <strong>id</strong> field
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
