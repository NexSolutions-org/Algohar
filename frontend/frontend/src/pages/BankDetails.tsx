import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Check, Building, Info, Globe, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getQueryFn } from "@/lib/queryClient";
import SEO from "@/components/SEO";
import { generateBreadcrumbSchema } from "@/utils/structuredData";

// Bank logos
import hblLogo from "@assets/HBL-logo-vector-01_940x_1757437881297.webp";
import dibLogo from "@assets/dubai-islamic-bank-logo_370x_1757437995094.png";

const bankAccounts = [
  {
    id: "hbl",
    bankName: "Habib Bank Limited (HBL)",
    accountTitle: "Al Gohar Educational & Welfare Society",
    accountNumber: "2305-79012656-03",
    iban: "PK51HABB0023057901265603",
    swift: "HABBPKKA007",
    branchCode: "2305",
    branchName: "Beach comsats raiwind road Lahore",
    currency: "PKR"
  },
  {
    id: "dib",
    bankName: "Dubai Islamic Bank (DIB)",
    accountTitle: "Al Gohar Educational & Welfare Society",
    accountNumber: "0038744002",
    iban: "PK33DUIB0000000038744002",
    swift: "DUIBPKKA",
    branchCode: "001",
    branchName: "Peco road branch Lahore",
    currency: "PKR"
  }
];

interface CopyButtonProps {
  text: string;
  label: string;
  analyticsData?: any;
}

function CopyButton({ text, label, analyticsData }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });

      // Track analytics event
      if (analyticsData) {
        fetch("/api/analytics/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            event: "bank_details_copy", 
            data: analyticsData
          }),
        }).catch(console.error);
      }
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please select and copy the text manually",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="ml-2 h-8 w-8 p-0"
      data-testid={`button-copy-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </Button>
  );
}

export default function BankDetails() {
  // Fetch contact details from API
  const { data: contactResponse } = useQuery<{ success: boolean; data: any }>({
    queryKey: ["/api/contact-details"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const contactDetails = contactResponse?.data || {};
  
  // Get contact information with fallbacks
  const whatsapp = contactDetails.whatsapp || contactDetails.phone1 || "+92 321 2546427";
  const phone = contactDetails.phone2 || contactDetails.phones?.[1] || "+92 42 35233555";
  const email = contactDetails.donationsEmail || contactDetails.contactEmail || contactDetails.email1 || contactDetails.emails?.[0] || "info@algohar.org";

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Bank Details", url: "/bank-details" },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        pageKey="bank-details"
        structuredData={[breadcrumbSchema]}
      />
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6" data-testid="page-title">
            Bank Accounts
          </h1>
          <p className="text-xl opacity-90 leading-relaxed max-w-3xl mx-auto" data-testid="page-description">
            You can donate via bank transfer to the accounts below. Please email or WhatsApp your 
            transaction slip so we can issue a receipt and acknowledge your generous contribution.
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-4xl px-4 py-16">
        {/* Instructions */}
        <section className="mb-12">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Important Instructions</h3>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    <li>• Send your transaction slip via WhatsApp: <strong>{whatsapp}</strong></li>
                    <li>• Or email the receipt to: <strong>{email}</strong></li>
                    <li>• Include your full name and contact information</li>
                    <li>• We'll issue an official receipt within 24 hours</li>
                    <li>• International donors: please use IBAN and SWIFT codes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Bank Accounts */}
        <section className="space-y-8">
          {bankAccounts.map((account) => (
            <Card key={account.id} className="shadow-lg" data-testid={`bank-card-${account.id}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {account.id === "hbl" ? (
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 border">
                      <img 
                        src={hblLogo} 
                        alt="HBL Logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : account.id === "dib" ? (
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 border">
                      <img 
                        src={dibLogo} 
                        alt="Dubai Islamic Bank Logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl" data-testid={`bank-name-${account.id}`}>
                      {account.bankName}
                    </h2>
                    <p className="text-sm text-muted-foreground" data-testid={`branch-name-${account.id}`}>
                      {account.branchName}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Account Title */}
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Account Title</label>
                  <div className="flex items-center justify-between bg-muted p-3 rounded-lg mt-1">
                    <span className="font-mono" data-testid={`account-title-${account.id}`}>
                      {account.accountTitle}
                    </span>
                    <CopyButton 
                      text={account.accountTitle} 
                      label="Account Title"
                      analyticsData={{ 
                        field: "account_title", 
                        bank_name: account.bankName.split(" ")[0] 
                      }}
                    />
                  </div>
                </div>

                {/* Account Number */}
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Account Number</label>
                  <div className="flex items-center justify-between bg-muted p-3 rounded-lg mt-1">
                    <span className="font-mono text-lg" data-testid={`account-number-${account.id}`}>
                      {account.accountNumber}
                    </span>
                    <CopyButton 
                      text={account.accountNumber} 
                      label="Account Number"
                      analyticsData={{ 
                        field: "account_number", 
                        bank_name: account.bankName.split(" ")[0] 
                      }}
                    />
                  </div>
                </div>

                {/* IBAN */}
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">IBAN</label>
                  <div className="flex items-center justify-between bg-muted p-3 rounded-lg mt-1">
                    <span className="font-mono text-lg" data-testid={`iban-${account.id}`}>
                      {account.iban}
                    </span>
                    <CopyButton 
                      text={account.iban} 
                      label="IBAN"
                      analyticsData={{ 
                        field: "iban", 
                        bank_name: account.bankName.split(" ")[0] 
                      }}
                    />
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">SWIFT Code</label>
                    <div className="flex items-center justify-between bg-muted p-3 rounded-lg mt-1">
                      <span className="font-mono" data-testid={`swift-${account.id}`}>
                        {account.swift}
                      </span>
                      <CopyButton 
                        text={account.swift} 
                        label="SWIFT Code"
                        analyticsData={{ 
                          field: "swift", 
                          bank_name: account.bankName.split(" ")[0] 
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Branch Code</label>
                    <div className="bg-muted p-3 rounded-lg mt-1">
                      <span className="font-mono" data-testid={`branch-code-${account.id}`}>
                        {account.branchCode}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* International Donors Note */}
        <section className="mt-12">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">For International Donors</h3>
                  <p className="text-green-800 text-sm">
                    Please use the IBAN and SWIFT codes for international wire transfers. 
                    Bank fees may apply depending on your bank's international transfer policies. 
                    Contact us if you need assistance with currency conversion or transfer procedures.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact Information */}
        <section className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you have any questions about bank transfers or need assistance, feel free to contact us:
              </p>
              <div className="space-y-3">
                {whatsapp && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>WhatsApp: {whatsapp}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>Phone: {phone}</span>
                  </div>
                )}
                {email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-primary" />
                    <span>Email: {email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
