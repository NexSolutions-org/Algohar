import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ban, Save, Eye, Code, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DomainBlock() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEnabled, setIsEnabled] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch current domain block settings
  const { data: apiResponse, isLoading } = useQuery<{ success: boolean; data: { is_enabled: boolean; html_content: string } }>({
    queryKey: ["/api/developer/domain-block"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  useEffect(() => {
    if (apiResponse?.success && apiResponse.data) {
      setIsEnabled(apiResponse.data.is_enabled);
      setHtmlContent(apiResponse.data.html_content || "");
    }
  }, [apiResponse]);

  const updateMutation = useMutation({
    mutationFn: async (data: { is_enabled: boolean; html_content: string }) => {
      const response = await apiRequest("PUT", "/api/developer/domain-block", data);
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/developer/domain-block"] });
        toast({
          title: "Success",
          description: "Domain block settings updated successfully.",
        });
      } else {
        throw new Error(result.message || "Failed to update settings");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update domain block settings.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      is_enabled: isEnabled,
      html_content: htmlContent,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Domain Block Management</h1>
        <p className="text-muted-foreground mt-2">
          Control domain-wide blocking and customize the message shown to visitors.
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          When enabled, all routes (except developer and admin routes) will display the custom HTML content below.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Domain Block Settings</CardTitle>
              <CardDescription>
                Enable or disable domain blocking and customize the blocked page content.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="block-enabled" className="cursor-pointer">
                {isEnabled ? "Enabled" : "Disabled"}
              </Label>
              <Switch
                id="block-enabled"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="editor" className="w-full">
            <TabsList>
              <TabsTrigger value="editor">
                <Code className="h-4 w-4 mr-2" />
                HTML Editor
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="editor" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="html-content">HTML Content</Label>
                <Textarea
                  id="html-content"
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder="Enter HTML content to display when domain is blocked..."
                  className="font-mono text-sm min-h-[400px]"
                />
                <p className="text-sm text-muted-foreground">
                  Enter the complete HTML that will be displayed to visitors when domain blocking is enabled.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="preview" className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b">
                  <span className="text-sm font-medium">Preview</span>
                </div>
                <div className="bg-background p-4">
                  <iframe
                    srcDoc={htmlContent}
                    className="w-full h-[600px] border rounded"
                    title="Preview"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

