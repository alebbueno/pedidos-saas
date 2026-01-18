DO $$
DECLARE
    v_restaurant_id uuid := 'ff1e6c98-21e3-4f33-8ce7-d02b72445519'; -- Burger James
    v_cat_pizza uuid;
    v_cat_burger uuid;
    v_cat_acai uuid;
    v_cat_drink uuid;
    v_cat_dessert uuid;
    v_prod_id uuid;
    v_group_id uuid;
BEGIN
    -- =========================================================================
    -- 1. CATEGORIES
    -- =========================================================================
    
    SELECT id INTO v_cat_pizza FROM categories WHERE restaurant_id = v_restaurant_id AND name = 'Pizzas';
    IF v_cat_pizza IS NULL THEN
        INSERT INTO categories (restaurant_id, name, display_order) VALUES (v_restaurant_id, 'Pizzas', 1) RETURNING id INTO v_cat_pizza;
    END IF;

    SELECT id INTO v_cat_burger FROM categories WHERE restaurant_id = v_restaurant_id AND name = 'Hambúrgueres';
    IF v_cat_burger IS NULL THEN
        INSERT INTO categories (restaurant_id, name, display_order) VALUES (v_restaurant_id, 'Hambúrgueres', 2) RETURNING id INTO v_cat_burger;
    END IF;

    SELECT id INTO v_cat_acai FROM categories WHERE restaurant_id = v_restaurant_id AND name = 'Açaí';
    IF v_cat_acai IS NULL THEN
        INSERT INTO categories (restaurant_id, name, display_order) VALUES (v_restaurant_id, 'Açaí', 3) RETURNING id INTO v_cat_acai;
    END IF;

    SELECT id INTO v_cat_drink FROM categories WHERE restaurant_id = v_restaurant_id AND name = 'Bebidas';
    IF v_cat_drink IS NULL THEN
        INSERT INTO categories (restaurant_id, name, display_order) VALUES (v_restaurant_id, 'Bebidas', 4) RETURNING id INTO v_cat_drink;
    END IF;

    SELECT id INTO v_cat_dessert FROM categories WHERE restaurant_id = v_restaurant_id AND name = 'Sobremesas';
    IF v_cat_dessert IS NULL THEN
        INSERT INTO categories (restaurant_id, name, display_order) VALUES (v_restaurant_id, 'Sobremesas', 5) RETURNING id INTO v_cat_dessert;
    END IF;

    -- =========================================================================
    -- 2. PIZZAS
    -- =========================================================================
    
    -- Pizza Calabresa
    SELECT id INTO v_prod_id FROM products WHERE restaurant_id = v_restaurant_id AND name = 'Pizza Calabresa';
    IF v_prod_id IS NULL THEN
        INSERT INTO products (restaurant_id, category_id, name, description, base_price, image_url) 
        VALUES (v_restaurant_id, v_cat_pizza, 'Pizza Calabresa', 'Molho, mussarela, calabresa e cebola.', 0, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop') RETURNING id INTO v_prod_id;
    END IF;

    -- Options for Pizza Calabresa
    DELETE FROM product_option_groups WHERE product_id = v_prod_id;
    
    INSERT INTO product_option_groups (product_id, name, type, min_selection, max_selection, price_rule)
    VALUES (v_prod_id, 'Tamanho', 'single', 1, 1, 'sum') RETURNING id INTO v_group_id;
    INSERT INTO product_options (group_id, name, price_modifier, is_available) VALUES
    (v_group_id, 'Média (6 fatias)', 40, true), (v_group_id, 'Grande (8 fatias)', 50, true), (v_group_id, 'Gigante (12 fatias)', 70, true);

    INSERT INTO product_option_groups (product_id, name, type, min_selection, max_selection, price_rule)
    VALUES (v_prod_id, 'Borda', 'single', 0, 1, 'sum') RETURNING id INTO v_group_id;
    INSERT INTO product_options (group_id, name, price_modifier, is_available) VALUES
    (v_group_id, 'Sem Borda', 0, true), (v_group_id, 'Catupiry', 6, true), (v_group_id, 'Cheddar', 6, true);

    -- Pizza Vegetariana
    SELECT id INTO v_prod_id FROM products WHERE restaurant_id = v_restaurant_id AND name = 'Pizza Vegetariana';
    IF v_prod_id IS NULL THEN
        INSERT INTO products (restaurant_id, category_id, name, description, base_price, image_url) 
        VALUES (v_restaurant_id, v_cat_pizza, 'Pizza Vegetariana', 'Brócolis, palmito, champignon e tomate seco.', 0, 'https://images.unsplash.com/photo-1511688878353-3a2f5be94c54?q=80&w=600&auto=format&fit=crop') RETURNING id INTO v_prod_id;
    END IF;

    DELETE FROM product_option_groups WHERE product_id = v_prod_id;
    
    INSERT INTO product_option_groups (product_id, name, type, min_selection, max_selection, price_rule)
    VALUES (v_prod_id, 'Tamanho', 'single', 1, 1, 'sum') RETURNING id INTO v_group_id;
    INSERT INTO product_options (group_id, name, price_modifier, is_available) VALUES
    (v_group_id, 'Média (6 fatias)', 42, true), (v_group_id, 'Grande (8 fatias)', 55, true);

    -- =========================================================================
    -- 3. HAMBURGERS
    -- =========================================================================

    -- X-Bacon Artesanal
    SELECT id INTO v_prod_id FROM products WHERE restaurant_id = v_restaurant_id AND name = 'X-Bacon Artesanal';
    IF v_prod_id IS NULL THEN
        INSERT INTO products (restaurant_id, category_id, name, description, base_price, image_url) 
        VALUES (v_restaurant_id, v_cat_burger, 'X-Bacon Artesanal', 'Pão brioche, blend 160g, cheddar e bacon.', 32.90, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop') RETURNING id INTO v_prod_id;
    END IF;

    DELETE FROM product_option_groups WHERE product_id = v_prod_id;

    INSERT INTO product_option_groups (product_id, name, type, min_selection, max_selection, price_rule)
    VALUES (v_prod_id, 'Ponto da Carne', 'single', 1, 1, 'sum') RETURNING id INTO v_group_id;
    INSERT INTO product_options (group_id, name, price_modifier, is_available) VALUES
    (v_group_id, 'Mal Passado', 0, true), (v_group_id, 'Ao Ponto', 0, true), (v_group_id, 'Bem Passado', 0, true);

    INSERT INTO product_option_groups (product_id, name, type, min_selection, max_selection, price_rule)
    VALUES (v_prod_id, 'Adicionais', 'multiple', 0, 5, 'sum') RETURNING id INTO v_group_id;
    INSERT INTO product_options (group_id, name, price_modifier, is_available) VALUES
    (v_group_id, 'Bacon Extra', 4, true), (v_group_id, 'Queijo Extra', 3.50, true), (v_group_id, 'Hambúrguer Extra', 12, true);

    -- Cheddar Melts
    SELECT id INTO v_prod_id FROM products WHERE restaurant_id = v_restaurant_id AND name = 'Cheddar Melts';
    IF v_prod_id IS NULL THEN
        INSERT INTO products (restaurant_id, category_id, name, description, base_price, image_url) 
        VALUES (v_restaurant_id, v_cat_burger, 'Cheddar Melts', 'Muito cheddar cremoso e cebola caramelizada.', 34.90, 'https://images.unsplash.com/photo-1586190848861-99c8a3fb7ea5?q=80&w=600&auto=format&fit=crop') RETURNING id INTO v_prod_id;
    END IF;

    DELETE FROM product_option_groups WHERE product_id = v_prod_id;

    INSERT INTO product_option_groups (product_id, name, type, min_selection, max_selection, price_rule)
    VALUES (v_prod_id, 'Ponto da Carne', 'single', 1, 1, 'sum') RETURNING id INTO v_group_id;
    INSERT INTO product_options (group_id, name, price_modifier, is_available) VALUES
    (v_group_id, 'Mal Passado', 0, true), (v_group_id, 'Ao Ponto', 0, true), (v_group_id, 'Bem Passado', 0, true);

    -- =========================================================================
    -- 4. AÇAÍ
    -- =========================================================================

    -- Barca de Açaí
    SELECT id INTO v_prod_id FROM products WHERE restaurant_id = v_restaurant_id AND name = 'Barca de Açaí';
    IF v_prod_id IS NULL THEN
        INSERT INTO products (restaurant_id, category_id, name, description, base_price, image_url) 
        VALUES (v_restaurant_id, v_cat_acai, 'Barca de Açaí', 'Barca gigante para dividir (aprox 1L).', 45.00, 'https://images.unsplash.com/photo-1626343512965-0219c6218d6f?q=80&w=600&auto=format&fit=crop') RETURNING id INTO v_prod_id;
    END IF;

    DELETE FROM product_option_groups WHERE product_id = v_prod_id;

    INSERT INTO product_option_groups (product_id, name, type, min_selection, max_selection, price_rule)
    VALUES (v_prod_id, 'Adicionais Premium', 'multiple', 0, 10, 'sum') RETURNING id INTO v_group_id;
    INSERT INTO product_options (group_id, name, price_modifier, is_available) VALUES
    (v_group_id, 'Nutella Extra', 8, true), (v_group_id, 'Confeti', 4, true), (v_group_id, 'Leite Condensado', 0, true);

    -- =========================================================================
    -- 5. BEBIDAS
    -- =========================================================================

    SELECT id INTO v_prod_id FROM products WHERE restaurant_id = v_restaurant_id AND name = 'Coca-Cola Lata 350ml';
    IF v_prod_id IS NULL THEN
        INSERT INTO products (restaurant_id, category_id, name, description, base_price, image_url) 
        VALUES (v_restaurant_id, v_cat_drink, 'Coca-Cola Lata 350ml', 'Refrescante.', 6.00, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop');
    END IF;

    SELECT id INTO v_prod_id FROM products WHERE restaurant_id = v_restaurant_id AND name = 'Suco de Laranja (Copo)';
    IF v_prod_id IS NULL THEN
        INSERT INTO products (restaurant_id, category_id, name, description, base_price, image_url) 
        VALUES (v_restaurant_id, v_cat_drink, 'Suco de Laranja (Copo)', 'Natural.', 10.00, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=600&auto=format&fit=crop');
    END IF;

    -- =========================================================================
    -- 6. SOBREMESAS
    -- =========================================================================

    SELECT id INTO v_prod_id FROM products WHERE restaurant_id = v_restaurant_id AND name = 'Brownie de Chocolate';
    IF v_prod_id IS NULL THEN
        INSERT INTO products (restaurant_id, category_id, name, description, base_price, image_url) 
        VALUES (v_restaurant_id, v_cat_dessert, 'Brownie de Chocolate', 'Servido quente com sorvete de creme.', 15.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop');
    END IF;

    SELECT id INTO v_prod_id FROM products WHERE restaurant_id = v_restaurant_id AND name = 'Pudim de Leite';
    IF v_prod_id IS NULL THEN
        INSERT INTO products (restaurant_id, category_id, name, description, base_price, image_url) 
        VALUES (v_restaurant_id, v_cat_dessert, 'Pudim de Leite', 'Aquele pudim lisinho e sem furinhos.', 12.00, 'https://images.unsplash.com/photo-1517093750596-3532c13eeb79?q=80&w=600&auto=format&fit=crop');
    END IF;

END $$;
