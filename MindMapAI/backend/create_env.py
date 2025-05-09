# Simple script to create a properly encoded .env file
with open('.env', 'w', encoding='utf-8') as f:
    f.write('GEMINI_API_KEY=AIzaSyAqd9XeAC4zIqBn71kec9uMXJSMYcxvczM\n')
    f.write('MISTRAL_API_KEY=W28Ya09JhYoDDwlYy91FacYWCpMvBTXj\n')
    print("Created .env file with API keys") 