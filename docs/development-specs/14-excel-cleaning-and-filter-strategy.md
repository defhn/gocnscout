# Excel Cleaning, Translation, and Filter Strategy

This document summarizes the data strategy for importing `139th Canton Fair Exhibitor Database (Full Version).xlsx` into gocnscout.

## Source File Summary

- File: `139th Canton Fair Exhibitor Database (Full Version).xlsx`
- Sheet: `Sheet1`
- Rows: 20,291 supplier rows
- Columns: 32
- Language: Chinese source fields with mixed English product keywords and website values

Source columns:

1. 琛屼笟
2. 灞曞晢鍚嶇О
3. 璐熻矗浜?4. 鎵嬫満
5. 鐢佃瘽
6. 浼犵湡
7. 閭
8. 瀹樼綉
9. 鐪佷唤
10. 鍩庡競
11. 鍦板潃
12. 閭紪
13. 涓昏惀浜у搧
14. 涓昏惀鍏抽敭璇?15. 鎴愮珛鏃堕棿
16. 娉ㄥ唽璧勯噾
17. 浼佷笟瑙勬ā
18. 浼佷笟绫诲瀷
19. 璐告槗褰㈠紡
20. 鍙傚睍鍘嗗彶
21. 浼佷笟鎬ц川
22. 鍒涙柊濂?23. CF濂?24. 澶氬眾鍙傚睍
25. 鍝佺墝灞曞晢
26. 涓崕鑰佸瓧鍙?27. 涔℃潙鎸叴鐗硅壊灞曞晢
28. 鏂板睍鍟?29. isSpecializedSpecializedSpecialNewEnterprise
30. 缁胯壊濂栧睍鍟?31. 娴峰叧璁よ瘉灞曞晢
32. 楂樻柊灞曞晢

## Product Principle

The database should not be treated as a public contact list. It should become a structured supplier research database.

Store:

- complete non-sensitive public business fields
- private contact fields in a separate restricted table
- original source row JSON
- English translations for public site and dashboard use
- Chinese fields where useful for audit, admin review, and bilingual search
- future filter signals even if they are not opened immediately

Never expose in public pages, exports, reports, or free/paid UI:

- contact person
- mobile number
- phone number
- fax number
- email
- full street address
- postal code

## Database Field Strategy

### Supplier Main Record

Keep current compatibility fields while adding richer bilingual and filter fields.

Recommended public/display fields:

- `industryName`: English display industry for existing UI compatibility
- `industryNameCn`
- `industryNameEn`
- `industrySlug`
- `exhibitorName`: English display name where translated, otherwise Chinese fallback
- `exhibitorNameCn`
- `exhibitorNameEn`
- `province`: English display province
- `provinceCn`
- `provinceEn`
- `provinceCode`
- `city`: English display city
- `cityCn`
- `cityEn`
- `citySlug`
- `websiteRaw`
- `websiteUrl`
- `websiteDomain`
- `websiteStatus`
- `websiteType`
- `productsText`: English product text
- `productsTextCn`
- `productsTextEn`
- `keywordsText`: English keyword text
- `keywordsTextCn`
- `keywordsTextEn`
- `productKeywordsCn`
- `productKeywordsEn`
- `foundedYear`
- `foundedYearRange`
- `registeredCapital`
- `registeredCapitalRaw`
- `registeredCapitalRmb`
- `registeredCapitalRange`
- `companySize`: English display company size
- `companySizeCn`
- `companySizeEn`
- `companySizeCode`
- `companyType`: English display company type
- `companyTypeCn`
- `companyTypeEn`
- `companyTypeCode`
- `tradeModes`
- `tradeModesRaw`
- `exhibitorHistory`
- `exhibitionSessions`
- `firstExhibitionSession`
- `lastExhibitionSession`
- `exhibitionSessionCount`
- `companyNature`: English display company nature
- `companyNatureCn`
- `companyNatureEn`
- `companyNatureCode`
- `region`
- `industrialCluster`
- `stabilityScore`
- `capabilityScore`
- `dataQualityScore`
- `searchText`
- `searchTextCn`
- `searchTextEn`

### Private Data

Keep separate and restricted:

- `contactPerson`
- `contactPersonCn`
- `contactPersonEn`
- `mobile`
- `phone`
- `fax`
- `email`
- `fullAddress`
- `fullAddressCn`
- `fullAddressEn`
- `postalCode`
- `rawJson`

### Supplier Signals

Store all Y/N source flags, even if not immediately public:

- `innovationAward`
- `cantonFairDesignAward`
- `multiSessionExhibitor`
- `brandExhibitor`
- `chinaTimeHonoredBrand`
- `ruralRevitalizationExhibitor`
- `newExhibitor`
- `specializedSpecialNewEnterprise`
- `greenAwardExhibitor`
- `customsCertifiedExhibitor`
- `highTechEnterprise`
- `hasAnyAward`
- `hasCertificationSignal`
- `hasBrandSignal`
- `hasInnovationSignal`

