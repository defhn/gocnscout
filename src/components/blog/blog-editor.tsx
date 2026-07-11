"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { marked } from "marked";
import { DOMParser as ProseMirrorDOMParser } from "@tiptap/pm/model";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Code, Link as LinkIcon, Table as TableIcon, Undo, Redo, Image as ImageIcon } from "lucide-react";
import type { BlogDocument } from "@/lib/blog/content";
import { MediaLibraryModal } from "@/components/blog/media-library-modal";

type Props = { content: BlogDocument; onChange: (content: BlogDocument) => void };

function Tool({ title, onClick, children, disabled = false }: { title: string; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return <button type="button" title={title} onMouseDown={(event) => { event.preventDefault(); onClick(); }} disabled={disabled} className="inline-flex h-8 w-8 items-center justify-center rounded border border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 disabled:opacity-40">{children}</button>;
}

export function BlogEditor({ content, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  const cleanAltFromFilename = (filename: string) => filename.replace(/\.[^/.]+$/, "").replace(/[-_.]+/g, " ").trim();

  const uploadImage = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/blog/media", { method: "POST", body: form });
    const payload = (await response.json().catch(() => ({}))) as { item?: { publicUrl?: string }; error?: string };
    if (!response.ok || !payload.item?.publicUrl) throw new Error(payload.error ?? "图片上传失败");
    return payload.item.publicUrl;
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: "在这里写文章，或直接粘贴 Markdown..." }),
      CharacterCount,
      Link.configure({ openOnClick: false }),
      Image.configure({ allowBase64: false }),
      Table.configure({ resizable: true }), TableRow, TableHeader, TableCell,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor: instance }) => onChange(instance.getJSON() as BlogDocument),
    editorProps: {
      attributes: { class: "prose prose-slate max-w-none min-h-[420px] px-5 py-4 focus:outline-none" },
      handlePaste(view, event) {
        const imageItem = Array.from(event.clipboardData?.items ?? []).find((item) => item.type.startsWith("image/"));
        const imageFile = imageItem?.getAsFile();
        if (imageFile) {
          event.preventDefault();
          setUploading(true);
          setNotice("正在上传粘贴的图片...");
          void uploadImage(imageFile)
            .then((src) => {
              editor?.chain().focus().setImage({ src, alt: cleanAltFromFilename(imageFile.name) }).run();
              setNotice("图片已插入正文");
            })
            .catch((error: Error) => setNotice(error.message))
            .finally(() => setUploading(false));
          return true;
        }
        const text = event.clipboardData?.getData("text/plain");
        if (!text) return false;
        const markdownPattern = /(^|\n)(#{1,6}\s+|[-*+]\s+|\d+\.\s+|>\s+|\|.*\||```)|\*\*|__|\[[^\]]+\]\([^\)]+\)/;
        if (!markdownPattern.test(text)) return false;
        event.preventDefault();
        const html = marked.parse(text, { async: false });
        const doc = new window.DOMParser().parseFromString(html, "text/html");
        const slice = ProseMirrorDOMParser.fromSchema(view.state.schema).parseSlice(doc.body);
        view.dispatch(view.state.tr.replaceSelection(slice));
        return true;
      },
      handleDrop(_view, event) {
        const imageFile = Array.from(event.dataTransfer?.files ?? []).find((file) => file.type.startsWith("image/"));
        if (!imageFile) return false;
        event.preventDefault();
        setUploading(true);
        setNotice("正在上传拖入的图片...");
        void uploadImage(imageFile)
          .then((src) => {
            editor?.chain().focus().setImage({ src, alt: cleanAltFromFilename(imageFile.name) }).run();
            setNotice("图片已插入正文");
          })
          .catch((error: Error) => setNotice(error.message))
          .finally(() => setUploading(false));
        return true;
      },
    },
  });

  if (!editor) return <div className="min-h-[480px] rounded-md border border-slate-200 bg-white" />;
  const words = (editor.storage.characterCount as { words: () => number }).words();
  const setLink = () => {
    const href = window.prompt("请输入链接地址", editor.getAttributes("link").href ?? "https://");
    if (href === null) return;
    if (!href) editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href }).run();
  };
  const pickImage = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setNotice("正在上传图片...");
    try {
      const src = await uploadImage(file);
      editor.chain().focus().setImage({ src, alt: cleanAltFromFilename(file.name) }).run();
      setNotice("图片已插入正文");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "图片上传失败");
    } finally {
      setUploading(false);
    }
  };

  return <div className="rounded-md border border-slate-200 bg-white">
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2 rounded-t-md">
      <Tool title="粗体" onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={15} /></Tool>
      <Tool title="斜体" onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={15} /></Tool>
      <Tool title="二级标题" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={15} /></Tool>
      <Tool title="三级标题" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 size={15} /></Tool>
      <Tool title="无序列表" onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={15} /></Tool>
      <Tool title="有序列表" onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={15} /></Tool>
      <Tool title="引用" onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={15} /></Tool>
      <Tool title="代码" onClick={() => editor.chain().focus().toggleCode().run()}><Code size={15} /></Tool>
      <Tool title="链接" onClick={setLink}><LinkIcon size={15} /></Tool>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(event) => { void pickImage(event.target.files?.[0]); event.target.value = ""; }} />
      <Tool title="上传图片" onClick={() => fileRef.current?.click()} disabled={uploading}><ImageIcon size={15} /></Tool>
      <Tool title="媒体库" onClick={() => setShowMediaLibrary(true)}><ImageIcon size={15} /></Tool>
      <Tool title="插入表格" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><TableIcon size={15} /></Tool>
      <Tool title="撤销" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}><Undo size={15} /></Tool>
      <Tool title="重做" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}><Redo size={15} /></Tool>
      <span className="ml-auto px-2 text-xs text-slate-400">{words} 字 · 约 {Math.max(1, Math.round(words / 200))} 分钟阅读</span>
    </div>
    <EditorContent editor={editor} />
    <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-2 text-xs text-slate-400">
      <span>支持直接粘贴 Markdown、截图或图片。</span>
      {notice && <span className={notice.includes("失败") || notice.includes("尚未") ? "text-red-600" : "text-teal-700"}>{notice}</span>}
    </div>
    {showMediaLibrary && <MediaLibraryModal onClose={() => setShowMediaLibrary(false)} onSelect={(src) => { editor.chain().focus().setImage({ src, alt: "" }).run(); setShowMediaLibrary(false); }} />}
  </div>;
}
