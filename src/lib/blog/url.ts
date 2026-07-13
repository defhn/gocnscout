import { absoluteUrl } from "@/lib/utils";

export function blogPostUrl(slug: string) {
  return absoluteUrl(`/blog/${slug}`);
}
