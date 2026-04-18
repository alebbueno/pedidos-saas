-- Multi-segment catalog (NOVA_REGRA.md — Fase 1)
-- restaurants.segment: business vertical
-- products.product_type: how the product behaves in catalog/checkout

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS segment TEXT NOT NULL DEFAULT 'food';

ALTER TABLE restaurants
  DROP CONSTRAINT IF EXISTS restaurants_segment_check;

ALTER TABLE restaurants
  ADD CONSTRAINT restaurants_segment_check
  CHECK (segment IN ('food', 'fashion', 'handcraft', 'retail'));

COMMENT ON COLUMN restaurants.segment IS 'Business segment: drives segmentRules (food, fashion, handcraft, retail)';

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT 'customizable';

ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_product_type_check;

ALTER TABLE products
  ADD CONSTRAINT products_product_type_check
  CHECK (product_type IN ('simple', 'customizable', 'variant', 'composed'));

COMMENT ON COLUMN products.product_type IS 'simple | customizable | variant | composed — aligned with product_config.type';

CREATE INDEX IF NOT EXISTS idx_restaurants_segment ON restaurants(segment);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON products(product_type);
