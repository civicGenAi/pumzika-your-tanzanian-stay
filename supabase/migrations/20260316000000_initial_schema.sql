-- PUMZIKA INITIAL SCHEMA MIGRATION
-- This script is idempotent and can be run multiple times.

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ENUM TYPES
do $$ 
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('guest', 'host', 'both', 'admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'listing_status') then
    create type listing_status as enum ('draft', 'published', 'paused');
  end if;
  if not exists (select 1 from pg_type where typname = 'destination_slug') then
    create type destination_slug as enum ('zanzibar', 'arusha', 'kilimanjaro', 'dodoma');
  end if;
  if not exists (select 1 from pg_type where typname = 'cancellation_policy') then
    create type cancellation_policy as enum ('flexible', 'moderate', 'strict', 'non_refundable');
  end if;
  if not exists (select 1 from pg_type where typname = 'availability_status') then
    create type availability_status as enum ('available', 'booked', 'blocked_by_host', 'pending');
  end if;
  if not exists (select 1 from pg_type where typname = 'pricing_rule_type') then
    create type pricing_rule_type as enum ('seasonal', 'weekend', 'last_minute', 'long_stay');
  end if;
  if not exists (select 1 from pg_type where typname = 'booking_status') then
    create type booking_status as enum (
      'pending_approval', 'confirmed', 'active', 'completed', 
      'cancelled_by_guest', 'cancelled_by_host', 'declined', 'expired'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'booking_mode') then
    create type booking_mode as enum ('instant', 'request');
  end if;
end $$;

-- 3. TABLES

-- USERS
create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  phone text unique,
  full_name text not null,
  avatar_url text,
  role user_role default 'guest' not null,
  is_verified boolean default false,
  is_superhost boolean default false,
  response_rate integer,
  response_time text,
  languages text[] default '{}',
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.users enable row level security;
drop policy if exists "Users can read all profiles" on public.users;
create policy "Users can read all profiles" on public.users for select using (true);
drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- LISTINGS
create table if not exists public.listings (
  id uuid default uuid_generate_v4() primary key,
  host_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text not null,
  property_type text not null,
  status listing_status default 'draft' not null,
  destination destination_slug not null,
  region text not null,
  address text not null,
  latitude double precision,
  longitude double precision,
  max_guests integer not null,
  bedrooms integer not null,
  beds integer not null,
  bathrooms integer not null,
  base_price bigint not null,
  cleaning_fee bigint default 0,
  security_deposit bigint default 0,
  min_nights integer default 1,
  max_nights integer,
  instant_book boolean default false,
  cancellation_policy cancellation_policy default 'flexible' not null,
  amenities text[] default '{}',
  host_languages text[] default '{}',
  weekend_price_multiplier double precision default 1.0,
  average_rating numeric(3,2) default 0.0,
  review_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.listings enable row level security;
drop policy if exists "listings_select" on public.listings;
create policy "listings_select" on public.listings for select using (status = 'published' OR auth.uid() = host_id);
drop policy if exists "listings_insert" on public.listings;
create policy "listings_insert" on public.listings for insert with check (auth.uid() = host_id);
drop policy if exists "listings_update" on public.listings;
create policy "listings_update" on public.listings for update using (auth.uid() = host_id);
drop policy if exists "listings_delete" on public.listings;
create policy "listings_delete" on public.listings for delete using (auth.uid() = host_id);

-- LISTING IMAGES
create table if not exists public.listing_images (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  url text not null,
  caption text,
  is_primary boolean default false,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.listing_images enable row level security;
drop policy if exists "Images are public" on public.listing_images;
create policy "Images are public" on public.listing_images for select using (true);
drop policy if exists "Hosts can manage own images" on public.listing_images;
create policy "Hosts can manage own images" on public.listing_images for all using (
  exists (select 1 from public.listings where id = listing_images.listing_id and host_id = auth.uid())
);

-- LISTING AVAILABILITY
create table if not exists public.listing_availability (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  date date not null,
  status availability_status default 'available' not null,
  price_override bigint,
  unique(listing_id, date)
);

create index if not exists idx_listing_availability_date on public.listing_availability (listing_id, date);

alter table public.listing_availability enable row level security;
drop policy if exists "Availability is public" on public.listing_availability;
create policy "Availability is public" on public.listing_availability for select using (true);
drop policy if exists "Hosts manage availability" on public.listing_availability;
create policy "Hosts manage availability" on public.listing_availability for all using (
  exists (select 1 from public.listings where id = listing_availability.listing_id and host_id = auth.uid())
);

-- PRICING RULES
create table if not exists public.pricing_rules (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  rule_type pricing_rule_type not null,
  start_date date,
  end_date date,
  price_modifier double precision not null,
  min_nights_required integer default 1,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.pricing_rules enable row level security;
drop policy if exists "Pricing rules are public" on public.pricing_rules;
create policy "Pricing rules are public" on public.pricing_rules for select using (true);
drop policy if exists "Hosts can manage pricing rules" on public.pricing_rules;
create policy "Hosts can manage pricing rules" on public.pricing_rules for all using (
  exists (select 1 from public.listings where id = pricing_rules.listing_id and host_id = auth.uid())
);

-- BOOKINGS
create table if not exists public.bookings (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  guest_id uuid references public.users(id) on delete cascade not null,
  host_id uuid references public.users(id) on delete cascade not null,
  check_in date not null,
  check_out date not null,
  total_nights integer not null,
  guests_count integer not null,
  status booking_status default 'pending_approval' not null,
  booking_mode booking_mode not null,
  base_price_per_night bigint not null,
  subtotal bigint not null,
  cleaning_fee bigint default 0,
  service_fee_guest bigint not null,
  service_fee_host bigint not null,
  total_guest_pays bigint not null,
  total_host_receives bigint not null,
  platform_revenue bigint not null,
  cancellation_policy cancellation_policy not null,
  cancellation_reason text,
  cancelled_at timestamp with time zone,
  special_requests text,
  payment_id text,
  payment_status text default 'pending',
  payout_id text,
  payout_status text default 'pending',
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_bookings_guest_id on public.bookings (guest_id);
create index if not exists idx_bookings_host_id on public.bookings (host_id);
create index if not exists idx_bookings_listing_id on public.bookings (listing_id);
create index if not exists idx_bookings_status on public.bookings (status);
create index if not exists idx_bookings_check_in on public.bookings (check_in);

alter table public.bookings enable row level security;
drop policy if exists "Users see own bookings" on public.bookings;
create policy "Users see own bookings" on public.bookings for select using (auth.uid() = guest_id or auth.uid() = host_id);
drop policy if exists "Guests can create bookings" on public.bookings;
create policy "Guests can create bookings" on public.bookings for insert with check (auth.uid() = guest_id);
drop policy if exists "Participants update bookings" on public.bookings;
create policy "Participants update bookings" on public.bookings for update using (auth.uid() = guest_id or auth.uid() = host_id);

-- REVIEWS
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings(id) on delete cascade not null,
  reviewer_id uuid references public.users(id) on delete cascade not null,
  reviewee_id uuid references public.users(id) on delete cascade not null,
  listing_id uuid references public.listings(id) on delete cascade not null,
  review_type text not null,
  overall_rating integer check (overall_rating >= 1 and overall_rating <= 5) not null,
  cleanliness_rating integer,
  accuracy_rating integer,
  communication_rating integer,
  location_rating integer,
  checkin_rating integer,
  value_rating integer,
  comment text,
  is_published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reviews enable row level security;
drop policy if exists "Reviews are public" on public.reviews;
create policy "Reviews are public" on public.reviews for select using (true);
drop policy if exists "Reviewers see own reviews" on public.reviews;
create policy "Reviewers see own reviews" on public.reviews for select using (auth.uid() = reviewer_id);
drop policy if exists "Reviewers can insert own reviews" on public.reviews;
create policy "Reviewers can insert own reviews" on public.reviews for insert with check (auth.uid() = reviewer_id);

-- CONVERSATIONS
create table if not exists public.conversations (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  guest_id uuid references public.users(id) on delete cascade not null,
  host_id uuid references public.users(id) on delete cascade not null,
  last_message_at timestamp with time zone default timezone('utc'::text, now()),
  is_read_guest boolean default false,
  is_read_host boolean default false,
  unique(listing_id, guest_id, host_id)
);

alter table public.conversations enable row level security;
drop policy if exists "Participants see conversations" on public.conversations;
create policy "Participants see conversations" on public.conversations for select using (auth.uid() = guest_id or auth.uid() = host_id);
drop policy if exists "Participants can create conversations" on public.conversations;
create policy "Participants can create conversations" on public.conversations for insert with check (auth.uid() = guest_id);
drop policy if exists "Participants can update conversations" on public.conversations;
create policy "Participants can update conversations" on public.conversations for update using (auth.uid() = guest_id or auth.uid() = host_id);

-- MESSAGES
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.users(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_messages_conversation_created on public.messages (conversation_id, created_at desc);

alter table public.messages enable row level security;
drop policy if exists "Participants see messages" on public.messages;
create policy "Participants see messages" on public.messages for select using (
  exists (select 1 from public.conversations where id = messages.conversation_id and (guest_id = auth.uid() or host_id = auth.uid()))
);
drop policy if exists "Participants can send messages" on public.messages;
create policy "Participants can send messages" on public.messages for insert with check (auth.uid() = sender_id);

-- NOTIFICATIONS
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  type text not null,
  title text not null,
  body text not null,
  data jsonb default '{}'::jsonb,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_notifications_user_read_created on public.notifications (user_id, is_read, created_at desc);

alter table public.notifications enable row level security;
drop policy if exists "Users see own notifications" on public.notifications;
create policy "Users see own notifications" on public.notifications for select using (auth.uid() = user_id);
drop policy if exists "Users update own notifications" on public.notifications;
create policy "Users update own notifications" on public.notifications for update using (auth.uid() = user_id);
drop policy if exists "System can insert notifications" on public.notifications;
create policy "System can insert notifications" on public.notifications for insert with check (true);

-- 4. FUNCTIONS & TRIGGERS

-- Updated_at handler
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- New user trigger
create or replace function public.handle_new_user()
returns trigger as $$
declare
  _full_name text;
  _role public.user_role;
  _phone text;
begin
  -- 1. Safe Metadata Extraction
  _full_name := coalesce(new.raw_user_meta_data->>'full_name', 'Pumzika User');
  
  -- 2. Safe Role Casting
  begin
    _role := (coalesce(new.raw_user_meta_data->>'role', 'guest'))::public.user_role;
  exception when others then
    _role := 'guest'::public.user_role;
  end;

  -- 3. Safe Phone Formatting (treat empty as null)
  _phone := nullif(trim(new.raw_user_meta_data->>'phone'), '');

  -- 4. Defensive Insert with conflict handling for ID and Email
  insert into public.users (id, email, full_name, role, phone)
  values (new.id, new.email, _full_name, _role, _phone)
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role,
    phone = case 
      when excluded.phone is null then public.users.phone 
      else excluded.phone 
    end,
    updated_at = now();
    
  return new;
exception when others then
  -- Ultimate fallback: never block auth.users creation
  return new;
end;
$$ language plpgsql security definer;

-- Re-attach triggers (idempotent)
drop trigger if exists on_users_updated on public.users;
create trigger on_users_updated before update on public.users for each row execute procedure public.handle_updated_at();

drop trigger if exists on_listings_updated on public.listings;
create trigger on_listings_updated before update on public.listings for each row execute procedure public.handle_updated_at();

drop trigger if exists on_bookings_updated on public.bookings;
create trigger on_bookings_updated before update on public.bookings for each row execute procedure public.handle_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
