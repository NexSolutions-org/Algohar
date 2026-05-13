import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { LogIn, Mail, AlertCircle, ArrowLeft, Clock, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { extractErrorMessage } from "@/lib/errorUtils";

const sendOtpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const verifyOtpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type SendOtpForm = z.infer<typeof sendOtpSchema>;
type VerifyOtpForm = z.infer<typeof verifyOtpSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Restore state from sessionStorage if available
  const [step, setStep] = useState<"send" | "verify">(() => {
    const savedStep = sessionStorage.getItem("loginStep");
    const savedEmail = sessionStorage.getItem("loginEmail");
    return (savedStep === "verify" && savedEmail) ? "verify" : "send";
  });
  
  const [emailOrPhone, setEmailOrPhone] = useState<string>(() => {
    return sessionStorage.getItem("loginEmail") || "";
  });
  
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Fetch contact details from API - non-blocking, won't interfere with OTP flow
  const { data: contactResponse } = useQuery<{ success: boolean; data: any }>({
    queryKey: ["/api/contact-details"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const contactDetails = contactResponse?.data || {};
  
  // Get contact information with fallbacks
  const supportEmail = contactDetails.contactEmail || contactDetails.email1 || contactDetails.emails?.[0] || "support@algohar.org";
  const supportPhone = contactDetails.phone1 || contactDetails.phones?.[0] || contactDetails.whatsapp || "+92 321 2546427";
  
  // Save email to sessionStorage when it changes
  useEffect(() => {
    if (emailOrPhone) {
      sessionStorage.setItem("loginEmail", emailOrPhone);
    }
  }, [emailOrPhone]);
  
  // Save step to sessionStorage when it changes
  useEffect(() => {
    if (step) {
      sessionStorage.setItem("loginStep", step);
    }
  }, [step]);
  
  // Clear sessionStorage on successful login
  const clearLoginState = () => {
    sessionStorage.removeItem("loginEmail");
    sessionStorage.removeItem("loginStep");
  };

  const sendOtpForm = useForm<SendOtpForm>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: {
      email: emailOrPhone || "",
    },
  });

  const verifyOtpForm = useForm<VerifyOtpForm>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const sendOtpMutation = useMutation({
    mutationFn: async (data: SendOtpForm) => {
      const response = await apiRequest("POST", "/api/auth/send-otp", data);
      return response.json();
    },
    onSuccess: (result) => {
      const email = sendOtpForm.getValues("email");
      setEmailOrPhone(email);
      setStep("verify");
      setResendTimer(60); // 60 seconds countdown
      setError(null); // Clear any previous errors
      toast({
        title: "OTP sent!",
        description: `We've sent a 6-digit code to ${email}`,
      });
    },
    onError: (error: any) => {
      const errorMessage = extractErrorMessage(error);
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: VerifyOtpForm & { email: string }) => {
      const response = await apiRequest("POST", "/api/auth/verify-otp", data);
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        // Clear login state from sessionStorage
        clearLoginState();
        
        // Optionally persist user profile (no tokens stored in browser)
        if (result.user) {
          localStorage.setItem("user", JSON.stringify(result.user));
        }

        toast({
          title: "Welcome back!",
          description: result.user?.role === "admin" 
            ? "You have successfully logged in as Admin." 
            : "You have successfully logged in.",
        });

        // Redirect based on role or intended page
        const redirectParam = new URLSearchParams(window.location.search).get("redirect");
        let redirectTo = "/";
        
        if (redirectParam) {
          // Use redirect parameter if provided
          redirectTo = redirectParam;
        } else if (result.user?.role === "admin") {
          // Admin users go to admin dashboard
          redirectTo = "/admin/dashboard";
        } else {
          // Regular users go to user dashboard
          redirectTo = "/user/dashboard";
        }
        
        // Full reload to ensure session cookies are active across the app
        // Small delay ensures localStorage write is complete (for user info only)
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 100);
      } else {
        throw new Error(result.message || "Login failed");
      }
    },
    onError: (error: any) => {
      const errorMessage = extractErrorMessage(error);
      setError(errorMessage);
      verifyOtpForm.resetField("otp");
      toast({
        title: "Verification failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSendOtp = (data: SendOtpForm) => {
    setError(null);
    sendOtpMutation.mutate(data);
  };

  const onVerifyOtp = (data: VerifyOtpForm) => {
    setError(null);
    verifyOtpMutation.mutate({ ...data, email: emailOrPhone });
  };

  const handleResendOtp = () => {
    if (resendTimer === 0 && emailOrPhone) {
      sendOtpMutation.mutate({ email: emailOrPhone });
    }
  };

  const handleBackToEmail = () => {
    setStep("send");
    setError(null);
    verifyOtpForm.reset();
    sessionStorage.removeItem("loginStep");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <LogIn className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="page-title">
            Welcome Back
          </h1>
          <p className="text-muted-foreground" data-testid="page-description">
            Sign in with a secure OTP code
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              {step === "send" 
                ? "Enter your email address to receive a verification code"
                : "Enter the 6-digit code sent to your email"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6" data-testid="alert-error">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === "send" ? (
              <Form {...sendOtpForm}>
                <form onSubmit={sendOtpForm.handleSubmit(onSendOtp)} className="space-y-6">
                  <FormField
                    control={sendOtpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="your@email.com"
                              className="pl-10"
                              data-testid="input-email"
                              disabled={sendOtpMutation.isPending}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={sendOtpMutation.isPending}
                    className="w-full btn-primary py-3 text-lg font-semibold"
                    data-testid="button-send-otp"
                  >
                    {sendOtpMutation.isPending ? "Sending..." : "Send OTP"}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...verifyOtpForm}>
                <form onSubmit={verifyOtpForm.handleSubmit(onVerifyOtp)} className="space-y-6">
                  <div className="mb-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToEmail}
                      className="mb-4 -ml-2"
                      data-testid="button-back"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Change email
                    </Button>
                    <p className="text-sm text-muted-foreground mb-4">
                      We sent a 6-digit code to your email <strong>{emailOrPhone}</strong>
                    </p>
                  </div>

                  <FormField
                    control={verifyOtpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enter OTP Code</FormLabel>
                        <FormControl>
                          <InputOTP
                            maxLength={6}
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value);
                              // Auto-submit when all 6 digits are entered
                              if (value.length === 6 && !verifyOtpMutation.isPending && emailOrPhone) {
                                setTimeout(() => {
                                  verifyOtpForm.handleSubmit((data) => {
                                    onVerifyOtp({ ...data, email: emailOrPhone });
                                  })();
                                }, 150);
                              }
                            }}
                            data-testid="input-otp"
                            disabled={verifyOtpMutation.isPending}
                          >
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    {resendTimer > 0 ? (
                      <>
                        <Clock className="w-4 h-4" />
                        <span>Resend OTP in {resendTimer}s</span>
                      </>
                    ) : (
                      <>
                        <span>Didn't receive the code?</span>
                        <Button
                          type="button"
                          variant="link"
                          onClick={handleResendOtp}
                          disabled={resendTimer > 0}
                          className="h-auto p-0 text-primary"
                          data-testid="button-resend-otp"
                        >
                          Resend OTP
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={verifyOtpMutation.isPending}
                    className="w-full btn-primary py-3 text-lg font-semibold"
                    data-testid="button-verify-otp"
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    {verifyOtpMutation.isPending ? "Verifying..." : "Verify & Sign In"}
                  </Button>
                </form>
              </Form>
            )}

            {step === "send" && (
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  <Link
                    href="/donate"
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                    data-testid="link-donate"
                  >
                    Donate now to have an account
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="mt-6 bg-muted">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-3 text-sm">Need Help?</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              {supportEmail && (
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <strong>Email Support:</strong>{" "}
                  <a
                    href={`mailto:${supportEmail}`}
                    className="text-primary hover:underline"
                  >
                    {supportEmail}
                  </a>
                </p>
              )}
              {supportPhone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <strong>Phone:</strong>{" "}
                  <a
                    href={`tel:${supportPhone.replace(/\s+/g, '-')}`}
                    className="text-primary hover:underline"
                  >
                    {supportPhone}
                  </a>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

