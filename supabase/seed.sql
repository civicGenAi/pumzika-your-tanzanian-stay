-- PUMZIKA SEED DATA
-- Note: This seed creates a test host user and 8 listings.

-- 1. Create a test host user in auth.users (local development hack)
-- In production, users are created via the Auth API.
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, confirmation_token, recovery_token, email_change_token_new, email_change_confirm_status)
VALUES (
    'h0570000-0000-0000-0000-000000000000', 
    'host@pumzika.com', 
    crypt('password123', gen_salt('bf')), 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    '{"full_name":"Bakari Tanzania","phone":"+255712345678","role":"host"}', 
    now(), now(), 'authenticated', '', '', '', 0
) ON CONFLICT (id) DO NOTHING;

-- Note: The trigger handle_new_user will automatically create the public.users record.

-- 2. Insert 8 sample listings for Tanzania
-- destination enums: 'zanzibar', 'arusha', 'kilimanjaro', 'dodoma'

-- 1. The Dhow House (Nungwi, Zanzibar)
INSERT INTO public.listings (
    title, description, property_type, status, destination, region, address, 
    max_guests, bedrooms, beds, bathrooms, base_price, amenities, instant_book, host_id
) VALUES (
    'The Dhow House', 
    'Experience authentic coastal living in this stunning traditional dhow-inspired house right on the sands of Nungwi.', 
    'Entire Home', 'published', 'zanzibar', 'Nungwi', 'Nungwi Beach, Zanzibar', 
    6, 3, 3, 2, 120000, 
    ARRAY['Beachfront', 'Wifi', 'Kitchen', 'Air conditioning'], true, 
    'h0570000-0000-0000-0000-000000000000'
);

-- 2. Baobab Garden Villa (Arusha)
INSERT INTO public.listings (
    title, description, property_type, status, destination, region, address, 
    max_guests, bedrooms, beds, bathrooms, base_price, amenities, host_id
) VALUES (
    'Baobab Garden Villa', 
    'Nestled among ancient baobabs, this modern villa offers a peaceful retreat with easy access to Arusha city.', 
    'Entire Home', 'published', 'arusha', 'Arusha City', 'Baobab Road, Arusha', 
    4, 2, 2, 2, 85000, 
    ARRAY['Garden', 'Wifi', 'Parking', 'Kitchen'], 
    'h0570000-0000-0000-0000-000000000000'
);

-- 3. Kibo Summit Cottage (Kilimanjaro)
INSERT INTO public.listings (
    title, description, property_type, status, destination, region, address, 
    max_guests, bedrooms, beds, bathrooms, base_price, amenities, instant_book, host_id
) VALUES (
    'Kibo Summit Cottage', 
    'Wake up to breathtaking views of Mt. Kilimanjaro. This cozy cottage is the perfect base for climbers.', 
    'Cottage', 'published', 'kilimanjaro', 'Moshi', 'Marangu, Kilimanjaro', 
    2, 1, 1, 1, 65000, 
    ARRAY['Mountain View', 'Wifi', 'Fireplace'], true, 
    'h0570000-0000-0000-0000-000000000000'
);

-- 4. Stone Town Heritage Suite (Zanzibar)
INSERT INTO public.listings (
    title, description, property_type, status, destination, region, address, 
    max_guests, bedrooms, beds, bathrooms, base_price, amenities, host_id
) VALUES (
    'Stone Town Heritage Suite', 
    'Immerse yourself in history in this beautifully restored suite in the heart of Stone Town.', 
    'Private Room', 'published', 'zanzibar', 'Stone Town', 'Kenyatta Road, Stone Town', 
    2, 1, 1, 1, 95000, 
    ARRAY['Historic', 'Wifi', 'Air conditioning'], 
    'h0570000-0000-0000-0000-000000000000'
);

-- 5. Capitol Hill Apartment (Dodoma)
INSERT INTO public.listings (
    title, description, property_type, status, destination, region, address, 
    max_guests, bedrooms, beds, bathrooms, base_price, amenities, host_id
) VALUES (
    'Capitol Hill Apartment', 
    'A practical and stylish apartment in Tanzania''s capital. Ideal for business travelers.', 
    'Entire Apartment', 'published', 'dodoma', 'City Center', 'Capital Hill, Dodoma', 
    2, 1, 1, 1, 55000, 
    ARRAY['City View', 'Wifi', 'Desk'], 
    'h0570000-0000-0000-0000-000000000000'
);

-- 6. Serengeti Edge Lodge (Arusha)
INSERT INTO public.listings (
    title, description, property_type, status, destination, region, address, 
    max_guests, bedrooms, beds, bathrooms, base_price, amenities, host_id
) VALUES (
    'Serengeti Edge Lodge', 
    'Experience luxury at the edge of the wilderness. This lodge offers unparalleled views.', 
    'Safari Lodge', 'published', 'arusha', 'Outskirts', 'Serengeti Gate Rd, Arusha', 
    4, 2, 2, 2, 180000, 
    ARRAY['Luxury', 'Safari', 'Pool', 'Breakfast Included'], 
    'h0570000-0000-0000-0000-000000000000'
);

-- 7. Matemwe Beach Banda (Zanzibar)
INSERT INTO public.listings (
    title, description, property_type, status, destination, region, address, 
    max_guests, bedrooms, beds, bathrooms, base_price, amenities, host_id
) VALUES (
    'Matemwe Beach Banda', 
    'Rustic charm meets ocean breeze. Stay in a traditional beachfront banda.', 
    'Bungalow', 'published', 'zanzibar', 'Matemwe', 'Matemwe Beach, North Zanzibar', 
    2, 1, 1, 1, 70000, 
    ARRAY['Beachfront', 'Rustic', 'No Wifi'], 
    'h0570000-0000-0000-0000-000000000000'
);

-- 8. Marangu Route Guesthouse (Kilimanjaro)
INSERT INTO public.listings (
    title, description, property_type, status, destination, region, address, 
    max_guests, bedrooms, beds, bathrooms, base_price, amenities, host_id
) VALUES (
    'Marangu Route Guesthouse', 
    'A welcoming and affordable guesthouse in Marangu, the gateway to Kilimanjaro.', 
    'Guesthouse', 'published', 'kilimanjaro', 'Marangu', 'Marangu Gate, Kilimanjaro', 
    10, 5, 8, 3, 45000, 
    ARRAY['Budget', 'Group Friendly', 'Hiking'], 
    'h0570000-0000-0000-0000-000000000000'
);
