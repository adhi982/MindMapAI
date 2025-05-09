-- SQL functions to handle API key storage and retrieval

-- Create api_keys table if it doesn't exist
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  provider TEXT NOT NULL,
  api_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Function to insert or update API keys (upsert operation)
CREATE OR REPLACE FUNCTION insert_api_key(
  p_user_id UUID,
  p_email TEXT,
  p_provider TEXT,
  p_api_key TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- Use a more reliable upsert operation
  INSERT INTO api_keys (user_id, email, provider, api_key, created_at, last_used)
  VALUES (
    p_user_id,
    p_email,
    p_provider,
    p_api_key,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id, provider) 
  DO UPDATE SET 
    api_key = EXCLUDED.api_key,
    last_used = NOW();
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in insert_api_key: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all API keys for a user with RLS bypass
CREATE OR REPLACE FUNCTION get_user_api_keys(
  p_user_id UUID
) RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH user_keys AS (
    SELECT provider, api_key FROM api_keys WHERE user_id = p_user_id
  )
  SELECT json_build_object(
    'gemini_api_key', (SELECT api_key FROM user_keys WHERE provider = 'google'),
    'openai_api_key', (SELECT api_key FROM user_keys WHERE provider = 'openai'),
    'anthropic_api_key', (SELECT api_key FROM user_keys WHERE provider = 'anthropic'),
    'cohere_api_key', (SELECT api_key FROM user_keys WHERE provider = 'cohere')
  ) INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in get_user_api_keys: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view to safely get user data including email
CREATE OR REPLACE VIEW users_with_email AS
SELECT 
  id,
  email,
  last_login,
  total_generations
FROM users;

-- Set up proper RLS policies for api_keys table
CREATE POLICY api_keys_select_policy
  ON api_keys
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY api_keys_insert_policy
  ON api_keys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY api_keys_update_policy
  ON api_keys
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION insert_api_key TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_api_keys TO authenticated;
GRANT SELECT ON users_with_email TO authenticated; 