### Product Keyword Records

Create one row per product or keyword token:

- `supplierId`
- `keywordCn`
- `keywordEn`
- `keywordSlug`
- `sourceField`: `products`, `keywords`, or `ai_cluster`
- `clusterName`
- `confidence`

This supports product filters, SEO pages, shortlist matching, and future keyword clusters.

### Source Raw Row

Every imported row should preserve:

- source file
- sheet name
- row number
- row hash
- raw JSON
- deterministic cleaned JSON
- AI translated JSON
- cleaning status
- error message

This is required for auditability and resume/retry behavior.

## Filter Strategy

The product value comes from narrowing supplier pools, not from displaying a static directory.

### Basic Filters

Open early:

- Search keyword
- Industry
- Product keyword
- Province
- City
- Company type
- Company size
- Trade mode
- Company nature
- Founded year range
- Registered capital range
- Has website

### Advanced Filters

Best for Pro/Team:

- Website status
- Website type
- Region
- Industrial cluster
- Attended latest session
- First exhibition session
- Last exhibition session
- Exhibition session count
- Multi-session exhibitor
- Brand exhibitor
- New exhibitor
- High-tech enterprise
- Customs certified exhibitor
- Green award exhibitor
- Innovation award
- Canton Fair design award
- Specialized and Innovative SME
- China Time-honored Brand
- Has products
- Has keywords
- Has province/city
- Data quality score
- Stability score
- Capability score

### Filter Panel Order

1. Search
2. Order results by
3. Industry
4. Product Keywords
5. Province
6. City
7. Region
8. Company Type
9. Company Size
10. Company Nature
11. Trade Mode
12. Founded Year
13. Registered Capital
14. Website
15. Exhibition History
16. Supplier Signals
17. Data Quality

## Translation Strategy

Do not send every field to DeepSeek. Use three layers.

### Deterministic Dictionaries

Use local dictionaries for:

- industry
- province
- city where known
- company size
- company type
- company nature
- trade mode
- Y/N signal fields

### Rule-Based Cleaning

Use local code for:

- URL normalization
- website type detection
- invalid website detection
- founded year parsing
- registered capital parsing
- exhibition history parsing
- product token splitting
- row hash creation
- slug creation

### DeepSeek Translation

Use DeepSeek for:

- exhibitor English name
- product English terms
- keyword English terms
- address English translation for admin/private data
- optional product cluster labels

DeepSeek must return strict JSON and must not invent:

- websites
- certifications
- supplier verification
- factory status
- products not present in the row

## Two-Stage Execution Strategy

The safest workflow is two-stage:

1. **Clean locally first**
   - Read Excel.
   - Run deterministic cleaning.
   - Run DeepSeek translation.
   - Save cleaned records to local JSONL files.
   - Resume from local checkpoint files.
   - Validate local output before touching the production database.

2. **Sync to database after validation**
   - Read local JSONL output.
   - Run structural checks.
   - Insert/upsert to Neon in batches.
   - Update directory pages, supplier signals, raw rows, and keyword tables.

This prevents partial AI failures from polluting the database and makes manual sampling easier before import.

Local output paths:

- `.import-state/canton-fair-cleaned.jsonl`
- `.import-state/canton-fair-failed.jsonl`
- `.import-state/canton-fair-clean-state.json`
- `.import-state/canton-fair-sync-state.json`

## DeepSeek Local Cleaning Rules

The import script must support:

- 10 concurrent DeepSeek requests
- test mode with first 10 rows
- continue to full local cleaning only after all 10 test rows succeed
- resume from existing local cleaned `sourceRowHash`
- progress printed continuously in the PowerShell window
- progress summary every 500 rows
- pause 30 seconds after every 500 rows
- retry failed DeepSeek batch twice
- each retry timeout must be no longer than 20 seconds
- after two retries, record failed rows
- after the main pass, retry failed rows once more
- write local cleaned JSONL every 250 successful rows
- never write to the database during DeepSeek cleaning

## Database Sync Rules

The sync script must support:

- validate local JSONL before operational use
- read `.import-state/canton-fair-cleaned.jsonl`
- skip already imported rows by `sourceRowHash`
- write to Neon every 250 rows in one transaction
- create/update supplier, private data, source raw row, signal row, product keyword rows, and directory page rows
- create an `ImportJob` record for sync progress
- write `.import-state/canton-fair-sync-report.json`

## Acceptance Criteria

- The raw Excel file is never committed to GitHub.
- Sensitive contact fields remain in private tables only.
- The public supplier table has English display fields.
- Chinese fields remain available for admin and bilingual search.
- All 11 signal columns are preserved.
- Product keywords are split into a dedicated keyword table.
- The script can be stopped and rerun without duplicating suppliers.
- Test cleaning of 10 rows must succeed before full cleaning begins.
- Full cleaning prints progress and pauses as required.
- Database sync is a separate command after local validation.

