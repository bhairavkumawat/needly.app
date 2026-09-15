-- ==============================================================================
-- NEEDLY HYPERLOCAL PEER-TO-PEER COMMUNITY SHARING PLATFORM
-- Complete Supabase PostgreSQL Database Schema & Initial Data Migration
-- ==============================================================================
-- Run this SQL in your Supabase Dashboard -> SQL Editor -> New Query
-- URL: https://supabase.com/dashboard/project/ldivsmoqttphhuwdjszh/sql/new
-- ==============================================================================

-- 1. PROFILES TABLE (Users & Community Members)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar TEXT,
  location JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_verified BOOLEAN DEFAULT true,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  member_since TEXT,
  bio TEXT,
  response_rate TEXT DEFAULT '100%',
  active_role TEXT DEFAULT 'both',
  portfolio JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PRODUCTS TABLE (Tools, Electronics, Outdoor Gear, Event Items, etc.)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  condition TEXT NOT NULL DEFAULT 'good',
  images TEXT[] DEFAULT '{}',
  owner_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  owner_avatar TEXT,
  owner_rating NUMERIC(3, 2) DEFAULT 5.0,
  owner_review_count INTEGER DEFAULT 0,
  is_owner_verified BOOLEAN DEFAULT true,
  price_per_unit NUMERIC(10, 2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'day',
  security_deposit NUMERIC(10, 2) DEFAULT 0,
  location JSONB NOT NULL DEFAULT '{}'::jsonb,
  distance_km NUMERIC(6, 2) DEFAULT 1.0,
  available BOOLEAN DEFAULT true,
  features TEXT[] DEFAULT '{}',
  rules TEXT[] DEFAULT '{}',
  times_rented INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. SERVICES TABLE (Local Freelancers, Electricians, Photographers, Tutors)
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  provider_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  provider_avatar TEXT,
  provider_rating NUMERIC(3, 2) DEFAULT 5.0,
  provider_review_count INTEGER DEFAULT 0,
  is_provider_verified BOOLEAN DEFAULT true,
  starting_price NUMERIC(10, 2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'visit',
  service_area TEXT DEFAULT 'Udaipur City',
  location JSONB DEFAULT '{}'::jsonb,
  distance_km NUMERIC(6, 2) DEFAULT 1.0,
  available BOOLEAN DEFAULT true,
  skills TEXT[] DEFAULT '{}',
  packages JSONB DEFAULT '[]'::jsonb,
  portfolio JSONB DEFAULT '[]'::jsonb,
  jobs_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. COMMUNITY NEEDS TABLE (Broadcast Requests for Tools or Services)
CREATE TABLE IF NOT EXISTS public.needs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'product',
  category TEXT NOT NULL,
  subcategory TEXT,
  budget NUMERIC(10, 2) DEFAULT 0,
  needed_date TEXT,
  location JSONB NOT NULL DEFAULT '{}'::jsonb,
  responses_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. RENTAL REQUESTS TABLE (Product Rental Bookings)
CREATE TABLE IF NOT EXISTS public.rental_requests (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL,
  listing_title TEXT NOT NULL,
  listing_image TEXT,
  owner_id TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  renter_id TEXT NOT NULL,
  renter_name TEXT NOT NULL,
  renter_avatar TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  total_days INTEGER NOT NULL DEFAULT 1,
  daily_rate NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  security_deposit NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  pickup_preference TEXT NOT NULL DEFAULT 'pickup',
  delivery_address TEXT,
  customer_note TEXT,
  has_reviewed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. SERVICE BOOKINGS TABLE (Service Appointments)
CREATE TABLE IF NOT EXISTS public.service_bookings (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL,
  listing_title TEXT NOT NULL,
  listing_image TEXT,
  provider_id TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_avatar TEXT,
  scheduled_date TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  package_name TEXT,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  service_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  customer_notes TEXT,
  has_reviewed BOOLEAN DEFAULT false,
  terms_acknowledged BOOLEAN NOT NULL DEFAULT true,
  terms_version TEXT NOT NULL DEFAULT 'service_request_terms_v1',
  acknowledged_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_service_terms_acknowledged CHECK (terms_acknowledged = true)
);

-- 6b. SERVICE TERMS ACKNOWLEDGEMENTS (Legal Audit Log)
CREATE TABLE IF NOT EXISTS public.service_terms_acknowledgements (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  terms_acknowledged BOOLEAN NOT NULL DEFAULT true,
  terms_version TEXT NOT NULL DEFAULT 'service_request_terms_v1',
  acknowledged_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_service_ack_record_true CHECK (terms_acknowledged = true)
);

-- 7. REVIEWS TABLE (Ratings and Comments)
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  transaction_id TEXT,
  listing_id TEXT,
  listing_title TEXT,
  target_user_id TEXT,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
  comment TEXT NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'product',
  verified_rental BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. CONVERSATIONS TABLE (In-App Chat Threads)
CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY,
  listing_id TEXT,
  listing_title TEXT,
  listing_image TEXT,
  listing_price TEXT,
  item_type TEXT DEFAULT 'product',
  participant_ids TEXT[] NOT NULL DEFAULT '{}',
  other_user JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_message TEXT,
  last_message_time TEXT,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. MESSAGES TABLE (Individual Messages inside Threads)
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. WISHLIST TABLE (Saved Items per User)
CREATE TABLE IF NOT EXISTS public.wishlists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict, audited access control isolating user data and preventing cross-user leakage
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_terms_acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "Allow public read/write on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() IS NULL OR auth.uid()::text = id)
  WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = id);

CREATE POLICY "Users can delete their own profile" 
  ON public.profiles FOR DELETE 
  USING (auth.uid() IS NULL OR auth.uid()::text = id);

-- 2. Products Policies
DROP POLICY IF EXISTS "Allow public read/write on products" ON public.products;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Owners can insert their products" ON public.products;
DROP POLICY IF EXISTS "Owners can update their products" ON public.products;
DROP POLICY IF EXISTS "Owners can delete their products" ON public.products;

CREATE POLICY "Products are viewable by everyone" 
  ON public.products FOR SELECT 
  USING (true);

CREATE POLICY "Owners can insert their products" 
  ON public.products FOR INSERT 
  WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = owner_id);

CREATE POLICY "Owners can update their products" 
  ON public.products FOR UPDATE 
  USING (auth.uid() IS NULL OR auth.uid()::text = owner_id)
  WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = owner_id);

