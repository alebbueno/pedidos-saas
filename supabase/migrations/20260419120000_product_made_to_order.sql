-- Produto sob encomenda: prazo em dias (calendário) informado ao cliente
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_made_to_order BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS made_to_order_lead_days INTEGER NULL;

COMMENT ON COLUMN products.is_made_to_order IS 'Quando true, o item é vendido como encomenda/sob demanda';
COMMENT ON COLUMN products.made_to_order_lead_days IS 'Prazo estimado em dias (calendário) quando is_made_to_order = true';

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_made_to_order_lead_days_check;
ALTER TABLE products
  ADD CONSTRAINT products_made_to_order_lead_days_check
  CHECK (
    made_to_order_lead_days IS NULL
    OR (made_to_order_lead_days >= 1 AND made_to_order_lead_days <= 366)
  );
