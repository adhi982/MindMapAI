import os

def create_env_file():
    if os.path.exists('.env'):
        overwrite = input("An .env file already exists. Overwrite? (y/n): ").lower()
        if overwrite != 'y':
            print("Operation cancelled.")
            return

    gemini_key = input("Enter your Gemini API key: ")
    mistral_key = input("Enter your Mistral API key: ")
    
    with open('.env', 'w', encoding='utf-8') as f:
        f.write(f'GEMINI_API_KEY={gemini_key}\n')
        f.write(f'MISTRAL_API_KEY={mistral_key}\n')
    
    print("Created .env file with API keys")
    print("NOTE: Make sure to add .env to your .gitignore file")

if __name__ == "__main__":
    create_env_file()