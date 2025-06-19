# Simple script to create a properly encoded .env file
with open('.env', 'w', encoding='utf-8') as f:
    f.write('GEMINI_API_KEY= your API key here ')
    f.write('MISTRAL_API_KEY=your API key here ')
    print("Created .env file with API keys") 