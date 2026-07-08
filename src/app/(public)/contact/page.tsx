import { Mail, ShieldCheck, FileText, CheckCircle2, ChevronRight } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { FaqSection } from "@/components/marketing/faq-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { createMetadata, SITE } from "@/config/seo";

export const metadata = createMetadata({
  title: "Contact Sourcing Support | gocnscout Help Desk",
  description: "Reach our data engineers for billing queries, data licenses, custom supplier lists, or privacy inquiries.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
      
      <section className="container-page pb-20">
        {/* Header Section */}
        <div className="max-w-4xl py-6 mb-8 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Get in Touch</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 mt-2">
            Contact gocnscout
          </h1>
          <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-600">
            Have questions regarding database access, reports, data licensing, custom shortlists, billing, or data policies? 
            Submit details, and our data protection officers will respond.
          </p>
        </div>

        {/* Two-Column Form & Details */}
        <div className="grid gap-8 lg:grid-cols-[1fr_420px] items-start">
          {/* Left Column info */}
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden hover:border-teal-500/10 transition-colors">
                <CardContent className="p-5">
                  <Mail className="h-6 w-6 text-teal-600 mb-3" />
                  <h3 className="text-sm font-bold text-slate-950">Support Email</h3>
                  <p className="text-xs text-slate-500 mt-1 font-mono">{SITE.supportEmail}</p>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden hover:border-teal-500/10 transition-colors">
                <CardContent className="p-5">
                  <ShieldCheck className="h-6 w-6 text-teal-600 mb-3" />
                  <h3 className="text-sm font-bold text-slate-950">Data Compliance</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Compliance-verified supplier profiles strictly matching business licenses.</p>
                </CardContent>
              </Card>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-xs text-slate-600 space-y-4">
              <h3 className="font-bold text-slate-900">What to Include in Your Sourcing Inquiry:</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-teal-600 mt-0.5 shrink-0" />
                  <div>
                    <strong>For Database Questions</strong>: State your target products, location clusters, or filters you are evaluating.
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-teal-600 mt-0.5 shrink-0" />
                  <div>
                    <strong>For PDF Report Inquiries</strong>: Mention the category report name and whether you need data refresh intervals.
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-teal-600 mt-0.5 shrink-0" />
                  <div>
                    <strong>For Policy Removal Requests</strong>: Provide your legal business name, directory URLs, and specific fields to redact.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Form Card */}
          <Card className="border border-slate-200 bg-white shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-lg font-bold text-slate-950">Send an Inquiry Request</CardTitle>
              <p className="text-xs text-slate-500 mt-1">Reviewed by our data team within 24 business hours.</p>
            </CardHeader>
            <CardContent className="p-6">
              <form action="/api/inquiries" method="post" className="grid gap-4">
                <input type="hidden" name="redirectTo" value="/contact" />
                
                <div className="grid gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Inquiry Department</label>
                  <select name="type" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20">
                    <option value="GENERAL">General Sourcing Question</option>
                    <option value="DATA_LICENSE">Enterprise Data License</option>
                    <option value="CUSTOM_SHORTLIST">Custom Supplier Shortlist</option>
                    <option value="REPORT_PURCHASE">Report Purchase Inquiry</option>
                    <option value="BILLING_SUPPORT">Stripe Billing Support</option>
                    <option value="DATA_REMOVAL">Directory Correction/Removal</option>
                  </select>
                </div>

                <Input name="name" placeholder="Your Name" required className="border-slate-200 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 h-10 rounded-xl text-xs" />
                <Input name="email" type="email" placeholder="Corporate Sourcing Email" required className="border-slate-200 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 h-10 rounded-xl text-xs" />
                <Input name="companyName" placeholder="Company Name" className="border-slate-200 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 h-10 rounded-xl text-xs" />
                <Textarea name="message" placeholder="How can our database engineers assist your sourcing workflow?" required className="border-slate-200 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 rounded-xl text-xs min-h-[100px]" />

                <Button type="submit" className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-all">
                  Submit Inquiry Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <section className="mt-16">
          <FaqSection
            title="Support FAQ"
            items={[
              {
                question: "Can I request lists of supplier emails through this form?",
                answer: "No. gocnscout strictly complies with GDPR regulations and local privacy frameworks. We block direct personal contact coordinates to secure legal sourcing paths.",
              },
              {
                question: "How are enterprise licensing requests processed?",
                answer: "Submitting a Data License inquiry routes details directly to our data engineers. We confirm use cases, fields, and update intervals prior to generating licenses.",
              },
              {
                question: "How long does a data removal request review take?",
                answer: "Corporate removal or updating requests are prioritized and resolved by our legal staff within 48 business hours of form submission.",
              },
            ]}
          />
        </section>
      </section>
    </>
  );
}
