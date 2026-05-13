import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowRight, Home, RefreshCw } from "lucide-react";

export default function PaymentFailure() {
  const [, setLocation] = useLocation();
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  
  const message = searchParams.get("message") || "Payment was cancelled or failed.";

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Payment Failed</CardTitle>
            <CardDescription className="mt-2">
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground text-center">
                Your payment could not be processed. Please try again or contact support if the issue persists.
              </p>
            </div>

            <div className="space-y-2 pt-4">
              <p className="text-sm text-muted-foreground text-center">
                If you continue to experience issues, please contact our support team.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <Button
                onClick={() => setLocation("/user/payments")}
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}

