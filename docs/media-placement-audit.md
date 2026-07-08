# GoCNScout Media Placement Audit

Purpose: audit every current front-end image placement, identify image/text mismatches, and prepare exact prompts for replacement images. This document is an audit only. It does not request immediate generation.

## 1. Executive Summary

The current media insertion has three levels:

- Static homepage visuals: mostly acceptable.
- Reusable diagnostic and data visuals: acceptable.
- Dynamic industry/city cards using `getCityUnderlayAsset()`: not acceptable for many categories.

The core problem is that `src/config/media.ts` currently maps many different industries into only five generic backgrounds:

- electronics / technology park
- home appliance factory
- hardware / machinery factory
- textile / light industry
- port manufacturing fallback

This causes obvious mismatches. Example: `Medical Equipment & Supplies` currently maps to the CNC / machinery factory image because the text contains "machines". That is wrong.

## 2. Current Image Placements

### 2.1 Home Page `/`

| Placement | Current image | Verdict | Notes |
|---|---|---|---|
| Bento: Cluster Cost Reductions | `bento-cluster-cost.webp` | Match | Industrial cluster / internal logistics concept fits the copy. |
| Bento: Logistical Proximity | `bento-logistics-port.webp` | Match | Factory warehouse, container truck, port theme fits. |
| Bento: Specialized Labor Supply | `bento-skilled-labor.webp` | Match | QC engineer / inspection visual fits. |
| Workflow 01 Select Category | `workflow-select-category.webp` | Match | Buyer category filtering visual fits. |
| Workflow 02 Apply Scale Filters | `workflow-apply-filters.webp` | Match | Data filtering panel fits. |
| Workflow 03 Inspect Public Profiles | `workflow-inspect-profile.webp` | Match | Profile review / locked fields fits. |
| Workflow 04 Perform Direct Vetting | `workflow-direct-vetting.webp` | Match | Factory audit / clipboard fits. |
| Browse by Industry Category | `directory-industry-matrix.webp` | Match | Industry matrix data terminal fits. |
| Browse by Sourcing City | `directory-city-heatmap.webp` | Match | China coastal heatmap fits. |

Action: no replacement needed.

### 2.2 Industry List Page `/industries`

Current implementation: every standardized industry card uses `getCityUnderlayAsset(ind.name + ind.desc)`.

This is the largest mismatch area.

| Industry card | Current mapping result | Verdict | Required action |
|---|---|---|---|
| Consumer Electronics & Smart Gadgets | tech park | Match | Keep. |
| Hardware, Power Tools & Fasteners | hardware / machinery | Match | Keep. |
| Home Appliances & Kitchenware | home appliance factory | Partial | Home appliances fit; kitchenware/tableware needs a separate kitchenware image if used standalone. |
| Textiles, Garments & Fashion Apparel | light industry | Partial | Textile/fabric fits; garment apparel should use apparel/sewing line. |
| Machinery & Industrial Parts | hardware / machinery | Match | Keep. |
| Medical Equipment & Supplies | hardware / machinery because of "machines" | Mismatch | Needs medical devices / cleanroom / lab equipment image. |
| Auto Parts & Accessories | port fallback | Mismatch | Needs auto parts assembly / machining / vehicle components image. |
| New Energy & PV Solar | port fallback | Mismatch | Needs solar / battery / EV energy equipment image. |
| Building & Decorative Materials | port fallback | Mismatch | Needs building materials / tiles / glass / aluminum profiles image. |
| Furniture & Interior Decor | port fallback | Mismatch | Needs furniture woodworking / upholstery / panel furniture production image. |
| Lighting & LED Products | port fallback | Mismatch | Needs LED lighting assembly / testing line image. |
| Toys, Hobbies & Baby Products | port fallback | Mismatch | Needs toy / baby product clean assembly and packing image. |

### 2.3 Industry Detail Page `/industries/[slug]`

