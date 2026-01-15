-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Restaurants (Tenants)
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    whatsapp_number TEXT,
    address TEXT,
    opening_hours TEXT,
    delivery_fee DECIMAL(10, 2) DEFAULT 0.00,
    is_open BOOLEAN DEFAULT TRUE,
    subscription_status TEXT DEFAULT 'trialing', -- active, trialing, past_due, canceled
    stripe_customer_id TEXT,
    ai_config JSONB DEFAULT '{}'::JSONB -- { "prompt": "...", "welcome_message": "..." }
);

-- Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Option Groups (e.g., Size, Border)
CREATE TABLE product_option_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "Tamanho", "Borda"
    type TEXT NOT NULL CHECK (type IN ('single', 'multiple')),
    min_selection INTEGER DEFAULT 0,
    max_selection INTEGER DEFAULT 1,
    price_rule TEXT DEFAULT 'sum', -- 'sum', 'highest', 'average'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Options (e.g., Small, Large, Catupiry)
CREATE TABLE product_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES product_option_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price_modifier DECIMAL(10, 2) DEFAULT 0.00,
    is_available BOOLEAN DEFAULT TRUE
);

-- Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_order_at TIMESTAMP WITH TIME ZONE
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'new', -- new, confirmed, preparing, delivery, completed, canceled
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method TEXT, -- 'pix', 'card_machine', 'online'
    delivery_type TEXT, -- 'delivery', 'pickup'
    delivery_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id), -- No cascade to keep history ideally, but for MVP cascade is ok or set null
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    options_selected JSONB -- [{ "group_name": "Tamanho", "option_name": "Grande", "price": 0 }]
);

-- RLS Policies (Simplified for MVP - assuming public read for menu, authenticated read for admin)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Public Access Policies (For Menu)
CREATE POLICY "Public restaurants read" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Public categories read" ON categories FOR SELECT USING (true);
CREATE POLICY "Public products read" ON products FOR SELECT USING (true);
CREATE POLICY "Public options read" ON product_option_groups FOR SELECT USING (true);
CREATE POLICY "Public option values read" ON product_options FOR SELECT USING (true);

-- Admin Access Policies (TODO: Add auth.uid() checks mapped to restaurant owners)
-- For MVP, we might use a simple 'owner_id' column in restaurants or a join table.
-- Adding owner_id to restaurants for simplicity:
ALTER TABLE restaurants ADD COLUMN owner_id UUID REFERENCES auth.users(id);

CREATE POLICY "Owners can do everything on their restaurant" ON restaurants 
FOR ALL USING (auth.uid() = owner_id);

-- Helper policies need traversing, for MVP we can be permissive or write specific policies.
