-- Add half_and_half column to order_items table
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS half_and_half JSONB;

-- Add comment
COMMENT ON COLUMN order_items.half_and_half IS 'Stores half and half configuration with both products and their options';