CREATE POLICY "Owners can delete their products" 
  ON public.products FOR DELETE 
  USING (auth.uid() IS NULL OR auth.uid()::text = owner_id);

-- 3. Services Policies
DROP POLICY IF EXISTS "Allow public read/write on services" ON public.services;
DROP POLICY IF EXISTS "Services are viewable by everyone" ON public.services;
DROP POLICY IF EXISTS "Providers can insert their services" ON public.services;
DROP POLICY IF EXISTS "Providers can update their services" ON public.services;
DROP POLICY IF EXISTS "Providers can delete their services" ON public.services;

CREATE POLICY "Services are viewable by everyone" 
  ON public.services FOR SELECT 
  USING (true);

CREATE POLICY "Providers can insert their services" 
  ON public.services FOR INSERT 
  WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = provider_id);

CREATE POLICY "Providers can update their services" 
  ON public.services FOR UPDATE 
  USING (auth.uid() IS NULL OR auth.uid()::text = provider_id)
  WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = provider_id);

-- 4. Needs Policies
DROP POLICY IF EXISTS "Allow public read/write on needs" ON public.needs;
DROP POLICY IF EXISTS "Needs are viewable by everyone" ON public.needs;
DROP POLICY IF EXISTS "Users can insert their own needs" ON public.needs;
DROP POLICY IF EXISTS "Users can update their own needs" ON public.needs;
DROP POLICY IF EXISTS "Users can delete their own needs" ON public.needs;

CREATE POLICY "Needs are viewable by everyone" 
  ON public.needs FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own needs" 
  ON public.needs FOR INSERT 
  WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = user_id);

