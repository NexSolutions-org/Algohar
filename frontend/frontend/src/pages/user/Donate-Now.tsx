import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { getQueryFn } from "@/lib/queryClient";
import {
  Heart,
  Shield,
  Award,
  Handshake,
  CreditCard,
} from "lucide-react";
import UserLayout from "@/components/user/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, API_BASE_URL } from "@/lib/queryClient";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { useCurrency } from "@/contexts/CurrencyContext";
import { convertAmountSync } from "@/lib/currencyUtils";

const donationFormSchema = z.object({
  donorName: z.string().min(1, "Name is required"),
  donorEmail: z.string().email("Invalid email address"),
  donorPhone: z.string().optional(),
  amount: z.coerce.number().min(500, "Minimum donation amount is 500 PKR"),
  type: z.enum(["one-time"]),
  paymentMethod: z.enum(["payfast"]),
  cause: z.string().optional(),
  donationType: z.enum(["zakat", "donation"], {
    required_error: "Please select Zakat or Donation",
  }),
});

type DonationForm = z.infer<typeof donationFormSchema>;

const amountPresets = [
  { amount: 6000, label: "Rs 6000 Monthly", description: "Monthly Ration For 1 Family" },
  { amount: 9000, label: "Rs 9000 One-Time", description: "Books & Uniform For 1 Student" },
  { amount: 4000, label: "Rs 4000 Monthly", description: "Sponsor A Child Education" },
];

const causes = [
  { id: "education", name: "Education Support", description: "Help children access quality education" },
  { id: "medical", name: "Medical Camp", description: "Support free medical camps in communities" },
  { id: "ration", name: "Food Ration", description: "Provide monthly rations to families" },
  { id: "general", name: "General Fund", description: "Support our general welfare activities" },
];

