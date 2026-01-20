import { createClient } from '@/lib/supabase/server'

/**
 * Agent function definitions for OpenAI function calling
 */
export const agentFunctions = [
    {
        name: 'list_products',
        description:
            'Lista produtos disponíveis no cardápio. Use para responder perguntas sobre o menu ou ajudar o cliente a escolher.',
        parameters: {
            type: 'object',
            properties: {
                category: {
                    type: 'string',
                    description: 'Filtrar por categoria (opcional). Ex: "Pizzas", "Bebidas"',
                },
                search: {
                    type: 'string',
                    description: 'Buscar produtos por nome (opcional)',
                },
            },
        },
    },
    {
        name: 'create_draft_order',
        description:
            'Cria ou atualiza o rascunho de pedido. ATENÇÃO: Envie sempre a lista COMPLETA de itens. Esta função substitui o rascunho anterior.',
        parameters: {
            type: 'object',
            properties: {
                items: {
                    type: 'array',
                    description: 'Lista de itens do pedido',
                    items: {
                        type: 'object',
                        properties: {
                            product_id: {
                                type: 'string',
                                description: 'ID do produto',
                            },
                            product_name: {
                                type: 'string',
                                description: 'Nome do produto',
                            },
                            quantity: {
                                type: 'number',
                                description: 'Quantidade',
                            },
                            options: {
                                type: 'array',
                                description: 'Opções selecionadas (tamanho, sabor, etc)',
                                items: {
                                    type: 'object',
                                    properties: {
                                        group_name: {
                                            type: 'string',
                                            description: 'Nome do grupo (ex: Tamanho)',
                                        },
                                        option_name: {
                                            type: 'string',
                                            description: 'Nome da opção (ex: Grande)',
                                        },
                                        price: {
                                            type: 'number',
                                            description: 'Preço adicional',
                                        },
                                    },
                                },
                            },
                            unit_price: {
                                type: 'number',
                                description: 'Preço unitário calculado',
                            },
                        },
                        required: ['product_id', 'product_name', 'quantity', 'unit_price'],
                    },
                },
                delivery_type: {
                    type: 'string',
                    enum: ['delivery', 'pickup'],
                    description: 'Tipo de entrega',
                },
                delivery_address: {
                    type: 'string',
                    description: 'Endereço de entrega completo (obrigatório se delivery_type = delivery). Formato: Rua, Número, Bairro, Cidade',
                },
                payment_method: {
                    type: 'string',
                    enum: ['cash', 'credit', 'debit', 'pix', 'voucher'],
                    description: 'Forma de pagamento escolhida pelo cliente',
                },
                customer_name: {
                    type: 'string',
                    description: 'Nome do cliente (obrigatório se cliente novo). Se o cliente já está cadastrado (você tem acesso aos DADOS DO CLIENTE), este campo é opcional.',
                },
                customer_email: {
                    type: 'string',
                    description: 'Email do cliente (opcional)',
                },
            },
            required: ['items', 'payment_method'],
        },
    },
    {
        name: 'confirm_order',
        description:
            '🚨🚨🚨 FUNÇÃO CRÍTICA E OBRIGATÓRIA 🚨🚨🚨 Você DEVE chamar esta função quando o cliente confirmar o pedido (dizer "sim", "confirmo", "pode confirmar", "está certo", etc). Esta função SALVA o pedido no banco de dados. SEM chamar esta função, o pedido NÃO será salvo e será perdido. Após apresentar o resumo do pedido e o cliente confirmar, você DEVE chamar esta função IMEDIATAMENTE. Use APENAS após confirmação explícita do cliente.',
        parameters: {
            type: 'object',
            properties: {
                confirmed: {
                    type: 'boolean',
                    description: 'Sempre use true quando o cliente confirmar o pedido. Esta função salva o pedido no banco de dados. SEM esta função, o pedido NÃO será salvo.',
                },
            },
            required: ['confirmed'],
        },
    },
]

/**
 * List products from database
 */
