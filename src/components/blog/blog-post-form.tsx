"use client";

import { useEffect, useRef, useState } from "react";
import { getExistingCategories } from "@/server/blog";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Check, Copy, Image as ImageIcon, Loader2, Save, Sparkles, Upload } from "lucide-react";
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
  const [categories, setCategories] = useState<string[]>([]);
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);

  useEffect(() => {
    getExistingCategories().then((res) => {
      const defaultCategories = ["Supplier Verification", "Sourcing Guides", "Trade Compliance", "Market Research"];
      const merged = Array.from(new Set([...defaultCategories, ...res]));
      setCategories(merged);
      if (initialPost?.category && !merged.includes(initialPost.category)) {
        setIsCreatingNewCategory(true);
      }
    }).catch(() => {});
  }, [initialPost?.category]);

  const handleCategoryChange = (val: string) => {
    if (val === "__NEW__") {
      setIsCreatingNewCategory(true);
      set("category", "");
    } else {
      setIsCreatingNewCategory(false);
      set("category", val);
    }
  };

  const set = (key: keyof InitialPost, value: string | number) => setForm((current) => ({ ...current, [key]: value }));
  const titleStatus = seoLengthStatus(form.metaTitle || form.title, 50, 60);
  const descStatus = seoLengthStatus(form.metaDescription || form.excerpt, 150, 160);
  const imageStats = getBlogImageStats(form.content);
  const words = extractBlogText(form.content).split(/\s+/).filter(Boolean).length;

  const STOP_WORDS_SET = new Set(["a","an","the","and","or","but","in","on","at","to","for","of","with","by","is","it","its","if","be","as","was","are","how","your","my","our","can","do","did","from","this","that","have","has","what","which","who","will","up","out","about","into","not","step","guide","complete","every","must","know","before","making","first"]);
  const importMarkdown = async (file: File) => {
    const raw = await file.text();
    const parsed = parseMarkdownFrontMatter(raw);
    const metadata = parsed.metadata;
    const tags = Array.isArray(metadata.tags) ? metadata.tags : typeof metadata.tags === "string" ? metadata.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [];
    // Priority: Frontmatter Slug → short slug from title (4 keywords) → filename fallback
    const frontmatterSlug = metadata.slug ?? metadata.Slug;
    const titleForSlug = String(metadata.title ?? metadata.Title ?? "");
    const autoSlug = titleForSlug
      ? titleForSlug.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").split("-").filter(w => w.length > 0 && !STOP_WORDS_SET.has(w)).slice(0, 4).join("-")
      : file.name.replace(/\.md$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").split("-").slice(-4).join("-");
    const slug = String(frontmatterSlug ?? autoSlug);
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
    <form onSubmit={(event) => { event.preventDefault(); void submit(); }} className="space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-slate-950">{initialPost ? "编辑文章" : "新建博客文章"}</h1><p className="mt-1 text-sm text-slate-500">支持直接粘贴 Markdown，也可以导入本地 .md 文件。</p></div>
        <div className="flex gap-2"><input ref={fileRef} type="file" accept=".md,.markdown,text/markdown" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importMarkdown(file); event.target.value = ""; }} /><button type="button" onClick={() => fileRef.current?.click()} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">导入 Markdown</button><button disabled={saving} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50">{saving ? "保存中..." : "保存文章"}</button></div>
      </div>
      {message && <p className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">{message}</p>}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <main className="space-y-4 relative">
          {/* Scroll Navigation Arrows */}
          <div className="absolute right-0 top-0 h-full w-0 z-50 hidden lg:block pointer-events-none">
            <div className="sticky top-[50vh] -translate-y-1/2 flex flex-col gap-2 translate-x-4 pointer-events-auto">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="flex size-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-[0_2px_8px_0_rgba(0,0,0,0.08)] border border-slate-200 hover:bg-slate-50 hover:text-teal-600 transition-colors focus:outline-none"
                title="返回顶部"
              >
                <ArrowUp size={16} />
              </button>
              <button
                type="button"
                onClick={() => window.scrollBy({ top: -(document.body.scrollHeight / 4), behavior: "smooth" })}
                className="flex size-8 items-center justify-center rounded-full bg-white text-slate-400 shadow-[0_2px_8px_0_rgba(0,0,0,0.08)] border border-slate-200 hover:bg-slate-50 hover:text-teal-600 transition-colors focus:outline-none"
                title="向上滚动 1/4"
              >
                <ArrowUp size={12} className="opacity-70" />
              </button>
              <button
                type="button"
                onClick={() => window.scrollBy({ top: document.body.scrollHeight / 4, behavior: "smooth" })}
                className="flex size-8 items-center justify-center rounded-full bg-white text-slate-400 shadow-[0_2px_8px_0_rgba(0,0,0,0.08)] border border-slate-200 hover:bg-slate-50 hover:text-teal-600 transition-colors focus:outline-none"
                title="向下滚动 1/4"
              >
                <ArrowDown size={12} className="opacity-70" />
              </button>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
                className="flex size-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-[0_2px_8px_0_rgba(0,0,0,0.08)] border border-slate-200 hover:bg-slate-50 hover:text-teal-600 transition-colors focus:outline-none"
                title="滑动到底部"
              >
                <ArrowDown size={16} />
              </button>
            </div>
          </div>

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

        <aside className="space-y-2 text-xs">
          <section className="rounded-md border border-slate-200 bg-white p-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-400">发布设置</h2>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              <button type="button" disabled={saving} onClick={() => void submit("PUBLISHED")} className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-teal-600 text-[11px] font-bold text-white hover:bg-teal-700 disabled:opacity-50"><Save size={12} />直接发布</button>
              <button type="button" disabled={saving} onClick={() => void submit("DRAFT")} className="inline-flex h-8 items-center justify-center rounded-md border border-slate-300 text-[11px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">保存草稿</button>
              <button type="button" onClick={() => void copyParams()} className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-slate-300 text-[11px] font-bold text-slate-700 hover:bg-slate-50">{copied ? <Check size={12} /> : <Copy size={12} />}复制参数</button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-slate-400">正文共 {words} 词 · 预计 {Math.max(1, Math.round(words / 200))} 分钟阅读</p>
          </section>

          <section className="rounded-md border border-slate-200 bg-white p-2">
            <div className="flex items-center justify-between"><h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-400">封面图</h2><button type="button" onClick={() => void callAI("generate_cover_prompt")} className="text-[10px] font-semibold text-indigo-700 hover:underline">AI 提示词</button></div>
            {form.coverImage ? (
              <img src={form.coverImage} alt="封面图预览" className="mt-2 h-60 w-full rounded-md object-cover" />
            ) : (
              <button type="button" onClick={() => coverRef.current?.click()} className="mt-2 flex h-48 w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-slate-300 text-[11px] text-slate-500 hover:bg-slate-50">
                {coverUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={14} />}
                点击上传封面图
              </button>
            )}
            <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(event) => { void uploadCover(event.target.files?.[0]); event.target.value = ""; }} />
            <input value={form.coverImage ?? ""} onChange={(event) => set("coverImage", event.target.value)} placeholder="封面图片 URL" className="field-input mt-2 h-8 text-xs px-2 py-1" />
            {coverPrompt && <p className="mt-1.5 rounded bg-indigo-50 p-1.5 text-[10px] leading-4 text-indigo-900">{coverPrompt}</p>}
          </section>

          <section className="space-y-2 rounded-md border border-slate-200 bg-white p-2">
            <div className="grid grid-cols-2 gap-2">
              <label><span className="text-[10px] font-semibold text-slate-500">URL 路径 (Slug)</span><input pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(event) => set("slug", event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="留空自动生成" className="field-input h-8 text-xs px-2 py-1 mt-0.5" /></label>
              <label>
                <span className="text-[10px] font-semibold text-slate-500">文章分类</span>
                {!isCreatingNewCategory ? (
                  <select 
                    value={form.category ?? ""} 
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="h-9 px-2 text-xs border border-slate-300 rounded-md bg-white w-full focus:border-teal-600 outline-none mt-0.5 cursor-pointer"
                  >
                    <option value="">选择分类...</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__NEW__" className="text-teal-600 font-bold">+ 新建分类...</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-1 mt-0.5">
                    <input
                      value={form.category ?? ""}
                      onChange={(e) => set("category", e.target.value)}
                      placeholder="输入新分类"
                      className="field-input h-8 text-xs px-2 py-1 flex-1"
                      autoFocus
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsCreatingNewCategory(false);
                        set("category", "");
                      }} 
                      className="rounded border border-slate-300 px-1.5 h-8 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 shrink-0"
                    >
                      选择已有
                    </button>
                  </div>
                )}
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label><span className="text-[10px] font-semibold text-slate-500">流量渠道</span><select value={form.trafficSource ?? "SEARCH"} onChange={(event) => set("trafficSource", event.target.value)} className="h-9 px-2 text-xs border border-slate-300 rounded-md bg-white w-full focus:border-teal-600 outline-none mt-0.5 cursor-pointer"><option value="SEARCH">Search (搜索)</option><option value="LINKEDIN">LinkedIn</option><option value="X">X</option><option value="YOUTUBE">YouTube</option><option value="SOCIAL">Social</option></select></label>
              <label><span className="text-[10px] font-semibold text-slate-500">作者</span><input value={form.authorName ?? ""} onChange={(event) => set("authorName", event.target.value)} className="field-input h-8 text-xs px-2 py-1 mt-0.5" /></label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label><span className="text-[10px] font-semibold text-slate-500">状态</span><select value={form.status} onChange={(event) => set("status", event.target.value)} className="h-9 px-2 text-xs border border-slate-300 rounded-md bg-white w-full focus:border-teal-600 outline-none mt-0.5 cursor-pointer"><option value="DRAFT">草稿</option><option value="PUBLISHED">已发布</option><option value="ARCHIVED">已归档</option></select></label>
              <label><span className="text-[10px] font-semibold text-slate-500">标签（逗号分隔）</span><input value={tagsText} onChange={(event) => setTagsText(event.target.value)} className="field-input h-8 text-xs px-2 py-1 mt-0.5" /></label>
            </div>
          </section>

          <section className="space-y-2 rounded-md border border-slate-200 bg-white p-2">
            <div className="flex items-center justify-between"><h2 className="text-[11px] font-bold uppercase tracking-wide text-slate-400">SEO 三件套微调</h2><button type="button" onClick={() => void callAI("generate_seo_pack")} className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 hover:underline">{aiLoading === "generate_seo_pack" ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}AI 一键填充</button></div>
            <label><span className="text-[10px] font-semibold text-slate-500">Meta 标题</span><input value={form.metaTitle ?? ""} onChange={(event) => set("metaTitle", event.target.value)} className="field-input h-8 text-xs px-2 py-1 mt-0.5" /></label>
            <div className="flex justify-between text-[10px] text-slate-400"><span>标准: 50-60</span><StatusText {...titleStatus} /></div>
            <label><span className="text-[10px] font-semibold text-slate-500">Meta 描述</span><textarea rows={2} value={form.metaDescription ?? ""} onChange={(event) => set("metaDescription", event.target.value)} className="field-input text-xs px-2 py-1 mt-0.5" /></label>
            <div className="flex justify-between text-[10px] text-slate-400"><span>标准: 150-160</span><StatusText {...descStatus} /></div>
            <button type="button" onClick={() => void fillImageAlts()} className="inline-flex w-full items-center justify-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100">{aiLoading === "generate_image_alts" ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}AI 识别插图 Alt</button>
          </section>

          <section className="grid grid-cols-5 gap-1 rounded-md border border-slate-200 bg-white p-2">
            {[["searchViews", "Search"], ["linkedinViews", "In"], ["xViews", "X"], ["youtubeViews", "YT"], ["otherViews", "Other"]].map(([key, label]) => (
              <label key={key} className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-slate-400 truncate w-full text-center">{label}</span>
                <input type="number" min={0} value={Number(form[key as keyof InitialPost] ?? 0)} onChange={(event) => set(key as keyof InitialPost, Number(event.target.value))} className="field-input h-7 text-xs p-0 text-center mt-1" />
              </label>
            ))}
          </section>
        </aside>
      </div>
    </form>
  );
}
