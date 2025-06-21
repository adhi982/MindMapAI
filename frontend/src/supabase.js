import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase URL and anon key
const supabaseUrl = 'https://kldvwpuyyvjktetagppj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsZHZ3cHV5eXZqa3RldGFncHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3ODc2MDAsImV4cCI6MjA2MjM2MzYwMH0.cHPQvWb4Ek7F-FbBOa50gb4ck7RX2TEC9sQ18Z3W2JI';

// Initialize Supabase client with auto session refresh
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'mindmap_auth_token',
    storage: localStorage
  }
});

// Database schema creation instructions for reference
// You'll need to create the following tables in Supabase:

/*
Table: users (handled by Supabase Auth)
  - id (uuid, primary key, created by Supabase Auth)
  - email (string, created by Supabase Auth)
  - created_at (timestamp, created by Supabase Auth)
  
Table: user_profiles
  - id (uuid, primary key, references users.id)
  - research_count (integer, default: 0)
  - normal_count (integer, default: 0)
  - last_login (timestamp)
  - openai_api_key (text, nullable)
  - anthropic_api_key (text, nullable)
  - gemini_api_key (text, nullable)
  - cohere_api_key (text, nullable)
  - total_generations (integer, default: 0)
  
Table: usage_logs
  - id (uuid, primary key)
  - user_id (uuid, references users.id, nullable for anonymous users)
  - session_id (text, for tracking anonymous users)
  - generation_type (text, 'normal' or 'research')
  - created_at (timestamp, default: now())
  - prompt_text (text)
  - model_used (text)
*/

// Helper functions for tracking usage
export const incrementUsage = async (userId, type) => {
  if (userId) {
    // For logged in users, we'll increment a counter in the users table
    try {
      // First get current values
      const { data, error } = await supabase
        .from('users')
        .select('total_generations')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user data for usage increment:', error);
        // Still track usage locally even if we fail to update the server
        const localUsage = getLocalUsage();
        localUsage[type] += 1;
        localStorage.setItem('mindmap_usage', JSON.stringify(localUsage));
        return false;
      }
      
      // Increment the total generations count
      const currentCount = data?.total_generations || 0;
      const { error: updateError } = await supabase
        .from('users')
        .update({ total_generations: currentCount + 1 })
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating user generations count:', updateError);
      }
      
      // Log the usage
      await logUsage(userId, null, type, null, null);
      
      return !updateError;
    } catch (err) {
      console.error('Unexpected error incrementing usage:', err);
      // Fall back to local storage
      const localUsage = getLocalUsage();
      localUsage[type] += 1;
      localStorage.setItem('mindmap_usage', JSON.stringify(localUsage));
      return false;
    }
  } else {
    // For anonymous users, use localStorage
    const localUsage = getLocalUsage();
    localUsage[type] += 1;
    localStorage.setItem('mindmap_usage', JSON.stringify(localUsage));
    return true;
  }
};

export const getLocalUsage = () => {
  return JSON.parse(localStorage.getItem('mindmap_usage') || '{"research": 0, "normal": 0}');
};

export const checkUsageLimits = (type) => {
  const localUsage = getLocalUsage();
  if (type === 'research') {
    return localUsage.research < 2; // Allow 2 research generations
  } else {
    return localUsage.normal < 5; // Allow 5 normal generations
  }
};

export const logUsage = async (userId, sessionId, type, promptText, modelUsed) => {
  const { error } = await supabase
    .from('usage_logs')
    .insert({
      user_id: userId,
      session_id: sessionId || crypto.randomUUID(),
      generation_type: type,
      prompt_text: promptText,
      model_used: modelUsed
    });
  
  return !error;
};

