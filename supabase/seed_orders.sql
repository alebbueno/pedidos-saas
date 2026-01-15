-- 1. Create Customers
INSERT INTO customers (id, restaurant_id, name, phone, address) VALUES
('aaa00000-0000-0000-0000-000000000001', 'ff1e6c98-21e3-4f33-8ce7-d02b72445519', 'João Silva', '5511999990001', 'Rua das Flores, 100 - Apt 101'),
('aaa00000-0000-0000-0000-000000000002', 'ff1e6c98-21e3-4f33-8ce7-d02b72445519', 'Maria Oliveira', '5511999990002', 'Av. Paulista, 500 - Bloco B'),
('aaa00000-0000-0000-0000-000000000003', 'ff1e6c98-21e3-4f33-8ce7-d02b72445519', 'Carlos Santos', '5511999990003', 'Rua Augusta, 800')
ON CONFLICT (id) DO NOTHING;

-- 2. Create Orders (Different Statuses)

-- Order 1: NEW (Novo)
INSERT INTO orders (id, restaurant_id, customer_id, status, total_amount, delivery_type, payment_method, delivery_address, created_at) VALUES
('bbb00000-0000-0000-0000-000000000001', 'ff1e6c98-21e3-4f33-8ce7-d02b72445519', 'aaa00000-0000-0000-0000-000000000001', 'new', 62.00, 'delivery', 'pix', 'Rua das Flores, 100 - Apt 101', NOW())
ON CONFLICT (id) DO NOTHING;

-- Order 2: PREPARING (Em Preparo)
INSERT INTO orders (id, restaurant_id, customer_id, status, total_amount, delivery_type, payment_method, delivery_address, created_at) VALUES
('bbb00000-0000-0000-0000-000000000002', 'ff1e6c98-21e3-4f33-8ce7-d02b72445519', 'aaa00000-0000-0000-0000-000000000002', 'preparing', 45.00, 'delivery', 'credit_card', 'Av. Paulista, 500 - Bloco B', NOW() - INTERVAL '15 minutes')
ON CONFLICT (id) DO NOTHING;

-- Order 3: DELIVERY (Em Entrega)
INSERT INTO orders (id, restaurant_id, customer_id, status, total_amount, delivery_type, payment_method, delivery_address, created_at) VALUES
('bbb00000-0000-0000-0000-000000000003', 'ff1e6c98-21e3-4f33-8ce7-d02b72445519', 'aaa00000-0000-0000-0000-000000000003', 'delivery', 12.00, 'pickup', 'cash', NULL, NOW() - INTERVAL '40 minutes')
ON CONFLICT (id) DO NOTHING;

-- Order 4: COMPLETED (Finalizado)
INSERT INTO orders (id, restaurant_id, customer_id, status, total_amount, delivery_type, payment_method, delivery_address, created_at) VALUES
('bbb00000-0000-0000-0000-000000000004', 'ff1e6c98-21e3-4f33-8ce7-d02b72445519', 'aaa00000-0000-0000-0000-000000000001', 'completed', 55.00, 'delivery', 'pix', 'Rua das Flores, 100 - Apt 101', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;


-- 3. Create Order Items (Linking Orders to Products)

-- Items for Order 1 (Pizza Grande + Borda Catupiry + Coca)
-- Pizza Calabresa (Base 0 + Grande 50 + Catupiry 5 = 55)
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price, options_selected, observations) VALUES
('ccc00000-0000-0000-0000-000000000001', 'bbb00000-0000-0000-0000-000000000001', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 1, 55.00, 55.00, 
 '[{"group_name": "Tamanho", "option_name": "Grande", "price": 50.00}, {"group_name": "Borda", "option_name": "Catupiry", "price": 5.00}]'::jsonb, 
 'Sem cebola');

-- Coca Cola (12)
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price, options_selected) VALUES
('ccc00000-0000-0000-0000-000000000002', 'bbb00000-0000-0000-0000-000000000001', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e55', 1, 12.00, 12.00, NULL);


-- Items for Order 2 (Pizza Média Sem Borda)
-- Pizza Calabresa (Base 0 + Média 40 + Sem Borda 0 = 40)
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price, options_selected) VALUES
('ccc00000-0000-0000-0000-000000000003', 'bbb00000-0000-0000-0000-000000000002', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 1, 40.00, 40.00, 
 '[{"group_name": "Tamanho", "option_name": "Média", "price": 40.00}, {"group_name": "Borda", "option_name": "Sem Borda", "price": 0.00}]'::jsonb);


-- Items for Order 3 (Coca Cola, Retirada)
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price, options_selected) VALUES
('ccc00000-0000-0000-0000-000000000004', 'bbb00000-0000-0000-0000-000000000003', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e55', 1, 12.00, 12.00, NULL);


-- Items for Order 4 (Pizza Grande, Completed)
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, total_price, options_selected) VALUES
('ccc00000-0000-0000-0000-000000000005', 'bbb00000-0000-0000-0000-000000000004', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 1, 50.00, 50.00, 
 '[{"group_name": "Tamanho", "option_name": "Grande", "price": 50.00}]'::jsonb);
