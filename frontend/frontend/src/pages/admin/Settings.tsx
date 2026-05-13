import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Mail,
  CreditCard,
  Save,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<
    | "general"
    | "payment"
    | "email"
  >("general");

  // Fetch settings from API
  const { data: apiResponse, isLoading } = useQuery<{ success: boolean; data: Record<string, any> }>({
    queryKey: ["/api/admin/settings"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Extract settings from API response
  // The API returns { success: true, data: {...} }, but getQueryFn returns the full response
  const apiSettings = (apiResponse as any)?.data || (apiResponse as any) || {};

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    foundationName: "",
    foundationEmail: "",
    foundationPhone: "",
    foundationAddress: "",
    websiteUrl: "",
    timezone: "Asia/Karachi",
    currency: "PKR",
    language: "en",
    description: "",
    // Contact Details
    contactPhone1: "",
    contactPhone2: "",
    contactPhone3: "",
    contactWhatsapp: "",
    contactEmail1: "",
    contactEmail2: "",
    contactEmailContact: "",
    contactEmailDonations: "",
    contactEmailVolunteer: "",
    contactEmailMedia: "",
    officeHours: "Monday - Friday: 9:00 AM - 5:00 PM\nSaturday: 9:00 AM - 1:00 PM\nSunday: Closed",
    // WhatsApp Button Settings
    whatsappButtonEnabled: true,
    whatsappNumber: "",
    // Map Coordinates (optional - will auto-geocode from address if not provided)
    contactLatitude: "",
    contactLongitude: "",
  });

  // Payment Gateway Settings (removed Stripe, JazzCash, Bank Transfer)
  const [paymentSettings, setPaymentSettings] = useState({
    payfastEnabled: false,
    payfastMerchantId: "",
    payfastSecuredKey: "",
    payfastMode: "sandbox",
    minimumDonationAmount: 500,
  });

  const [showPaymentSecrets, setShowPaymentSecrets] = useState({
    payfastSecuredKey: false,
  });

  // Email/SMTP Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpEnabled: true,
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUsername: "",
    smtpPassword: "",
    smtpEncryption: "tls",
    fromEmail: "noreply@algohar.org",
    fromName: "Al Gohar Foundation",
    replyToEmail: "info@algohar.org",
  });

  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState("");

  const [isTestingPayFast, setIsTestingPayFast] = useState(false);

  const handleGeneralChange = (field: string, value: string | boolean) => {
    setGeneralSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field: string, value: string | boolean | number) => {
    setPaymentSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmailChange = (field: string, value: string | boolean | number) => {
    setEmailSettings((prev) => ({ ...prev, [field]: value }));
  };

  // Load settings from API when data is available
  useEffect(() => {
    if (apiSettings && Object.keys(apiSettings).length > 0) {
      // General settings
      if (apiSettings.foundationName) setGeneralSettings(prev => ({ ...prev, foundationName: apiSettings.foundationName }));
      if (apiSettings.foundationEmail) {
        setGeneralSettings(prev => ({ ...prev, foundationEmail: apiSettings.foundationEmail }));
        // Initialize test email address with foundation email if not already set
        if (!testEmailAddress) {
          setTestEmailAddress(apiSettings.foundationEmail);
        }
      }
      if (apiSettings.foundationPhone) setGeneralSettings(prev => ({ ...prev, foundationPhone: apiSettings.foundationPhone }));
      if (apiSettings.foundationAddress) setGeneralSettings(prev => ({ ...prev, foundationAddress: apiSettings.foundationAddress }));
      if (apiSettings.contactLatitude !== undefined) setGeneralSettings(prev => ({ ...prev, contactLatitude: apiSettings.contactLatitude?.toString() || "" }));
      if (apiSettings.contactLongitude !== undefined) setGeneralSettings(prev => ({ ...prev, contactLongitude: apiSettings.contactLongitude?.toString() || "" }));
      if (apiSettings.websiteUrl) setGeneralSettings(prev => ({ ...prev, websiteUrl: apiSettings.websiteUrl }));
      if (apiSettings.timezone) setGeneralSettings(prev => ({ ...prev, timezone: apiSettings.timezone }));
      if (apiSettings.currency) setGeneralSettings(prev => ({ ...prev, currency: apiSettings.currency }));
      if (apiSettings.language) setGeneralSettings(prev => ({ ...prev, language: apiSettings.language }));
      if (apiSettings.description) setGeneralSettings(prev => ({ ...prev, description: apiSettings.description }));

      // Contact details
      if (apiSettings.contactPhone1) setGeneralSettings(prev => ({ ...prev, contactPhone1: apiSettings.contactPhone1 }));
      if (apiSettings.contactPhone2) setGeneralSettings(prev => ({ ...prev, contactPhone2: apiSettings.contactPhone2 }));
      if (apiSettings.contactPhone3) setGeneralSettings(prev => ({ ...prev, contactPhone3: apiSettings.contactPhone3 }));
      if (apiSettings.contactWhatsapp) setGeneralSettings(prev => ({ ...prev, contactWhatsapp: apiSettings.contactWhatsapp }));
      if (apiSettings.contactEmail1) setGeneralSettings(prev => ({ ...prev, contactEmail1: apiSettings.contactEmail1 }));
      if (apiSettings.contactEmail2) setGeneralSettings(prev => ({ ...prev, contactEmail2: apiSettings.contactEmail2 }));
      if (apiSettings.contactEmailContact) setGeneralSettings(prev => ({ ...prev, contactEmailContact: apiSettings.contactEmailContact }));
      if (apiSettings.contactEmailDonations) setGeneralSettings(prev => ({ ...prev, contactEmailDonations: apiSettings.contactEmailDonations }));
      if (apiSettings.contactEmailVolunteer) setGeneralSettings(prev => ({ ...prev, contactEmailVolunteer: apiSettings.contactEmailVolunteer }));
      if (apiSettings.contactEmailMedia) setGeneralSettings(prev => ({ ...prev, contactEmailMedia: apiSettings.contactEmailMedia }));
      if (apiSettings.officeHours) setGeneralSettings(prev => ({ ...prev, officeHours: apiSettings.officeHours }));

      // WhatsApp Button Settings
      if (apiSettings.whatsappButtonEnabled !== undefined) setGeneralSettings(prev => ({ ...prev, whatsappButtonEnabled: apiSettings.whatsappButtonEnabled }));
      if (apiSettings.whatsappNumber) setGeneralSettings(prev => ({ ...prev, whatsappNumber: apiSettings.whatsappNumber }));

      // Payment settings
      if (apiSettings.payfastEnabled !== undefined) setPaymentSettings(prev => ({ ...prev, payfastEnabled: apiSettings.payfastEnabled }));
      if (apiSettings.payfastMerchantId) setPaymentSettings(prev => ({ ...prev, payfastMerchantId: apiSettings.payfastMerchantId }));
      if (apiSettings.payfastSecuredKey) setPaymentSettings(prev => ({ ...prev, payfastSecuredKey: apiSettings.payfastSecuredKey }));
      if (apiSettings.payfastMode) setPaymentSettings(prev => ({ ...prev, payfastMode: apiSettings.payfastMode }));
      if (apiSettings.minimumDonationAmount) setPaymentSettings(prev => ({ ...prev, minimumDonationAmount: apiSettings.minimumDonationAmount }));

      // Email settings
      if (apiSettings.smtpEnabled !== undefined) setEmailSettings(prev => ({ ...prev, smtpEnabled: apiSettings.smtpEnabled }));
      if (apiSettings.smtpHost) setEmailSettings(prev => ({ ...prev, smtpHost: apiSettings.smtpHost }));
      if (apiSettings.smtpPort) setEmailSettings(prev => ({ ...prev, smtpPort: apiSettings.smtpPort }));
      if (apiSettings.smtpUsername) setEmailSettings(prev => ({ ...prev, smtpUsername: apiSettings.smtpUsername }));
      if (apiSettings.smtpPassword) setEmailSettings(prev => ({ ...prev, smtpPassword: apiSettings.smtpPassword }));
      if (apiSettings.smtpEncryption) setEmailSettings(prev => ({ ...prev, smtpEncryption: apiSettings.smtpEncryption }));
      if (apiSettings.fromEmail) setEmailSettings(prev => ({ ...prev, fromEmail: apiSettings.fromEmail }));
      if (apiSettings.fromName) setEmailSettings(prev => ({ ...prev, fromName: apiSettings.fromName }));
      if (apiSettings.replyToEmail) setEmailSettings(prev => ({ ...prev, replyToEmail: apiSettings.replyToEmail }));
    }
  }, [apiSettings]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: Record<string, any>) => {
      const response = await apiRequest("PUT", "/api/admin/settings", { settings });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: "Settings saved",
        description: "Settings have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to save settings.",
        variant: "destructive",
      });
    },
  });

  const handleSaveSettings = () => {
    const settingsToSave: Record<string, any> = {};

    // Collect all settings based on active tab
    if (activeTab === "general") {
      Object.assign(settingsToSave, generalSettings);
    } else if (activeTab === "payment") {
      Object.assign(settingsToSave, paymentSettings);
    } else if (activeTab === "email") {
      Object.assign(settingsToSave, emailSettings);
    }

    saveSettingsMutation.mutate(settingsToSave);
  };

  const handleTestEmail = async () => {
    // Check if SMTP is enabled
    if (!emailSettings.smtpEnabled) {
      toast({
        title: "SMTP not enabled",
        description: "Please enable SMTP first before testing.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!emailSettings.smtpHost || !emailSettings.smtpPort) {
      toast({
        title: "Missing configuration",
        description: "Please enter SMTP host and port.",
        variant: "destructive",
      });
      return;
    }

    if (!emailSettings.smtpUsername || !emailSettings.smtpPassword) {
      toast({
        title: "Missing credentials",
        description: "Please enter SMTP username and password.",
        variant: "destructive",
      });
      return;
    }

    // Get test email address from user
    const email = testEmailAddress || generalSettings.foundationEmail || "";
    
    if (!email) {
      toast({
        title: "Email address required",
        description: "Please enter an email address to send the test email to.",
        variant: "destructive",
      });
      return;
    }

    setIsTestingEmail(true);
    try {
      let response: Response;
      try {
        response = await apiRequest("POST", "/api/admin/settings/test-email", {
          email: email,
          settings: emailSettings,
        });
      } catch (apiError: any) {
        // apiRequest throws on non-OK responses, but we want to parse the error response
        // The error message format is: "400: {response body}"
        if (apiError?.message) {
          const errorMatch = apiError.message.match(/^(\d+):\s*(.+)$/);
          if (errorMatch) {
            const statusCode = parseInt(errorMatch[1]);
            const responseBody = errorMatch[2];
            
            try {
              const errorData = JSON.parse(responseBody);
              // Handle error response
              throw { isApiError: true, status: statusCode, data: errorData };
            } catch (parseError) {
              // If not JSON, throw original error
              throw apiError;
            }
          }
        }
        throw apiError;
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Test email sent",
          description: result.message || "Test email has been sent successfully.",
        });
      } else {
        toast({
          title: "Failed to send test email",
          description: result.message || "Failed to send test email. Please check your settings.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      let errorMessage = "Failed to send test email. Please try again.";
      
      try {
        // Check if this is our custom API error (thrown from apiRequest catch)
        if (error?.isApiError && error.data) {
          const errorData = error.data;
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else if (error?.message) {
          // Try to parse error message from apiRequest throwIfResNotOk format: "400: {json}"
          const errorText = error.message;
          const errorMatch = errorText.match(/^(\d+):\s*(.+)$/);
          
          if (errorMatch) {
            const responseBody = errorMatch[2];
            try {
              const errorData = JSON.parse(responseBody);
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
              // Not JSON format, use the error text as-is
              errorMessage = `HTTP ${errorMatch[1]}: ${responseBody.substring(0, 200)}`;
            }
          } else {
            // Regular error message
            errorMessage = errorText;
          }
        }
      } catch (parseError) {
        // If parsing fails, log and use default message
        console.error("Error parsing test email error:", parseError);
        console.error("Original error:", error);
      }

      toast({
        title: "Error",
        description: errorMessage.length > 300 ? errorMessage.substring(0, 300) + '...' : errorMessage,
        variant: "destructive",
        duration: 8000, // Show for 8 seconds so user can read it
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleTestPayment = async () => {
    // Test PayFast connection if PayFast is enabled
    if (paymentSettings.payfastEnabled) {
      if (!paymentSettings.payfastMerchantId || !paymentSettings.payfastSecuredKey) {
    toast({
          title: "Missing credentials",
          description: "Please enter Merchant ID and Secured Key before testing.",
          variant: "destructive",
        });
        return;
      }

      setIsTestingPayFast(true);
      try {
        let response: Response;
        try {
          response = await apiRequest("POST", "/api/admin/payments/payfast/test", {
            merchant_id: paymentSettings.payfastMerchantId,
            secured_key: paymentSettings.payfastSecuredKey,
            mode: paymentSettings.payfastMode || "sandbox",
          });
        } catch (apiError: any) {
          // apiRequest throws on non-OK responses, but we want to parse the error response
          // The error message format is: "400: {response body}"
          if (apiError?.message) {
            const errorMatch = apiError.message.match(/^(\d+):\s*(.+)$/);
            if (errorMatch) {
              const statusCode = parseInt(errorMatch[1]);
              const responseBody = errorMatch[2];
              
              try {
                const errorData = JSON.parse(responseBody);
                // Handle error response as if it was successful (so we can show proper error)
                throw { isApiError: true, status: statusCode, data: errorData };
              } catch (parseError) {
                // If not JSON, throw original error
                throw apiError;
              }
            }
          }
          throw apiError;
        }

        const result = await response.json();

        if (result.success) {
          toast({
            title: "Connection successful",
            description: result.message || "PayFast credentials are valid.",
          });
        } else {
          // Enhanced error display with detailed information
          let errorDescription = result.message || "Failed to connect to PayFast. Please check your credentials.";
          
          // Add HTTP code if available
          if (result.http_code) {
            errorDescription += ` (HTTP ${result.http_code})`;
          }
          
          // Log response and debug info for troubleshooting
          if (result.response) {
            console.error('PayFast Error Response (full):', result.response);
            // Also show preview in console if available
            if (result.response_preview) {
              console.error('PayFast Error Response (preview):', result.response_preview);
            }
          }
          if (result.debug) {
            console.error('PayFast Debug Info:', result.debug);
          }
          
          // Show more detailed error if response preview is available
          let fullErrorMessage = errorDescription;
          if (result.response_preview && result.response_preview.length > 0) {
            // Try to show a cleaner version of the error
            try {
              const errorJson = JSON.parse(result.response_preview);
              if (errorJson.MESSAGE || errorJson.message) {
                fullErrorMessage = errorJson.MESSAGE || errorJson.message;
              }
            } catch {
              // If not JSON, show first 200 chars of response
              if (result.response_preview.length > 200) {
                fullErrorMessage = errorDescription + '\n\nResponse: ' + result.response_preview.substring(0, 200) + '...';
              } else {
                fullErrorMessage = errorDescription + '\n\nResponse: ' + result.response_preview;
              }
            }
          }
          
          toast({
            title: "Connection failed",
            description: fullErrorMessage,
            variant: "destructive",
            duration: 8000, // Show for 8 seconds so user can read it
          });
        }
      } catch (error: any) {
        // Handle different types of errors
        let errorMessage = "Failed to test PayFast connection. Please try again.";
        let errorDetails = null;
        
        try {
          // Check if this is our custom API error (thrown from apiRequest catch)
          if (error?.isApiError && error.data) {
            const errorData = error.data;
            errorMessage = errorData.message || errorData.error || errorMessage;
            errorDetails = errorData;
            
            if (errorData.http_code) {
              errorMessage += ` (HTTP ${errorData.http_code})`;
            }
            
            console.error('PayFast Error Response:', errorData);
            
            // Log full response body from PayFast API
            if (errorData.response) {
              console.error('PayFast API Response Body (full):', errorData.response);
              
              // Try to parse if it's JSON
              try {
                const apiResponse = JSON.parse(errorData.response);
                console.error('PayFast API Error (parsed):', apiResponse);
                if (apiResponse.MESSAGE || apiResponse.message) {
                  errorMessage = apiResponse.MESSAGE || apiResponse.message;
                } else if (apiResponse.ERROR || apiResponse.error) {
                  errorMessage = apiResponse.ERROR || apiResponse.error;
                }
              } catch {
                // Not JSON, log raw response
                console.error('PayFast API Error (raw, not JSON):', errorData.response);
                // Use first 200 chars of raw response if available
                if (errorData.response_preview) {
                  errorMessage += '\n\n' + errorData.response_preview.substring(0, 200);
                }
              }
            }
            
            if (errorData.debug) {
              console.error('PayFast Debug Info:', errorData.debug);
            }
          } else if (error?.message) {
            // Try to parse error message from apiRequest throwIfResNotOk format: "400: {json}"
            const errorText = error.message;
            const errorMatch = errorText.match(/^(\d+):\s*(.+)$/);
            
            if (errorMatch) {
              const statusCode = errorMatch[1];
              const responseBody = errorMatch[2];
              
              try {
                const errorData = JSON.parse(responseBody);
                errorMessage = errorData.message || errorData.error || errorMessage;
                errorDetails = errorData;
                
                if (errorData.http_code || statusCode) {
                  errorMessage += ` (HTTP ${errorData.http_code || statusCode})`;
                }
                
                console.error('PayFast Error (parsed from error message):', errorData);
                
                if (errorData.response) {
                  console.error('PayFast API Response:', errorData.response);
                  try {
                    const apiResponse = JSON.parse(errorData.response);
                    if (apiResponse.MESSAGE || apiResponse.message) {
                      errorMessage = apiResponse.MESSAGE || apiResponse.message;
                    }
                  } catch {
                    // Not JSON
                  }
                }
              } catch {
                // Not JSON format, use the error text as-is
                errorMessage = `HTTP ${statusCode}: ${responseBody.substring(0, 200)}`;
                console.error('PayFast Error (non-JSON):', errorText);
              }
            } else {
              // Regular error message
              errorMessage = errorText;
              console.error('PayFast Error:', error);
            }
          }
        } catch (parseError) {
          // If parsing fails, log and use default message
          console.error('Error parsing PayFast error:', parseError);
          console.error('Original error:', error);
        }
        
        toast({
          title: "Connection Error",
          description: errorMessage.length > 300 ? errorMessage.substring(0, 300) + '...' : errorMessage,
          variant: "destructive",
          duration: 10000, // Show for 10 seconds so user can read it
        });
      } finally {
        setIsTestingPayFast(false);
      }
    } else {
      toast({
        title: "PayFast not enabled",
        description: "Please enable PayFast first before testing the connection.",
        variant: "destructive",
      });
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Building2 },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "email", label: "Email", icon: Mail },
  ];

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-2">
          Configure your foundation's settings and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar Navigation */}
        <Card className="lg:col-span-1">
          <CardContent className="p-0">
            <div className="space-y-1 p-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* General Settings */}
          {activeTab === "general" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Configure your foundation's basic information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading settings...
                  </div>
                ) : (
                  <>
                <div className="space-y-2">
                  <Label htmlFor="foundationName">Foundation Name</Label>
                  <Input
                    id="foundationName"
                    value={generalSettings.foundationName}
                    onChange={(e) => handleGeneralChange("foundationName", e.target.value)}
                    placeholder="Enter foundation name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="foundationEmail">Email Address</Label>
                    <Input
                      id="foundationEmail"
                      type="email"
                      value={generalSettings.foundationEmail}
                      onChange={(e) => handleGeneralChange("foundationEmail", e.target.value)}
                      placeholder="info@algohar.org"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="foundationPhone">Phone Number</Label>
                    <Input
                      id="foundationPhone"
                      type="tel"
                      value={generalSettings.foundationPhone}
                      onChange={(e) => handleGeneralChange("foundationPhone", e.target.value)}
                      placeholder="+92 300 1234567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foundationAddress">Address</Label>
                  <Textarea
                    id="foundationAddress"
                    value={generalSettings.foundationAddress}
                    onChange={(e) => handleGeneralChange("foundationAddress", e.target.value)}
                    placeholder="Enter foundation address"
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    The address will be used for the contact page map. If coordinates are not provided, the map will automatically geocode the address.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactLatitude">Latitude (Optional)</Label>
                    <Input
                      id="contactLatitude"
                      type="number"
                      step="any"
                      value={generalSettings.contactLatitude}
                      onChange={(e) => handleGeneralChange("contactLatitude", e.target.value)}
                      placeholder="31.4904"
                    />
                    <p className="text-xs text-muted-foreground">
                      Map latitude coordinate (e.g., 31.4904)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactLongitude">Longitude (Optional)</Label>
                    <Input
                      id="contactLongitude"
                      type="number"
                      step="any"
                      value={generalSettings.contactLongitude}
                      onChange={(e) => handleGeneralChange("contactLongitude", e.target.value)}
                      placeholder="74.3118"
                    />
                    <p className="text-xs text-muted-foreground">
                      Map longitude coordinate (e.g., 74.3118)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={generalSettings.websiteUrl}
                    onChange={(e) => handleGeneralChange("websiteUrl", e.target.value)}
                    placeholder="https://algohar.org"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={generalSettings.timezone}
                      onValueChange={(value) => handleGeneralChange("timezone", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Karachi">Asia/Karachi</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={generalSettings.currency}
                      onValueChange={(value) => handleGeneralChange("currency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PKR">PKR (Pakistani Rupee)</SelectItem>
                        <SelectItem value="USD">USD (US Dollar)</SelectItem>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={generalSettings.language}
                      onValueChange={(value) => handleGeneralChange("language", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ur">Urdu</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={generalSettings.description}
                    onChange={(e) => handleGeneralChange("description", e.target.value)}
                    placeholder="Enter foundation description"
                    rows={4}
                  />
                </div>

                <Separator />

                {/* Contact Details Section */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Contact Details</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configure contact information that will be displayed across the website
                    </p>
                  </div>

                  {/* Phone Numbers */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Phone Numbers</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone1">Phone 1 (Primary)</Label>
                        <Input
                          id="contactPhone1"
                          type="tel"
                          value={generalSettings.contactPhone1}
                          onChange={(e) => handleGeneralChange("contactPhone1", e.target.value)}
                          placeholder="+92 321 2546427"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone2">Phone 2</Label>
                        <Input
                          id="contactPhone2"
                          type="tel"
                          value={generalSettings.contactPhone2}
                          onChange={(e) => handleGeneralChange("contactPhone2", e.target.value)}
                          placeholder="+92 42 35233555"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone3">Phone 3</Label>
                        <Input
                          id="contactPhone3"
                          type="tel"
                          value={generalSettings.contactPhone3}
                          onChange={(e) => handleGeneralChange("contactPhone3", e.target.value)}
                          placeholder="+92 42 35116263"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactWhatsapp">WhatsApp</Label>
                        <Input
                          id="contactWhatsapp"
                          type="tel"
                          value={generalSettings.contactWhatsapp}
                          onChange={(e) => handleGeneralChange("contactWhatsapp", e.target.value)}
                          placeholder="+92 321 2546427"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Email Addresses */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Email Addresses</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail1">Email 1 (Primary)</Label>
                        <Input
                          id="contactEmail1"
                          type="email"
                          value={generalSettings.contactEmail1}
                          onChange={(e) => handleGeneralChange("contactEmail1", e.target.value)}
                          placeholder="info@algohar.org"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail2">Email 2</Label>
                        <Input
                          id="contactEmail2"
                          type="email"
                          value={generalSettings.contactEmail2}
                          onChange={(e) => handleGeneralChange("contactEmail2", e.target.value)}
                          placeholder="contact@algohar.org"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmailContact">Contact Email</Label>
                        <Input
                          id="contactEmailContact"
                          type="email"
                          value={generalSettings.contactEmailContact}
                          onChange={(e) => handleGeneralChange("contactEmailContact", e.target.value)}
                          placeholder="contact@algohar.org"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmailDonations">Donations Email</Label>
                        <Input
                          id="contactEmailDonations"
                          type="email"
                          value={generalSettings.contactEmailDonations}
                          onChange={(e) => handleGeneralChange("contactEmailDonations", e.target.value)}
                          placeholder="donations@algohar.org"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmailVolunteer">Volunteer Email</Label>
                        <Input
                          id="contactEmailVolunteer"
                          type="email"
                          value={generalSettings.contactEmailVolunteer}
                          onChange={(e) => handleGeneralChange("contactEmailVolunteer", e.target.value)}
                          placeholder="volunteer@algohar.org"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmailMedia">Media Email</Label>
                        <Input
                          id="contactEmailMedia"
                          type="email"
                          value={generalSettings.contactEmailMedia}
                          onChange={(e) => handleGeneralChange("contactEmailMedia", e.target.value)}
                          placeholder="media@algohar.org"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Office Hours */}
                  <div className="space-y-2">
                    <Label htmlFor="officeHours">Office Hours</Label>
                    <Textarea
                      id="officeHours"
                      value={generalSettings.officeHours}
                      onChange={(e) => handleGeneralChange("officeHours", e.target.value)}
                      placeholder="Monday - Friday: 9:00 AM - 5:00 PM&#10;Saturday: 9:00 AM - 1:00 PM&#10;Sunday: Closed"
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter each office hour on a new line
                    </p>
                  </div>
                </div>

                  <Separator />

                  {/* WhatsApp Button Settings */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">WhatsApp Button</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Configure the WhatsApp button that appears on the marketing site
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="whatsappButtonEnabled">Enable WhatsApp Button</Label>
                        <p className="text-sm text-muted-foreground">
                          Show or hide the WhatsApp button on the marketing site
                        </p>
                      </div>
                      <Switch
                        id="whatsappButtonEnabled"
                        checked={generalSettings.whatsappButtonEnabled}
                        onCheckedChange={(checked) =>
                          handleGeneralChange("whatsappButtonEnabled", checked)
                        }
                      />
                    </div>

                    {generalSettings.whatsappButtonEnabled && (
                      <div className="space-y-2 pl-6 border-l-2">
                        <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                        <Input
                          id="whatsappNumber"
                          type="tel"
                          value={generalSettings.whatsappNumber}
                          onChange={(e) => handleGeneralChange("whatsappNumber", e.target.value)}
                          placeholder="+92 321 2546427"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter the WhatsApp number (with country code) that users will contact. If left empty, it will use the WhatsApp contact number above.
                        </p>
                      </div>
                    )}
                  </div>

                <Separator />

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={saveSettingsMutation.isPending || isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Gateway Settings */}
          {activeTab === "payment" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Gateway Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure payment gateways and methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading settings...
                    </div>
                  ) : (
                    <>
                  {/* PayFast Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>PayFast</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable PayFast payment processing
                        </p>
                      </div>
                      <Switch
                        checked={paymentSettings.payfastEnabled}
                        onCheckedChange={(checked) =>
                          handlePaymentChange("payfastEnabled", checked)
                        }
                      />
                    </div>
                    {paymentSettings.payfastEnabled && (
                      <div className="space-y-4 pl-6 border-l-2">
                        <div className="space-y-2">
                          <Label htmlFor="payfastMerchantId">Merchant ID</Label>
                          <Input
                            id="payfastMerchantId"
                            value={paymentSettings.payfastMerchantId}
                            onChange={(e) =>
                              handlePaymentChange("payfastMerchantId", e.target.value)
                            }
                            placeholder="Enter merchant ID"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payfastSecuredKey">Secured Key</Label>
                          <div className="relative">
                            <Input
                              id="payfastSecuredKey"
                              type={showPaymentSecrets.payfastSecuredKey ? "text" : "password"}
                              value={paymentSettings.payfastSecuredKey}
                              onChange={(e) =>
                                handlePaymentChange("payfastSecuredKey", e.target.value)
                              }
                              placeholder="Enter secured key"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowPaymentSecrets((prev) => ({
                                  ...prev,
                                  payfastSecuredKey: !prev.payfastSecuredKey,
                                }))
                              }
                              className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                              {showPaymentSecrets.payfastSecuredKey ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="payfastMode">Mode</Label>
                          <Select
                            value={paymentSettings.payfastMode}
                            onValueChange={(value) =>
                              handlePaymentChange("payfastMode", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                              <SelectItem value="production">Production</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Use sandbox for testing, production for live payments
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleTestPayment}
                          disabled={isTestingPayFast}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isTestingPayFast ? 'animate-spin' : ''}`} />
                          {isTestingPayFast ? 'Testing...' : 'Test Connection'}
                        </Button>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="minimumDonationAmount">Minimum Donation Amount</Label>
                    <Input
                      id="minimumDonationAmount"
                      type="number"
                      value={paymentSettings.minimumDonationAmount}
                      onChange={(e) =>
                        handlePaymentChange("minimumDonationAmount", parseInt(e.target.value))
                      }
                      placeholder="500"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum amount required for donations (in {generalSettings.currency})
                    </p>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSaveSettings}
                      disabled={saveSettingsMutation.isPending || isLoading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saveSettingsMutation.isPending ? "Saving..." : "Save Payment Settings"}
                    </Button>
                  </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Email/SMTP Settings */}
          {activeTab === "email" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email/SMTP Settings
                </CardTitle>
                <CardDescription>
                  Configure email server settings for sending notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading settings...
                  </div>
                ) : (
                  <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable SMTP</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable SMTP email sending
                    </p>
                  </div>
                  <Switch
                    checked={emailSettings.smtpEnabled}
                    onCheckedChange={(checked) => handleEmailChange("smtpEnabled", checked)}
                  />
                </div>

                {emailSettings.smtpEnabled && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtpHost">SMTP Host</Label>
                        <Input
                          id="smtpHost"
                          value={emailSettings.smtpHost}
                          onChange={(e) => handleEmailChange("smtpHost", e.target.value)}
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPort">SMTP Port</Label>
                        <Input
                          id="smtpPort"
                          type="number"
                          value={emailSettings.smtpPort}
                          onChange={(e) =>
                            handleEmailChange("smtpPort", parseInt(e.target.value))
                          }
                          placeholder="587"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtpUsername">SMTP Username</Label>
                        <Input
                          id="smtpUsername"
                          value={emailSettings.smtpUsername}
                          onChange={(e) => handleEmailChange("smtpUsername", e.target.value)}
                          placeholder="your-email@gmail.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPassword">SMTP Password</Label>
                        <div className="relative">
                          <Input
                            id="smtpPassword"
                            type={showEmailPassword ? "text" : "password"}
                            value={emailSettings.smtpPassword}
                            onChange={(e) => handleEmailChange("smtpPassword", e.target.value)}
                            placeholder="Enter password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowEmailPassword(!showEmailPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showEmailPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtpEncryption">Encryption</Label>
                      <Select
                        value={emailSettings.smtpEncryption}
                        onValueChange={(value) => handleEmailChange("smtpEncryption", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tls">TLS</SelectItem>
                          <SelectItem value="ssl">SSL</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fromEmail">From Email</Label>
                        <Input
                          id="fromEmail"
                          type="email"
                          value={emailSettings.fromEmail}
                          onChange={(e) => handleEmailChange("fromEmail", e.target.value)}
                          placeholder="noreply@algohar.org"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fromName">From Name</Label>
                        <Input
                          id="fromName"
                          value={emailSettings.fromName}
                          onChange={(e) => handleEmailChange("fromName", e.target.value)}
                          placeholder="Al Gohar Foundation"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="replyToEmail">Reply-To Email</Label>
                      <Input
                        id="replyToEmail"
                        type="email"
                        value={emailSettings.replyToEmail}
                        onChange={(e) => handleEmailChange("replyToEmail", e.target.value)}
                        placeholder="info@algohar.org"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="testEmailAddress">Test Email Address</Label>
                        <Input
                          id="testEmailAddress"
                          type="email"
                          value={testEmailAddress}
                          onChange={(e) => setTestEmailAddress(e.target.value)}
                          placeholder={generalSettings.foundationEmail || "Enter email address to test"}
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter the email address where you want to receive the test email. If left empty, it will use the foundation email.
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={handleTestEmail}
                        disabled={isTestingEmail}
                      >
                        <Mail className={`h-4 w-4 mr-2 ${isTestingEmail ? 'animate-pulse' : ''}`} />
                        {isTestingEmail ? 'Sending...' : 'Send Test Email'}
                      </Button>
                    </div>
                  </>
                )}

                <Separator />

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={saveSettingsMutation.isPending || isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saveSettingsMutation.isPending ? "Saving..." : "Save Email Settings"}
                  </Button>
                </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}