export const storeApiKey = async (userId, provider, apiKey) => {
  if (!userId) {
    console.error('Cannot store API key: No user ID provided');
    return false;
  }
  
  try {
    console.log(`Attempting to store ${provider} API key for user ${userId}`);
    console.log(`API key will be stored in plaintext format: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 3)}`);
    
    // First get the user's email
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Failed to get user data:', userError);
      return false;
    }
    
    const email = userData.user.email;
    console.log(`Got user email: ${email}`);
    
    // APPROACH 1: Direct insert/update through JS client
    console.log("Trying approach 1: Direct upsert operation");
    try {
      const { data: apiKeyData, error: apiKeyError } = await supabase
        .from('api_keys')
        .upsert([
          {
            user_id: userId,
            email: email,
            provider: provider,
            api_key: apiKey,
            created_at: new Date().toISOString(),
            last_used: new Date().toISOString()
          }
        ], {
          onConflict: 'user_id,provider'
        });
      
      console.log('API key upsert result:', apiKeyData, apiKeyError);
      
      if (apiKeyError) {
        console.error(`Error in approach 1: ${apiKeyError.message}`, apiKeyError);
      } else {
        console.log("Approach 1 successful!");
        return true;
      }
    } catch (err) {
      console.error("Exception in approach 1:", err);
    }
    
    // APPROACH 2: Try basic insert with ON CONFLICT DO UPDATE
    console.log("Trying approach 2: INSERT with ON CONFLICT");
    try {
      const { data: insertData, error: insertError } = await supabase
        .rpc('insert_api_key', { 
          p_user_id: userId,
          p_email: email,
          p_provider: provider,
          p_api_key: apiKey
        });
      
      console.log('Insert result:', insertData, insertError);
      
      if (insertError) {
        console.error(`Error in approach 2: ${insertError.message}`, insertError);
      } else {
        console.log("Approach 2 successful!");
        return true;
      }
    } catch (err) {
      console.error("Exception in approach 2:", err);
    }
    
    // APPROACH 3: Try a direct INSERT first, then UPDATE if it fails
    console.log("Trying approach 3: Separate INSERT then UPDATE");
    try {
      // First try to insert
      const { error: insertError } = await supabase
        .from('api_keys')
        .insert([
          {
            user_id: userId,
            email: email,
            provider: provider,
            api_key: apiKey,
            created_at: new Date().toISOString()
          }
        ]);
      
      // If insert failed (likely due to existing record), try update
      if (insertError) {
        console.log('Insert failed, trying update instead:', insertError);
        
        const { error: updateError } = await supabase
          .from('api_keys')
          .update({ 
            api_key: apiKey,
            last_used: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('provider', provider);
        
        if (updateError) {
          console.error('Update also failed:', updateError);
          return false;
        } else {
          console.log("Approach 3 successful with update!");
          return true;
        }
      } else {
        console.log("Approach 3 successful with insert!");
        return true;
      }
    } catch (err) {
      console.error("Exception in approach 3:", err);
    }
    
    console.error('All approaches failed to store API key');
    return false;
  } catch (err) {
    console.error('Unexpected error storing API key:', err);
    return false;
  }
};

export const getUserApiKeys = async (userId) => {
  if (!userId) {
    console.log("getUserApiKeys: No userId provided");
    return null;
  }
  
  try {
    console.log(`Fetching API keys for user ${userId}`);
    
    // First try to get from api_keys table
    const { data, error } = await supabase
      .from('api_keys')
      .select('provider, api_key')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching from api_keys table:', error);
      
      // Try fallback to direct query
      console.log("Trying fallback direct query...");
      const { data: directData, error: directError } = await supabase
        .rpc('get_user_api_keys', { p_user_id: userId });
      
      if (directError) {
        console.error('Error with direct query fallback:', directError);
        return null;
      }
      
      if (directData) {
        console.log(`Found api keys via direct query: ${Object.keys(directData).length}`);
        return directData;
      }
      
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log('No API keys found for this user');
      return null;
    }
    
    console.log(`Found ${data.length} API keys for the user`);
    
    // Transform the data into the expected format
    const apiKeys = {
      gemini_api_key: null,
      openai_api_key: null,
      anthropic_api_key: null,
      cohere_api_key: null,
      email: null
    };
    
    // Get the user's email from auth
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.email) {
        apiKeys.email = userData.user.email;
        console.log(`Got user email: ${apiKeys.email}`);
      }
    } catch (emailErr) {
      console.error("Error getting user email:", emailErr);
    }
    
    // Map the provider names to the expected keys
    data.forEach(item => {
      if (!item.provider || !item.api_key) {
        console.warn("Invalid API key record:", item);
        return;
      }
      
      console.log(`Processing API key for provider: ${item.provider} (length: ${item.api_key.length})`);
      
      const providerKey = `${item.provider}_api_key`;
      if (providerKey in apiKeys) {
        apiKeys[providerKey] = item.api_key;
      } else if (item.provider === 'google') {
        apiKeys.gemini_api_key = item.api_key;
      }
    });
    
    // Check which keys were found
    Object.entries(apiKeys)
      .filter(([key]) => key.includes('_api_key'))
      .forEach(([key, value]) => {
        if (value) {
          console.log(`Found key for ${key.replace('_api_key', '')}: ${value.substring(0, 5)}...`);
        }
      });
    
    return apiKeys;
  } catch (err) {
    console.error('Unexpected error fetching API keys:', err);
    return null;
  }
};

export const updateLastLogin = async (userId) => {
  if (!userId) return false;
  
  try {
    console.log(`Updating last login for user ${userId}`);
    
    // Update the last_login field in the users table
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date() })
      .eq('id', userId);
    
    if (error) {
      console.error('Error updating last login:', error);
      return false;
    }
    
    // Also record in login_history
    const { data: userData } = await supabase.auth.getUser();
    const email = userData?.user?.email;
    
    if (email) {
      const { error: historyError } = await supabase
        .from('login_history')
        .insert([{
          user_id: userId,
          email: email,
          login_time: new Date()
        }]);
      
      if (historyError) {
        console.error('Error recording login history:', historyError);
      }
    }
    
    return true;
  } catch (err) {
    console.error('Unexpected error updating last login:', err);
    return false;
  }
};

// Function to verify and set up database schema if needed
export const verifyDatabaseSetup = async () => {
  try {
    // Check if api_keys table exists
    const { error: apiKeysError } = await supabase
      .from('api_keys')
      .select('id')
      .limit(1);
    
    if (apiKeysError && apiKeysError.code === '42P01') {
      console.warn('API keys table not set up. Please run the SQL setup script.');
      return { 
        success: false, 
        message: 'API keys table not set up. Please run the SQL setup script in frontend/src/sql/api_key_functions.sql in the Supabase SQL editor.'
      };
    }
    
    // Check if users_with_email view exists
    const { error: viewError } = await supabase
      .from('users_with_email')
      .select('id')
      .limit(1);
    
    if (viewError && viewError.code === '42P01') {
      console.warn('Database views not set up. Please run the SQL setup script.');
      return { 
        success: false, 
        message: 'Database views not set up. Please run the SQL setup script in frontend/src/sql/api_key_functions.sql in the Supabase SQL editor.'
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error verifying database setup:', error);
    return { 
      success: false, 
      message: 'Error verifying database setup. Please check your Supabase connection.'
    };
  }
}; 