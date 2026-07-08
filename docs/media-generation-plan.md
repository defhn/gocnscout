# GoCNScout Realistic Media Generation Plan

This document records all website media assets that should be generated for GoCNScout, where they are used, whether they can be reused, and the final workspace filenames.

## Global Rules

- All images must use a realistic photographic or realistic data-terminal style.
- Do not use cartoon, flat illustration, decorative SVG, low-quality stock-photo style, or fake luxury visuals.
- Do not show real brands, real company names, personal names, phone numbers, emails, fax numbers, detailed addresses, postal codes, or private contact lists.
- Files are saved in `public/media/generated/`.
- Final website assets use `.webp`.
- Existing generated media may be overwritten when a clearer version is created.

## Reuse Decision

The shared images can be reused safely.

- The three diagnostic images are metric-level visuals, not city-specific or industry-specific facts. They can be reused on both industry detail pages and city detail pages:
  - `signal-website-verification.webp`
  - `signal-capital-registration.webp`
  - `signal-exhibition-stability.webp`
- The five city card background groups are intentionally generic industrial types. They are enough for the current reusable card-background layer:
  - port manufacturing
  - electronics or technology park
  - textile and light industry
  - hardware and machinery
  - home appliance factory
- City-specific landmark or factory-cluster images are not required now. If later a page needs a unique visual for a key city, generate a separate city-specific image at that time.

## Final Generated Assets

| # | File | Ratio | Primary use | Status |
|---|---|---:|---|---|
| 1 | `industry-trend-report.webp` | 16:9 | Industry detail overview trend/report visual | Done |
| 2 | `signal-website-verification.webp` | 1:1 | Website Verification Rate card | Done, reusable |
| 3 | `signal-capital-registration.webp` | 1:1 | Capital Registration Rate card | Done, reusable |
| 4 | `signal-exhibition-stability.webp` | 1:1 | Stand Session Stability card | Done, reusable |
| 5 | `locked-spreadsheet-preview.webp` | 16:9 | Locked export/paywall background | Done |
| 6 | `bento-cluster-cost.webp` | 4:3 | Home Bento: Cluster Cost Reductions | Done |
| 7 | `bento-logistics-port.webp` | 4:3 | Home Bento: Logistical Proximity | Done |
| 8 | `bento-skilled-labor.webp` | 4:3 | Home Bento: Specialized Labor Supply | Done |
| 9 | `workflow-select-category.webp` | 1:1 | Home Workflow 01 | Done |
| 10 | `workflow-apply-filters.webp` | 1:1 | Home Workflow 02 | Done |
| 11 | `workflow-inspect-profile.webp` | 1:1 | Home Workflow 03 | Done |
| 12 | `workflow-direct-vetting.webp` | 1:1 | Home Workflow 04 | Done |
| 13 | `directory-industry-matrix.webp` | 16:9 | Home Interactive Directory: industry category | Done |
| 14 | `directory-city-heatmap.webp` | 16:9 | Home Interactive Directory: sourcing city | Done |
| 15 | `city-industrial-cluster-aerial.webp` | 16:9 | City detail overview | Done |
| 16 | `city-port-manufacturing-underlay.webp` | 16:9 | City card background: port manufacturing | Done |
| 17 | `city-tech-park-underlay.webp` | 16:9 | City card background: electronics/tech park | Done |
| 18 | `city-light-industry-underlay.webp` | 16:9 | City card background: textile/light industry | Done |
| 19 | `city-hardware-machinery-underlay.webp` | 16:9 | City card background: hardware/machinery | Regenerated clearer version |
| 20 | `city-home-appliance-factory-underlay.webp` | 16:9 | City card background: home appliance factory | Regenerated clearer version |

## Image Prompts

### 1. Industry Trend Report

File: `industry-trend-report.webp`

Prompt:

```text
Create a realistic premium B2B sourcing intelligence scene for a website industry overview module. Show an executive desk with an open industry report, a large monitor displaying a clean export growth trend line chart, and a subtle modern factory or export logistics background through glass. Photorealistic, high-end consulting report meets Bloomberg-style data terminal, crisp professional photography. 16:9 wide composition, no visible brand logos, no readable private data, no phone numbers, no emails, no real company names, no watermark.
```

