-- Add onboarding tracking and customization fields to restaurants table
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#FF3B30',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#FF9500',
ADD COLUMN IF NOT EXISTS minimum_order_value DECIMAL(10, 2) DEFAULT 0.00;

-- Add comments for clarity
COMMENT ON COLUMN restaurants.onboarding_completed IS 'Whether the user has completed the onboarding wizard';
COMMENT ON COLUMN restaurants.onboarding_step IS 'Current step in onboarding process (0-6)';
COMMENT ON COLUMN restaurants.primary_color IS 'Primary brand color for customization';
COMMENT ON COLUMN restaurants.secondary_color IS 'Secondary brand color for customization';
COMMENT ON COLUMN restaurants.minimum_order_value IS 'Minimum order value for delivery';
