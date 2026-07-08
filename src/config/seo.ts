import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/utils";

export const SITE = {
  name: "gocnscout",
  domain: "gocnscout.com",
  supportEmail: "gerry@gocnscout.com",
  description:
    "Search a non-sensitive China supplier database for supplier research, industry reports, and sourcing shortlists.",
};

type SeoInput = {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
};

export function createMetadata({ title, description, path = "/", noindex = false }: SeoInput): Metadata {
  const fullTitle = title.includes(SITE.name) ? title : `${title} | ${SITE.name}`;
  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: absoluteUrl(path),
    },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url: absoluteUrl(path),
      siteName: SITE.name,
      type: "website",
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; href: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE.name,
    "url": absoluteUrl("/"),
    "logo": absoluteUrl("/favicon.ico"),
    "sameAs": [
      "https://twitter.com/gocnscout",
      "https://github.com/gocnscout"
    ]
  };
}

export function websiteSearchJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE.name,
    "url": absoluteUrl("/"),
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${absoluteUrl("/database")}?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function productJsonLd({
  name,
  description,
  lowPrice,
  highPrice,
  offerCount,
}: {
  name: string;
  description: string;
  lowPrice: string;
  highPrice: string;
  offerCount: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": lowPrice,
      "highPrice": highPrice,
      "offerCount": offerCount,
    },
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      },
    })),
  };
}

export function blogPostingJsonLd({
  title,
  description,
  slug,
  datePublished,
  dateModified,
  authorName,
  imageName,
}: {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  imageName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "image": absoluteUrl(imageName),
    "datePublished": datePublished,
    "dateModified": dateModified,
    "author": {
      "@type": "Person",
      "name": authorName,
    },
    "publisher": {
      "@type": "Organization",
      "name": SITE.name,
      "logo": {
        "@type": "ImageObject",
        "url": absoluteUrl("/favicon.ico"),
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": absoluteUrl(`/blog/${slug}`),
    },
  };
}

