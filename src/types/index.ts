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
  opening_hours: string | null
  delivery_fee: number
  is_open: boolean
  subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled'
  stripe_customer_id: string | null
  ai_config: {
    prompt?: string
    welcome_message?: string
  } | null
  owner_id?: string
}

export interface Category {
  id: string
  restaurant_id: string
  name: string
  display_order: number
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
}
