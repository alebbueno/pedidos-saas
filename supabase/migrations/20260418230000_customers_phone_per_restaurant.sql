-- Cliente vinculado à loja: mesmo telefone pode existir em restaurants diferentes.
-- Remove unicidade global de `phone` e garante unicidade (restaurant_id, phone).

ALTER TABLE customers ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;

-- Preenche restaurant_id a partir do pedido mais recente de cada cliente
UPDATE customers c
SET restaurant_id = o.restaurant_id
FROM (
    SELECT DISTINCT ON (customer_id) customer_id, restaurant_id
    FROM orders
    WHERE customer_id IS NOT NULL
    ORDER BY customer_id, created_at DESC
) o
WHERE c.id = o.customer_id
  AND c.restaurant_id IS NULL;

ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_phone_key;

CREATE UNIQUE INDEX IF NOT EXISTS customers_restaurant_id_phone_uidx
    ON customers (restaurant_id, phone)
    WHERE restaurant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customers_restaurant_id_phone ON customers (restaurant_id, phone);
