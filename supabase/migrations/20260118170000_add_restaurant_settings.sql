-- Add payment methods and opening hours to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '{"cash": true, "credit": true, "debit": true, "pix": true, "voucher": false}'::jsonb,
ADD COLUMN IF NOT EXISTS opening_hours JSONB DEFAULT '{
  "monday": {"open": "09:00", "close": "22:00", "enabled": true},
  "tuesday": {"open": "09:00", "close": "22:00", "enabled": true},
  "wednesday": {"open": "09:00", "close": "22:00", "enabled": true},
  "thursday": {"open": "09:00", "close": "22:00", "enabled": true},
  "friday": {"open": "09:00", "close": "22:00", "enabled": true},
  "saturday": {"open": "09:00", "close": "22:00", "enabled": true},
  "sunday": {"open": "09:00", "close": "22:00", "enabled": true}
}'::jsonb;

-- Add comments for clarity
COMMENT ON COLUMN restaurants.description IS 'Restaurant description text';
COMMENT ON COLUMN restaurants.phone IS 'Restaurant contact phone';
COMMENT ON COLUMN restaurants.email IS 'Restaurant contact email';
COMMENT ON COLUMN restaurants.payment_methods IS 'Accepted payment methods as JSON object with boolean values';
COMMENT ON COLUMN restaurants.opening_hours IS 'Opening hours for each day of the week as JSON object';
