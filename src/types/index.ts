export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Restaurant {
  id: string
  created_at: string
  name: string
  slug: string
  logo_url: string | null
  whatsapp_number: string | null
  address: string | null
  // Detailed address fields
  address_cep?: string | null
  address_street?: string | null
  address_number?: string | null
  address_complement?: string | null
  address_neighborhood?: string | null
  address_city?: string | null
  address_state?: string | null
  opening_hours: {
    [key: string]: {
      open: string
      close: string
      enabled: boolean
    }
  } | null
  delivery_fee: number
  minimum_order_value?: number
  is_open: boolean
  subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled'
  stripe_customer_id: string | null
  ai_config: {
    prompt?: string
    welcome_message?: string
  } | null
  owner_id?: string
  // Customization fields
  primary_color?: string | null
  secondary_color?: string | null
  background_color?: string | null
  text_color?: string | null
  banner_url?: string | null
  font_family?: string | null
  // Additional fields
  description?: string | null
  phone?: string | null
  email?: string | null
  payment_methods?: {
    cash?: boolean
    credit?: boolean
    debit?: boolean
    pix?: boolean
    voucher?: boolean
  } | null
  // Half and half configuration
  half_and_half_pricing_method?: 'highest' | 'average' | 'sum'
}

export interface Category {
  id: string
  restaurant_id: string
  name: string
  display_order: number
  allows_half_and_half?: boolean
}

export interface Product {
  id: string
  restaurant_id: string
  category_id: string | null
  name: string
  description: string | null
  base_price: number
  image_url: string | null
  is_active: boolean
  allows_half_and_half?: boolean
}

export interface ProductOptionGroup {
  id: string
  product_id: string
  name: string
  type: 'single' | 'multiple'
  min_selection: number
  max_selection: number
  price_rule: 'sum' | 'highest' | 'average'
  options?: ProductOption[]
  product_options?: ProductOption[] // Supabase returns this name
}

export interface ProductOption {
  id: string
  group_id: string
  name: string
  price_modifier: number
  is_available: boolean
}

export interface Customer {
  id: string
  restaurant_id: string
  name: string
  phone: string
  address: string | null
  last_order_at: string | null
}

export interface Order {
  id: string
  restaurant_id: string
  customer_id: string | null
  status: 'new' | 'confirmed' | 'preparing' | 'delivery' | 'completed' | 'canceled'
  total_amount: number
  payment_method: string | null
  delivery_type: 'delivery' | 'pickup'
  delivery_address: string | null
  created_at: string
  items?: OrderItem[]
  customer?: Customer
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  options_selected: CartItemOption[]
  product?: Product
}

// Cart Types
export interface CartItemOption {
  group_name: string
  option_name: string
  price: number
}

export interface CartItem {
  itemId: string // temporary ID for cart
  product: Product
  quantity: number
  selectedOptions: CartItemOption[]
  totalPrice: number
  // Half and half structure (optional)
  half_and_half?: {
    first_half: {
      product: Product // Product selected for first half
      options: CartItemOption[]
      price: number
    }
    second_half: {
      product: Product // Product selected for second half
      options: CartItemOption[]
      price: number
    }
  }
}

