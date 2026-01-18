-- Add structured address fields to customer_addresses table
ALTER TABLE customer_addresses 
ADD COLUMN IF NOT EXISTS street TEXT,
ADD COLUMN IF NOT EXISTS number TEXT,
ADD COLUMN IF NOT EXISTS neighborhood TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;

-- Add comment to clarify that 'address' stores the full concatenated address
COMMENT ON COLUMN customer_addresses.address IS 'Full concatenated address for display';
COMMENT ON COLUMN customer_addresses.street IS 'Street name';
COMMENT ON COLUMN customer_addresses.number IS 'Street number';
COMMENT ON COLUMN customer_addresses.neighborhood IS 'Neighborhood/district';
COMMENT ON COLUMN customer_addresses.city IS 'City name';