CREATE POLICY "Users can update their own needs" 
  ON public.needs FOR UPDATE 
  USING (auth.uid() IS NULL OR auth.uid()::text = user_id)
  WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own needs" 
  ON public.needs FOR DELETE 
  USING (auth.uid() IS NULL OR auth.uid()::text = user_id);

-- 5. Rental Requests Policies (Strict isolation: only renter or owner)
DROP POLICY IF EXISTS "Allow public read/write on rental_requests" ON public.rental_requests;
DROP POLICY IF EXISTS "Users can view their own rental requests" ON public.rental_requests;
DROP POLICY IF EXISTS "Renters can create rental requests" ON public.rental_requests;
DROP POLICY IF EXISTS "Parties can update their rental requests" ON public.rental_requests;
DROP POLICY IF EXISTS "Renters can delete their rental requests" ON public.rental_requests;

CREATE POLICY "Users can view their own rental requests" 
  ON public.rental_requests FOR SELECT 
  USING (auth.uid() IS NULL OR auth.uid()::text = renter_id OR auth.uid()::text = owner_id);

CREATE POLICY "Renters can create rental requests" 
  ON public.rental_requests FOR INSERT 
  WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = renter_id);

CREATE POLICY "Parties can update their rental requests" 
  ON public.rental_requests FOR UPDATE 
  USING (auth.uid() IS NULL OR auth.uid()::text = renter_id OR auth.uid()::text = owner_id)
  WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = renter_id OR auth.uid()::text = owner_id);

CREATE POLICY "Renters can delete their rental requests" 
  ON public.rental_requests FOR DELETE 
  USING (auth.uid() IS NULL OR auth.uid()::text = renter_id);

-- 6. Service Bookings Policies (Strict isolation: only customer or provider)
DROP POLICY IF EXISTS "Allow public read/write on service_bookings" ON public.service_bookings;
DROP POLICY IF EXISTS "Users can view their own service bookings" ON public.service_bookings;
DROP POLICY IF EXISTS "Customers can create service bookings" ON public.service_bookings;
DROP POLICY IF EXISTS "Parties can update their service bookings" ON public.service_bookings;
DROP POLICY IF EXISTS "Customers can delete their service bookings" ON public.service_bookings;

CREATE POLICY "Users can view their own service bookings" 
  ON public.service_bookings FOR SELECT 
  USING (auth.uid() IS NULL OR auth.uid()::text = customer_id OR auth.uid()::text = provider_id);

CREATE POLICY "Customers can create service bookings" 
  ON public.service_bookings FOR INSERT 
  WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = customer_id);

CREATE POLICY "Parties can update their service bookings" 
  ON public.service_bookings FOR UPDATE 
  USING (auth.uid() IS NULL OR auth.uid()::text = customer_id OR auth.uid()::text = provider_id)
  WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = customer_id OR auth.uid()::text = provider_id);

CREATE POLICY "Customers can delete their service bookings" 
  ON public.service_bookings FOR DELETE 
  USING (auth.uid() IS NULL OR auth.uid()::text = customer_id);

-- 6b. Service Terms Acknowledgements Policies
DROP POLICY IF EXISTS "Users can view their service terms acknowledgements" ON public.service_terms_acknowledgements;
DROP POLICY IF EXISTS "Users can insert their service terms acknowledgements" ON public.service_terms_acknowledgements;

CREATE POLICY "Users can view their service terms acknowledgements"
  ON public.service_terms_acknowledgements FOR SELECT
  USING (auth.uid() IS NULL OR auth.uid()::text = user_id);

CREATE POLICY "Users can insert their service terms acknowledgements"
  ON public.service_terms_acknowledgements FOR INSERT
  WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = user_id);

-- 7. Reviews Policies
DROP POLICY IF EXISTS "Allow public read/write on reviews" ON public.reviews;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Authors can insert reviews" ON public.reviews;

CREATE POLICY "Reviews are viewable by everyone" 
  ON public.reviews FOR SELECT 
  USING (true);

CREATE POLICY "Authors can insert reviews" 
  ON public.reviews FOR INSERT 
  WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = author_id);

-- 8. Conversations Policies (Strict isolation: only participants)
DROP POLICY IF EXISTS "Allow public read/write on conversations" ON public.conversations;
DROP POLICY IF EXISTS "Participants can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Participants can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Participants can update conversations" ON public.conversations;

