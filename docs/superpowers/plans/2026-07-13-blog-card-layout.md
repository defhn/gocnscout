# Blog Card Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make public blog cards display 16:9 covers and use three columns on desktop.

**Architecture:** The existing `PublicBlogList` component owns the responsive grid and each card's cover container, so the layout change stays localized to that component. Tailwind utilities provide the responsive breakpoints and aspect ratio without adding client state or dependencies.

**Tech Stack:** Next.js, React, Tailwind CSS, Vitest, TypeScript.

---

### Task 1: Update the public blog card presentation

**Files:**
- Modify: `src/components/blog/public-blog-list.tsx:29-42`
- Verify: `src/components/blog/public-blog-list.tsx`

- [ ] **Step 1: Define the expected responsive presentation**

The grid must use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`. Both the `<img>` and fallback cover wrapper must use `aspect-video w-full`, and the image keeps `object-cover` so a non-16:9 source fills the 16:9 frame without distortion.

- [ ] **Step 2: Implement the minimal Tailwind class changes**

```tsx
<div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
  {post.coverImage ? (
    <img src={post.coverImage} alt={post.title} className="aspect-video w-full object-cover" />
  ) : (
    <div className="flex aspect-video w-full items-end bg-slate-900 p-5 text-white">
```

- [ ] **Step 3: Run type verification**

Run: `npm run typecheck`

Expected: exit code 0.

- [ ] **Step 4: Run production build verification**

Run: `npm run build`

Expected: Next.js reports `Compiled successfully` and exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/blog/public-blog-list.tsx docs/superpowers/specs/2026-07-13-blog-card-layout-design.md docs/superpowers/plans/2026-07-13-blog-card-layout.md
git commit -m "fix: display blog covers in a three-column 16:9 grid"
```
