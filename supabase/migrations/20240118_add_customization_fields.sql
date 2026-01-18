-- Add customization columns to restaurants table
alter table restaurants
add column if not exists primary_color text default '#F97316',
add column if not exists secondary_color text default '#1F2937',
add column if not exists background_color text default '#FFFFFF',
add column if not exists text_color text default '#000000',
add column if not exists logo_url text,
add column if not exists banner_url text,
add column if not exists font_family text default 'inter';