### 2. Website Verification Signal

File: `signal-website-verification.webp`

Prompt:

```text
Create a realistic premium cybersecurity and supplier website verification scene. Show a business laptop dashboard with a company website status panel, HTTPS padlock, green verified shield indicator, and subtle DNS or network signal lines on the screen. Square composition, polished B2B SaaS data terminal photography, slate gray and teal accents, no readable company names, no private contact data, no third-party logos.
```

### 3. Capital Registration Signal

File: `signal-capital-registration.webp`

Prompt:

```text
Create a realistic corporate finance audit scene representing supplier capital registration review. Show registration documents, a small balance scale, stacked coins, a factory blueprint, and a subtle approved audit mark on a desk. Square close-up, premium procurement due-diligence photography, cool slate and white paper with muted gold accents. No readable personal data, no government seals, no real company names, no phone numbers, no emails.
```

### 4. Exhibition Stability Signal

File: `signal-exhibition-stability.webp`

Prompt:

```text
Create a realistic trade exhibition stability scene. Show a premium procurement desk with exhibitor badges from multiple sessions, a subtle timeline board with repeat attendance markers, booth floorplan papers, and a small recognition object. Square close-up, exhibition hall softly blurred in the background, professional and credible. No real fair logos, no personal names, no private contact details, no excessive readable text.
```

### 5. Locked Spreadsheet Preview

File: `locked-spreadsheet-preview.webp`

Prompt:

```text
Create a realistic SaaS export dashboard and spreadsheet preview showing supplier rows, columns, filters, and export controls. The spreadsheet must be intentionally blurred so no rows or fields are readable. 16:9 screen close-up, white, slate, teal accents, visible locked/private columns as a visual paywall cue. No readable emails, phone numbers, company names, real Excel logo, brand logos, or actual private data.
```

### 6. Cluster Cost Reductions

File: `bento-cluster-cost.webp`

Prompt:

```text
Create a realistic industrial cluster cost-reduction scene for a B2B sourcing homepage card. Show a clean industrial park where component workshops, assembly facilities, internal logistics lanes, and warehouse docks are visually connected. Photorealistic, premium supply chain report style, 4:3 composition, no brands, no readable signage, no private data.
```

### 7. Logistical Proximity

File: `bento-logistics-port.webp`

Prompt:

```text
Create a realistic logistics proximity scene for a sourcing website. Show a factory warehouse loading containers directly onto trucks, with a container port and cargo ship visible in the background. Photorealistic industrial photography, 4:3 composition, clear and premium, no logos, no readable shipping labels, no private data.
```

### 8. Specialized Labor Supply

File: `bento-skilled-labor.webp`

Prompt:

```text
Create a realistic skilled labor and quality inspection scene. Show a quality engineer using calipers to inspect precision components near a clean production line. Photorealistic, professional manufacturing audit style, 4:3 composition, no visible personal identity, no brand logos, no readable private data.
```

### 9. Workflow: Select Category

File: `workflow-select-category.webp`

Prompt:

```text
Create a realistic sourcing workflow image showing a buyer using a desktop screen to select supplier industry categories from a structured database interface. Square composition, premium B2B SaaS and procurement setting, no readable personal data, no brand logos, no fake contact list.
```

### 10. Workflow: Apply Filters

File: `workflow-apply-filters.webp`

Prompt:

```text
Create a realistic data filtering scene showing a procurement analyst applying company scale, province, city, product keyword, and exporter-type filters on a clean database dashboard. Square composition, professional data terminal style, no readable private fields, no real company names, no logos.
```

### 11. Workflow: Inspect Public Profiles

File: `workflow-inspect-profile.webp`

Prompt:

```text
Create a realistic supplier profile inspection scene. Show a monitor with a structured public company profile, visible lock indicators for sensitive fields, and a magnifying glass or review notes nearby. Square composition, premium SaaS report style, no readable private contact data, no real companies, no brand logos.
```

