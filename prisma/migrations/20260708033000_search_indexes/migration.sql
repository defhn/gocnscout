CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "Supplier_exhibitorName_trgm_idx"
ON "Supplier" USING gin ("exhibitorName" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Supplier_industryName_trgm_idx"
ON "Supplier" USING gin ("industryName" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Supplier_productsText_trgm_idx"
ON "Supplier" USING gin ("productsText" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Supplier_keywordsText_trgm_idx"
ON "Supplier" USING gin ("keywordsText" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Supplier_city_trgm_idx"
ON "Supplier" USING gin ("city" gin_trgm_ops);
