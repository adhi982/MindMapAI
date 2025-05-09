import os
from dotenv import load_dotenv

# Try to load .env file
print("Attempting to load .env file...")
load_dotenv()

# Check for API keys
gemini_key = os.getenv("GEMINI_API_KEY", "")
mistral_key = os.getenv("MISTRAL_API_KEY", "")

print(f"Environment variables loaded:")
print(f"GEMINI_API_KEY: {'[Set]' if gemini_key else '[Not set]'} (length: {len(gemini_key)})")
print(f"MISTRAL_API_KEY: {'[Set]' if mistral_key else '[Not set]'} (length: {len(mistral_key)})")

# Check if .env file exists and try to read it directly
print("\nDirect file access:")
try:
    with open('.env', 'r', encoding='utf-8') as f:
        content = f.read()
        print("File content:")
        print(content)
        
    # Try parsing manually
    lines = content.strip().split('\n')
    for line in lines:
        if '=' in line:
            key, value = line.split('=', 1)
            print(f"Parsed key: {key} = {'[Value set]' if value else '[Empty]'} (length: {len(value)})")
except Exception as e:
    print(f"Error reading file: {e}") 