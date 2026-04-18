-- Remove segment 'beauty' (cosméticos → varejo/outros). Idempotente para quem já rodou a migração anterior com 5 valores.

UPDATE restaurants SET segment = 'retail' WHERE segment = 'beauty';

ALTER TABLE restaurants DROP CONSTRAINT IF EXISTS restaurants_segment_check;

ALTER TABLE restaurants
  ADD CONSTRAINT restaurants_segment_check
  CHECK (segment IN ('food', 'fashion', 'handcraft', 'retail'));

COMMENT ON COLUMN restaurants.segment IS 'Business segment: food, fashion, handcraft, retail';
