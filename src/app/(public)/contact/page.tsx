import { Mail, CheckCircle2, Clock, Award } from "lucide-react";
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
      <Breadcrumbs items={[
        { label: "Home", href: "/" },
        { label: "Contact" }
      ]} />
      
      <section className="container-page pb-20 max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="py-6 mb-8 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600">Get in Touch</span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 mt-2">
            Contact gocnscout
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Have questions regarding database access, intelligence reports, enterprise licensing, billing queries, or data removal policies? Submit your sourcing parameters or account details, and our support staff will respond promptly.
          </p>
        </div>

        {/* Two-Column Form & Details */}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] items-start">
          {/* Left Column info */}
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden hover:border-teal-500/10 transition-colors">
                <CardContent className="p-5">
                  <Mail className="h-6 w-6 text-teal-600 mb-3" />
                  <h3 className="text-xs font-bold text-slate-950">Support Email</h3>
                  <p className="text-xs text-slate-500 mt-1 font-mono">{SITE.supportEmail}</p>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 bg-white shadow-sm rounded-2xl overflow-hidden hover:border-teal-500/10 transition-colors">
                <CardContent className="p-5">
                  <Clock className="h-6 w-6 text-teal-600 mb-3" />
                  <h3 className="text-xs font-bold text-slate-950">Response Time</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">Typically within 24 business hours.</p>
                </CardContent>
              </Card>
            </div>

            {/* Sourcing Desk Guidelines (EEAT Expansion) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-teal-600" />
                How to Structure Your Sourcing Request
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                To help our data engineers extract the most accurate manufacturer shortlists and geographic analytics for your team, please include the following parameters in your inquiry message:
              </p>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-teal-600 mt-0.5 shrink-0" />
                  <span><strong>Target Products &amp; Specs:</strong> Clearly state your target product keywords, compliance standards (e.g., CE, FCC, RoHS), or manufacturing processes required.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-teal-600 mt-0.5 shrink-0" />
                  <span><strong>Scale Requirements:</strong> Mention if you prefer established enterprise factories (registered capital &gt; $1M USD) or agile OEM/ODM workshops.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="h-4.5 w-4.5 text-teal-600 mt-0.5 shrink-0" />
                  <span><strong>Geographic Preferences:</strong> Specify if you need logistics alignment with particular ports (e.g., Shenzhen, Ningbo, Qingdao) or specific province clusters.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-xs text-slate-600 space-y-3">
              <h3 className="font-bold text-slate-900">Compliance &amp; Opt-Out Requests:</h3>
              <p className="leading-relaxed">
                Exporters or trade agents seeking registry updates or profile corrections may submit their request directly. Please specify the target company name and directory URL. We verify credentials and resolve data privacy concerns within 48 business hours.
              </p>
            </div>
          </div>

          {/* Right Column Form Card */}
          <Card className="border border-slate-200 bg-white shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-base font-bold text-slate-950">Submit Inquiry Form</CardTitle>
              <p className="text-xs text-slate-500 mt-1">Direct pipeline to our data analyst team.</p>
            </CardHeader>
            <CardContent className="p-6">
              <form action="/api/inquiries" method="post" className="grid gap-4">
                <input type="hidden" name="redirectTo" value="/contact" />
                
                <div className="grid gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inquiry Department</label>
                  <select name="type" className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20">
                    <option value="GENERAL">General Sourcing Support</option>
                    <option value="DATA_LICENSE">Enterprise Data License</option>
                    <option value="CUSTOM_SHORTLIST">Custom Supplier Shortlist</option>
                    <option value="REPORT_PURCHASE">Report Purchase Inquiry</option>
                    <option value="BILLING_SUPPORT">Stripe Billing Support</option>
                    <option value="DATA_REMOVAL">Directory Correction/Removal</option>
                  </select>
                </div>

                <Input name="name" placeholder="Your Name" required className="border-slate-200 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 h-10 rounded-xl text-xs" />
                <Input name="email" type="email" placeholder="Corporate Email Address" required className="border-slate-200 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 h-10 rounded-xl text-xs" />
                <Input name="companyName" placeholder="Company Name (Optional)" className="border-slate-200 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 h-10 rounded-xl text-xs" />
                <Textarea name="message" placeholder="Please describe your sourcing requirements or query detail in full..." required className="border-slate-200 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 rounded-xl text-xs min-h-[120px]" />

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
                question: "Do you resell supplier emails or phone numbers?",
                answer: "No. gocnscout strictly complies with international privacy frameworks and local digital regulations. We prune direct personal contact details to guarantee compliance, while providing official business details and verified domains.",
              },
              {
                question: "How are custom shortlisting requests handled?",
                answer: "Once received, a sourcing engineer reviews your target parameters, extracts candidates from our database using proprietary filters, and contacts you with a quote for a custom research file.",
              },
              {
                question: "How do I request deletion of my business directory listing?",
                answer: "If you represent a cataloged business and wish to request redactment, submit this form selecting the 'Directory Correction/Removal' department. The request is processed by legal within 48 business hours.",
              },
            ]}
          />
        </section>
      </section>
    </>
  );
}