### 12. Workflow: Direct Vetting

File: `workflow-direct-vetting.webp`

Prompt:

```text
Create a realistic factory vetting scene. Show a procurement auditor holding a clipboard in front of a clean production line, with checklist marks and quality control context. Square composition, professional sourcing due diligence style, no close-up faces, no private data, no logos.
```

### 13. Industry Category Matrix

File: `directory-industry-matrix.webp`

Prompt:

```text
Create a realistic data-terminal screen showing a structured matrix of industry categories for a supplier database. Use abstract blocks, charts, and category clusters without readable brand names or private data. 16:9 composition, premium analytics screen, cool slate and teal palette, no fake contact list.
```

### 14. China Coastal Manufacturing Heatmap

File: `directory-city-heatmap.webp`

Prompt:

```text
Create a realistic high-end data screen showing a China coastal manufacturing heatmap, with emphasis on coastal industrial regions and city cluster distribution. 16:9 composition, premium analytics terminal style, no political claims, no private data, no company names, no logos.
```

### 15. City Industrial Cluster Aerial

File: `city-industrial-cluster-aerial.webp`

Prompt:

```text
Create a realistic aerial-style view of a modern Chinese manufacturing cluster with factories, warehouses, logistics roads, and nearby port or freight infrastructure. 16:9 composition, premium industrial report visual, clear and detailed, no readable signage, no logos, no private data.
```

### 16. Port Manufacturing Underlay

File: `city-port-manufacturing-underlay.webp`

Prompt:

```text
Create a realistic low-contrast city card background showing port-side manufacturing, container cranes, logistics yards, warehouse roofs, and export trucks. 16:9 background plate, text-friendly, muted cool colors, no readable labels, no logos, no private data.
```

### 17. Tech Park Underlay

File: `city-tech-park-underlay.webp`

Prompt:

```text
Create a realistic low-contrast city card background showing a modern electronics or technology manufacturing park with clean factories, glass office buildings, loading areas, and orderly roads. 16:9 background plate, text-friendly, muted cool colors, no readable signage, no logos, no private data.
```

### 18. Light Industry Underlay

File: `city-light-industry-underlay.webp`

Prompt:

```text
Create a realistic low-contrast city card background showing textile or light-industry manufacturing with clean workshop rows, fabric rolls, packing stations, and warehouse lanes. 16:9 background plate, text-friendly, restrained colors, no readable labels, no logos, no private data.
```

### 19. Hardware Machinery Underlay

File: `city-hardware-machinery-underlay.webp`

Prompt used for regenerated clear version:

```text
Create a realistic, crisp industrial scene for hardware and machinery manufacturing. Show a clean modern CNC machining and metal hardware factory with visible lathes, milling machines, metal parts, pallets, tool racks, and a wide central aisle. Photorealistic industrial photography, premium B2B report style, wide 16:9 composition, enough empty space for text overlay. Bright neutral factory lighting, clear details, moderate contrast. Must be sharp and readable, low-contrast enough for a background but not washed out. No haze, no blur, no overexposure, no watermark, no logos, no readable brand names, no text.
```

### 20. Home Appliance Factory Underlay

File: `city-home-appliance-factory-underlay.webp`

Prompt used for regenerated clear version:

```text
Create a realistic, crisp home appliance manufacturing scene. Show a clean modern appliance assembly factory with rows of washing machine or air-conditioner units on assembly lines, quality testing stations, packaging cartons, conveyors, and a wide central aisle. Photorealistic industrial photography, premium B2B supply chain report style, wide 16:9 composition, enough calm negative space for text overlay. Bright neutral factory lighting, clear details, moderate contrast. Must be sharp and readable, low-contrast enough for a background but not washed out. No haze, no blur, no overexposure, no watermark, no logos, no readable brand names, no text.
```

## Conversion Verification

- `sharp` is installed as a development tool for future image conversion and compression.
- All 20 generated project assets are now `.webp`.
- `public/media/generated/` currently contains only the 20 final WebP files for this media batch.
- The last two industrial underlay images were regenerated because the earlier versions were too hazy.
