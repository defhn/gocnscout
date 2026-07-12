# Alibaba AI Analysis Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide a public Alibaba-store or company-website URL analysis page that uses Firecrawl to create an evidence-backed buyer research summary and preserves the result for later human-review checkout.

**Architecture:** A server-side analysis service validates a public HTTP(S) URL, classifies Alibaba storefronts, scrapes only the approved public endpoints, and produces a structured, source-attributed summary. A public form submits to an API route, which persists the result and redirects to a shareable result page.

**Tech Stack:** Next.js 16 App Router, TypeScript, Prisma/Postgres, Firecrawl REST API, Zod, Vitest, Tailwind CSS.

---

### Task 1: Persist a bounded analysis result

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_add_supplier_analysis/migration.sql`
- Test: `src/server/analysis/contract.test.ts`

- [ ] Add an `AnalysisStatus` enum (`PROCESSING`, `COMPLETED`, `FAILED`) and a `SupplierAnalysis` model storing source URL, normalized URL, source type, status, JSON result, error message, and timestamps.
- [ ] Add a failing test that proves URL classification and result serialization reject non-HTTP URLs and preserve only public source links.
- [ ] Add the migration and contract implementation, then run `pnpm test -- src/server/analysis/contract.test.ts`.

### Task 2: Implement the public-page analysis service

**Files:**
- Create: `src/server/analysis/contract.ts`
- Create: `src/server/analysis/firecrawl.ts`
- Create: `src/server/analysis/service.ts`
- Modify: `src/lib/env.ts`
- Test: `src/server/analysis/service.test.ts`

- [ ] Write failing tests for Alibaba endpoint derivation: homepage, feedback page, TrustPass summary, and mobile product list; tests must reject login, contact, onsite, and CAPTCHA/404 responses.
- [ ] Implement Firecrawl calls with server-only credentials, a US location, strict timeouts, response-size limits, and no storage of session links, cookies, or contact tokens.
- [ ] Extract only company/product/ratings/public-signal evidence and return coverage plus explicit unavailable fields; run focused tests.

### Task 3: Add the analysis API and result persistence

**Files:**
- Create: `src/app/api/supplier-analysis/route.ts`
- Create: `src/server/analysis/repository.ts`
- Test: `src/app/api/supplier-analysis/route.test.ts`

- [ ] Write a failing route test for URL validation and a successful persisted analysis response.
- [ ] Implement the JSON API with Zod validation, rate-safe error responses, and persisted result records.
- [ ] Run the route and service tests.

### Task 4: Build the public input and result pages

**Files:**
- Create: `src/app/(public)/supplier-check/page.tsx`
- Create: `src/app/(public)/supplier-check/[id]/page.tsx`
- Create: `src/components/supplier-check/analysis-form.tsx`
- Create: `src/components/supplier-check/analysis-result.tsx`
- Modify: `src/components/layout/public-header.tsx`

- [ ] Add a URL-only form with loading, validation, and failure states.
- [ ] Render evidence coverage, company signals, product signals, limitations, and a neutral disclaimer.
- [ ] Add non-functional human-review CTA placeholders that preserve `analysisId`; checkout is a later vertical slice.
- [ ] Verify responsive rendering and keyboard accessibility.

### Task 5: Verify and document the handoff fields

**Files:**
- Modify: `.env.example`
- Modify: `docs/development-specs/11-environment-and-integration-runbook.md`

- [ ] Document `FIRECRAWL_API_KEY` and server URL configuration without secrets.
- [ ] Document later human-review intake fields: supplier URL prefilled from analysis; target product, destination market, procurement stage, estimated order value, and optional notes collected only after purchase intent.
- [ ] Run `pnpm test`, `pnpm typecheck`, and `pnpm lint`; record any pre-existing lint failures separately.