| Placement | Current image | Verdict | Notes |
|---|---|---|---|
| Overview image | `industry-trend-report.webp` | Match | Generic sourcing intelligence report fits all industry pages. |
| Website Verification Rate | `signal-website-verification.webp` | Match | Metric-level diagnostic image can be reused. |
| Capital Registration Rate | `signal-capital-registration.webp` | Match | Metric-level diagnostic image can be reused. |
| Stand Session Stability | `signal-exhibition-stability.webp` | Match | Metric-level diagnostic image can be reused. |
| Supplier Directory locked background | `locked-spreadsheet-preview.webp` | Match | Blurred spreadsheet/paywall visual fits. |
| Top Sourcing Cities cards | `getCityUnderlayAsset(city + industryName)` | Mixed | Works only when industryName matches one of the five current groups. Many industries are wrong. |

Action: Top Sourcing Cities cards should not use city-only or five-group matching for all categories. They need industry-aware image mapping.

### 2.4 City List Page `/cities`

| Placement | Current image | Verdict | Notes |
|---|---|---|---|
| Intro: Cluster Cost Reductions | `bento-cluster-cost.webp` | Match | Fits city cluster value proposition. |
| Intro: Logistical Proximity | `bento-logistics-port.webp` | Match | Fits port/logistics value proposition. |
| Intro: Specialized Labor Supply | `bento-skilled-labor.webp` | Match | Fits labor/inspection value proposition. |
| Fallback city cards | `getCityUnderlayAsset(city + specialty)` | Mostly OK | Because fallback city data includes specialty text. |
| Real city cards from DB | `getCityUnderlayAsset(city + title)` | Risk / mismatch | `title` is generic, so most cities fall back to port imagery. This is not accurate for cities like Zhongshan, Foshan, Quanzhou, Chaozhou, Jinhua, etc. |

Required action: real city cards should use dominant industry data, not `city.title`, or use a neutral industrial-cluster aerial that does not imply a wrong sector.

### 2.5 City Detail Page `/cities/[slug]`

| Placement | Current image | Verdict | Notes |
|---|---|---|---|
| Overview image | `city-industrial-cluster-aerial.webp` | Mostly match | Generic aerial industrial cluster can fit city detail pages. |
| Website Verification Rate | `signal-website-verification.webp` | Match | Reusable metric image. |
| Capital Registration Rate | `signal-capital-registration.webp` | Match | Reusable metric image. |
| Stand Session Stability | `signal-exhibition-stability.webp` | Match | Reusable metric image. |
| Supplier Directory locked background | `locked-spreadsheet-preview.webp` | Match | Fits locked fields and export preview. |

Action: no urgent replacement needed for city detail overview, but later key cities can get city-specific images.

## 3. Real Industry Mapping Audit

The following real industry categories exist in the database. The current five-image mapping is too coarse.

### 3.1 Can Keep Existing Images

| Industry | Use image |
|---|---|
| Home Appliances | `city-home-appliance-factory-underlay.webp` |
| Hardware | `city-hardware-machinery-underlay.webp` |
| Tools | `city-hardware-machinery-underlay.webp` |
| General Machinery and Mechanical Basic Parts | `city-hardware-machinery-underlay.webp` |
| Processing Machinery and Equipment | `city-hardware-machinery-underlay.webp` |
| Industrial Automation and Intelligent Manufacturing | `city-tech-park-underlay.webp` or new automation image |
| Construction and Engineering Machinery | Prefer new heavy machinery image; existing machinery image is only partial. |
| Consumer Electronics and Information Products | `city-tech-park-underlay.webp` |
| Electronic and Electrical Products | `city-tech-park-underlay.webp` or new electrical assembly image |
| Home Textiles | `city-light-industry-underlay.webp` |
| Textile Raw Materials and Fabrics | `city-light-industry-underlay.webp` |
| Garment Accessories and Parts | `city-light-industry-underlay.webp` |

### 3.2 Must Replace / Needs New Dedicated Images

