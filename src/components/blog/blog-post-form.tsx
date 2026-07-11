"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BlogEditor } from "@/components/blog/blog-editor";
import { emptyBlogDocument, markdownToBlogDocument, parseMarkdownFrontMatter, type BlogDocument } from "@/lib/blog/content";

type InitialPost = {
  slug: string; title: string; excerpt: string | null; content: BlogDocument; coverImage: string | null; status: string; category: string | null; tags: string[]; metaTitle: string | null; metaDescription: string | null; authorName: string | null;
};

export function BlogPostForm({ initialPost }: { initialPost?: InitialPost }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<InitialPost>(initialPost ?? { slug: "", title: "", excerpt: "", content: emptyBlogDocument(), coverImage: "", status: "DRAFT", category: "", tags: [], metaTitle: "", metaDescription: "", authorName: "" });
  const [tagsText, setTagsText] = useState((initialPost?.tags ?? []).join(", "));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const set = (key: keyof InitialPost, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const importMarkdown = async (file: File) => {
    const raw = await file.text();
    const parsed = parseMarkdownFrontMatter(raw);
    const metadata = parsed.metadata;
    const tags = Array.isArray(metadata.tags) ? metadata.tags : typeof metadata.tags === "string" ? metadata.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [];
    const slug = String(metadata.slug ?? metadata.Slug ?? file.name.replace(/\.md$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    setForm((current) => ({ ...current, slug, title: String(metadata.title ?? metadata.Title ?? current.title), excerpt: String(metadata.excerpt ?? metadata.Excerpt ?? current.excerpt ?? ""), category: String(metadata.category ?? metadata.Category ?? current.category ?? ""), metaTitle: String(metadata.metaTitle ?? metadata.MetaTitle ?? current.metaTitle ?? ""), metaDescription: String(metadata.metaDescription ?? metadata.MetaDescription ?? current.metaDescription ?? ""), authorName: String(metadata.author ?? metadata.Author ?? current.authorName ?? ""), tags, content: markdownToBlogDocument(parsed.body), sourceFileName: file.name }));
    setTagsText(tags.join(", "));
    setMessage(`已导入 ${file.name}，请检查后保存。`);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true); setMessage("");
    const payload = { ...form, tags: tagsText.split(",").map((tag) => tag.trim()).filter(Boolean) };
    const response = await fetch(initialPost ? `/api/blog/${initialPost.slug}` : "/api/blog", { method: initialPost ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (response.ok) router.push("/admin/blog");
    else setMessage((await response.json().catch(() => ({})) as { error?: string }).error ?? "保存失败，请稍后重试。");
    setSaving(false);
  };

  return <form onSubmit={submit} className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-xl font-bold text-slate-950">{initialPost ? "编辑博客文章" : "新建博客文章"}</h1><p className="mt-1 text-sm text-slate-500">支持直接粘贴 Markdown，也可以导入本地 .md 文件。</p></div>
      <div className="flex gap-2"><input ref={fileRef} type="file" accept=".md,.markdown,text/markdown" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importMarkdown(file); event.target.value = ""; }} /><button type="button" onClick={() => fileRef.current?.click()} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">导入 Markdown</button><button disabled={saving} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50">{saving ? "保存中..." : "保存文章"}</button></div>
    </div>
    {message && <p className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">{message}</p>}
    <div className="grid gap-4 rounded-md border border-slate-200 bg-white p-5 md:grid-cols-2">
      <label className="md:col-span-2"><span className="field-label">标题</span><input required value={form.title} onChange={(e) => set("title", e.target.value)} className="field-input" /></label>
      <label><span className="field-label">URL Slug</span><input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(e) => set("slug", e.target.value)} className="field-input" /></label>
      <label><span className="field-label">分类</span><input value={form.category ?? ""} onChange={(e) => set("category", e.target.value)} placeholder="如：Supplier Verification" className="field-input" /></label>
      <label><span className="field-label">作者</span><input value={form.authorName ?? ""} onChange={(e) => set("authorName", e.target.value)} className="field-input" /></label>
      <label><span className="field-label">状态</span><select value={form.status} onChange={(e) => set("status", e.target.value)} className="field-input"><option value="DRAFT">草稿</option><option value="PUBLISHED">已发布</option><option value="ARCHIVED">已归档</option></select></label>
      <label className="md:col-span-2"><span className="field-label">摘要</span><textarea rows={3} value={form.excerpt ?? ""} onChange={(e) => set("excerpt", e.target.value)} className="field-input" /></label>
      <label className="md:col-span-2"><span className="field-label">标签（逗号分隔）</span><input value={tagsText} onChange={(e) => setTagsText(e.target.value)} className="field-input" /></label>
      <label className="md:col-span-2"><span className="field-label">封面图片 URL</span><input type="url" value={form.coverImage ?? ""} onChange={(e) => set("coverImage", e.target.value)} className="field-input" /></label>
      <label><span className="field-label">SEO 标题</span><input value={form.metaTitle ?? ""} onChange={(e) => set("metaTitle", e.target.value)} className="field-input" /></label>
      <label><span className="field-label">SEO 描述</span><textarea rows={2} value={form.metaDescription ?? ""} onChange={(e) => set("metaDescription", e.target.value)} className="field-input" /></label>
    </div>
    <div><p className="mb-2 text-sm font-semibold text-slate-700">正文</p><BlogEditor content={form.content} onChange={(content) => setForm((current) => ({ ...current, content }))} /></div>
  </form>;
}
