"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Image as ImageIcon, Loader2, Save, Sparkles, Upload } from "lucide-react";
import { BlogEditor } from "@/components/blog/blog-editor";
import { emptyBlogDocument, markdownToBlogDocument, parseMarkdownFrontMatter, type BlogDocument } from "@/lib/blog/content";
import { extractBlogText, getBlogImageStats, seoLengthStatus } from "@/lib/blog/seo";

type InitialPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  content: BlogDocument;
  coverImage: string | null;
  status: string;
  category: string | null;
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  authorName: string | null;
  trafficSource?: string | null;
  searchViews?: number;
  linkedinViews?: number;
  xViews?: number;
  youtubeViews?: number;
  otherViews?: number;
};

function StatusText({ length, label, tone }: { length: number; label: string; tone: "muted" | "warn" | "danger" | "good" }) {
  const color = tone === "good" ? "text-emerald-600" : tone === "danger" ? "text-red-600" : tone === "warn" ? "text-amber-600" : "text-slate-400";
  return <span className={`text-[11px] font-semibold ${color}`}>实际: {length} · {label}</span>;
}

export function BlogPostForm({ initialPost }: { initialPost?: InitialPost }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<InitialPost>(initialPost ?? {
    slug: "",
    title: "",
    excerpt: "",
    content: emptyBlogDocument(),
    coverImage: "",
    status: "DRAFT",
    category: "",
    tags: [],
    metaTitle: "",
    metaDescription: "",
    authorName: "",
    trafficSource: "SEARCH",
    searchViews: 0,
    linkedinViews: 0,
    xViews: 0,
    youtubeViews: 0,
    otherViews: 0,
  });
  const [tagsText, setTagsText] = useState((initialPost?.tags ?? []).join(", "));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [aiLoading, setAiLoading] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [coverPrompt, setCoverPrompt] = useState("");

  const set = (key: keyof InitialPost, value: string | number) => setForm((current) => ({ ...current, [key]: value }));
  const titleStatus = seoLengthStatus(form.metaTitle || form.title, 50, 60);
  const descStatus = seoLengthStatus(form.metaDescription || form.excerpt, 150, 160);
  const imageStats = getBlogImageStats(form.content);
  const words = extractBlogText(form.content).split(/\s+/).filter(Boolean).length;

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

  const uploadCover = async (file: File | undefined) => {
    if (!file) return;
    setCoverUploading(true);
    setMessage("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/blog/media", { method: "POST", body });
      const payload = (await response.json().catch(() => ({}))) as { item?: { publicUrl?: string }; error?: string };
      if (!response.ok || !payload.item?.publicUrl) throw new Error(payload.error ?? "封面图上传失败");
      set("coverImage", payload.item.publicUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "封面图上传失败");
    } finally {
      setCoverUploading(false);
    }
  };

  const callAI = async (action: string) => {
    setAiLoading(action);
    setMessage("");
    try {
      const response = await fetch("/api/admin/blog/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, title: form.title, content: form.content, category: form.category, excerpt: form.excerpt }),
      });
      const payload = (await response.json()) as { result?: string; error?: string };
      if (!response.ok || !payload.result) throw new Error(payload.error ?? "AI 生成失败");
      if (action === "generate_excerpt") set("excerpt", payload.result);
      if (action === "generate_cover_prompt") setCoverPrompt(payload.result);
      if (action === "generate_seo_pack") {
        const parsed = JSON.parse(payload.result) as { metaTitle?: string; metaDescription?: string; tags?: string[] };
        if (parsed.metaTitle) set("metaTitle", parsed.metaTitle);
        if (parsed.metaDescription) set("metaDescription", parsed.metaDescription);
        if (Array.isArray(parsed.tags)) setTagsText(parsed.tags.join(", "));
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "AI 生成失败");
    } finally {
      setAiLoading("");
    }
  };

  const fillImageAlts = async () => {
    setAiLoading("generate_image_alts");
    try {
      const response = await fetch("/api/admin/blog/ai-image-alt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, content: form.content }),
      });
      const payload = (await response.json()) as { content?: BlogDocument; count?: number; error?: string };
      if (!response.ok || !payload.content) throw new Error(payload.error ?? "Alt 回填失败");
      setForm((current) => ({ ...current, content: payload.content! }));
      setMessage(`已回填 ${payload.count ?? 0} 张插图的 Alt。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Alt 回填失败");
    } finally {
      setAiLoading("");
    }
  };

  const submit = async (status = form.status) => {
    setSaving(true); setMessage("");
    const payload = { ...form, status, tags: tagsText.split(",").map((tag) => tag.trim()).filter(Boolean) };
    const response = await fetch(initialPost ? `/api/blog/${initialPost.slug}` : "/api/blog", { method: initialPost ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (response.ok) router.push("/admin/blog");
    else setMessage((await response.json().catch(() => ({})) as { error?: string }).error ?? "保存失败，请稍后重试。");
    setSaving(false);
  };

  const copyParams = async () => {
    const text = `| Title | Category | Traffic | Tags | Views |\n| --- | --- | --- | --- | --- |\n| ${form.title.replace(/\|/g, "\\|") || "-"} | ${form.category || "-"} | ${form.trafficSource || "SEARCH"} | ${tagsText || "-"} | ${(form.searchViews ?? 0) + (form.linkedinViews ?? 0) + (form.xViews ?? 0) + (form.youtubeViews ?? 0) + (form.otherViews ?? 0)} |`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <form onSubmit={(event) => { event.preventDefault(); void submit(); }} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-slate-950">{initialPost ? "编辑文章" : "新建博客文章"}</h1><p className="mt-1 text-sm text-slate-500">支持直接粘贴 Markdown，也可以导入本地 .md 文件。</p></div>
        <div className="flex gap-2"><input ref={fileRef} type="file" accept=".md,.markdown,text/markdown" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importMarkdown(file); event.target.value = ""; }} /><button type="button" onClick={() => fileRef.current?.click()} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">导入 Markdown</button><button disabled={saving} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50">{saving ? "保存中..." : "保存文章"}</button></div>
      </div>
      {message && <p className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">{message}</p>}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <main className="space-y-4">
          <input required value={form.title} onChange={(event) => set("title", event.target.value)} placeholder="文章标题" className="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-2xl font-bold text-slate-950 outline-none focus:border-teal-500" />
          <section className="rounded-md border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2"><span className="text-sm font-semibold text-slate-700">文章摘要</span><button type="button" onClick={() => void callAI("generate_excerpt")} className="inline-flex items-center gap-1 rounded border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">{aiLoading === "generate_excerpt" ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}AI 辅助生成</button></div>
            <textarea rows={3} value={form.excerpt ?? ""} onChange={(event) => set("excerpt", event.target.value)} className="w-full resize-none px-4 py-3 text-sm outline-none" />
          </section>
          <section>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">文章正文</p>
              <div className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ${imageStats.total === imageStats.withAlt ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}><ImageIcon size={13} />插图: {imageStats.total} (Alt: {imageStats.withAlt}/{imageStats.total})</div>
            </div>
            <BlogEditor content={form.content} onChange={(content) => setForm((current) => ({ ...current, content }))} />
          </section>
        </main>

        <aside className="space-y-3">
          <section className="rounded-md border border-slate-200 bg-white p-4">
            <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">发布设置</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <button type="button" disabled={saving} onClick={() => void submit("PUBLISHED")} className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-teal-600 text-xs font-bold text-white"><Save size={13} />直接发布</button>
              <button type="button" disabled={saving} onClick={() => void submit("DRAFT")} className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 text-xs font-bold text-slate-700">保存草稿</button>
              <button type="button" onClick={() => void copyParams()} className="inline-flex h-9 items-center justify-center gap-1 rounded-md border border-slate-300 text-xs font-bold text-slate-700">{copied ? <Check size={13} /> : <Copy size={13} />}复制参数</button>
            </div>
            <p className="mt-2 text-center text-xs text-slate-400">正文共 {words} 词 · 预计 {Math.max(1, Math.round(words / 200))} 分钟阅读</p>
          </section>

          <section className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between"><h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">封面图</h2><button type="button" onClick={() => void callAI("generate_cover_prompt")} className="text-xs font-semibold text-indigo-700">AI 提示词</button></div>
            {form.coverImage ? <img src={form.coverImage} alt="封面图预览" className="mt-3 aspect-video w-full rounded-md object-cover" /> : <button type="button" onClick={() => coverRef.current?.click()} className="mt-3 flex aspect-video w-full flex-col items-center justify-center rounded-md border border-dashed border-slate-300 text-sm text-slate-500">{coverUploading ? <Loader2 className="animate-spin" /> : <Upload />}点击上传封面图</button>}
            <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(event) => { void uploadCover(event.target.files?.[0]); event.target.value = ""; }} />
            <input value={form.coverImage ?? ""} onChange={(event) => set("coverImage", event.target.value)} placeholder="封面图片 URL" className="field-input mt-3" />
            {coverPrompt && <p className="mt-2 rounded bg-indigo-50 p-2 text-xs leading-5 text-indigo-900">{coverPrompt}</p>}
          </section>

          <section className="space-y-3 rounded-md border border-slate-200 bg-white p-4">
            <label><span className="field-label">URL 路径 (Slug)</span><input pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(event) => set("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="留空则提交时自动生成" className="field-input" /></label>
            <label><span className="field-label">文章分类</span><input value={form.category ?? ""} onChange={(event) => set("category", event.target.value)} placeholder="如：Supplier Verification" className="field-input" /></label>
            <label><span className="field-label">流量渠道</span><select value={form.trafficSource ?? "SEARCH"} onChange={(event) => set("trafficSource", event.target.value)} className="field-input"><option value="SEARCH">Search (搜索)</option><option value="LINKEDIN">LinkedIn</option><option value="X">X</option><option value="YOUTUBE">YouTube</option><option value="SOCIAL">Social</option></select></label>
            <label><span className="field-label">作者</span><input value={form.authorName ?? ""} onChange={(event) => set("authorName", event.target.value)} className="field-input" /></label>
            <label><span className="field-label">状态</span><select value={form.status} onChange={(event) => set("status", event.target.value)} className="field-input"><option value="DRAFT">草稿</option><option value="PUBLISHED">已发布</option><option value="ARCHIVED">已归档</option></select></label>
            <label><span className="field-label">标签（逗号分隔）</span><input value={tagsText} onChange={(event) => setTagsText(event.target.value)} className="field-input" /></label>
          </section>

          <section className="space-y-3 rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between"><h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">SEO 三件套微调</h2><button type="button" onClick={() => void callAI("generate_seo_pack")} className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700">{aiLoading === "generate_seo_pack" ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}AI 一键填充</button></div>
            <label><span className="field-label">Meta 标题</span><input value={form.metaTitle ?? ""} onChange={(event) => set("metaTitle", event.target.value)} className="field-input" /></label>
            <div className="flex justify-between text-xs text-slate-400"><span>标准: 50-60</span><StatusText {...titleStatus} /></div>
            <label><span className="field-label">Meta 描述</span><textarea rows={3} value={form.metaDescription ?? ""} onChange={(event) => set("metaDescription", event.target.value)} className="field-input" /></label>
            <div className="flex justify-between text-xs text-slate-400"><span>标准: 150-160</span><StatusText {...descStatus} /></div>
            <button type="button" onClick={() => void fillImageAlts()} className="inline-flex w-full items-center justify-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700">{aiLoading === "generate_image_alts" ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}AI 识别插图 Alt</button>
          </section>

          <section className="grid grid-cols-2 gap-2 rounded-md border border-slate-200 bg-white p-4">
            {[["searchViews", "Search"], ["linkedinViews", "LinkedIn"], ["xViews", "X"], ["youtubeViews", "YouTube"], ["otherViews", "Other"]].map(([key, label]) => <label key={key}><span className="field-label">{label}</span><input type="number" min={0} value={Number(form[key as keyof InitialPost] ?? 0)} onChange={(event) => set(key as keyof InitialPost, Number(event.target.value))} className="field-input" /></label>)}
          </section>
        </aside>
      </div>
    </form>
  );
}
