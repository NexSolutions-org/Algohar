import { useState, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Heart, Shield, Award, Handshake, CreditCard, Building, Smartphone } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, API_BASE_URL } from "@/lib/queryClient";
import { DonationModalContext } from "@/App";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { useCurrency } from "@/contexts/CurrencyContext";

const donationFormSchema = z.object({
  donorName: z.string().min(1, "Name is required"),
  donorEmail: z.string().email("Invalid email address"),
  donorPhone: z.string().optional(),
  amount: z.coerce.number().min(500, "Minimum donation amount is 500 PKR"),
  type: z.enum(["one-time"]),
  paymentMethod: z.enum(["payfast"]),
});

type DonationForm = z.infer<typeof donationFormSchema>;

const amountPresets = [1000, 3000, 6000];

const getImpactText = (amountInPKR: number, formatCurrency: (amount: number) => string) => {
  if (amountInPKR >= 6000) {
    const families = Math.floor(amountInPKR / 6000);
    return `${formatCurrency(amountInPKR)} supports ${families} family(ies) with monthly rations including rice, flour, oil, and essential groceries.`;
  } else if (amountInPKR >= 3000) {
    const children = Math.floor(amountInPKR / 600);
    return `${formatCurrency(amountInPKR)} provides school supplies and educational materials for ${children} children.`;
  } else {
    const days = Math.floor(amountInPKR / 150);
    return `${formatCurrency(amountInPKR)} helps feed a family for ${days} days with essential food items.`;
  }
};

export default function DonationModal() {
  const { isOpen, closeModal } = useContext(DonationModalContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { format, convert } = useCurrencyConversion();
  const { currency } = useCurrency();
  const [selectedAmount, setSelectedAmount] = useState(6000);
  const [customAmount, setCustomAmount] = useState("");

  const form = useForm<DonationForm>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      donorName: "",
      donorEmail: "",
      donorPhone: "",
      amount: 6000,
      type: "one-time",
      paymentMethod: "payfast",
    },
  });

  const createDonationMutation = useMutation({
    mutationFn: async (data: DonationForm) => {
      // Convert camelCase to snake_case for backend API
      const apiData = {
        donor_name: data.donorName,
        donor_email: data.donorEmail,
        donor_phone: data.donorPhone || null,
        amount: data.amount,
        type: "one-time",
        payment_method: data.paymentMethod,
      };
      const response = await apiRequest("POST", "/api/donations", apiData);
      return response.json();
    },
    onSuccess: (response) => {
      const donation = response.data || response;
      
      // If session was established and user info returned, persist profile
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
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
        // Close modal first
        closeModal();
        
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
        closeModal();
        form.reset();
        
        // Track analytics event
        fetch(`${API_BASE_URL}/api/analytics/event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            event: "donation_submit", 
            data: { 
              amount: donation.amount,
              type: donation.type,
              paymentMethod: donation.payment_method,
              success: true
            } 
          }),
        }).catch(console.error);
      }
    },
    onError: (error) => {
      console.error("Donation error:", error);
      toast({
        title: "Error processing donation",
        description: "Please try again or contact us for assistance.",
        variant: "destructive",
      });

      // Track analytics event
      fetch(`${API_BASE_URL}/api/analytics/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          event: "donation_submit", 
          data: { 
            amount: form.getValues().amount,
            type: form.getValues().type,
            success: false
          } 
        }),
      }).catch(console.error);
    },
  });

  const onSubmit = (data: DonationForm) => {
    createDonationMutation.mutate(data);
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
    form.setValue("amount", amount);
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseInt(value) || 0;
    if (numValue >= 500) {
      setSelectedAmount(0);
      form.setValue("amount", numValue);
    }
  };


  useEffect(() => {
    if (isOpen) {
      // Track analytics event
      fetch(`${API_BASE_URL}/api/analytics/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          event: "donation_modal_open", 
          data: {} 
        }),
      }).catch(console.error);
    }
  }, [isOpen]);

  const currentAmount = customAmount ? parseInt(customAmount) || 0 : selectedAmount;

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-foreground text-left">
            Make a Donation
          </DialogTitle>
          <p className="text-muted-foreground mt-2 text-left">Your contribution helps us transform lives in communities across Pakistan</p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Amount Selection */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground text-left">Donation Amount</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        {amountPresets.map((amount) => (
                          <Button
                            key={amount}
                            type="button"
                            variant={selectedAmount === amount ? "default" : "outline"}
                            onClick={() => handleAmountSelect(amount)}
                            className="p-4 font-semibold"
                            data-testid={`button-amount-${amount}`}
                          >
                            {format(amount)}
                          </Button>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Custom Amount:</span>
                        <Input
                          type="number"
                          placeholder={`Min ${format(500)}`}
                          min="500"
                          value={customAmount}
                          onChange={(e) => handleCustomAmountChange(e.target.value)}
                          className="flex-1"
                          data-testid="input-custom-amount"
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

            {/* Impact Information */}
            <div className="bg-muted p-6 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <Heart className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground text-left">Your Impact</h3>
              </div>
              <p className="text-muted-foreground" data-testid="text-impact">
                {getImpactText(currentAmount, format)}
              </p>
            </div>

            {/* Donor Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="donorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-left">Full Name *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter your full name"
                        data-testid="input-donor-name"
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
                    <FormLabel className="text-left">Email Address *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="email"
                        placeholder="your.email@example.com"
                        data-testid="input-donor-email"
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
                    <FormLabel className="text-left">Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="tel"
                        placeholder="+92-300-1234567"
                        data-testid="input-donor-phone"
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Payment Method */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground text-left">Payment Method</FormLabel>
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
            <div className="flex items-center justify-center space-x-8 py-4 border-t border-border">
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
              className="w-full btn-primary py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl"
              data-testid="button-submit-donation"
            >
              <Heart className="w-5 h-5 mr-2" />
              {createDonationMutation.isPending ? "Processing..." : "Complete Donation"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}