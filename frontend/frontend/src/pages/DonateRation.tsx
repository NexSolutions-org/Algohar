import { useState, useContext } from "react";
import { Heart, ShieldCheck, Award, Handshake, Plus, Minus, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DonationModalContext } from "@/App";
import serveHumanityBanner from "@assets/Screenshot 2025-09-08 150234_1757368985228.png";
import SEO from "@/components/SEO";
import { generateBreadcrumbSchema, generateDonationActionSchema, generateServiceSchema } from "@/utils/structuredData";

const rationImages = [
  "https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3", 
  "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3",
  "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3"
];

const faqs = [
  {
    question: "How do you select families for ration distribution?",
    answer: "We work with local community leaders and conduct household surveys to identify families most in need. Priority is given to widows, elderly, disabled individuals, and families with multiple children."
  },
  {
    question: "What items are included in the ration packages?",
    answer: "Each ration package includes rice, flour, cooking oil, lentils, sugar, tea, spices, and other essential food items sufficient for a family of 5-6 members for one month."
  },
  {
    question: "How can I track my donation's impact?",
    answer: "After your donation, you'll receive regular updates via email with photos and reports showing how your contribution is helping families. You can also check our reports section for detailed impact data."
  },
  {
    question: "Can I donate for multiple families?",
    answer: "Yes! You can select the quantity of ration packages you want to sponsor. Each package costs Rs. 6,000 and supports one family for a month."
  }
];

export default function DonateRation() {
  const [quantity, setQuantity] = useState(1);
  const [donationType, setDonationType] = useState<'one-time' | 'monthly'>('monthly');
  const { openModal } = useContext(DonationModalContext);

  const packageCost = 6000;
  const totalAmount = quantity * packageCost;

  const handleDonateClick = () => {
    openModal();
    
    // Track analytics event
    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        event: "donation_view", 
        data: { 
          item_id: "ration_package",
          amount: totalAmount,
          quantity,
          type: donationType
        } 
      }),
    }).catch(console.error);
  };

  const adjustQuantity = (delta: number) => {
    const newQuantity = Math.max(1, quantity + delta);
    setQuantity(newQuantity);
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Donate Ration", url: "/donate/ration" },
  ]);

  const rationServiceSchema = generateServiceSchema({
    name: "Ration Donation Program",
    description: "Help provide essential food items to families in need. Your ration donation ensures no family goes to sleep hungry.",
  });

  const donationActionSchema = generateDonationActionSchema({
    title: "Donate Ration - Al Gohar Foundation",
    description: "Help provide essential food items to families in need. Your ration donation ensures no family goes to sleep hungry.",
    url: "/donate/ration",
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO
        pageKey="donate-ration"
        structuredData={[breadcrumbSchema, rationServiceSchema, donationActionSchema]}
      />
      {/* Banner */}
      <section className="w-full">
        <img 
          src={serveHumanityBanner}
          alt="SERVE HUMANITY - Donate Now" 
          className="w-full h-auto object-cover"
        />
      </section>

      {/* Header */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6" data-testid="page-title">
            DONATE RATION
          </h1>
          <p className="text-xl opacity-90 leading-relaxed max-w-3xl mx-auto" data-testid="page-summary">
            Donate Ration Monthly is a charitable program that provides monthly rations to needy families, 
            helping to ensure they don't miss essential meals. You can easily give back and make a difference 
            in the lives of those in need.
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Images and Details */}
          <div className="space-y-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground mb-4">Ration Distribution Gallery</h2>
              <div className="grid grid-cols-2 gap-4">
                {rationImages.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`Ration distribution photo ${index + 1}`}
                    className="rounded-lg shadow-md w-full h-48 object-cover hover:shadow-lg transition-shadow"
                    data-testid={`gallery-image-${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Impact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Your Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-lg font-semibold text-foreground" data-testid="impact-message">
                    Rs. 6,000 supports a family with monthly rations including rice, flour, oil, 
                    lentils, sugar, tea, and essential groceries.
                  </p>
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Feeds a family of 5-6 members for one month
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Includes 15+ essential food items
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Delivered directly to families' homes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Detailed impact reports provided
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Donation Form */}
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Make Your Donation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Donation Type */}
                <div>
                  <label className="text-sm font-semibold text-foreground mb-3 block">
                    Donation Frequency
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={donationType === 'one-time' ? 'default' : 'outline'}
                      onClick={() => setDonationType('one-time')}
                      className="font-semibold"
                      data-testid="button-one-time"
                    >
                      One-time
                    </Button>
                    <Button
                      variant={donationType === 'monthly' ? 'default' : 'outline'}
                      onClick={() => setDonationType('monthly')}
                      className="font-semibold"
                      data-testid="button-monthly"
                    >
                      Monthly
                    </Button>
                  </div>
                </div>

                {/* Preset Amounts */}
                <div>
                  <label className="text-sm font-semibold text-foreground mb-3 block">
                    Quick Selection
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setQuantity(Math.ceil(1000 / packageCost))}
                      className="text-center"
                      data-testid="button-amount-1000"
                    >
                      <div>
                        <div className="font-semibold">Rs. 1,000</div>
                        <div className="text-xs text-muted-foreground">Partial</div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setQuantity(Math.ceil(3000 / packageCost))}
                      className="text-center"
                      data-testid="button-amount-3000"
                    >
                      <div>
                        <div className="font-semibold">Rs. 3,000</div>
                        <div className="text-xs text-muted-foreground">Half Package</div>
                      </div>
                    </Button>
                    <Button
                      variant={quantity === 1 ? 'default' : 'outline'}
                      onClick={() => setQuantity(1)}
                      className="text-center"
                      data-testid="button-amount-6000"
                    >
                      <div>
                        <div className="font-semibold">Rs. 6,000</div>
                        <div className="text-xs">Full Package</div>
                      </div>
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Quantity Selection */}
                <div>
                  <label className="text-sm font-semibold text-foreground mb-3 block">
                    Number of Ration Packages
                  </label>
                  <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground">Quantity</div>
                      <div className="text-lg font-semibold" data-testid="text-quantity">{quantity} package(s)</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => adjustQuantity(-1)}
                        disabled={quantity <= 1}
                        data-testid="button-decrease-quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => adjustQuantity(1)}
                        data-testid="button-increase-quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Each package costs Rs. 6,000 and feeds one family for a month
                  </p>
                </div>

                {/* Total Amount */}
                <div className="bg-primary/10 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary" data-testid="text-total-amount">
                      Rs. {totalAmount.toLocaleString()}
                    </span>
                  </div>
                  {donationType === 'monthly' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      This amount will be charged monthly
                    </p>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="flex items-center justify-around py-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span>SSL Secure</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Award className="w-4 h-4 text-blue-500" />
                    <span>Registered Trust</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Handshake className="w-4 h-4 text-primary" />
                    <span>Partner Bank</span>
                  </div>
                </div>

                {/* Donate Button */}
                <Button 
                  onClick={handleDonateClick}
                  className="w-full btn-primary py-4 text-lg font-semibold shadow-lg hover:shadow-xl"
                  data-testid="button-donate-now"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  DONATE NOW
                </Button>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left" data-testid={`faq-question-${index + 1}`}>
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground" data-testid={`faq-answer-${index + 1}`}>
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
