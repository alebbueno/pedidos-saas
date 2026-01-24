-- Enable Realtime for orders and order_items
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table order_items;