export async function listProducts(restaurantId: string, category?: string, search?: string) {
    const supabase = await createClient()

    let query = supabase
        .from('products')
        .select(
            `
      *,
      categories (name),
      product_option_groups (
        id,
        name,
        type,
        min_selection,
        max_selection,
        product_options (
          id,
          name,
          price_modifier,
          is_available
        )
      )
    `
        )
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)

    if (category) {
        query = query.eq('categories.name', category)
    }

    if (search) {
        query = query.ilike('name', `%${search}%`)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error listing products:', error)
        return { products: [], error: error.message }
    }

    return { products: data || [], error: null }
}

/**
 * Parse address string into components
 * Examples:
 * "Rua das Flores, 123, Centro, São Paulo" -> { street: "Rua das Flores", number: "123", neighborhood: "Centro", city: "São Paulo" }
 * "Avenida Paulista, 1000, Apto 501, Bela Vista, São Paulo" -> { street: "Avenida Paulista", number: "1000", complement: "Apto 501", neighborhood: "Bela Vista", city: "São Paulo" }
 */
function parseAddress(addressString: string): {
    street: string
    number: string
    neighborhood: string
    city: string
    complement?: string
} {
    console.log('[parseAddress] Parsing address:', addressString)
    
    // Remove extra spaces and normalize
    const normalized = addressString.replace(/\s+/g, ' ').trim()
    
    // Split by comma
    const parts = normalized.split(',').map(p => p.trim()).filter(p => p)
    
    console.log('[parseAddress] Split into parts:', parts)
    
    if (parts.length < 3) {
        console.warn('[parseAddress] Address has less than 3 parts, may be incomplete')
    }
    
    // Extract number from first or second part
    let street = parts[0] || ''
    let number = 'S/N'
    let complement: string | undefined
    let neighborhood = ''
    let city = ''
    
    // Try to find number in first part
    const numberInStreet = street.match(/\b(\d+[A-Za-z]?)\b/)
    if (numberInStreet) {
        number = numberInStreet[1]
        street = street.replace(numberInStreet[0], '').replace(/\s+/g, ' ').trim()
    } else if (parts.length > 1) {
        // Check if second part is just a number
        const secondPart = parts[1]
        const numberMatch = secondPart.match(/^(\d+[A-Za-z]?)$/)
        if (numberMatch) {
            number = numberMatch[1]
            parts.splice(1, 1) // Remove number from parts
        }
    }
    
    // Remaining parts: [street, complement?, neighborhood, city]
    if (parts.length === 3) {
        // Format: "Street, Neighborhood, City"
        neighborhood = parts[1]
        city = parts[2]
    } else if (parts.length === 4) {
        // Format: "Street, Complement, Neighborhood, City"
        complement = parts[1]
        neighborhood = parts[2]
        city = parts[3]
    } else if (parts.length >= 5) {
        // Format: "Street, Number, Complement, Neighborhood, City" or more
        // Take last 2 as neighborhood and city
        city = parts[parts.length - 1]
        neighborhood = parts[parts.length - 2]
        // Everything in between is complement
        const middleParts = parts.slice(1, parts.length - 2)
        complement = middleParts.join(', ')
    } else if (parts.length === 2) {
        // Fallback: "Street, City"
        neighborhood = 'Centro'
        city = parts[1]
    } else {
        // Single part or error
        city = parts[parts.length - 1] || 'Não informada'
        neighborhood = 'Centro'
    }
    
    const result = {
        street: street || parts[0] || 'Não informada',
        number,
        neighborhood: neighborhood || 'Centro',
        city: city || 'Não informada',
        ...(complement && { complement })
    }
    
    console.log('[parseAddress] Parsed result:', result)
    return result
}

/**
 * Convert product name/slug to UUID
 * This is needed because the AI agent sometimes passes product names instead of UUIDs
 */