| Industry | Current likely image | Problem | Needed asset |
|---|---|---|---|
| Household Items | port fallback | Too generic | household goods production / packing line |
| Kitchen and Tableware | home appliance factory due "kitchen" | Appliance line is not tableware | kitchenware/tableware production |
| Gifts & Premiums | port fallback | Wrong | gifts/premiums assembly and packaging |
| Food | port fallback | Wrong | food processing / packaged food production |
| Auto Parts | port fallback | Wrong | auto parts manufacturing |
| Men's and Women's Clothing | port fallback | Wrong | apparel sewing/garment factory |
| Fur, Leather, Down and Products | port fallback | Wrong | leather/down goods production |
| Sports, Travel and Leisure Products | port fallback | Wrong | sports/leisure goods manufacturing |
| Shoes / Footwear | port fallback | Wrong | footwear production line |
| Bathroom Equipment | port fallback | Wrong | sanitary ware / bathroom fixture production |
| Bags and Luggage | port fallback | Wrong | luggage/bag production line |
| Toys | port fallback | Wrong | toy production and packing |
| Garden Supplies | port fallback | Wrong | garden tools/outdoor supplies production |
| Office and School Supplies | port fallback | Wrong | stationery / school supplies production |
| Daily-use Ceramics | port fallback | Wrong | ceramics production |
| Medicines, Health Products and Medical Devices | machinery due "machines" / or port fallback | Wrong | medical devices / healthcare cleanroom |
| Lighting Products | port fallback | Wrong | LED lighting assembly and testing |
| New Materials and Chemical Products | port fallback | Wrong | chemical materials / lab-safe production |
| Glass Crafts | port fallback | Wrong | glass craft production |
| Power and Electrical Equipment | port fallback | Wrong | power/electrical equipment factory |
| Motorcycles | port fallback | Wrong | motorcycle assembly |
| Festive Supplies / Festival Supplies / Festive Products | port fallback | Wrong | seasonal decoration production |
| Underwear | port fallback | Wrong | apparel/underwear garment line |
| Personal Care Appliances | home appliance due "appliances" | Too generic | small personal-care appliance assembly |
| Baby and Maternity Products | port fallback | Wrong | baby products manufacturing |
| New Energy | port fallback | Wrong | solar/battery energy production |
| Agricultural Machinery | machinery partial | Needs agricultural equipment | agricultural machinery assembly |
| Woven, Rattan and Iron Crafts | port fallback | Wrong | woven/rattan/iron crafts workshop |
| Artistic Ceramics | port fallback | Wrong | ceramics craft production |
| Pet Supplies | port fallback | Wrong | pet supplies production |
| Children's Clothing | port fallback | Wrong | children apparel production |
| New Energy Vehicles and Smart Mobility | tech due smart? | Too generic | EV/smart mobility assembly |
| Bicycles | port fallback | Wrong | bicycle assembly |
| Carpets & Tapestries | port fallback | Wrong | carpet/textile weaving production |
| Integrated Housing and Courtyard Facilities | port fallback | Wrong | modular housing / courtyard facilities production |
| Clocks, Watches and Glasses | port fallback | Wrong | watch/glasses precision assembly |
| Vehicles | port fallback | Wrong | vehicle assembly / parts |

## 4. Required Replacement Image Set

To avoid one image per every 54 industries, use a controlled asset taxonomy. These 24 additions cover the current real categories without obvious mismatch.

### 4.1 `industry-household-goods-production.webp`

Use for: Household Items.

Prompt:

```text
Use case: photorealistic-natural
Asset type: website industry card image for GoCNScout, filename industry-household-goods-production.webp, ratio 16:9
Primary request: Create a realistic household goods manufacturing and packing scene with plastic storage boxes, cleaning tools, small home utility products, organized packing tables, cartons, and quality inspection stations.
Style/medium: photorealistic B2B manufacturing photography, premium sourcing report style.
Composition/framing: wide 16:9, clean factory depth, organized production and packing lanes, enough calm space for card text if cropped.
Lighting/mood: bright neutral industrial lighting, clean and trustworthy.
Constraints: no brand logos, no readable labels, no personal data, no phone numbers, no emails, no watermark, no cartoon.
```

### 4.2 `industry-kitchen-tableware-production.webp`

Use for: Kitchen and Tableware.

