create table if not exists chat_messages (
  id uuid default gen_random_uuid() primary key,
  restaurant_id uuid references restaurants(id) on delete cascade not null,
  customer_phone text not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_chat_messages_restaurant_phone on chat_messages(restaurant_id, customer_phone);
