-- Complete Supabase SQL Integration for MindMapAI
-- This file sets up all necessary tables, triggers, functions, and RLS policies

-- 1. User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  research_count INTEGER DEFAULT 0,
  normal_count INTEGER DEFAULT 0,
  total_generations INTEGER DEFAULT 0,
  last_login TIMESTAMP WITH TIME ZONE DEFAULT now(),
  openai_api_key TEXT,
  anthropic_api_key TEXT,
  gemini_api_key TEXT,
  cohere_api_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Usage Logs Table
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  generation_type TEXT NOT NULL CHECK (generation_type IN ('normal', 'research')),
  prompt_text TEXT,
  model_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Create user_profiles_with_email view
CREATE OR REPLACE VIEW user_profiles_with_email AS
SELECT 
  p.*,
  u.email
FROM 
  user_profiles p
JOIN 
  auth.users u ON p.id = u.id;

-- 4. Create increment function for counters
CREATE OR REPLACE FUNCTION increment(row_id UUID, field_name TEXT)
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
AS $$
  UPDATE user_profiles 
  SET 
    research_count = CASE WHEN field_name = 'research_count' THEN research_count + 1 ELSE research_count END,
    normal_count = CASE WHEN field_name = 'normal_count' THEN normal_count + 1 ELSE normal_count END,
    total_generations = CASE WHEN field_name = 'total_generations' THEN total_generations + 1 ELSE total_generations END
  WHERE id = row_id
  RETURNING 
    CASE 
      WHEN field_name = 'research_count' THEN research_count
      WHEN field_name = 'normal_count' THEN normal_count
      WHEN field_name = 'total_generations' THEN total_generations
      ELSE 0
    END;
$$;

-- 5. Create add_counts function for transferring anonymous usage
CREATE OR REPLACE FUNCTION add_counts(row_id UUID, count_to_add INTEGER, field_name TEXT)
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
AS $$
  UPDATE user_profiles 
  SET 
    research_count = CASE WHEN field_name = 'research_count' THEN research_count + count_to_add ELSE research_count END,
    normal_count = CASE WHEN field_name = 'normal_count' THEN normal_count + count_to_add ELSE normal_count END,
    total_generations = CASE WHEN field_name = 'total_generations' THEN total_generations + count_to_add ELSE total_generations END
  WHERE id = row_id
  RETURNING 
    CASE 
      WHEN field_name = 'research_count' THEN research_count
      WHEN field_name = 'normal_count' THEN normal_count
      WHEN field_name = 'total_generations' THEN total_generations
      ELSE 0
    END;
$$;

-- 6. Create trigger to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 7. Row Level Security Policies
-- Enable RLS on tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- User Profiles RLS Policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Usage Logs RLS Policies
CREATE POLICY "Users can view their own usage logs"
  ON usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage logs"
  ON usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow anonymous usage logging"
  ON usage_logs FOR INSERT
  WITH CHECK (user_id IS NULL);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_session_id ON usage_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at); 