export default function DonateNow() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { format, convert, rates } = useCurrencyConversion();
  const { currency } = useCurrency();
  const [selectedAmount, setSelectedAmount] = useState(6000);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedCause, setSelectedCause] = useState("general");

  // Fetch current user data (session-based)
  const { data: userResponse } = useQuery<any>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Get user data from API response or localStorage
  const getUserData = () => {
    // Try API response first (most up-to-date)
    if (userResponse?.success && userResponse?.user) {
      return userResponse.user;
    }
    if (userResponse?.user) {
      return userResponse.user;
    }
    // Fallback to localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  };

  const userData = getUserData();
  const userEmail = userData?.email || "";
  const userName = userData?.name || "";
  const userPhone = userData?.phone || "";

  const form = useForm<DonationForm>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      donorName: userName,
      donorEmail: userEmail,
      donorPhone: userPhone || "",
      amount: 6000,
      type: "one-time",
      paymentMethod: "payfast",
      cause: "general",
      donationType: undefined,
    },
  });

  // Update form when user data is loaded
  useEffect(() => {
    // Use presence of userData instead of undefined `isLoggedIn` variable.
    if (userData) {
      if (userName) form.setValue("donorName", userName);
      if (userEmail) form.setValue("donorEmail", userEmail);
      if (userPhone) form.setValue("donorPhone", userPhone);
    }
  }, [userData, userName, userEmail, userPhone]);

  // Clear custom amount when currency changes (to avoid confusion)
  useEffect(() => {
    if (customAmount) {
      setCustomAmount("");
      // Reset to selected preset amount, or default to 6000 if none selected
      const amountToSet = selectedAmount > 0 ? selectedAmount : 6000;
      setSelectedAmount(amountToSet);
      form.setValue("amount", amountToSet);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency]);

  const createDonationMutation = useMutation({
    mutationFn: async (data: DonationForm) => {
      // Convert camelCase to snake_case for backend API
      const apiData: any = {
        donor_name: data.donorName,
        donor_email: data.donorEmail,
        donor_phone: data.donorPhone || null,
        amount: data.amount,
        type: data.type,
        payment_method: data.paymentMethod,
        cause: data.cause || null,
        donation_type: data.donationType,
      };
      const response = await apiRequest("POST", "/api/donations", apiData);
      return response.json();
    },
    onSuccess: (response: any) => {
      const donation = response.data || response;
      
      // If backend returned user (session established), persist user profile
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
        toast({
          title: "Account updated",
          description: "You are signed in and your profile is saved.",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/donations"] });
      
      // Check for PayFast errors first
      if (response.payfast?.error) {
        toast({
          title: "Payment Error",
          description: response.payfast.error,
          variant: "destructive",
        });
        return;
      }
      
      // Handle PayFast payment form if available
      if (response.payfast?.payment_form_html) {
        // Show loading message
        toast({
          title: "Redirecting to PayFast...",
          description: "Please wait while we redirect you to the payment gateway.",
        });
        
        // Create a temporary container for the form
        const formContainer = document.createElement('div');
        formContainer.style.display = 'none';
        formContainer.innerHTML = response.payfast.payment_form_html;
        document.body.appendChild(formContainer);
        
        // Auto-submit the form
        const form = document.getElementById('PayFastForm') as HTMLFormElement;
        if (form) {
          form.submit();
        } else {
          // If form not found, try after a short delay
          setTimeout(() => {
            const form = document.getElementById('PayFastForm') as HTMLFormElement;
            if (form) {
              form.submit();
            } else {
              toast({
                title: "Payment form error",
                description: "Could not redirect to payment gateway. Please try again.",
                variant: "destructive",
              });
            }
          }, 500);
        }
      } else {
        // No PayFast form, show success message
        toast({
          title: "Thank you for your donation!",
          description: "You will receive a confirmation email shortly.",
        });
        form.reset();
        setSelectedAmount(6000);
        setCustomAmount("");
        
        // Redirect to my donations page after a short delay
        setTimeout(() => {
          setLocation("/user/my-donations");
        }, 2000);
      }
    },
    onError: (error: any) => {
      console.error("Donation error:", error);
      toast({
        title: "Error processing donation",
        description: "Please try again or contact us for assistance.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DonationForm) => {
    createDonationMutation.mutate({ ...data, cause: selectedCause });
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
    form.setValue("amount", amount);
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value) || 0;
    
    // If no value or rates not loaded yet, clear selection but don't set form value
    if (!value || value === "" || !rates) {
      if (selectedAmount > 0) {
        // Keep the selected preset amount if custom amount is cleared
        form.setValue("amount", selectedAmount);
      }
      return;
    }
    
    // Convert the custom amount from selected currency to PKR
    const amountInPKR = currency === "PKR" 
      ? numValue 
      : convertAmountSync(numValue, currency, "PKR", rates);
    
    // Check if the converted amount meets the minimum (500 PKR)
    const minAmountInSelectedCurrency = currency === "PKR" 
      ? 500 
      : convertAmountSync(500, "PKR", currency, rates);
    
    if (numValue >= minAmountInSelectedCurrency) {
      setSelectedAmount(0);
      form.setValue("amount", amountInPKR);
    } else if (numValue > 0) {
      // If amount is entered but below minimum, still set it (validation will catch it)
      setSelectedAmount(0);
      form.setValue("amount", amountInPKR);
    }
  };

  // Calculate current amount in PKR for display and submission
  const currentAmount = (() => {
    if (customAmount && rates && parseFloat(customAmount) > 0) {
      // User entered a custom amount - convert from selected currency to PKR
      return currency === "PKR" 
        ? parseFloat(customAmount) || 0 
        : convertAmountSync(parseFloat(customAmount) || 0, currency, "PKR", rates);
    }
    // Use selected preset amount (already in PKR)
    return selectedAmount;
  })();

  // Calculate minimum amount in selected currency for input validation
  const minAmountInSelectedCurrency = rates
    ? (currency === "PKR" ? 500 : convertAmountSync(500, "PKR", currency, rates))
    : 500;

  return (
    <UserLayout>
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Make a Donation</h1>
        <p className="text-muted-foreground mt-2">
          Your contribution helps us transform lives in communities across Pakistan
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Donation Details</CardTitle>
                <CardDescription>
                  Fill out the form below to make your contribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Cause Selection */}
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">
                        Select Cause (Optional)
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        {causes.map((cause) => (
                          <button
                            key={cause.id}
                            type="button"
                            onClick={() => setSelectedCause(cause.id)}
                            className={`p-4 border-2 rounded-lg text-left transition-all ${
                              selectedCause === cause.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="font-semibold">{cause.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {cause.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Amount Selection */}
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">
                            Donation Amount
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 gap-4">
                                {amountPresets.map((preset) => (
                                  <button
                                    key={preset.amount}
                                    type="button"
                                    onClick={() => handleAmountSelect(preset.amount)}
                                    className={`p-6 border-2 rounded-lg text-left transition-all ${
                                      selectedAmount === preset.amount
                                        ? "border-primary bg-primary text-primary-foreground shadow-md"
                                        : "border-border hover:border-primary/50 hover:bg-accent"
                                    }`}
                                  >
                                    <div className="text-xl font-bold mb-1">{preset.label}</div>
                                    <div className={`text-sm ${selectedAmount === preset.amount ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                                      {preset.description}
                                    </div>
                                  </button>
                                ))}
                              </div>
                              <div className="space-y-2">
                                <span className="text-base font-bold text-foreground block">
                                  Custom Amount:
                                </span>
                                <Input
                                  type="number"
                                  placeholder={`Min ${format(500)}`}
                                  min={minAmountInSelectedCurrency}
                                  step="any"
                                  value={customAmount}
                                  onChange={(e) =>
                                    handleCustomAmountChange(e.target.value)
                                  }
                                  className="w-full font-bold text-lg py-6 px-4 border-2 border-primary focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Amounts shown in {currency}. Actual donation will be processed in PKR.
                              </p>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Donation Type Selection */}
                    <FormField
                      control={form.control}
                      name="donationType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">
                            Donation Type *
                          </FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-2 gap-4">
                              <button
                                type="button"
                                onClick={() => field.onChange("zakat")}
                                className={`p-6 border-2 rounded-lg text-center transition-all ${
                                  field.value === "zakat"
                                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                                    : "border-border hover:border-primary/50 hover:bg-accent"
                                }`}
                              >
                                <div className="text-2xl font-bold mb-2">Zakat</div>
                                <div className={`text-sm ${field.value === "zakat" ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                                  Fulfill your religious obligation
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={() => field.onChange("donation")}
                                className={`p-6 border-2 rounded-lg text-center transition-all ${
                                  field.value === "donation"
                                    ? "border-primary bg-primary text-primary-foreground shadow-md"
                                    : "border-border hover:border-primary/50 hover:bg-accent"
                                }`}
                              >
                                <div className="text-2xl font-bold mb-2">Donation</div>
                                <div className={`text-sm ${field.value === "donation" ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                                  Support our charitable causes
                                </div>
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Donor Information */}
                    {!userData ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="donorName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Enter your full name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="donorEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="your.email@example.com"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="donorPhone"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Phone Number (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="tel"
                                  placeholder="+92-300-1234567"
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="donorName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled
                                  className="bg-muted cursor-not-allowed"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="donorEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  disabled
                                  className="bg-muted cursor-not-allowed"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="donorPhone"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="tel"
                                  disabled
                                  className="bg-muted cursor-not-allowed"
                                  value={field.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                              {!userPhone && (
                                <p className="text-xs text-muted-foreground">
                                  Phone number will be saved after your first donation
                                </p>
                              )}
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Payment Method */}
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">
                            Payment Method
                          </FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-3 p-4 border border-border rounded-lg bg-primary/5">
                              <CreditCard className="w-5 h-5 text-primary" />
                              <div className="flex-1">
                                <div className="font-semibold">PayFast</div>
                                <div className="text-sm text-muted-foreground">
                                  Secure payment gateway - Bank, Mobile Wallets, Card Payments, QR Payments
                                </div>
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Trust Badges */}
                    <div className="flex items-center justify-center space-x-6 py-4 border-t border-border">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span>100% Secure</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Award className="w-4 h-4 text-blue-500" />
                        <span>Registered Trust</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Handshake className="w-4 h-4 text-primary" />
                        <span>100% Transparent</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={createDonationMutation.isPending}
                      className="w-full btn-primary py-6 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl"
                    >
                      <Heart className="w-5 h-5 mr-2" />
                      {createDonationMutation.isPending
                        ? "Processing..."
                        : "Complete Donation"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Donation Summary */}
          <div className="space-y-6">
            {/* Donation Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Donation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">
                    {currentAmount > 0 ? format(currentAmount) : format(0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-semibold capitalize">One-time</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment:</span>
                  <span className="font-semibold">PayFast</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-primary">
                      {currentAmount > 0 ? format(currentAmount) : format(0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
    </UserLayout>
  );
}
