-- Enable RLS on tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;

-- Policies for Categories
CREATE POLICY "Owners can manage their categories" ON categories
    USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()))
    WITH CHECK (restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "Public can view categories" ON categories
    FOR SELECT USING (true);

-- Policies for Products
CREATE POLICY "Owners can manage their products" ON products
    USING (restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()))
    WITH CHECK (restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()));

CREATE POLICY "Public can view products" ON products
    FOR SELECT USING (true);

-- Policies for Option Groups (indirectly linked to restaurant via product)
-- Note: This requires a join or a denormalized restaurant_id. 
-- Since product_option_groups links to product_id, checking ownership is harder in standard RLS without joins.
-- A simpler approach for MVP is to allow all authenticated users to insert/update if they own the product.
-- Or better: Add restaurant_id to these tables? No, that denormalizes.
-- Use EXISTS clause.

CREATE POLICY "Owners can manage option groups" ON product_option_groups
    USING (product_id IN (SELECT id FROM products WHERE restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())))
    WITH CHECK (product_id IN (SELECT id FROM products WHERE restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid())));

CREATE POLICY "Public can view option groups" ON product_option_groups
    FOR SELECT USING (true);

CREATE POLICY "Owners can manage options" ON product_options
    USING (group_id IN (SELECT id FROM product_option_groups WHERE product_id IN (SELECT id FROM products WHERE restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()))))
    WITH CHECK (group_id IN (SELECT id FROM product_option_groups WHERE product_id IN (SELECT id FROM products WHERE restaurant_id IN (SELECT id FROM restaurants WHERE owner_id = auth.uid()))));

CREATE POLICY "Public can view options" ON product_options
    FOR SELECT USING (true);
