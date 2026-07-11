import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { BlogPostForm } from "@/components/blog/blog-post-form";
import { isBlogDocument, emptyBlogDocument } from "@/lib/blog/content";

type Props = { params: Promise<{ slug: string }> };

export default async function EditBlogPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) notFound();
  return <BlogPostForm initialPost={{ ...post, content: isBlogDocument(post.content) ? post.content : emptyBlogDocument(), status: post.status }} />;
}