async function convertProductNameToUuid(
    supabase: any,
    restaurantId: string,
    productIdentifier: string
): Promise<string | null> {
    // Check if it's already a UUID (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (uuidRegex.test(productIdentifier)) {
        // Already a UUID, verify it exists
        const { data } = await supabase
            .from('products')
            .select('id')
            .eq('id', productIdentifier)
            .eq('restaurant_id', restaurantId)
            .single()
        
        return data ? data.id : null
    }

    // Not a UUID, search by name
    // Try exact match first (case-insensitive)
    const { data: exactMatch } = await supabase
        .from('products')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .ilike('name', productIdentifier)
        .eq('is_active', true)
        .single()

    if (exactMatch) {
        console.log(`[convertProductNameToUuid] Converted "${productIdentifier}" to UUID (exact match): ${exactMatch.id}`)
        return exactMatch.id
    }

    // Try with underscores replaced by spaces (e.g., "cheddar_melts" -> "cheddar melts")
    const nameWithSpaces = productIdentifier.replace(/_/g, ' ')
    const { data: spaceMatch } = await supabase
        .from('products')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .ilike('name', nameWithSpaces)
        .eq('is_active', true)
        .single()

    if (spaceMatch) {
        console.log(`[convertProductNameToUuid] Converted "${productIdentifier}" to UUID (space match): ${spaceMatch.id}`)
        return spaceMatch.id
    }

    // Try partial match (contains)
    const { data: partialMatch } = await supabase
        .from('products')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .ilike('name', `%${productIdentifier}%`)
        .eq('is_active', true)
        .limit(1)
        .single()

    if (partialMatch) {
        console.log(`[convertProductNameToUuid] Converted "${productIdentifier}" to UUID (partial match): ${partialMatch.id}`)
        return partialMatch.id
    }

    // Try partial match with spaces
    const { data: partialSpaceMatch } = await supabase
        .from('products')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .ilike('name', `%${nameWithSpaces}%`)
        .eq('is_active', true)
        .limit(1)
        .single()

    if (partialSpaceMatch) {
        console.log(`[convertProductNameToUuid] Converted "${productIdentifier}" to UUID (partial space match): ${partialSpaceMatch.id}`)
        return partialSpaceMatch.id
    }

    console.error(`[convertProductNameToUuid] Could not find product: "${productIdentifier}" (tried: exact, space, partial, partial space)`)
    return null
}

/**
 * Calculate order total from draft
 */
export function calculateOrderTotal(items: any[], deliveryFee: number = 0): number {
    const itemsTotal = items.reduce((sum, item) => {
        const price = typeof item.unit_price === 'number' ? item.unit_price : 0
        return sum + price * (item.quantity || 1)
    }, 0)

    return itemsTotal + deliveryFee
}

/**
 * Format order summary for confirmation message
 */
export function formatOrderSummary(
    items: any[],
    deliveryType: string,
    deliveryAddress?: string,
    deliveryFee: number = 0
): string {
    let summary = 'Perfeito! Seu pedido ficou assim:\n\n'

    items.forEach((item, index) => {
        summary += `${index + 1}. ${item.product_name}`
        if (item.quantity > 1) {
            summary += ` (x${item.quantity})`
        }
        summary += '\n'

        if (item.options && item.options.length > 0) {
            item.options.forEach((opt: any) => {
                summary += `   - ${opt.group_name}: ${opt.option_name}`
                if (opt.price > 0) {
                    summary += ` (+R$ ${opt.price.toFixed(2)})`
                }
                summary += '\n'
            })
        }

        summary += `   R$ ${(item.unit_price * item.quantity).toFixed(2)}\n\n`
    })

    const itemsTotal = calculateOrderTotal(items, 0)
    summary += `Subtotal: R$ ${itemsTotal.toFixed(2)}\n`

    if (deliveryType === 'delivery') {
        summary += `Taxa de entrega: R$ ${deliveryFee.toFixed(2)}\n`
        summary += `\n📍 Endereço: ${deliveryAddress}\n`
    } else {
        summary += `\n🏪 Retirada no local\n`
    }

    const total = calculateOrderTotal(items, deliveryType === 'delivery' ? deliveryFee : 0)
    summary += `\n💰 Total: R$ ${total.toFixed(2)}\n\n`
    summary += 'Posso confirmar?'

    return summary
}

/**
 * Create order in database
 */
