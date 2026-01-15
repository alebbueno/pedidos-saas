-- Seed Data for Pedidos SaaS

-- 1. Create a dummy user (Optional, usually handled by Auth)
-- For seed, we assume we will link manually or jus use the restaurant.

-- 2. Create Restaurant
INSERT INTO restaurants (id, name, slug, address, whatsapp_number, delivery_fee, is_open)
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Pizzaria Demo', 'demo-pizza', 'Rua das Pizzas, 123', '5511999999999', 5.00, true);

-- 3. Categories
INSERT INTO categories (id, restaurant_id, name, display_order) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Pizzas Tradicionais', 1),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Bebidas', 2);

-- 4. Products
-- Pizza Calabresa
INSERT INTO products (id, restaurant_id, category_id, name, description, base_price, image_url) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'Pizza Calabresa', 'Molho, mussarela e calabresa fatiada', 0.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800');

-- Coca Cola
INSERT INTO products (id, restaurant_id, category_id, name, description, base_price, image_url) VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e55', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'Coca-Cola 2L', 'Gelada', 12.00, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800');

-- 5. Option Groups
-- Tamanhos (Size)
INSERT INTO product_option_groups (id, product_id, name, type, min_selection, max_selection, price_rule) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f66', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 'Tamanho', 'single', 1, 1, 'sum');

-- Bordas (Edge)
INSERT INTO product_option_groups (id, product_id, name, type, min_selection, max_selection, price_rule) VALUES
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380177', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 'Borda', 'single', 0, 1, 'sum');

-- 6. Options
-- Sizes
INSERT INTO product_options (group_id, name, price_modifier) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f66', 'Pequena', 30.00),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f66', 'Média', 40.00),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f66', 'Grande', 50.00);

-- Borders
INSERT INTO product_options (group_id, name, price_modifier) VALUES
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380177', 'Sem Borda', 0.00),
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380177', 'Catupiry', 5.00),
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380177', 'Cheddar', 5.00);

-- Note: Half/Half logic requires assigning "Sabores" group.
-- For simple MVP demonstration, we instantiated a concrete Flavor "Calabresa". 
-- If we want "Montar Pizza", the Product would be "Pizza Personalizada" and Groups would include "Sabores".
