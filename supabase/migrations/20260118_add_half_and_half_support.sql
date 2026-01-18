-- Add half and half support to products and restaurants
-- Migration: add_half_and_half_support

-- Add allows_half_and_half column to products table (deprecated - use category level)
ALTER TABLE products 
ADD COLUMN allows_half_and_half BOOLEAN DEFAULT FALSE;

-- Add allows_half_and_half to categories table (primary method)
ALTER TABLE categories
ADD COLUMN allows_half_and_half BOOLEAN DEFAULT FALSE;

-- Add half_and_half_pricing_method column to restaurants table
-- Options: 'highest', 'average', 'sum'
-- Default: 'highest' (most common pricing strategy)
ALTER TABLE restaurants 
ADD COLUMN half_and_half_pricing_method TEXT DEFAULT 'highest' 
CHECK (half_and_half_pricing_method IN ('highest', 'average', 'sum'));

-- Add comments for documentation
COMMENT ON COLUMN products.allows_half_and_half IS 'DEPRECATED: Use category-level setting instead. Indicates if this product can be ordered as half and half';
COMMENT ON COLUMN categories.allows_half_and_half IS 'Indicates if products in this category can be combined in half and half orders (e.g., different pizza flavors)';
COMMENT ON COLUMN restaurants.half_and_half_pricing_method IS 'Pricing method for half and half products: highest (use highest price), average (average both prices), sum (sum both prices)';
