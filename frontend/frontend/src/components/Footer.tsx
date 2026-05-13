import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Facebook, Instagram, Twitter, Linkedin, MapPin, Phone, Mail, Shield, Award } from "lucide-react";
// Algohar logo
import algoharLogo from "@assets/Screenshot_2025-09-08_142619-removebg-preview_1757368665353_1757968801977.png";
import { getQueryFn } from "@/lib/queryClient";

const navigation = [
  { name: "Donate", href: "/donate/ration" },
  { name: "Services", href: "/services" },
  { name: "Projects", href: "/projects" },
  { name: "Reports", href: "/reports" },
  { name: "Blogs", href: "/blogs" },
  { name: "About", href: "/about" },
];

const supportLinks = [
  { name: "Bank Details", href: "/bank-details" },
  { name: "Contact", href: "/contact" },
  { name: "Privacy Policy", href: "#" },
  { name: "Terms & Conditions", href: "#" },
  { name: "FAQs", href: "#" },
];


export default function Footer() {
  // Fetch contact details from API
  const { data: contactResponse } = useQuery<{ success: boolean; data: any }>({
    queryKey: ["/api/contact-details"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const contactDetails = contactResponse?.data || {};
  
  // Default values for backward compatibility
  const address = contactDetails.address || "Plot no 5, Block 3, Sector D-II\nGreen Town, Lahore, Pakistan";
  const addressLines = address.split("\n").filter(line => line.trim());
  const phones = contactDetails.phones || [];
  const primaryEmail = contactDetails.email1 || contactDetails.emails?.[0] || "info@algohar.org";

  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center">
                <img 
                  src={algoharLogo} 
                  alt="Algohar Educational & Welfare Society Logo" 
                  className="h-12 w-auto"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold leading-tight">ALGOHAR</h3>
                <p className="text-sm text-gray-400 leading-tight">Educational & Welfare Society</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed text-left">
              Empowering communities through education, healthcare, and welfare programs since 1996.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                className="text-gray-400 hover:text-primary transition-colors"
                data-testid="link-facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com" 
                className="text-gray-400 hover:text-primary transition-colors"
                data-testid="link-instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                className="text-gray-400 hover:text-primary transition-colors"
                data-testid="link-twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                className="text-gray-400 hover:text-primary transition-colors"
                data-testid="link-linkedin"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-left">Quick Links</h4>
            <nav className="space-y-3">
              {navigation.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  className="block text-gray-300 hover:text-primary transition-colors text-left"
                  data-testid={`link-footer-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-left">Support</h4>
            <nav className="space-y-3">
              {supportLinks.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  className="block text-gray-300 hover:text-primary transition-colors text-left"
                  data-testid={`link-support-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-left">Contact Info</h4>
            <div className="space-y-3">
              {addressLines.length > 0 && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div className="text-gray-300 text-left">
                    {addressLines.map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </div>
                </div>
              )}
              {phones.length > 0 && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <div className="text-gray-300">
                    {phones.slice(0, 2).map((phone, index) => (
                      <a 
                        key={index}
                        href={`tel:${phone.replace(/\s+/g, '-')}`}
                        className="hover:text-primary transition-colors block"
                        data-testid={`link-phone-${index + 1}`}
                      >
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {primaryEmail && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <a 
                    href={`mailto:${primaryEmail}`}
                    className="text-gray-300 hover:text-primary transition-colors"
                    data-testid="link-email"
                  >
                    {primaryEmail}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Bottom */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm text-left">
              © {new Date().getFullYear()} Algohar Foundation. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-green-500" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Award className="w-4 h-4 text-blue-500" />
                <span>Registered Trust</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}