Prompt:

```text
Create a realistic kitchenware and tableware production scene: stainless cookware, ceramic plates, cutlery, silicone utensils, inspection benches, and export packing cartons in a clean factory. Photorealistic, premium B2B sourcing report style, 16:9 landscape. No logos, no readable labels, no private data, no people close-up, no watermark, no cartoon.
```

### 4.3 `industry-gifts-premiums-packaging.webp`

Use for: Gifts & Premiums, Festive Supplies, Festival Supplies, Festive Products.

Prompt:

```text
Create a realistic gifts and promotional products assembly and packaging scene with small gift items, boxed premiums, seasonal decorations, inspection tables, barcode-free cartons, and organized shelves. Photorealistic B2B manufacturing style, 16:9. No brand logos, no readable text, no private data, no fake contact information, no watermark.
```

### 4.4 `industry-food-processing.webp`

Use for: Food.

Prompt:

```text
Create a realistic clean food processing and packaged food production line with stainless steel equipment, sealed packages, quality-control stations, and hygienic factory lighting. 16:9 photorealistic industrial photography. No real food brands, no readable labels, no private data, no unsafe handling, no watermark.
```

### 4.5 `industry-auto-parts-manufacturing.webp`

Use for: Auto Parts, Vehicles.

Prompt:

```text
Create a realistic auto parts manufacturing scene with brake components, engine parts, sensors, machined metal parts, organized racks, quality inspection benches, and assembly stations. Photorealistic B2B factory photography, 16:9, clear and professional. No vehicle brand logos, no readable labels, no private data, no watermark.
```

### 4.6 `industry-apparel-garment-factory.webp`

Use for: Men's and Women's Clothing, Sportswear and Casual Wear, Underwear, Children's Clothing.

Prompt:

```text
Create a realistic garment factory scene with sewing machines, fabric cutting tables, neatly stacked apparel pieces, quality inspection, and export packing areas. Photorealistic, clean B2B sourcing style, 16:9. No fashion brand logos, no readable labels, no close-up faces, no private data, no watermark.
```

### 4.7 `industry-leather-down-products.webp`

Use for: Fur, Leather, Down and Products.

Prompt:

```text
Create a realistic leather and down goods production scene with leather panels, stitching stations, down jacket or soft goods filling area, pattern tables, and export inspection shelves. Photorealistic manufacturing report style, 16:9. No luxury brand logos, no readable labels, no private data, no watermark.
```

### 4.8 `industry-sports-leisure-products.webp`

Use for: Sports, Travel and Leisure Products.

Prompt:

```text
Create a realistic sports and travel leisure goods manufacturing scene with fitness accessories, outdoor equipment, travel gear parts, assembly benches, testing stations, and export cartons. Photorealistic B2B sourcing style, 16:9. No logos, no readable labels, no private data, no watermark.
```

### 4.9 `industry-footwear-production.webp`

Use for: Shoes, Footwear.

Prompt:

```text
Create a realistic footwear production line with shoe uppers, soles, stitching, glue-free visible assembly, inspection benches, and packed export cartons. Photorealistic factory photography, 16:9, clean and organized. No brand logos, no readable labels, no close-up faces, no watermark.
```

### 4.10 `industry-sanitary-bathroom-fixtures.webp`

Use for: Bathroom Equipment.

Prompt:

```text
Create a realistic sanitary ware and bathroom fixture manufacturing scene with ceramic basins, faucets, shower components, inspection benches, glazing or polishing area, and packed fixtures. Photorealistic B2B manufacturing style, 16:9. No brand logos, no readable labels, no private data, no watermark.
```

### 4.11 `industry-bags-luggage-production.webp`

Use for: Bags and Luggage.

Prompt:

```text
Create a realistic luggage and bag production scene with suitcase shells, fabric panels, stitching stations, handle and wheel assembly, inspection tables, and export packing cartons. Photorealistic, clean factory style, 16:9. No brand logos, no readable labels, no private data, no watermark.
```

### 4.12 `industry-toys-baby-products.webp`

