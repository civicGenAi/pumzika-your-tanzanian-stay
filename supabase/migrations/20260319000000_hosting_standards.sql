-- Add hosting standards columns to listings table
DO $$ 
BEGIN
    -- 1. Create the verification status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status') THEN
        CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
    END IF;

    -- 2. Add agreed_to_standards column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'agreed_to_standards') THEN
        ALTER TABLE public.listings ADD COLUMN agreed_to_standards BOOLEAN DEFAULT FALSE;
    END IF;

    -- 3. Add verification_status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'verification_status') THEN
        ALTER TABLE public.listings ADD COLUMN verification_status verification_status DEFAULT 'pending';
    END IF;
END $$;
