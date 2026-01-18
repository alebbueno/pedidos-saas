
import { createClient } from '@/lib/supabase/server'
import { getOwnerRestaurant } from '@/actions/admin'
import { upsertCategory, upsertProduct } from '@/actions/admin'
import { NextResponse } from 'next/server'

export async function GET() {
    let restaurant = await getOwnerRestaurant()

    if (!restaurant) {
        // Fallback or dev: try to get first restaurant using server client (cookie based)
        // If curl is used without cookies, this still fails, which is expected for secure route.
        // But for dev verify, we might not be able to bypass RLS easily without Service Key.
        // Assuming user invokes this from Browser where they are logged in.
    }

    if (!restaurant) {
        return NextResponse.json({ error: 'Restaurant not found or not logged in. Please log in first.' }, { status: 401 })
    }

    const created = {
        categories: [] as string[],
        products: [] as string[],
        debug: [] as any[]
    }

    // 1. PIZZAS (10 Options)
    // ----------------------------------------------------------------
    const upsertPizza = await upsertCategory(restaurant.id, 'Pizzas')
    if (upsertPizza?.error) {
        created.debug.push({ stage: 'upsert_pizza', error: upsertPizza.error })
    }

    if (upsertPizza?.category) {
        const catPizza = upsertPizza.category

        const pizzaOptions: any[] = [
            {
                name: 'Tamanho',
                type: 'single',
                min_selection: 1,
                max_selection: 1,
                price_rule: 'sum',
                options: [
                    { name: 'Média (6 fatias)', price_modifier: 40 },
                    { name: 'Grande (8 fatias)', price_modifier: 50 },
                    { name: 'Gigante (12 fatias)', price_modifier: 70 }
                ]
            },
            {
                name: 'Borda',
                type: 'single',
                min_selection: 0,
                max_selection: 1,
                price_rule: 'sum',
                options: [
                    { name: 'Sem Borda', price_modifier: 0 },
                    { name: 'Catupiry', price_modifier: 6 },
                    { name: 'Cheddar', price_modifier: 6 },
                    { name: 'Chocolate', price_modifier: 8 }
                ]
            }
        ]

        const pizzas = [
            { name: 'Pizza Calabresa', desc: 'Molho, mussarela, calabresa e cebola.', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop' },
            { name: 'Pizza Quatro Queijos', desc: 'Mussarela, provolone, parmesão e gorgonzola.', img: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?q=80&w=600&auto=format&fit=crop' },
            { name: 'Pizza Frango com Catupiry', desc: 'Peito de frango desfiado com o autêntico catupiry.', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop' },
            { name: 'Pizza Portuguesa', desc: 'Mussarela, presunto, ovos, cebola e azeitona.', img: 'https://images.unsplash.com/photo-1593560708920-63219413ca75?q=80&w=600&auto=format&fit=crop' },
            { name: 'Pizza Marguerita', desc: 'Mussarela, tomate e manjericão fresco.', img: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?q=80&w=600&auto=format&fit=crop' },
            { name: 'Pizza Pepperoni', desc: 'Mussarela e fatias generosas de pepperoni.', img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop' },
            { name: 'Pizza Moda da Casa', desc: 'A especialidade do chef com ingredientes selecionados.', img: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?q=80&w=600&auto=format&fit=crop' },
            { name: 'Pizza Vegetariana', desc: 'Brócolis, palmito, champignon e tomate seco.', img: 'https://images.unsplash.com/photo-1511688878353-3a2f5be94c54?q=80&w=600&auto=format&fit=crop' },
            { name: 'Pizza Bacon com Milho', desc: 'Mussarela, bacon crocante e milho verde.', img: 'https://images.unsplash.com/photo-1620374707236-404418037a01?q=80&w=600&auto=format&fit=crop' },
            { name: 'Pizza Califórnia', desc: 'Mussarela, lombo, abacaxi, pêssego e figo.', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop' },
        ]

        for (const p of pizzas) {
            const res = await upsertProduct({
                restaurant_id: restaurant.id,
                name: p.name,
                description: p.desc,
                base_price: 0,
                category_id: catPizza.id,
                image_url: p.img,
                option_groups: pizzaOptions
            })
            if (res.error) created.debug.push({ stage: `upsert_product_${p.name}`, error: res.error })
            else created.products.push(p.name)
        }
    }

    // 2. HAMBÚRGUERES (8 Options)
    // ----------------------------------------------------------------
    const upsertBurger = await upsertCategory(restaurant.id, 'Hambúrgueres')
    if (upsertBurger?.error) created.debug.push({ stage: 'upsert_burger', error: upsertBurger.error })

    if (upsertBurger?.category) {
        const catBurger = upsertBurger.category

        const burgerOptions: any[] = [
            {
                name: 'Ponto da Carne',
                type: 'single',
                min_selection: 1,
                max_selection: 1,
                price_rule: 'sum',
                options: [
                    { name: 'Mal Passado', price_modifier: 0 },
                    { name: 'Ao Ponto', price_modifier: 0 },
                    { name: 'Bem Passado', price_modifier: 0 }
                ]
            },
            {
                name: 'Adicionais',
                type: 'multiple',
                min_selection: 0,
                max_selection: 5,
                price_rule: 'sum',
                options: [
                    { name: 'Bacon Extra', price_modifier: 4 },
                    { name: 'Queijo Extra', price_modifier: 3.50 },
                    { name: 'Hambúrguer Extra', price_modifier: 12 }
                ]
            }
        ]

        const burgers = [
            { name: 'X-Bacon Artesanal', price: 32.90, desc: 'Pão brioche, blend 160g, cheddar e bacon.', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop' },
            { name: 'X-Salada Clássico', price: 28.00, desc: 'Pão, carne, queijo, alface, tomate e maionese.', img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop' },
            { name: 'Smash Burger Duplo', price: 35.00, desc: 'Dois smashes de 80g com muito cheddar.', img: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?q=80&w=600&auto=format&fit=crop' },
            { name: 'X-Tudo Monstro', price: 42.00, desc: 'Tudo que tem direito: ovo, bacon, salsicha, e mais.', img: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=600&auto=format&fit=crop' },
            { name: 'Veggie Burger', price: 30.00, desc: 'Hambúrguer de grão de bico com cogumelos.', img: 'https://images.unsplash.com/photo-1550950158-d0d960dff51b?q=80&w=600&auto=format&fit=crop' },
            { name: 'Chicken Burger', price: 25.00, desc: 'Filé de frango empanado crocante.', img: 'https://images.unsplash.com/photo-1615557960916-5f4791effe9d?q=80&w=600&auto=format&fit=crop' },
            { name: 'Cheddar Melts', price: 34.90, desc: 'Muito cheddar cremoso e cebola caramelizada.', img: 'https://images.unsplash.com/photo-1586190848861-99c8a3fb7ea5?q=80&w=600&auto=format&fit=crop' },
            { name: 'Blue Cheese Burger', price: 36.90, desc: 'Molho de gorgonzola e rúcula fresca.', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop' },
        ]

        for (const b of burgers) {
            const res = await upsertProduct({
                restaurant_id: restaurant.id,
                name: b.name,
                description: b.desc,
                base_price: b.price,
                category_id: catBurger.id,
                image_url: b.img,
                option_groups: burgerOptions
            })
            if (res.error) created.debug.push({ stage: `upsert_product_${b.name}`, error: res.error })
            else created.products.push(b.name)
        }
    }

    // 3. AÇAÍ (4 Options)
    // ----------------------------------------------------------------
    const upsertAcai = await upsertCategory(restaurant.id, 'Açaí')
    if (upsertAcai?.error) created.debug.push({ stage: 'upsert_acai', error: upsertAcai.error })

    if (upsertAcai?.category) {
        const catAcai = upsertAcai.category

        // Option groups mostly same for all
        const acaiOptions: any[] = [
            {
                name: 'Tamanho',
                type: 'single',
                min_selection: 1,
                max_selection: 1,
                price_rule: 'sum',
                options: [
                    { name: '300ml', price_modifier: 16 },
                    { name: '500ml', price_modifier: 22 },
                    { name: '700ml', price_modifier: 28 }
                ]
            },
            {
                name: 'Acompanhamentos Grátis',
                type: 'multiple',
                min_selection: 0,
                max_selection: 3,
                price_rule: 'sum',
                options: [
                    { name: 'Leite Ninho', price_modifier: 0 },
                    { name: 'Granola', price_modifier: 0 },
                    { name: 'Banana', price_modifier: 0 }
                ]
            }
        ]

        const res1 = await upsertProduct({
            restaurant_id: restaurant.id,
            name: 'Açaí no Copo',
            description: 'Monte do seu jeito.',
            base_price: 0,
            category_id: catAcai.id,
            image_url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=600&auto=format&fit=crop',
            option_groups: acaiOptions
        })
        if (res1.error) created.debug.push({ error: res1.error })
        else created.products.push('Açaí no Copo')

        const res2 = await upsertProduct({
            restaurant_id: restaurant.id,
            name: 'Açaí na Tigela (Com Frutas)',
            description: 'Tigela caprichada com Morango, Banana e Kiwi.',
            base_price: 0, // Using same sizes
            category_id: catAcai.id,
            image_url: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=600&auto=format&fit=crop',
            option_groups: acaiOptions
        })
        if (res2.error) created.debug.push({ error: res2.error })
        else created.products.push('Açaí na Tigela')

        const res3 = await upsertProduct({
            restaurant_id: restaurant.id,
            name: 'Barca de Açaí',
            description: 'Barca gigante para dividir (aprox 1L).',
            base_price: 45, // Fixed price for boat
            category_id: catAcai.id,
            image_url: 'https://images.unsplash.com/photo-1626343512965-0219c6218d6f?q=80&w=600&auto=format&fit=crop',
            option_groups: [
                {
                    name: 'Adicionais Premium',
                    type: 'multiple',
                    options: [
                        { name: 'Nutella Extra', price_modifier: 8, is_available: true },
                        { name: 'Confeti', price_modifier: 4, is_available: true }
                    ] as any
                }
            ]
        })
        if (res3.error) created.debug.push({ error: res3.error })
        else created.products.push('Barca de Açaí')

        const res4 = await upsertProduct({
            restaurant_id: restaurant.id,
            name: 'Açaí Zero Açúcar',
            description: 'O sabor do açaí sem culpa.',
            base_price: 0,
            category_id: catAcai.id,
            image_url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?q=80&w=600&auto=format&fit=crop',
            option_groups: acaiOptions
        })
        if (res4.error) created.debug.push({ error: res4.error })
        else created.products.push('Açaí Zero Açúcar')
    }

    // 4. BEBIDAS (12 Options)
    // ----------------------------------------------------------------
    const upsertDrinks = await upsertCategory(restaurant.id, 'Bebidas')
    if (upsertDrinks?.error) created.debug.push({ stage: 'upsert_drinks', error: upsertDrinks.error })

    if (upsertDrinks?.category) {
        const catDrinks = upsertDrinks.category

        const drinks = [
            { name: 'Coca-Cola Lata 350ml', price: 6, img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97' },
            { name: 'Coca-Cola 2L', price: 14, img: 'https://images.unsplash.com/photo-1554866585-cd94860890b7' },
            { name: 'Guaraná Antarctica Lata', price: 6, img: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859' },
            { name: 'Guaraná Antarctica 2L', price: 12, img: 'https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd' },
            { name: 'Água Mineral sem Gás', price: 4, img: 'https://images.unsplash.com/photo-1564419320461-6870880221ad' },
            { name: 'Água Mineral com Gás', price: 4.5, img: 'https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd' },
            { name: 'Suco de Laranja (Copo)', price: 10, img: 'https://images.unsplash.com/photo-1613478223719-2ab802602423' },
            { name: 'Suco de Laranja (Jarra)', price: 25, img: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba' },
            { name: 'Cerveja Heineken Long Neck', price: 12, img: 'https://images.unsplash.com/photo-1618641986557-1ecd23095910' },
            { name: 'Refrigerante Limão Lata', price: 6, img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd' },
            { name: 'Suco de Uva Integral 300ml', price: 9, img: 'https://images.unsplash.com/photo-1606710332857-7c08b3c3c1b6?q=80&w=600&auto=format&fit=crop' },
            { name: 'Chá Gelado Limão', price: 7, img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=600&auto=format&fit=crop' }
        ]

        for (const d of drinks) {
            const res = await upsertProduct({
                restaurant_id: restaurant.id,
                name: d.name,
                description: 'Refrescante.',
                base_price: d.price,
                category_id: catDrinks.id,
                image_url: d.img + '?q=80&w=600&auto=format&fit=crop', // ensure params
                option_groups: []
            })
            if (res.error) created.debug.push({ stage: `upsert_product_${d.name}`, error: res.error })
            else created.products.push(d.name)
        }
    }

    // 5. SOBREMESAS (3 Options)
    // ----------------------------------------------------------------
    const upsertDesserts = await upsertCategory(restaurant.id, 'Sobremesas')
    if (upsertDesserts?.error) created.debug.push({ stage: 'upsert_desserts', error: upsertDesserts.error })

    if (upsertDesserts?.category) {
        const catDesserts = upsertDesserts.category

        const desserts = [
            { name: 'Brownie de Chocolate', price: 15, desc: 'Servido quente com sorvete de creme.', img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop' },
            { name: 'Petit Gateau', price: 18, desc: 'Clássico bolinho de chocolate com recheio cremoso.', img: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=600&auto=format&fit=crop' },
            { name: 'Pudim de Leite', price: 12, desc: 'Aquele pudim lisinho e sem furinhos.', img: 'https://images.unsplash.com/photo-1517093750596-3532c13eeb79?q=80&w=600&auto=format&fit=crop' }
        ]

        for (const d of desserts) {
            const res = await upsertProduct({
                restaurant_id: restaurant.id,
                name: d.name,
                description: d.desc,
                base_price: d.price,
                category_id: catDesserts.id,
                image_url: d.img,
                option_groups: []
            })
            if (res.error) created.debug.push({ stage: `upsert_product_${d.name}`, error: res.error })
            else created.products.push(d.name)
        }
    }

    return NextResponse.json({ success: true, created })
}
