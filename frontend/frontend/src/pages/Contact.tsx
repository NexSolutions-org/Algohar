import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn, API_BASE_URL } from "@/lib/queryClient";
import SEO from "@/components/SEO";
import { generateBreadcrumbSchema } from "@/utils/structuredData";
import {
  geocodeAddress,
  getOpenStreetMapEmbedUrl,
  getOpenStreetMapViewUrl,
  getGoogleMapsSearchUrl,
  Coordinates,
} from "@/lib/geocoding";

const insertContactMessageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  message: z.string().min(1, "Message is required"),
});

type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

export default function Contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const [mapCoordinates, setMapCoordinates] = useState<Coordinates | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Fetch contact details from API
  const { data: contactResponse } = useQuery<{ success: boolean; data: any }>({
    queryKey: ["/api/contact-details"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const contactDetails = contactResponse?.data || {};
  
  // Build contact info from API data
  const address = contactDetails.address || "Plot no 5, Block 3, Sector D-II\nGreen Town, Lahore, Pakistan";
  const addressLines = address.split("\n").filter(line => line.trim());
  
  // Get coordinates from API or geocode address
  useEffect(() => {
    const loadMapCoordinates = async () => {
      // Check if coordinates are provided in API response
      if (contactDetails.latitude && contactDetails.longitude) {
        setMapCoordinates({
          latitude: contactDetails.latitude,
          longitude: contactDetails.longitude,
        });
        return;
      }

      // If no coordinates, geocode the address
      if (address && address.trim() !== '') {
        setIsGeocoding(true);
        try {
          const coords = await geocodeAddress(address);
          if (coords) {
            setMapCoordinates(coords);
          } else {
            // Fallback to default coordinates for Green Town, Lahore
            setMapCoordinates({
              latitude: 31.4904,
              longitude: 74.3118,
            });
          }
        } catch (error) {
          console.error('Failed to geocode address:', error);
          // Fallback to default coordinates
          setMapCoordinates({
            latitude: 31.4904,
            longitude: 74.3118,
          });
        } finally {
          setIsGeocoding(false);
        }
      }
    };

    loadMapCoordinates();
  }, [contactDetails.latitude, contactDetails.longitude, address]);
  const phones = contactDetails.phones || [];
  const emails = contactDetails.emails || [];
  const officeHours = contactDetails.officeHours || [
    "Monday - Friday: 9:00 AM - 5:00 PM",
    "Saturday: 9:00 AM - 1:00 PM",
    "Sunday: Closed"
  ];

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Us",
      details: addressLines.length > 0 ? addressLines : ["Plot no 5, Block 3, Sector D-II", "Green Town, Lahore, Pakistan"],
      color: "text-blue-600"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: phones.length > 0 ? phones : ["+92 321 2546427", "+92 42 35233555", "+92 42 35116263"],
      color: "text-green-600"
    },
    {
      icon: Mail,
      title: "Email Us",
      details: emails.length > 0 ? emails : ["info@algohar.org", "contact@algohar.org"],
      color: "text-purple-600"
    },
    {
      icon: Clock,
      title: "Office Hours",
      details: Array.isArray(officeHours) ? officeHours : officeHours.split("\n").filter((line: string) => line.trim()),
      color: "text-orange-600"
    }
  ];

  const form = useForm<InsertContactMessage>({
    resolver: zodResolver(insertContactMessageSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const submitContactMutation = useMutation({
    mutationFn: async (data: InsertContactMessage) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: (result) => {
      setIsSubmitted(true);
      form.reset();
      toast({
        title: "Message sent successfully!",
        description: result.message,
      });
      
      // Track analytics event
      fetch(`${API_BASE_URL}/api/analytics/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          event: "contact_form_submit", 
          data: { success: true }
        }),
      }).catch(console.error);
    },
    onError: (error) => {
      console.error("Contact form error:", error);
      toast({
        title: "Error sending message",
        description: "Please try again or contact us directly via phone or email.",
        variant: "destructive",
      });

      // Track analytics event
      fetch(`${API_BASE_URL}/api/analytics/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          event: "contact_form_submit", 
          data: { success: false }
        }),
      }).catch(console.error);
    },
  });

  const onSubmit = (data: InsertContactMessage) => {
    submitContactMutation.mutate(data);
  };

  const resetForm = () => {
    setIsSubmitted(false);
    form.reset();
  };

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Contact", url: "/contact" },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        pageKey="contact"
        structuredData={[breadcrumbSchema]}
      />
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6" data-testid="page-title">
            Contact Us
          </h1>
          <p className="text-xl opacity-90 leading-relaxed max-w-3xl mx-auto" data-testid="page-description">
            Have questions about our programs, want to volunteer, or need assistance? 
            We'd love to hear from you. Reach out through any of the channels below.
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Get in Touch</h2>
              <p className="text-muted-foreground leading-relaxed">
                Whether you're interested in our programs, looking to volunteer, or have questions 
                about donations, our team is here to help. We respond to all inquiries within 24 hours.
              </p>
            </div>

            <div className="grid gap-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow" data-testid={`contact-info-${index + 1}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${info.color}`}>
                        <info.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2" data-testid={`contact-title-${index + 1}`}>
                          {info.title}
                        </h3>
                        <div className="space-y-1">
                          {info.details.map((detail, detailIndex) => (
                            <p key={detailIndex} className="text-muted-foreground" data-testid={`contact-detail-${index + 1}-${detailIndex + 1}`}>
                              {detail}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Our Location</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isGeocoding ? (
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2 animate-pulse" />
                      <p className="text-muted-foreground">Loading map...</p>
                    </div>
                  </div>
                ) : mapCoordinates ? (
                  <>
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={getOpenStreetMapEmbedUrl(mapCoordinates.latitude, mapCoordinates.longitude)}
                        title="Al Gohar Foundation Location"
                        className="w-full h-full"
                      />
                    </div>
                    <div className="p-4 border-t space-y-2">
                      <a
                        href={getOpenStreetMapViewUrl(mapCoordinates.latitude, mapCoordinates.longitude)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4" />
                        View larger map on OpenStreetMap
                      </a>
                      <a
                        href={getGoogleMapsSearchUrl(
                          addressLines.length > 0 
                            ? addressLines.join(", ") 
                            : address
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4" />
                        View on Google Maps
                      </a>
                      <p className="text-xs text-muted-foreground mt-2">
                        {addressLines.length > 0 ? addressLines.join(", ") : address}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Map unavailable</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {addressLines.length > 0 ? addressLines.join(", ") : address}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-8" data-testid="success-message">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Thank you for your message!
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      We've received your inquiry and will get back to you within 24 hours.
                    </p>
                    <Button 
                      onClick={resetForm} 
                      variant="outline"
                      data-testid="button-send-another"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Your full name"
                                  data-testid="input-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address *</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="email"
                                  placeholder="your@email.com"
                                  data-testid="input-email"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="tel"
                                placeholder="+92 XXX XXXXXXX"
                                data-testid="input-phone"
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message *</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Tell us how we can help you..."
                                rows={6}
                                data-testid="textarea-message"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        disabled={submitContactMutation.isPending}
                        className="w-full btn-primary py-3 text-lg font-semibold"
                        data-testid="button-submit-message"
                      >
                        <Send className="w-5 h-5 mr-2" />
                        {submitContactMutation.isPending ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="mt-8 bg-muted">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">Other Ways to Connect</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {contactDetails.whatsapp && (
                    <p>📱 <strong>WhatsApp:</strong> {contactDetails.whatsapp} (Quick responses)</p>
                  )}
                  {contactDetails.contactEmail && (
                    <p>📧 <strong>General Inquiries:</strong> {contactDetails.contactEmail}</p>
                  )}
                  {contactDetails.donationsEmail && (
                    <p>💝 <strong>Donations:</strong> {contactDetails.donationsEmail}</p>
                  )}
                  {contactDetails.volunteerEmail && (
                    <p>🤝 <strong>Volunteering:</strong> {contactDetails.volunteerEmail}</p>
                  )}
                  {contactDetails.mediaEmail && (
                    <p>📊 <strong>Media & Press:</strong> {contactDetails.mediaEmail}</p>
                  )}
                  {!contactDetails.whatsapp && !contactDetails.contactEmail && !contactDetails.donationsEmail && !contactDetails.volunteerEmail && !contactDetails.mediaEmail && (
                    <>
                      <p>📱 <strong>WhatsApp:</strong> +92 321 2546427 (Quick responses)</p>
                      <p>📧 <strong>General Inquiries:</strong> info@algohar.org</p>
                      <p>💝 <strong>Donations:</strong> donations@algohar.org</p>
                      <p>🤝 <strong>Volunteering:</strong> volunteer@algohar.org</p>
                      <p>📊 <strong>Media & Press:</strong> media@algohar.org</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
