import { Button } from "@/components/ui/button";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { axiosInstance } from "@/lib/axiosInstace";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

const MAPPABLE_FIELDS = [
  {
    label: "Title",
    variable: "{{title}}",
    description: "The title of the article",
  },
  {
    label: "Content",
    variable: "{{content}}",
    description: "The full HTML content",
  },
  {
    label: "Slug",
    variable: "{{slug}}",
    description: "URL friendly slug",
  },
  {
    label: "Description",
    variable: "{{description}}",
    description: "Short excerpt",
  },
  {
    label: "Tags",
    variable: "{{tags}}",
    description: "List of tags",
  },
  {
    label: "Author Name",
    variable: "{{author.name}}",
    description: "Name of the author",
  },
  {
    label: "Canonical URL",
    variable: "{{canonical_url}}",
    description: "Original URL",
  },
];

interface CustomWebhookFormProps {
  formData: any;
  setFormData: (data: any) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  customHeaders: { key: string; value: string }[];
  setCustomHeaders: (headers: { key: string; value: string }[]) => void;
  mappingData: Record<string, string>;
  setMappingData: (data: Record<string, string>) => void;
  blogId?: string;
  integrationId?: string;
}

export function CustomWebhookForm(props: CustomWebhookFormProps) {
  const {
    formData,
    setFormData,
    handleChange,
    customHeaders,
    setCustomHeaders,
    mappingData,
    setMappingData,
  } = props;
  const [authTypeOpen, setAuthTypeOpen] = useState(false);
  const [apiKeyLocationOpen, setApiKeyLocationOpen] = useState(false);
  const [updateMethodOpen, setUpdateMethodOpen] = useState(false);

  // Test Connection Logic
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testArticleId, setTestArticleId] = useState("");

  const handleTestConnection = async () => {
    if (!props.blogId || !props.integrationId) {
      toast.error("Save the integration first to test connection");
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await axiosInstance.post(
        `/api/v1/blogs/${props.blogId}/integrations/${props.integrationId}/test_connection`,
        {
          test_article_id: testArticleId,
        }
      );

      const data = response.data;
      setTestResult(data);

      if (data.success) {
        toast.success("Test connection successful!");
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error("Test connection error:", error);
      setTestResult({
        success: false,
        error: "Connection failed",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const applySuggestedConfig = (config: any) => {
    const newFormData = { ...formData };
    if (config.response_id_field)
      newFormData.response_id_field = config.response_id_field;
    if (config.content_format)
      newFormData.content_format = config.content_format;

    setFormData(newFormData);

    if (config.field_mapping) {
      setMappingData({ ...mappingData, ...config.field_mapping });
    }

    toast.success("Configuration applied!");
  };

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="label" className="text-foreground/80 font-inter">
          Webhook Label
        </Label>
        <Input
          id="label"
          name="label"
          value={formData.label || ""}
          onChange={handleChange}
          required
          placeholder="My Custom Blog"
          className="font-inter"
        />
        <p className="text-[11px] text-muted-foreground">
          A friendly name for this webhook integration
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="webhook_url" className="text-foreground/80 font-inter">
          Webhook URL
        </Label>
        <Input
          id="webhook_url"
          name="webhook_url"
          value={formData.webhook_url || ""}
          onChange={handleChange}
          required
          placeholder="https://api.example.com/webhook"
          className="font-inter"
        />
        <p className="text-[11px] text-muted-foreground">
          The URL where we should send the article data
        </p>
      </div>

      <div className="space-y-4 pt-2">
        <div className="flex-1 space-y-1.5">
          <Label className="text-foreground/80 font-inter">
            Authentication Type
          </Label>
          <CustomDropdown
            open={authTypeOpen}
            onOpenChange={setAuthTypeOpen}
            value={formData.auth_type || ""}
            onSelect={(option: any) =>
              setFormData({ ...formData, auth_type: option.id })
            }
            options={[
              { id: "", name: "No Authentication" },
              { id: "bearer", name: "Bearer Token" },
              { id: "api_key", name: "API Key" },
              { id: "basic", name: "Basic Auth" },
              { id: "session", name: "Session / Cookie" },
              { id: "custom", name: "Custom Headers" },
            ]}
            trigger={
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between h-9 text-sm font-normal py-2 px-3 bg-white border-input"
              >
                {formData.auth_type
                  ? [
                      { id: "bearer", name: "Bearer Token" },
                      { id: "api_key", name: "API Key" },
                      { id: "basic", name: "Basic Auth" },
                      { id: "session", name: "Session / Cookie" },
                      { id: "custom", name: "Custom Headers" },
                    ].find((a) => a.id === formData.auth_type)?.name
                  : "No Authentication"}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            }
          />
        </div>

        {formData.auth_type === "bearer" && (
          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
            <Label className="text-foreground/80 font-inter">
              Bearer Token
            </Label>
            <Input
              type="password"
              placeholder="ey..."
              value={formData.credentials?.token || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  credentials: {
                    ...formData.credentials,
                    token: e.target.value,
                  },
                })
              }
              className="font-inter bg-white"
            />
          </div>
        )}

        {formData.auth_type === "api_key" && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-foreground/80 font-inter">
                  Key Name
                </Label>
                <Input
                  placeholder="X-API-Key"
                  value={formData.api_key_name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, api_key_name: e.target.value })
                  }
                  className="font-inter bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground/80 font-inter">
                  Location
                </Label>
                <CustomDropdown
                  open={apiKeyLocationOpen}
                  onOpenChange={setApiKeyLocationOpen}
                  value={formData.api_key_location || "header"}
                  onSelect={(option: any) =>
                    setFormData({ ...formData, api_key_location: option.id })
                  }
                  options={[
                    { id: "header", name: "Header" },
                    { id: "query", name: "Query Parameter" },
                  ]}
                  trigger={
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between h-9 text-sm font-normal py-2 px-3 bg-white border-input"
                    >
                      {formData.api_key_location === "query"
                        ? "Query Parameter"
                        : "Header"}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80 font-inter">
                API Key Value
              </Label>
              <Input
                type="password"
                placeholder="secret_key..."
                value={formData.credentials?.value || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    credentials: {
                      ...formData.credentials,
                      value: e.target.value,
                    },
                  })
                }
                className="font-inter bg-white"
              />
            </div>
          </div>
        )}

        {formData.auth_type === "basic" && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-1.5">
              <Label className="text-foreground/80 font-inter">Username</Label>
              <Input
                placeholder="admin"
                value={formData.credentials?.username || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    credentials: {
                      ...formData.credentials,
                      username: e.target.value,
                    },
                  })
                }
                className="font-inter bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80 font-inter">Password</Label>
              <Input
                type="password"
                placeholder="••••••"
                value={formData.credentials?.password || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    credentials: {
                      ...formData.credentials,
                      password: e.target.value,
                    },
                  })
                }
                className="font-inter bg-white"
              />
            </div>
          </div>
        )}

        {formData.auth_type === "session" && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-1.5">
              <Label className="text-foreground/80 font-inter">
                Cookie Name
              </Label>
              <Input
                placeholder="session_id"
                value={formData.cookie_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, cookie_name: e.target.value })
                }
                className="font-inter bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-foreground/80 font-inter">Value</Label>
              <Input
                type="password"
                placeholder="xyz..."
                value={formData.credentials?.value || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    credentials: {
                      ...formData.credentials,
                      value: e.target.value,
                    },
                  })
                }
                className="font-inter bg-white"
              />
            </div>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      {/* Test Connection Section */}
      <div className="bg-white border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-foreground/80 font-inter font-semibold">
              Test Connection
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Verify your settings by fetching a sample article
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={isTesting || !props.integrationId}
            className="h-8"
            title={!props.integrationId ? "Save integration to test" : ""}
          >
            {isTesting ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>
        </div>

        {!props.integrationId && (
          <p className="text-[11px] text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
            Please save the integration first to enable connection testing.
          </p>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs text-foreground/70 font-inter">
            Test Article ID (Optional)
          </Label>
          <Input
            value={testArticleId}
            onChange={(e) => setTestArticleId(e.target.value)}
            placeholder="e.g. 123 (if your API requires a specific ID)"
            className="h-8 text-xs font-inter bg-white"
            disabled={!props.integrationId}
          />
        </div>

        {testResult && (
          <div className="animate-in fade-in slide-in-from-top-2">
            {testResult.success ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-md p-3 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle className="w-4 h-4" />
                  <p className="text-xs font-semibold">
                    Connection Successful!
                  </p>
                </div>

                {testResult.suggested_config && (
                  <div className="bg-white border border-emerald-100 rounded p-3 space-y-2">
                    <p className="text-xs font-medium text-emerald-800">
                      Suggested Configuration
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-600">
                      {testResult.suggested_config.response_id_field && (
                        <div>
                          <span className="font-semibold">ID Field:</span>{" "}
                          {testResult.suggested_config.response_id_field}
                        </div>
                      )}
                      {testResult.suggested_config.content_format && (
                        <div>
                          <span className="font-semibold">Format:</span>{" "}
                          {testResult.suggested_config.content_format}
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="w-full h-7 text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none"
                      onClick={() =>
                        applySuggestedConfig(testResult.suggested_config)
                      }
                    >
                      Apply Configuration
                    </Button>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-semibold text-emerald-800">
                    Response Body
                  </p>
                  <pre className="text-[10px] bg-white border border-emerald-100 rounded p-2 overflow-auto max-h-32 text-gray-700 font-mono">
                    {JSON.stringify(testResult.response_body, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-100 rounded-md p-3 flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-red-800">
                    Connection Failed
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    {testResult.error}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Separator className="my-4" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-foreground/80 font-inter">
            Custom Headers
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setCustomHeaders([...customHeaders, { key: "", value: "" }])
            }
            className="h-7 text-xs gap-1"
          >
            <Plus className="w-3 h-3" />
            Add Header
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mb-2">
          Add custom headers for authentication or other purposes.
        </p>

        {customHeaders.length > 0 ? (
          <div className="grid gap-2 border rounded-lg p-4 bg-gray-50/50">
            {customHeaders.map((header, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Input
                    value={header.key}
                    onChange={(e) => {
                      const newHeaders = [...customHeaders];
                      newHeaders[index].key = e.target.value;
                      setCustomHeaders(newHeaders);
                    }}
                    placeholder="Key (e.g. Authorization)"
                    className="h-8 text-xs font-inter font-mono bg-white"
                  />
                </div>
                <div className="col-span-6">
                  <Input
                    value={header.value}
                    onChange={(e) => {
                      const newHeaders = [...customHeaders];
                      newHeaders[index].value = e.target.value;
                      setCustomHeaders(newHeaders);
                    }}
                    placeholder="Value"
                    className="h-8 text-xs font-inter font-mono bg-white"
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newHeaders = customHeaders.filter(
                        (_, i) => i !== index
                      );
                      setCustomHeaders(newHeaders);
                    }}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 border border-dashed rounded-lg bg-gray-50/50">
            <p className="text-xs text-muted-foreground">
              No custom headers added.
            </p>
          </div>
        )}
      </div>
      <div className="space-y-3">
        <Label className="text-foreground/80 font-inter">Field Mapping</Label>
        <p className="text-[11px] text-muted-foreground mb-2">
          Enter the JSON key you want to use for each field. Leave empty to
          skip.
        </p>

        <div className="grid gap-3 border rounded-lg p-4 bg-gray-50/50">
          {MAPPABLE_FIELDS.map((field) => (
            <div
              key={field.variable}
              className="grid grid-cols-12 gap-2 items-center"
            >
              <div className="col-span-4">
                <Label
                  htmlFor={`mapping-${field.variable}`}
                  className="text-xs font-medium text-gray-700"
                >
                  {field.label}
                </Label>
                <p className="text-[10px] text-gray-500 font-mono">
                  {field.variable}
                </p>
              </div>
              <div className="col-span-8">
                <Input
                  id={`mapping-${field.variable}`}
                  value={mappingData[field.variable] || ""}
                  onChange={(e) =>
                    setMappingData({
                      ...mappingData,
                      [field.variable]: e.target.value,
                    })
                  }
                  placeholder={`Key for ${field.label}`}
                  className="h-8 text-xs font-inter font-mono bg-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <br />

      <br />

      <div className="group border rounded-md p-4 bg-white space-y-6">
        <Label className="text-foreground/80 font-inter">
          Advanced Configuration
        </Label>
        <p className="text-[11px] text-muted-foreground mb-4">
          Enter the JSON key you want to use for each field. Leave empty to
          skip.
        </p>

        {/* Content Format */}
        <div className="space-y-3">
          <Label className="text-foreground/80 font-inter text-xs font-semibold uppercase tracking-wider">
            Content & Format
          </Label>
          <RadioGroup
            defaultValue={formData.content_format || "markdown"}
            onValueChange={(value) =>
              setFormData({ ...formData, content_format: value })
            }
            className="flex items-center "
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="markdown"
                id="format_markdown"
                className="bg-white"
              />
              <Label
                htmlFor="format_markdown"
                className="font-normal cursor-pointer text-sm"
              >
                Markdown
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="html"
                id="format_html"
                className="bg-white"
              />
              <Label
                htmlFor="format_html"
                className="font-normal cursor-pointer text-sm"
              >
                HTML (Pre-rendered)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* ID Extraction */}
        <div className="space-y-1.5">
          <Label
            htmlFor="response_id_field"
            className="text-foreground/80 font-inter"
          >
            Response ID Field
          </Label>
          <Input
            id="response_id_field"
            name="response_id_field"
            value={formData.response_id_field || ""}
            onChange={handleChange}
            placeholder="e.g. data.id (leaves empty for auto-detect)"
            className="font-inter h-9 text-sm bg-white"
          />
          <p className="text-[11px] text-muted-foreground">
            JSON path to the article ID in the API response
          </p>
        </div>

        {/* Custom CRUD URLs */}
        <div className="space-y-3">
          <Label className="text-foreground/80 font-inter text-xs font-semibold uppercase tracking-wider">
            Custom Endpoints
          </Label>

          <div className="space-y-1.5">
            <Label
              htmlFor="update_url"
              className="text-foreground/80 font-inter"
            >
              Update URL
            </Label>
            <div className="flex gap-2">
              <div className="w-[110px]">
                <CustomDropdown
                  open={updateMethodOpen}
                  onOpenChange={setUpdateMethodOpen}
                  value={formData.update_method || "PATCH"}
                  onSelect={(option: any) =>
                    setFormData({ ...formData, update_method: option.id })
                  }
                  options={[
                    { id: "PATCH", name: "PATCH" },
                    { id: "PUT", name: "PUT" },
                  ]}
                  trigger={
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between h-9 text-xs font-medium py-2 px-2 bg-white border-input"
                    >
                      {formData.update_method || "PATCH"}
                      <ChevronDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                    </Button>
                  }
                />
              </div>
              <Input
                id="update_url"
                name="update_url"
                value={formData.update_url || ""}
                onChange={handleChange}
                placeholder="https://api.../{id}"
                className="font-inter h-9 text-sm flex-1 bg-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="delete_url"
              className="text-foreground/80 font-inter"
            >
              Delete URL (DELETE)
            </Label>
            <Input
              id="delete_url"
              name="delete_url"
              value={formData.delete_url || ""}
              onChange={handleChange}
              placeholder="https://api.../{id}"
              className="font-inter h-9 text-sm bg-white"
            />
          </div>
        </div>

        {/* Timeout */}
        <div className="space-y-1.5">
          <Label htmlFor="timeout" className="text-foreground/80 font-inter">
            Request Timeout (seconds)
          </Label>
          <Input
            id="timeout"
            name="timeout"
            type="number"
            min="1"
            max="300"
            value={formData.timeout || "30"}
            onChange={handleChange}
            className="font-inter h-9 w-24 bg-white"
          />
        </div>
      </div>
    </>
  );
}