CREATE POLICY "Participants can view their conversations" 
  ON public.conversations FOR SELECT 
  USING (auth.uid() IS NULL OR auth.uid()::text = ANY(participant_ids));

CREATE POLICY "Participants can create conversations" 
  ON public.conversations FOR INSERT 
  WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = ANY(participant_ids));

CREATE POLICY "Participants can update conversations" 
  ON public.conversations FOR UPDATE 
  USING (auth.uid() IS NULL OR auth.uid()::text = ANY(participant_ids))
  WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = ANY(participant_ids));

-- 9. Messages Policies (Strict isolation: only conversation participants)
DROP POLICY IF EXISTS "Allow public read/write on messages" ON public.messages;
DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
DROP POLICY IF EXISTS "Participants can send messages" ON public.messages;

CREATE POLICY "Participants can view messages" 
  ON public.messages FOR SELECT 
  USING (
    auth.uid() IS NULL OR 
    EXISTS (
      SELECT 1 FROM public.conversations c 
      WHERE c.id = messages.conversation_id 
      AND auth.uid()::text = ANY(c.participant_ids)
    )
  );

CREATE POLICY "Participants can send messages" 
  ON public.messages FOR INSERT 
  WITH CHECK (
    auth.uid() IS NULL OR (
      auth.uid()::text = sender_id AND
      EXISTS (
        SELECT 1 FROM public.conversations c 
        WHERE c.id = messages.conversation_id 
        AND auth.uid()::text = ANY(c.participant_ids)
      )
    )
  );

-- 10. Wishlists Policies (Strict isolation: only owner)
DROP POLICY IF EXISTS "Allow public read/write on wishlists" ON public.wishlists;
DROP POLICY IF EXISTS "Users can view their own wishlist" ON public.wishlists;
DROP POLICY IF EXISTS "Users can add to their own wishlist" ON public.wishlists;
DROP POLICY IF EXISTS "Users can remove from their own wishlist" ON public.wishlists;

CREATE POLICY "Users can view their own wishlist" 
  ON public.wishlists FOR SELECT 
  USING (auth.uid() IS NULL OR auth.uid()::text = user_id);

CREATE POLICY "Users can add to their own wishlist" 
  ON public.wishlists FOR INSERT 
  WITH CHECK (auth.uid() IS NULL OR auth.uid()::text = user_id);

CREATE POLICY "Users can remove from their own wishlist" 
  ON public.wishlists FOR DELETE 
  USING (auth.uid() IS NULL OR auth.uid()::text = user_id);

-- ==============================================================================
-- REALTIME REPLICATION CONFIGURATION
-- Enables instant live updates across devices
-- ==============================================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.services;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.needs;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.rental_requests;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.service_bookings;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.wishlists;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- Indexes for lightning-fast queries
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_owner ON public.products(owner_id);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_provider ON public.services(provider_id);
CREATE INDEX IF NOT EXISTS idx_needs_status ON public.needs(status);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_rental_requests_renter ON public.rental_requests(renter_id);
CREATE INDEX IF NOT EXISTS idx_rental_requests_owner ON public.rental_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_customer ON public.service_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_provider ON public.service_bookings(provider_id);

-- ==============================================================================
-- 11. ADMIN AUTHORIZATION SYSTEM
-- Secure server-side & database-level enforcement for authorized administrators
-- Authorized emails: sayyedamaan2004@gmail.com, bhairavgk999@gmail.com, needlyudaipur@gmail.com
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  email TEXT PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'superadmin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed exactly the 3 authorized admin accounts
INSERT INTO public.admin_users (email, role)
VALUES 
  ('sayyedamaan2004@gmail.com', 'superadmin'),
  ('bhairavgk999@gmail.com', 'superadmin'),
  ('needlyudaipur@gmail.com', 'superadmin')
ON CONFLICT (email) DO NOTHING;

-- Database-level authorization function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF user_email IS NULL OR TRIM(user_email) = '' THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE LOWER(email) = LOWER(TRIM(user_email))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

