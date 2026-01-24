-- Add detailed address columns to restaurants table
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS address_cep TEXT,
ADD COLUMN IF NOT EXISTS address_street TEXT,
ADD COLUMN IF NOT EXISTS address_number TEXT,
ADD COLUMN IF NOT EXISTS address_complement TEXT,
ADD COLUMN IF NOT EXISTS address_neighborhood TEXT,
ADD COLUMN IF NOT EXISTS address_city TEXT,
ADD COLUMN IF NOT EXISTS address_state TEXT;

-- Add comments
COMMENT ON COLUMN restaurants.address_cep IS 'Postal code (CEP)';
COMMENT ON COLUMN restaurants.address_street IS 'Street name';
COMMENT ON COLUMN restaurants.address_number IS 'Building number';
COMMENT ON COLUMN restaurants.address_complement IS 'Additional address info (Apt, Suite, etc)';
COMMENT ON COLUMN restaurants.address_neighborhood IS 'Neighborhood/District';
COMMENT ON COLUMN restaurants.address_city IS 'City name';
COMMENT ON COLUMN restaurants.address_state IS 'State code (UF)';
