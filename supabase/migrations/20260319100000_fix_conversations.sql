-- Fix conversations table: add last_message column and update RLS

-- 1. Add last_message column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'last_message'
  ) THEN
    ALTER TABLE public.conversations ADD COLUMN last_message text;
  END IF;
END $$;

-- 2. Fix RLS policy to allow both guest AND host to create conversations
DROP POLICY IF EXISTS "Participants can create conversations" ON public.conversations;
CREATE POLICY "Participants can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = guest_id OR auth.uid() = host_id);

-- 3. Drop the unique constraint on (listing_id, guest_id, host_id) 
-- and replace with one on (guest_id, host_id) to allow direct chats without a listing
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_listing_id_guest_id_host_id_key;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'conversations_guest_id_host_id_key'
  ) THEN
    ALTER TABLE public.conversations ADD CONSTRAINT conversations_guest_id_host_id_key UNIQUE (guest_id, host_id);
  END IF;
END $$;
