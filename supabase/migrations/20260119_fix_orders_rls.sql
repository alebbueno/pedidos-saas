-- Fix RLS policies for orders and order_items to allow agent to create orders
-- Allow anyone to create orders (for agent and public checkout)
CREATE POLICY IF NOT EXISTS "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read orders (for admin and customer views)
CREATE POLICY IF NOT EXISTS "Anyone can read orders" ON orders
  FOR SELECT USING (true);

-- Allow anyone to update orders (for status changes)
CREATE POLICY IF NOT EXISTS "Anyone can update orders" ON orders
  FOR UPDATE USING (true);

-- Allow anyone to create order_items (for agent and public checkout)
CREATE POLICY IF NOT EXISTS "Anyone can create order_items" ON order_items
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read order_items
CREATE POLICY IF NOT EXISTS "Anyone can read order_items" ON order_items
  FOR SELECT USING (true);

-- Allow anyone to update order_items
CREATE POLICY IF NOT EXISTS "Anyone can update order_items" ON order_items
  FOR UPDATE USING (true);