export async function createOrderFromDraft(
    restaurantId: string,
    customerId: string | null,
    draft: any
) {
    const supabase = await createClient()

    console.log('[createOrderFromDraft] Starting order creation:', {
        restaurantId,
        customerId,
        itemsCount: draft.items?.length || 0,
        paymentMethod: draft.payment_method,
        deliveryType: draft.delivery_type,
        hasDeliveryFee: 'delivery_fee' in draft,
        deliveryFee: draft.delivery_fee
    })

    // Get delivery fee from restaurant if not in draft
    let deliveryFee = 0
    if (draft.delivery_type === 'delivery') {
        if (draft.delivery_fee !== undefined && draft.delivery_fee !== null) {
            deliveryFee = draft.delivery_fee
        } else {
            // Fetch from restaurant if not in draft
            const { data: restaurant } = await supabase
                .from('restaurants')
                .select('delivery_fee')
                .eq('id', restaurantId)
                .single()
            
            deliveryFee = restaurant?.delivery_fee || 0
            console.log('[createOrderFromDraft] Fetched delivery fee from restaurant:', deliveryFee)
        }
    }

    const totalAmount = calculateOrderTotal(draft.items, deliveryFee)

    console.log('[createOrderFromDraft] Calculated totals:', {
        itemsTotal: calculateOrderTotal(draft.items, 0),
        deliveryFee,
        totalAmount
    })

    // Validate required fields
    if (!draft.payment_method) {
        console.error('[createOrderFromDraft] Payment method missing')
        return { order: null, error: 'Forma de pagamento é obrigatória' }
    }

    if (!draft.items || draft.items.length === 0) {
        console.error('[createOrderFromDraft] No items in draft')
        return { order: null, error: 'Pedido deve ter pelo menos um item' }
    }

    // Validate delivery address if delivery type
    if (draft.delivery_type === 'delivery' && !draft.delivery_address) {
        console.warn('[createOrderFromDraft] Delivery type but no address provided. Will use customer default address if available.')
        
        // Try to get customer default address
        if (customerId) {
            const { data: defaultAddress } = await supabase
                .from('customer_addresses')
                .select('address')
                .eq('customer_id', customerId)
                .eq('is_default', true)
                .single()
            
            if (defaultAddress) {
                draft.delivery_address = defaultAddress.address
                console.log('[createOrderFromDraft] Using customer default address:', defaultAddress.address)
            }
        }
    }

    // Create order
    const orderData = {
        restaurant_id: restaurantId,
        customer_id: customerId,
        status: 'new',
        total_amount: totalAmount || 0, // Ensure not null
        delivery_type: draft.delivery_type || 'pickup',
        delivery_address: draft.delivery_address || null,
        payment_method: draft.payment_method,
    }

    console.log('[createOrderFromDraft] Inserting order with data:', {
        ...orderData,
        delivery_address_length: orderData.delivery_address?.length || 0
    })

    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

    if (orderError) {
        console.error('[createOrderFromDraft] Error creating order:', orderError)
        return { order: null, error: orderError.message }
    }

    console.log('[createOrderFromDraft] Order created:', {
        orderId: order.id,
        totalAmount: order.total_amount,
        status: order.status
    })

    // Create order items - validate and log each item
    console.log('[createOrderFromDraft] Draft items before mapping:', JSON.stringify(draft.items, null, 2))
    
    // Convert product names to UUIDs if needed (fallback in case conversion didn't happen in create_draft_order)
    const orderItems = await Promise.all(
        draft.items.map(async (item: any, index: number) => {
            let productId = item.product_id
            
            // Check if product_id is a UUID
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            if (!uuidRegex.test(productId)) {
                console.log(`[createOrderFromDraft] Item ${index + 1} product_id is not a UUID, converting: "${productId}"`)
                const convertedId = await convertProductNameToUuid(supabase, restaurantId, productId)
                if (convertedId) {
                    productId = convertedId
                    console.log(`[createOrderFromDraft] Item ${index + 1} converted to UUID: "${productId}"`)
                } else {
                    console.error(`[createOrderFromDraft] Item ${index + 1} failed to convert product_id: "${item.product_id}"`)
                }
            }
            
            const orderItem = {
                order_id: order.id,
                product_id: productId,
                quantity: item.quantity || 1,
                unit_price: item.unit_price || 0,
                total_price: (item.unit_price || 0) * (item.quantity || 1),
                options_selected: item.options || [],
            }
            
            console.log(`[createOrderFromDraft] Item ${index + 1}:`, {
                product_id: orderItem.product_id,
                quantity: orderItem.quantity,
                unit_price: orderItem.unit_price,
                total_price: orderItem.total_price,
                hasOptions: (item.options || []).length > 0
            })
            
            return orderItem
        })
    )

    // Validate all items have product_id and it's a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const itemsWithoutValidProductId = orderItems.filter((item: any) => {
        if (!item.product_id) return true
        return !uuidRegex.test(item.product_id)
    })
    
    if (itemsWithoutValidProductId.length > 0) {
        console.error('[createOrderFromDraft] Items without valid UUID product_id:', itemsWithoutValidProductId)
        await supabase.from('orders').delete().eq('id', order.id)
        return { order: null, error: 'Alguns itens não têm product_id válido (UUID)' }
    }

    console.log('[createOrderFromDraft] Creating order items:', {
        itemsCount: orderItems.length,
        items: orderItems.map((item: any) => ({
            productId: item.product_id,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalPrice: item.total_price
        }))
    })

    console.log('[createOrderFromDraft] Attempting to insert order items:', {
        count: orderItems.length,
        sampleItem: orderItems[0] ? {
            order_id: orderItems[0].order_id,
            product_id: orderItems[0].product_id,
            quantity: orderItems[0].quantity,
            unit_price: orderItems[0].unit_price
        } : null
    })

    const { error: itemsError, data: insertedItems } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select()

    if (itemsError) {
        console.error('[createOrderFromDraft] ❌ Error creating order items:', {
            error: itemsError,
            code: itemsError.code,
            message: itemsError.message,
            details: itemsError.details,
            hint: itemsError.hint,
            itemsAttempted: orderItems.length
        })
        // Rollback order creation
        const { error: deleteError } = await supabase.from('orders').delete().eq('id', order.id)
        if (deleteError) {
            console.error('[createOrderFromDraft] Error deleting order after items error:', deleteError)
        }
        return { order: null, error: itemsError.message || 'Erro ao criar itens do pedido' }
    }

    if (!insertedItems || insertedItems.length === 0) {
        console.error('[createOrderFromDraft] ❌ No items were inserted (insertedItems is empty or null)')
        console.error('[createOrderFromDraft] Items that should have been inserted:', orderItems)
        // Rollback order creation
        await supabase.from('orders').delete().eq('id', order.id)
        return { order: null, error: 'Nenhum item foi criado no banco de dados' }
    }

    if (insertedItems.length !== orderItems.length) {
        console.warn('[createOrderFromDraft] ⚠️ Warning: Not all items were inserted:', {
            attempted: orderItems.length,
            inserted: insertedItems.length
        })
    }

    console.log('[createOrderFromDraft] ✅ Order items created successfully:', {
        itemsCount: insertedItems.length,
        insertedItems: insertedItems.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price
        }))
    })

    console.log('[createOrderFromDraft] Order created successfully:', {
        orderId: order.id,
        totalAmount: order.total_amount,
        paymentMethod: order.payment_method,
        deliveryType: order.delivery_type
    })

    return { order, error: null }
}

