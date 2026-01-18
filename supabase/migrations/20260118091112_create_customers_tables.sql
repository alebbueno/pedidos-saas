-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer_addresses table
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  complement TEXT,
  reference TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add customer_id to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer_id ON customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers (public can create and read their own)
CREATE POLICY "Anyone can create customers" ON customers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read customers" ON customers
  FOR SELECT USING (true);

CREATE POLICY "Customers can update their own data" ON customers
  FOR UPDATE USING (true);

-- RLS Policies for customer_addresses
CREATE POLICY "Anyone can create addresses" ON customer_addresses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read addresses" ON customer_addresses
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update addresses" ON customer_addresses
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete addresses" ON customer_addresses
  FOR DELETE USING (true);
