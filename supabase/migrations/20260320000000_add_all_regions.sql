-- Migration to support all 31 regions of Tanzania
-- We convert the 'destination' column to text to avoid enum lock-in

ALTER TABLE public.listings ALTER COLUMN destination TYPE text;

-- (Optional) Drop the now unused enum if we want to clean up, 
-- but keeping it for compatibility with old migrations if they are run later in a fresh setup.
-- DROP TYPE destination_slug;

COMMENT ON COLUMN public.listings.destination IS 'Can be any of the 31 regions of Tanzania or major destinations.';