/**
 * Execute agent function based on function call from OpenAI
 */
export async function executeAgentFunction(
    functionName: string,
    functionArgs: any,
    restaurantId: string,
    conversationId: string
) {
    switch (functionName) {
        case 'list_products':
            return await listProducts(restaurantId, functionArgs.category, functionArgs.search)

        case 'create_draft_order':
            // Validate payment method is provided
            if (!functionArgs.payment_method) {
                return {
                    success: false,
                    message: 'Forma de pagamento é obrigatória. Por favor, pergunte ao cliente como deseja pagar. Opções: dinheiro, crédito, débito, PIX ou voucher.',
                    error: 'payment_method_required'
                }
            }
            
            // Validate delivery type is provided
            if (!functionArgs.delivery_type) {
                return {
                    success: false,
                    message: 'Forma de entrega é obrigatória. Por favor, pergunte ao cliente se é para entrega (delivery) ou retirada no local (pickup).',
                    error: 'delivery_type_required'
                }
            }
            
            // Validate delivery address if delivery type is delivery
            if (functionArgs.delivery_type === 'delivery' && !functionArgs.delivery_address) {
                return {
                    success: false,
                    message: 'Endereço de entrega é obrigatório quando o tipo de entrega é delivery. Por favor, colete o endereço completo do cliente no formato: Rua, Número, Bairro, Cidade. Exemplo: "Avenida Paulista, 1000, Bela Vista, São Paulo"',
                    error: 'delivery_address_required'
                }
            }
            
            // Validate address format if provided (should have at least street, number, and city)
            if (functionArgs.delivery_type === 'delivery' && functionArgs.delivery_address) {
                const addressParts = functionArgs.delivery_address.split(',').map((p: string) => p.trim())
                if (addressParts.length < 3) {
                    return {
                        success: false,
                        message: 'Endereço incompleto. Por favor, colete o endereço completo no formato: Rua, Número, Bairro, Cidade. Exemplo: "Avenida Paulista, 1000, Bela Vista, São Paulo"',
                        error: 'incomplete_address'
                    }
                }
            }
            
            // Validate items have product_id
            if (!functionArgs.items || functionArgs.items.length === 0) {
                return {
                    success: false,
                    message: 'O pedido deve ter pelo menos um item.',
                    error: 'no_items'
                }
            }
            
            const itemsWithoutProductId = functionArgs.items.filter((item: any) => !item.product_id)
            if (itemsWithoutProductId.length > 0) {
                console.error('[create_draft_order] Items without product_id:', itemsWithoutProductId)
                return {
                    success: false,
                    message: 'Alguns itens não têm product_id. Verifique os dados dos produtos.',
                    error: 'missing_product_id'
                }
            }
            
            // Convert product names/slugs to UUIDs if needed
            const supabase = await createClient()
            const convertedItems = await Promise.all(
                functionArgs.items.map(async (item: any) => {
                    const productId = item.product_id
                    const uuid = await convertProductNameToUuid(supabase, restaurantId, productId)
                    
                    if (!uuid) {
                        console.error(`[create_draft_order] Could not convert product_id "${productId}" to UUID`)
                        return item // Return original item, will fail validation later
                    }
                    
                    if (uuid !== productId) {
                        console.log(`[create_draft_order] Converted product_id from "${productId}" to "${uuid}"`)
                    }
                    
                    return {
                        ...item,
                        product_id: uuid
                    }
                })
            )
            
            // Check if any conversion failed
            const failedConversions = convertedItems.filter((item: any, index: number) => {
                const originalId = functionArgs.items[index].product_id
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
                return !uuidRegex.test(item.product_id)
            })
            
            if (failedConversions.length > 0) {
                console.error('[create_draft_order] Failed to convert some product_ids:', failedConversions)
                return {
                    success: false,
                    message: `Não foi possível encontrar alguns produtos. Verifique os nomes dos produtos.`,
                    error: 'product_conversion_failed'
                }
            }
            
            // Update functionArgs with converted items
            const updatedFunctionArgs = {
                ...functionArgs,
                items: convertedItems
            }
            
            // Log full draft data
            console.log('[create_draft_order] Full draft data:', {
                itemsCount: updatedFunctionArgs.items?.length || 0,
                items: updatedFunctionArgs.items?.map((item: any) => ({
                    product_id: item.product_id,
                    product_name: item.product_name,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    hasOptions: !!(item.options && item.options.length > 0)
                })),
                paymentMethod: updatedFunctionArgs.payment_method,
                deliveryType: updatedFunctionArgs.delivery_type,
                deliveryAddress: updatedFunctionArgs.delivery_address || 'N/A',
                customerName: updatedFunctionArgs.customer_name || 'N/A',
                customerEmail: updatedFunctionArgs.customer_email || 'N/A'
            })
            
            // Store draft in conversation
            const { updateOrderDraft } = await import('@/actions/conversation-actions')
            const updateResult = await updateOrderDraft(conversationId, updatedFunctionArgs)
            
            if (updateResult.error) {
                console.error('[create_draft_order] Error updating draft:', updateResult.error)
                return {
                    success: false,
                    message: `Erro ao salvar rascunho: ${updateResult.error}`,
                    error: 'draft_update_failed'
                }
            }
            
            console.log('[create_draft_order] ✅ Draft updated successfully')
            return {
                success: true,
                message: 'Rascunho do pedido atualizado',
                draft: updatedFunctionArgs,
            }

        case 'confirm_order':
            console.log('[confirm_order] Function called with args:', functionArgs)
            
            if (!functionArgs.confirmed) {
                console.log('[confirm_order] Order not confirmed by client')
                return { success: false, message: 'Pedido não confirmado pelo cliente' }
            }

            console.log('[confirm_order] Order confirmed, fetching conversation:', conversationId)

            // Get conversation to retrieve draft and customer
            const { getConversation } = await import('@/actions/conversation-actions')
            const { data: conversation, error: convError } = await getConversation(conversationId)

            if (convError) {
                console.error('[confirm_order] Error fetching conversation:', convError)
                return { success: false, message: `Erro ao buscar conversa: ${convError}` }
            }

            if (!conversation) {
                console.error('[confirm_order] Conversation not found:', conversationId)
                return { success: false, message: 'Conversa não encontrada' }
            }

            if (!conversation.current_order_draft) {
                console.error('[confirm_order] No draft found in conversation:', {
                    conversationId,
                    hasDraft: !!conversation.current_order_draft
                })
                return { success: false, message: 'Nenhum pedido em rascunho encontrado' }
            }

            console.log('[confirm_order] Draft found:', {
                itemsCount: conversation.current_order_draft.items?.length || 0,
                hasPaymentMethod: !!conversation.current_order_draft.payment_method,
                paymentMethod: conversation.current_order_draft.payment_method,
                deliveryType: conversation.current_order_draft.delivery_type,
                deliveryAddress: conversation.current_order_draft.delivery_address,
                customerName: conversation.current_order_draft.customer_name,
                customerEmail: conversation.current_order_draft.customer_email,
                items: conversation.current_order_draft.items?.map((item: any) => ({
                    product_id: item.product_id,
                    product_name: item.product_name,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    hasOptions: !!(item.options && item.options.length > 0)
                }))
            })

            // Validate payment method
            if (!conversation.current_order_draft.payment_method) {
                console.error('[confirm_order] Payment method missing in draft')
                return { success: false, message: 'Forma de pagamento não informada. Por favor, pergunte ao cliente como deseja pagar.' }
            }

            // Validate items
            if (!conversation.current_order_draft.items || conversation.current_order_draft.items.length === 0) {
                console.error('[confirm_order] No items in draft')
                return { success: false, message: 'Pedido não tem itens' }
            }

            console.log('[confirm_order] Creating order from draft:', {
                restaurantId,
                customerId: conversation.customer_id,
                itemsCount: conversation.current_order_draft.items?.length || 0,
                paymentMethod: conversation.current_order_draft.payment_method,
                deliveryType: conversation.current_order_draft.delivery_type,
                deliveryAddress: conversation.current_order_draft.delivery_address
            })

            // Check if there's a recent order (created in the last 10 seconds) to prevent duplicates
            const supabaseCheck = await createClient()
            const tenSecondsAgo = new Date(Date.now() - 10000).toISOString()
            const { data: recentOrders } = await supabaseCheck
                .from('orders')
                .select('id, created_at, total_amount')
                .eq('restaurant_id', restaurantId)
                .eq('customer_id', conversation.customer_id || '')
                .gte('created_at', tenSecondsAgo)
                .order('created_at', { ascending: false })
                .limit(1)
            
            if (recentOrders && recentOrders.length > 0) {
                const recentOrder = recentOrders[0]
                console.log('[confirm_order] Found recent order (created within last 10s), preventing duplicate:', {
                    orderId: recentOrder.id,
                    createdAt: recentOrder.created_at,
                    totalAmount: recentOrder.total_amount
                })
                
                // Return the existing order instead of creating a duplicate
                return {
                    success: true,
                    message: 'Pedido já foi confirmado!',
                    order_id: recentOrder.id,
                    order_number: recentOrder.id.substring(0, 8).toUpperCase(),
                }
            }

            // If no customer_id, try to create customer from phone number
            let finalCustomerId = conversation.customer_id
            let isNewCustomer = false
            
            if (!finalCustomerId && conversation.phone_number) {
                // Clean phone number (remove restaurantId suffix if present)
                // Format: "5511912345678-ff1e6c98-21e3-4f33-8ce7-d02b72445519" -> "5511912345678"
                const cleanPhone = conversation.phone_number.split('-')[0].replace(/\D/g, '')
                
                console.log('[confirm_order] No customer_id, attempting to create customer:', {
                    originalPhone: conversation.phone_number,
                    cleanPhone
                })
                
                // Extract customer name from draft if available (added by agent during conversation)
                const customerName = conversation.current_order_draft.customer_name || 'Cliente'
                const customerEmail = conversation.current_order_draft.customer_email || null
                
                console.log('[confirm_order] Customer info from draft:', {
                    name: customerName,
                    email: customerEmail,
                    hasDeliveryAddress: !!conversation.current_order_draft.delivery_address
                })
                
                const { findOrCreateCustomer } = await import('@/actions/customer')
                const { success: createSuccess, customer: newCustomer } = await findOrCreateCustomer(
                    cleanPhone,
                    customerName,
                    customerEmail
                )
                
                if (createSuccess && newCustomer) {
                    console.log('[confirm_order] Customer created/found:', {
                        id: newCustomer.id,
                        name: newCustomer.name,
                        phone: newCustomer.phone,
                        email: newCustomer.email
                    })
                    finalCustomerId = newCustomer.id
                    isNewCustomer = true
                    
                    // Update conversation with customer_id
                    await supabaseCheck
                        .from('ai_conversations')
                        .update({ customer_id: newCustomer.id })
                        .eq('id', conversationId)
                    
                    console.log('[confirm_order] Conversation updated with new customer_id')
                    
                    // If delivery type and address provided, save address
                    if (conversation.current_order_draft.delivery_type === 'delivery' && 
                        conversation.current_order_draft.delivery_address) {
                        
                        const addressString = conversation.current_order_draft.delivery_address
                        console.log('[confirm_order] Parsing address:', addressString)
                        
                        const addressParts = parseAddress(addressString)
                        
                        console.log('[confirm_order] Parsed address parts:', addressParts)
                        console.log('[confirm_order] Saving customer address:', {
                            customerId: newCustomer.id,
                            addressString,
                            addressParts
                        })
                        
                        const { saveCustomerAddress } = await import('@/actions/customer')
                        const addressResult = await saveCustomerAddress(
                            newCustomer.id,
                            addressParts.street,
                            addressParts.number,
                            addressParts.neighborhood,
                            addressParts.city,
                            addressParts.complement,
                            undefined, // reference
                            true // is_default (first address)
                        )
                        
                        if (addressResult.success) {
                            console.log('[confirm_order] ✅ Address saved successfully:', {
                                addressId: addressResult.address?.id,
                                fullAddress: addressResult.address?.address
                            })
                        } else {
                            console.error('[confirm_order] ❌ Failed to save address:', addressResult.error)
                        }
                    } else {
                        console.log('[confirm_order] Skipping address save:', {
                            deliveryType: conversation.current_order_draft.delivery_type,
                            hasAddress: !!conversation.current_order_draft.delivery_address
                        })
                    }
                } else {
                    console.warn('[confirm_order] Failed to create customer, proceeding without customer_id')
                }
            }

            // Create order
            const { order, error } = await createOrderFromDraft(
                restaurantId,
                finalCustomerId,
                conversation.current_order_draft
            )

            if (error) {
                console.error('[confirm_order] Error creating order:', error)
                return { success: false, message: `Erro ao criar pedido: ${error}` }
            }

            if (!order) {
                console.error('[confirm_order] Order creation returned null - no order object returned')
                return { success: false, message: 'Erro ao criar pedido no banco de dados' }
            }

            console.log('[confirm_order] ✅ Order created successfully in database:', {
                orderId: order.id,
                totalAmount: order.total_amount,
                status: order.status,
                paymentMethod: order.payment_method,
                deliveryType: order.delivery_type
            })

            // Clear the draft and update conversation status
            const supabaseClient = await createClient()
            const { error: clearDraftError } = await supabaseClient
                .from('ai_conversations')
                .update({ 
                    current_order_draft: null,
                    status: 'completed'
                })
                .eq('id', conversationId)
            
            if (clearDraftError) {
                console.warn('[confirm_order] Warning: Could not clear draft or update status:', clearDraftError)
            } else {
                console.log('[confirm_order] Draft cleared and conversation status updated to completed')
            }

            return {
                success: true,
                message: 'Pedido confirmado e salvo com sucesso!',
                order_id: order.id,
                order_number: order.id.substring(0, 8).toUpperCase(), // Short order ID for display
            }

        default:
            return { success: false, message: `Função desconhecida: ${functionName}` }
    }
}
