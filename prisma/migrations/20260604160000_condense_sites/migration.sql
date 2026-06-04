-- DropIndex (order no longer unique; sites can be reordered freely)
DROP INDEX IF EXISTS "Site_order_key";

-- CreateIndex (match/upsert sites by name so progress is preserved across updates)
CREATE UNIQUE INDEX "Site_name_key" ON "Site"("name");
