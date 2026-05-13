import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Home } from "lucide-react";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  
  const transactionId = searchParams.get("transaction_id");
  const basketId = searchParams.get("basket_id");
  const donationId = searchParams.get("donation_id");

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription className="mt-2">
              Thank you for your donation. Your payment has been processed successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {transactionId && (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                <p className="text-lg font-semibold">{transactionId}</p>
              </div>
            )}
            
            {basketId && (
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium text-muted-foreground">Basket ID</p>
                <p className="text-lg font-semibold">{basketId}</p>
              </div>
            )}

            <div className="space-y-2 pt-4">
              <p className="text-sm text-muted-foreground text-center">
                A confirmation email has been sent to your email address.
              </p>
              <p className="text-sm text-muted-foreground text-center">
                You can view your donation history in your dashboard.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-4">
              {donationId && (
                <Button
                  onClick={() => setLocation("/user/my-donations")}
                  className="w-full"
                >
                  View My Donations
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
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

