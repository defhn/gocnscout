export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
  author: string;
  image: string;
  content: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-verify-china-exhibitors",
    title: "How to Verify Chinese Trade Exhibitors: A Practical Vetting Guide",
    description: "Learn how to spot real manufacturers from trading agencies at major export exhibitions using registration numbers, scopes, and verification checklists.",
    datePublished: "2026-06-15T08:00:00Z",
    dateModified: "2026-06-15T08:00:00Z",
    author: "Gerry Vance, Sourcing Expert",
    image: "/favicon.ico",
    content: `
      <p>Sourcing products from major export exhibitions is one of the most effective ways to scale your supply chain, but it comes with distinct challenges. How do you distinguish a massive direct factory from a small trading company posing as one?</p>
      
      <h3 class="text-lg font-bold text-slate-900 mt-6 mb-2">1. Analyze the Chinese Business Scope (经营范围)</h3>
      <p class="mb-4">Every legitimate company registered in mainland China has an official Business Scope. This is a public registry parameter listing what the company is legally authorized to do. If their catalog lists plastic toys, steel tubing, and organic tea all under one company, they are almost certainly a trading broker, not a manufacturer. A genuine manufacturer will possess a highly focused business scope centered on specific raw materials and production types.</p>

      <h3 class="text-lg font-bold text-slate-900 mt-6 mb-2">2. Leverage Exhibition Stand History</h3>
      <p class="mb-4">First-time exhibitors are higher risk than companies that have maintained stands for 5 or 10 consecutive years. Steady exhibition history indicates cash flow stability, long-term customer relationships, and verified production continuity.</p>

      <h3 class="text-lg font-bold text-slate-900 mt-6 mb-2">3. Demand Target Certifications & Audits</h3>
      <p class="mb-4">Ask for recent ISO 9001, BSCI, or Sedex audit documents. Genuine manufacturers will readily share these PDFs along with original verification codes. Brokers will often hesitate, make excuses, or supply blurred files.</p>
    `
  },
  {
    slug: "top-china-manufacturing-cities-sourcing",
    title: "Mapping China's Industrial Hubs: Sourcing Cities by Product Category",
    description: "Discover China's specialized manufacturing clusters. Learn why sourcing plumbing from Ningbo or hardware from Yongkang saves 15% in costs.",
    datePublished: "2026-06-20T08:00:00Z",
    dateModified: "2026-06-20T08:00:00Z",
    author: "Gerry Vance, Sourcing Expert",
    image: "/favicon.ico",
    content: `
      <p>In China, manufacturing is highly localized. Specific cities master specific categories, creating deep supply ecosystems where raw materials, component factories, and logistics channels reside in one place.</p>
      
      <h3 class="text-lg font-bold text-slate-900 mt-6 mb-2">Major Manufacturing Cities to Know</h3>
      <ul class="list-disc pl-5 mb-4 space-y-2">
        <li><strong>Shenzhen & Dongguan (Guangdong)</strong>: The global capital of consumer electronics, PCB manufacturing, and smart gadgets.</li>
        <li><strong>Yongkang (Zhejiang)</strong>: Renowned for power tools, stainless steel vacuum cups, and hardware components.</li>
        <li><strong>Ningbo (Zhejiang)</strong>: Famous for plumbing valves, home appliances, and heavy industrial machinery.</li>
        <li><strong>Wenzhou (Zhejiang)</strong>: The global center for low-voltage electrical systems, shoes, and packaging machines.</li>
      </ul>
      
      <h3 class="text-lg font-bold text-slate-900 mt-6 mb-2">The Cluster Savings Effect</h3>
      <p class="mb-4">Sourcing a vacuum cup from Yongkang is typically 15% cheaper than sourcing from an isolated factory in another province. This is because raw materials, specialized paint lines, and packaging factories are down the road, eliminating middle-man logistics.</p>
    `
  },
  {
    slug: "trading-company-vs-manufacturer-china",
    title: "Chinese Trading Company vs Manufacturer: How to Spot the Difference",
    description: "Understand the core differences between sourcing brokers and factory-direct deals, and choose the right partner for your importing business.",
    datePublished: "2026-06-25T08:00:00Z",
    dateModified: "2026-06-25T08:00:00Z",
    author: "Gerry Vance, Sourcing Expert",
    image: "/favicon.ico",
    content: `
      <p>Many importers think they must always buy factory-direct. While direct sourcing offers the lowest unit cost, it demands high Minimum Order Quantities (MOQs) and strict technical knowledge. Trading companies can offer lower MOQs and mixed cargo, but charge markup fees.</p>

      <h3 class="text-lg font-bold text-slate-900 mt-6 mb-2">How to Spot a Trading Company in 3 Steps</h3>
      <p class="mb-4">1. <strong>Registered Capital</strong>: Manufacturing factories typically require heavy capital investments in land, machinery, and structures. A capital registration under $500,000 RMB usually indicates a service or trading office.</p>
      <p class="mb-4">2. <strong>Product Variety</strong>: Factories make things. Trading companies trade things. If a supplier's catalog covers unrelated categories, they do not own the production lines.</p>
      <p class="mb-4">3. <strong>Location Addresses</strong>: Check the physical address. A warehouse or commercial office in downtown Shanghai is a trading company. A manufacturing facility is located in an outlying industrial development zone.</p>
    `
  },
  {
    slug: "china-exhibitor-list-free-download",
    title: "China Sourcing Exhibition Lists: Why Buying CSV Lists Online is a Sourcing Risk",
    description: "Exposing the traps of purchasing static exhibitor databases online and why compliance-filtered records offer a safer procurement route.",
    datePublished: "2026-06-30T08:00:00Z",
    dateModified: "2026-06-30T08:00:00Z",
    author: "Gerry Vance, Sourcing Expert",
    image: "/favicon.ico",
    content: `
      <p>We've all seen them: emails offering '100% complete China Sourcing Exhibition lists with emails and phone numbers' for $99. Sourcing managers frequently purchase these static files only to face massive bounce rates and legal compliance issues.</p>

      <h3 class="text-lg font-bold text-slate-900 mt-6 mb-2">The Major Risks of Raw CSV Purchases</h3>
      <p class="mb-4">1. <strong>Data Decay</strong>: Static files decay at a rate of 22% per year. Websites expire, companies close down, and categories change.</p>
      <p class="mb-4">2. <strong>Regulatory Violations</strong>: Reselling databases containing direct contact person phone numbers and personal emails breaches international laws like GDPR and CCPA, exposing your importing entity to lawsuits.</p>
      <p class="mb-4">3. <strong>Inaccurate Targeting</strong>: Unverified lists contain massive numbers of shell agents and empty registrations. Filtered databases like gocnscout cleanse and restructure parameters to assure high-integrity searching.</p>
    `
  },
  {
    slug: "how-to-spot-scams-when-sourcing-china",
    title: "How to Avoid Sourcing Scams: Red Flags in Cross-Border Procurement",
    description: "Vetting exporters like a pro. Essential red flags to watch for during manufacturer research and wire transfers.",
    datePublished: "2026-07-05T08:00:00Z",
    dateModified: "2026-07-05T08:00:00Z",
    author: "Gerry Vance, Sourcing Expert",
    image: "/favicon.ico",
    content: `
      <p>Scams are rare in established B2B networks, but minor discrepancies, product substitution, and payment diversion happen. Learn the standard indicators of a high-risk supplier relationship.</p>

      <h3 class="text-lg font-bold text-slate-900 mt-6 mb-2">Core Red Flags to Keep in Mind</h3>
      <ul class="list-disc pl-5 mb-4 space-y-2">
        <li><strong>Diverted Bank Details</strong>: If a supplier requests payment to a bank account name that differs from their official business registration name (especially offshore bank locations), pause the transfer.</li>
        <li><strong>Refusal of Physical Audits</strong>: If a supplier makes persistent excuses preventing your third-party inspection agent from visiting their factory, cancel the order.</li>
        <li><strong>Absence of Exhibition Records</strong>: Lack of registration at established events like major export exhibitions is an indicator of a shell setup or unverified operation.</li>
      </ul>
    `
  }
];
