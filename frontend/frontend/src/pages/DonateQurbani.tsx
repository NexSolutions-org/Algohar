import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Shield, Award, CheckCircle, Users, MapPin, CreditCard,
  Plus, Minus, ChevronDown, ChevronUp, Copy, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, API_BASE_URL } from "@/lib/queryClient";
import SEO from "@/components/SEO";

// ── Types ──────────────────────────────────────────────────────────────────────
type PackageType = "goat" | "cow-share" | "full-cow";

const packages: Record<PackageType, { label: string; price: number; desc: string; animals?: string }> = {
  goat:       { label: "Goat / Sheep",   price: 60000,  desc: "Fulfills obligation for 1 person",         animals: "1 Goat / Sheep" },
  "cow-share":{ label: "Cow Share",      price: 32000,  desc: "1 share from a healthy bull/cow",          animals: "1/7 Share of a Cow" },
  "full-cow": { label: "Full Cow / Bull",price: 224000, desc: "Premium, large-breed animal",              animals: "1 Full Cow / Bull" },
};

const formSchema = z.object({
  donorName:  z.string().min(1, "Full name is required"),
  donorEmail: z.string().email("Invalid email address"),
  donorPhone: z.string().min(1, "Phone number is required"),
  onBehalf:   z.string().optional(),
  quantity:   z.number().min(1),
  packageType:z.enum(["goat", "cow-share", "full-cow"]),
  customAmount: z.coerce.number().optional(),
});
type QurbaniForm = z.infer<typeof formSchema>;

// ── Countdown ─────────────────────────────────────────────────────────────────
function useCountdown(target: Date) {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  });
  return time;
}

// ── FAQ data ───────────────────────────────────────────────────────────────────
const faqs = [
  { q: "What is Qurbani and who is it obligatory for?", a: "Qurbani is the act of sacrificing a livestock animal during Eid ul-Adha to commemorate the sacrifice of Prophet Ibrahim (AS). It is obligatory (Wajib) for every adult Muslim who possesses wealth above the nisab threshold." },
  { q: "Are your Qurbanis 100% Shariah-compliant?", a: "Yes. All sacrifices are performed strictly according to Islamic rulings — animals meet the required age and health criteria, Bismillah and Takbeer are recited, and every sacrifice is supervised by qualified Islamic scholars." },
  { q: "When will my Qurbani be performed?", a: "Qurbanis are performed on Eid ul-Adha (10th Dhul Hijjah) and the following two days (11th-12th Dhul Hijjah). You will receive a confirmation once your Qurbani has been completed." },
  { q: "Will I receive proof of my Qurbani?", a: "Yes. After your Qurbani is performed, we send detailed distribution reports with photos so you can see exactly where your donation reached." },
  { q: "How is the meat distributed?", a: "Meat is distributed to deserving families — orphans, widows, daily-wage earners, and underprivileged communities across Pakistan. We ensure every family receives a fair share." },
];