Use for: Toys, Baby and Maternity Products.

Prompt:

```text
Create a realistic toy and baby products manufacturing scene with educational toys, baby feeding items, stroller components, safe material inspection, clean assembly tables, and export cartons. Photorealistic B2B sourcing style, 16:9. No child faces, no brand logos, no readable labels, no private data, no watermark.
```

### 4.13 `industry-garden-outdoor-supplies.webp`

Use for: Garden Supplies.

Prompt:

```text
Create a realistic garden and outdoor supplies manufacturing scene with garden tools, planters, hoses, outdoor equipment parts, organized assembly benches, and export packaging. Photorealistic, 16:9, clean industrial setting. No logos, no readable labels, no private data, no watermark.
```

### 4.14 `industry-office-school-supplies.webp`

Use for: Office and School Supplies.

Prompt:

```text
Create a realistic office and school supplies production scene with notebooks, pens, binders, stationery sets, cutting/printing/packing stations, quality inspection tables, and export cartons. Photorealistic B2B manufacturing style, 16:9. No brand logos, no readable labels, no private contact data, no watermark.
```

### 4.15 `industry-ceramics-production.webp`

Use for: Daily-use Ceramics, Artistic Ceramics.

Prompt:

```text
Create a realistic ceramics production scene with ceramic cups, plates, glazing area, kiln-adjacent production space, inspection tables, and export packing boxes. Photorealistic industrial craft manufacturing style, 16:9. No brand logos, no readable labels, no private data, no watermark.
```

### 4.16 `industry-medical-health-devices.webp`

Use for: Medicines, Health Products and Medical Devices, Medical Equipment & Supplies fallback card.

Prompt:

```text
Create a realistic medical devices and healthcare products manufacturing scene with cleanroom-style assembly benches, diagnostic device components, sealed consumables, laboratory testing equipment, workers in protective clothing viewed from a distance, and sterile packaging stations. Photorealistic B2B manufacturing report style, 16:9. No hospital patients, no medicine brand labels, no readable private data, no logos, no watermark.
```

### 4.17 `industry-led-lighting-assembly.webp`

Use for: Lighting Products.

Prompt:

```text
Create a realistic LED lighting products assembly and testing line with downlights, LED strips, circuit boards, optical testing equipment, burn-in racks, and export packing cartons. Photorealistic, premium manufacturing style, 16:9. No brand logos, no readable labels, no private data, no watermark.
```

### 4.18 `industry-chemical-new-materials.webp`

Use for: New Materials and Chemical Products.

Prompt:

```text
Create a realistic new materials and chemical products production scene with safe laboratory testing benches, polymer material samples, sealed containers, industrial mixing equipment in the background, and quality-control instruments. Photorealistic B2B industrial report style, 16:9. No hazardous spill, no brand labels, no readable text, no private data, no watermark.
```

### 4.19 `industry-glass-crafts-production.webp`

Use for: Glass Crafts.

Prompt:

```text
Create a realistic glass crafts production scene with glassware, decorative glass items, polishing benches, inspection lights, protective work surfaces, and export packing area. Photorealistic craft manufacturing style, 16:9. No logos, no readable labels, no private data, no watermark.
```

### 4.20 `industry-power-electrical-equipment.webp`

Use for: Power and Electrical Equipment, Electronic and Electrical Products if not consumer electronics.

Prompt:

```text
Create a realistic power and electrical equipment manufacturing scene with electrical cabinets, transformers or control panels, wiring harness inspection, test benches, and organized factory lanes. Photorealistic B2B industrial photography, 16:9. No brand logos, no readable labels, no private data, no watermark.
```

### 4.21 `industry-motorcycle-bicycle-assembly.webp`

Use for: Motorcycles, Bicycles, New Energy Vehicles and Smart Mobility.

Prompt:

```text
Create a realistic two-wheel mobility assembly scene with motorcycle frames, bicycle frames, electric scooter or e-bike components, wheel assembly, battery inspection benches, and organized export packing. Photorealistic factory photography, 16:9. No vehicle brand logos, no readable labels, no private data, no watermark.
```

