-- DIAGNOSTIC SCRIPT FOR API KEYS ISSUE
-- This script will check permissions and insert an API key directly

-- Step 1: Check if the api_keys table exists and its structure
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns
WHERE 
  table_name = 'api_keys'
ORDER BY 
  ordinal_position;

-- Step 2: Check existing RLS policies on the api_keys table
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM
  pg_policies
WHERE
  tablename = 'api_keys';

-- Step 3: Try inserting the API key using SECURITY DEFINER context
-- which will bypass the RLS policies
-- (Note: You need to replace 'AIzaSyYourActualGoogleAPIKey' with your real API key)

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Check if the record already exists
  SELECT COUNT(*) 
  INTO v_count
  FROM api_keys
  WHERE 
    user_id = '15e94205-e74e-4404-bb5a-37642792d0a7' AND
    provider = 'google';
    
  -- Log the info
  RAISE NOTICE 'Found % existing records for this user/provider', v_count;
  
  -- Insert or update
  IF v_count > 0 THEN
    -- Update existing
    UPDATE api_keys
    SET 
      api_key = 'AIzaSyYourActualGoogleAPIKey',
      last_used = NOW()
    WHERE 
      user_id = '15e94205-e74e-4404-bb5a-37642792d0a7' AND
      provider = 'google';
      
    RAISE NOTICE 'Updated existing API key record';
  ELSE
    -- Insert new
    INSERT INTO api_keys (
      user_id,
      email,
      provider,
      api_key,
      created_at,
      last_used
    )
    VALUES (
      '15e94205-e74e-4404-bb5a-37642792d0a7',
      'salepiqa@asciibinder.net',
      'google',
      'AIzaSyYourActualGoogleAPIKey',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Inserted new API key record';
  END IF;
  
  -- Verify
  SELECT COUNT(*) 
  INTO v_count
  FROM api_keys
  WHERE 
    user_id = '15e94205-e74e-4404-bb5a-37642792d0a7' AND
    provider = 'google' AND
    api_key = 'AIzaSyYourActualGoogleAPIKey';
    
  RAISE NOTICE 'Verification: Found % matching records with the correct API key', v_count;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
END
$$;

-- Step 4: Verify the API key after insertion
SELECT 
  user_id, 
  email,
  provider, 
  LEFT(api_key, 5) || '...' || RIGHT(api_key, 3) AS api_key_sample,
  LENGTH(api_key) AS api_key_length,
  created_at,
  last_used
FROM 
  api_keys
WHERE 
  user_id = '15e94205-e74e-4404-bb5a-37642792d0a7';

-- Step 5: Check for column constraints that might be causing issues
SELECT 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM 
  information_schema.table_constraints tc
JOIN 
  information_schema.key_column_usage kcu
ON 
  tc.constraint_name = kcu.constraint_name
LEFT JOIN 
  information_schema.constraint_column_usage ccu
ON 
  ccu.constraint_name = tc.constraint_name
WHERE 
  tc.table_name = 'api_keys'
ORDER BY 
  tc.constraint_name, 
  kcu.column_name; 