// ── BankField ──────────────────────────────────────────────────────────────────
function BankField({ label, value, mono }: { label: string; value: string; mono: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2 gap-2">
        <span className={`text-sm ${mono ? "font-mono" : ""}`}>{value}</span>
        <button onClick={copy} className="shrink-0 text-muted-foreground hover:text-primary transition-colors">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DonateQurbani() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const eidDate = new Date("2026-06-27T00:00:00");
  const countdown = useCountdown(eidDate);

  const [selectedPkg, setSelectedPkg] = useState<PackageType>("cow-share");
  const [quantity, setQuantity] = useState(1);
  const [customAmount, setCustomAmount] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const basePrice = packages[selectedPkg].price;
  const totalAmount = customAmount ? parseFloat(customAmount) || 0 : basePrice * quantity;

  const form = useForm<QurbaniForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      donorName: "", donorEmail: "", donorPhone: "", onBehalf: "",
      quantity: 1, packageType: "cow-share",
    },
  });

  useEffect(() => {
    form.setValue("packageType", selectedPkg);
    form.setValue("quantity", quantity);
  }, [selectedPkg, quantity]);

  const mutation = useMutation({
    mutationFn: async (data: QurbaniForm) => {
      const apiData = {
        donor_name: data.donorName,
        donor_email: data.donorEmail,
        donor_phone: data.donorPhone,
        amount: totalAmount,
        type: "one-time",
        payment_method: "payfast",
        donation_type: "qurbani",
        meta: { package: data.packageType, quantity: data.quantity, on_behalf: data.onBehalf },
      };
      const response = await apiRequest("POST", "/api/donations", apiData);
      return response.json();
    },
    onSuccess: (response) => {
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/donations"] });

      if (response.payfast?.error) {
        toast({ title: "Payment Error", description: response.payfast.error, variant: "destructive" });
        return;
      }
      if (response.payfast?.payment_form_html) {
        toast({ title: "Redirecting to PayFast...", description: "Please wait..." });
        const container = document.createElement("div");
        container.style.display = "none";
        container.innerHTML = response.payfast.payment_form_html;
        document.body.appendChild(container);
        const f = document.getElementById("PayFastForm") as HTMLFormElement;
        if (f) { f.submit(); } else { setTimeout(() => { const f2 = document.getElementById("PayFastForm") as HTMLFormElement; f2?.submit(); }, 500); }
      } else {
        toast({ title: "Qurbani registered!", description: "JazakAllah Khair. You will receive a confirmation email." });
        form.reset(); setQuantity(1); setCustomAmount("");
        setTimeout(() => setLocation("/user/dashboard"), 1500);
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Please try again or contact us.", variant: "destructive" });
    },
  });

  const onSubmit = (data: QurbaniForm) => mutation.mutate(data);

  return (
    <div className="min-h-screen bg-background">
      <SEO pageKey="donate" />

      {/* ── Hero ── */}
      <section className="bg-primary text-primary-foreground py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-10 items-start">

            {/* Left */}
            <div className="flex-1">
              <span className="inline-block bg-white/20 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                Qurbani 2026 — Now Accepting Donations
              </span>
              <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                Donate <span className="text-yellow-300">Qurbani</span><br />
                2026<br />
                Online in Pakistan
              </h1>
              <p className="text-base opacity-90 mb-6 max-w-md">
                Honor the Sunnah of Ibrahim ﷺ and share the joy of Eid ul-Adha with thousands of deserving families across Pakistan. 100% Shariah-compliant.
              </p>
              <div className="flex flex-wrap gap-3 mb-8 text-sm">
                <span className="flex items-center gap-1 bg-white/15 rounded-full px-3 py-1"><CheckCircle className="w-4 h-4" /> Shariah-Compliant</span>
                <span className="flex items-center gap-1 bg-white/15 rounded-full px-3 py-1"><CheckCircle className="w-4 h-4" /> 100% Transparent</span>
                <span className="flex items-center gap-1 bg-white/15 rounded-full px-3 py-1"><CheckCircle className="w-4 h-4" /> Trusted Since 2005</span>
              </div>
              <div className="flex gap-3">
                <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-bold px-6">
                  Donate Qurbani Now
                </Button>
                <Button variant="outline" className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-primary px-6 font-bold">
                  View Packages
                </Button>
              </div>
            </div>

            {/* Right — Image + Countdown + Stats */}
            <div className="w-full lg:w-80 space-y-4">
              {/* Qurbani Image */}
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img
                  src="/qurbani.jpeg"
                  alt="Qurbani 2026 - Al Gohar Foundation"
                  className="w-full h-80 object-cover"
                />
              </div>
              {/* Countdown */}
              <div className="bg-white/10 rounded-2xl p-5 text-center">
                <p className="text-xs opacity-75 mb-3 uppercase tracking-wider">Eid ul-Adha 2026 begins in</p>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[
                    { val: countdown.days,    label: "Days" },
                    { val: countdown.hours,   label: "Hours" },
                    { val: countdown.minutes, label: "Mins" },
                    { val: countdown.seconds, label: "Secs" },
                  ].map(({ val, label }) => (
                    <div key={label} className="bg-white/20 rounded-xl p-2">
                      <div className="text-2xl font-extrabold">{String(val).padStart(2, "0")}</div>
                      <div className="text-[10px] opacity-75">{label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-xs opacity-60">Estimated: 27 June 2026</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Impact ── */}
      <section className="py-14 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl text-center">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Our 2025 Impact</p>
          <h2 className="text-3xl font-bold mb-10">Every Sacrifice Counts</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "🐄", val: "6,898",   label: "Cows & Bulls Sacrificed" },
              { icon: "🐐", val: "3,593",   label: "Goats & Sheep Sacrificed" },
              { icon: "🥩", val: "280,846", label: "Meat Packs Distributed" },
              { icon: "👨‍👩‍👧‍👦", val: "1.4M+",  label: "Total Beneficiaries" },
            ].map(({ icon, val, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-2xl">{icon}</div>
                <div className="text-2xl font-extrabold text-primary">{val}</div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Packages ── */}
      <section className="py-14 px-4" id="packages">
        <div className="container mx-auto max-w-5xl text-center">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Choose Your Qurbani</p>
          <h2 className="text-3xl font-bold mb-3">Qurbani 2026 Packages</h2>
          <p className="text-muted-foreground mb-10">Select the package that best fulfils your Sunnah obligation. All packages are 100% Shariah-compliant and supervised by certified Islamic scholars.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.entries(packages) as [PackageType, typeof packages[PackageType]][]).map(([key, pkg]) => (
              <div
                key={key}
                onClick={() => setSelectedPkg(key)}
                className={`relative rounded-2xl border-2 p-6 cursor-pointer text-left transition-all ${
                  selectedPkg === key
                    ? "border-primary bg-primary text-primary-foreground shadow-xl scale-105"
                    : "border-border hover:border-primary/50 bg-card"
                }`}
              >
                {key === "cow-share" && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                    Most Chosen
                  </span>
                )}
                <div className="text-3xl mb-3">{key === "goat" ? "🐐" : key === "cow-share" ? "🐄" : "🐂"}</div>
                <h3 className="text-xl font-bold mb-1">{pkg.label}</h3>
                <p className={`text-xs mb-3 ${selectedPkg === key ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{pkg.animals}</p>
                <div className="text-2xl font-extrabold mb-4">
                  PKR {pkg.price.toLocaleString()}
                  <span className={`text-sm font-normal ml-1 ${selectedPkg === key ? "text-primary-foreground/70" : "text-muted-foreground"}`}>/ animal</span>
                </div>
                <ul className="space-y-1.5 mb-5">
                  {[
                    "Fulfils obligation for 1 person",
                    pkg.desc,
                    "Professional butchers on-site",
                    "Certified halal supervision",
                    "Distribution report sent to you",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${selectedPkg === key ? "text-yellow-300" : "text-primary"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full font-semibold ${
                    selectedPkg === key
                      ? "bg-white text-primary hover:bg-white/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                  onClick={(e) => { e.stopPropagation(); setSelectedPkg(key); }}
                >
                  Donate {pkg.label}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Campaign Progress ── */}
      <section className="py-8 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-bold text-lg">Qurbani 2026 Campaign Progress</h3>
                <p className="text-sm text-muted-foreground">Help us reach our target of 5,000 animals this year</p>
              </div>
              <span className="text-2xl font-extrabold text-primary">1,247 / 5,000 animals</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "24.94%" }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>0 Animals</span>
              <span className="text-primary font-semibold">25% Donated</span>
              <span>5,000 Target</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Trust Us + Donation Form ── */}
      <section className="py-14 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-12">

            {/* Left — Trust Points */}
            <div className="flex-1">
              <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2">Why Al Gohar Foundation</p>
              <h2 className="text-3xl font-bold mb-3">Your Qurbani, In Safe Hands</h2>
              <p className="text-muted-foreground mb-8">We combine Islamic values with professional execution to ensure your Qurbani reaches those who need it most.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  { icon: "🕌", title: "Shariah Supervised",    desc: "Every sacrifice is performed under the direct supervision of certified Islamic scholars ensuring complete compliance." },
                  { icon: "📋", title: "Full Transparency",     desc: "Receive detailed post-Qurbani reports with photos and distribution records so you know exactly where your donation went." },
                  { icon: "🐄", title: "Healthy Animals",       desc: "Animals are carefully selected, veterinary-checked, and meet all Islamic criteria for a valid Qurbani." },
                  { icon: "🔪", title: "Trained Butchers",      desc: "Professional, trained butchers ensure hygienic processing and handling in line with food-safety standards." },
                  { icon: "📍", title: "Nationwide Reach",      desc: "Distribution across 20+ cities, reaching flood victims, orphans, widows, and underprivileged families in remote areas." },
                  { icon: "🔒", title: "Secure Donations",      desc: "Bank-grade security for online payments. Accept via JazzCash, EasyPaisa, Visa, Mastercard & bank transfer." },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="flex gap-3 items-start">
                    <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-xl shrink-0">{icon}</div>
                    <div>
                      <h4 className="font-semibold mb-1">{title}</h4>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bank Transfer Details */}
              <div className="mt-10">
                <h3 className="text-lg font-bold mb-4">Or Pay via Bank Transfer</h3>
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                  {/* Bank Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-border">
                    <div className="w-14 h-14 rounded-xl bg-[#00a651]/10 flex items-center justify-center text-sm font-extrabold text-[#00a651] border border-[#00a651]/30">HBL</div>
                    <div>
                      <p className="font-bold text-base">Habib Bank Limited (HBL)</p>
                      <p className="text-sm text-muted-foreground">Branch: Comsats Raiwind Road, Lahore</p>
                    </div>
                  </div>

                  {/* Account fields */}
                  {[
                    { label: "Account Title",  value: "Al Gohar Educational & Welfare Society", mono: false },
                    { label: "Account Number", value: "2305-79012656-03",                        mono: true  },
                    { label: "IBAN",           value: "PK51HABB0023057901265603",                mono: true  },
                  ].map(({ label, value, mono }) => (
                    <BankField key={label} label={label} value={value} mono={mono} />
                  ))}

                  {/* SWIFT + Branch side by side */}
                  <div className="grid grid-cols-2 gap-3">
                    <BankField label="SWIFT Code"   value="HABBPKKA007" mono={true} />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Branch Code</p>
                      <div className="bg-muted rounded-lg px-3 py-2 text-sm font-mono">2305</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Donation Form */}
            <div className="w-full lg:w-[420px] shrink-0">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-lg sticky top-6">
                <h3 className="text-xl font-bold mb-5">Donate Your Qurbani Online Today</h3>

                {/* Package Tabs */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {(Object.entries(packages) as [PackageType, typeof packages[PackageType]][]).map(([key, pkg]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => { setSelectedPkg(key); setCustomAmount(""); }}
                      className={`rounded-xl border-2 p-2 text-center text-xs font-semibold transition-all ${
                        selectedPkg === key
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div>{key === "goat" ? "🐐" : key === "cow-share" ? "🐄" : "🐂"}</div>
                      <div className="mt-1 leading-tight">{pkg.label}</div>
                      <div className="text-[10px] font-bold mt-0.5">PKR {(pkg.price / 1000).toFixed(0)}K</div>
                    </button>
                  ))}
                </div>

                {/* Quantity */}
                <div className="mb-4">
                  <label className="text-sm font-semibold mb-2 block">Quantity (number of animals)</label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-lg border-2 border-border flex items-center justify-center hover:border-primary">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-bold text-lg">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(q => q + 1)} className="w-9 h-9 rounded-lg border-2 border-border flex items-center justify-center hover:border-primary">
                      <Plus className="w-4 h-4" />
                    </button>
                    <span className="ml-2 text-sm text-muted-foreground">× PKR {basePrice.toLocaleString()}</span>
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                    {/* Custom Amount */}
                    <div>
                      <label className="text-sm font-semibold mb-1 block">Custom Amount (optional)</label>
                      <Input
                        type="number"
                        placeholder="PKR — Minimum PKR 10,000"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="border-border"
                      />
                    </div>

                    <FormField control={form.control} name="donorName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input {...field} placeholder="Your full name" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="donorPhone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl><Input {...field} type="tel" placeholder="0300-XXXXXXX" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="donorEmail" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl><Input {...field} type="email" placeholder="your@email.com" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="onBehalf" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Donate on behalf of (optional)</FormLabel>
                        <FormControl><Input {...field} placeholder="Deceased's name or 'Myself'" value={field.value ?? ""} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Total */}
                    <div className="flex justify-between items-center py-3 border-t border-border">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="text-xl font-extrabold text-primary">PKR {totalAmount.toLocaleString()}</span>
                    </div>

                    <Button
                      type="submit"
                      disabled={mutation.isPending}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 text-base rounded-xl"
                    >
                      {mutation.isPending ? "Processing..." : "🐄 Donate Now — Secure Payment"}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">Powered by SSL & bank-grade encryption</p>
                  </form>
                </Form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-14 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-5xl text-center">
          <p className="text-yellow-300 text-sm font-semibold uppercase tracking-widest mb-2">Simple Process</p>
          <h2 className="text-3xl font-bold mb-3">How It Works</h2>
          <p className="opacity-80 mb-12">Perform your Qurbani in 3 easy steps — fully online, fully trusted.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Select Package",  desc: "Choose your preferred Qurbani package — Goat, Cow Share, or Full Cow." },
              { num: "02", title: "Make Payment",    desc: "Donate securely via JazzCash, EasyPaisa, Card, or Bank Transfer at your convenience." },
              { num: "03", title: "We Handle Rest",  desc: "Your Qurbani is performed on Eid days & meat distributed. You receive full confirmation." },
            ].map(({ num, title, desc }) => (
              <div key={num} className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16 rounded-full border-2 border-yellow-300 flex items-center justify-center">
                  <span className="text-xl font-extrabold">{num}</span>
                  <CheckCircle className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 bg-primary rounded-full" />
                </div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="opacity-80 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Shariah Compliance ── */}
      <section className="py-14 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🕌</div>
          <h2 className="text-2xl font-bold mb-3">100% Shariah-Compliant Qurbani</h2>
          <p className="text-muted-foreground mb-8">All Qurbanis are performed strictly according to Islamic rulings under the supervision of qualified Islamic scholars.</p>
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            {["Scholar Supervision", "Correct Animal Age & Health", "Eid Days Timing (10-12 Dhul Hijjah)", "Bismillah & Takbeer Recited"].map((item) => (
              <span key={item} className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4" /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-14 px-4">
        <div className="container mx-auto max-w-3xl">
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-2 text-center">Got Questions?</p>
          <h2 className="text-3xl font-bold mb-10 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold hover:bg-muted/40 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-5 h-5 text-primary shrink-0" /> : <ChevronDown className="w-5 h-5 shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