### 4.22 `industry-personal-care-appliances.webp`

Use for: Personal Care Appliances.

Prompt:

```text
Create a realistic personal care appliance assembly scene with electric shavers, hair dryers, grooming devices, small motor components, testing fixtures, inspection benches, and clean packaging stations. Photorealistic B2B manufacturing style, 16:9. No brand logos, no readable labels, no private data, no watermark.
```

### 4.23 `industry-agricultural-machinery.webp`

Use for: Agricultural Machinery.

Prompt:

```text
Create a realistic agricultural machinery manufacturing scene with small tractors, tiller components, irrigation equipment parts, metal frames, assembly benches, and export packaging area. Photorealistic industrial factory style, 16:9. No brand logos, no readable labels, no private data, no watermark.
```

### 4.24 `industry-crafts-woven-rattan-iron.webp`

Use for: Woven, Rattan and Iron Crafts, Carpets & Tapestries.

Prompt:

```text
Create a realistic woven, rattan, iron craft, carpet and tapestry production scene with weaving benches, rattan material, metal craft frames, textile rolls, inspection tables, and export packaging. Photorealistic craft manufacturing style, 16:9. No brand logos, no readable labels, no private data, no watermark.
```

### 4.25 `industry-modular-building-facilities.webp`

Use for: Integrated Housing and Courtyard Facilities.

Prompt:

```text
Create a realistic modular building and courtyard facilities manufacturing scene with prefabricated wall panels, courtyard fixtures, outdoor structural parts, assembly lanes, and warehouse loading area. Photorealistic B2B construction materials style, 16:9. No brand logos, no readable labels, no private data, no watermark.
```

### 4.26 `industry-watches-glasses-precision.webp`

Use for: Clocks, Watches and Glasses.

Prompt:

```text
Create a realistic precision assembly scene for clocks, watches, and glasses with watch components, eyewear frames, small tools, inspection microscopes, clean benches, and organized component trays. Photorealistic premium manufacturing style, 16:9. No luxury brand logos, no readable labels, no private data, no watermark.
```

### 4.27 `industry-building-materials.webp`

Use for: Building and Decoration Materials.

Prompt:

```text
Create a realistic building and decoration materials production scene with ceramic tiles, aluminum profiles, architectural glass panels, PVC flooring rolls, inspection benches, and warehouse racks. Photorealistic B2B manufacturing style, 16:9. No brand logos, no readable labels, no private data, no watermark.
```

### 4.28 `industry-furniture-interior-production.webp`

Use for: Furniture & Interior Decor.

Prompt:

```text
Create a realistic furniture and interior decor manufacturing scene with panel furniture parts, woodworking machinery, upholstery stations, mattress or chair components, inspection benches, and export packaging. Photorealistic factory photography, 16:9. No brand logos, no readable labels, no private data, no watermark.
```

## 5. City Card Strategy

Current real city cards use:

```ts
getCityUnderlayAsset(`${city.city} ${city.title}`)
```

This is weak because `city.title` is generic, for example `Hangzhou Export Manufacturers & B2B Suppliers | China Sourcing Atlas`. It does not contain dominant sectors.

There is also a visual-quality problem after these images were placed inside dark city cards. The current generic city-card backgrounds become too hazy and too low-information under the dark overlay. They do not give enough visual confidence, especially on cards such as Anqing, where the background looks like an indistinct dark factory silhouette rather than a clear sourcing-cluster image.

Recommended replacement logic:

1. For `/cities` real DB cards, either:
   - use a neutral city industrial cluster image for all cards, or
   - query each city’s top industry and map by that industry.
2. Do not infer city manufacturing sector from city name only unless it is a known major cluster and explicitly mapped.

### City-Specific Images Not Required Yet

Do not generate one image for every city now. That is too many and not necessary. Use industry-dominant images or a neutral aerial cluster image.

### Required Neutral City Card Replacement Images

These two city-card background images must be regenerated and replaced because they are now used behind dark overlay cards and need to remain clear, structured, and readable after darkening.

