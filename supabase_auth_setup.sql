-- ====================================================================
-- INDIAN RAILWAYS DEMO OFFICER ACCOUNTS METADATA UPDATE SCRIPT
-- ====================================================================
-- Run this script in Supabase Dashboard -> SQL Editor after creating
-- the 3 users in Authentication -> Users to auto-confirm their emails
-- and assign their department metadata.

-- 1. Update TRACK Officer
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  raw_user_meta_data = jsonb_build_object('department', 'TRACK', 'full_name', 'Senior Track Maintenance Engineer')
WHERE email = 'track.officer@gmail.com';

-- 2. Update S&T Officer
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  raw_user_meta_data = jsonb_build_object('department', 'S&T', 'full_name', 'Senior Signal & Telecom Officer')
WHERE email = 'st.officer@gmail.com';

-- 3. Update TRD Officer
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  raw_user_meta_data = jsonb_build_object('department', 'TRD', 'full_name', 'Senior Traction Distribution Officer')
WHERE email = 'trd.officer@gmail.com';