#### 5.1 `city-neutral-industrial-cluster-card.webp`

Use for: real DB city cards when no dominant industry is available.

File: `city-neutral-industrial-cluster-card.webp`

Prompt:

```text
Use case: photorealistic-natural
Asset type: dark-overlay city card background for GoCNScout, filename city-neutral-industrial-cluster-card.webp, ratio 16:9
Primary request: Create a realistic neutral Chinese manufacturing city cluster background for small website cards. Show factory roofs, warehouse lanes, logistics roads, container trucks, and light industrial buildings from a slightly elevated angle.
Style/medium: photorealistic industrial cluster photography, premium B2B sourcing database style.
Composition/framing: 16:9 landscape, clear foreground-to-background structure, strong silhouettes and readable factory geometry after a dark overlay is applied, no important detail only in the far distance.
Lighting/mood: clear daytime industrial light, moderately high clarity, not foggy, not washed out, not overly dark.
Color palette: cool industrial gray, muted teal, white roofs, asphalt roads; enough contrast for dark-card use.
Constraints: do not imply a specific industry such as medical, toys, auto, textiles, or electronics. No logos, no readable signage, no private data, no phone numbers, no emails, no watermark, no cartoon.
Avoid: haze, fog, skyline-only views, overly distant aerials, blank roofs only, cinematic darkness, low-contrast blur.
```

#### 5.2 `city-dense-export-industrial-park-card.webp`

Use for: city cards where the page wants a stronger manufacturing-cluster feeling but still cannot safely infer a specific industry.

File: `city-dense-export-industrial-park-card.webp`

Prompt:

```text
Use case: photorealistic-natural
Asset type: dark-overlay city card background for GoCNScout, filename city-dense-export-industrial-park-card.webp, ratio 16:9
Primary request: Create a realistic dense export-oriented industrial park scene for city cards. Show clean factory buildings, loading docks, parked container trucks, small warehouse courtyards, internal roads, and orderly logistics movement.
Style/medium: photorealistic B2B manufacturing and export logistics photography.
Composition/framing: 16:9 landscape, medium-elevated view, clear readable shapes after dark overlay, visible industrial activity without being crowded, useful negative space for text.
Lighting/mood: crisp daytime light, clear details, practical sourcing-intelligence feel.
Color palette: neutral concrete, steel gray, muted teal logistics accents, white warehouse roofs.
Constraints: industry-neutral, no specific products, no logos, no readable signage, no license plates, no private data, no phone numbers, no emails, no watermark, no cartoon.
Avoid: foggy aerial view, abstract skyline, empty dark warehouse, excessive shadows, unreadable haze, fantasy or stock-photo look.
```

## 6. Implementation Notes For Tomorrow

After the replacement images are generated:

1. Add new paths to `src/config/media.ts`.
2. Replace `getCityUnderlayAsset()` with a more complete `getIndustryVisualAsset(input)` mapping.
3. Use `getIndustryVisualAsset(industryName)` for:
   - `/industries` standardized industry cards
   - `/industries` real DB industry cards
   - `/industries/[slug]` Top Sourcing Cities cards
4. For `/cities` real DB cards:
   - best: query dominant city industries and map to `getIndustryVisualAsset(topIndustryName)`
   - acceptable: use `city-neutral-industrial-cluster-card.webp`
5. Keep the current static homepage, diagnostic, directory matrix, heatmap, and locked spreadsheet images.

## 7. Highest Priority Fix List

Generate these first because they fix the most visible mismatches:

1. `industry-medical-health-devices.webp`
2. `industry-auto-parts-manufacturing.webp`
3. `industry-new-energy` equivalent: use `industry-power-electrical-equipment.webp` plus a solar/battery-specific image if possible.
4. `industry-building-materials.webp`
5. `industry-furniture-interior-production.webp`
6. `industry-led-lighting-assembly.webp`
7. `industry-toys-baby-products.webp`
8. `industry-office-school-supplies.webp`
9. `industry-apparel-garment-factory.webp`
10. `city-neutral-industrial-cluster-card.webp`
