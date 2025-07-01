from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any, Dict
from nlp_service import extract_concepts_and_relationships, research_and_extract, GEMINI_API_KEY, MISTRAL_API_KEY
from mermaid_formatter import to_mermaid
from fastapi.middleware.cors import CORSMiddleware

print("Starting FastAPI application")

# Define constant
MOCK_MODE = False
if not GEMINI_API_KEY or len(GEMINI_API_KEY) < 10:
    if not MISTRAL_API_KEY or len(MISTRAL_API_KEY) < 10:
        print("No valid API keys found - enabling MOCK_MODE")
        MOCK_MODE = True
    else:
        print("Using Mistral API only")
else:
    print("API keys detected")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mindmapai-ns7n.onrender.com",  # your new frontend URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MapRequest(BaseModel):
    text: str
    research_mode: bool = False

class MapResponse(BaseModel):
    mermaid: str
    api_used: str = "gemini"  # Default, will be updated based on actual use

@app.get("/")
async def root():
    return {"status": "ok", "mock_mode": MOCK_MODE}

@app.get("/debug")
async def debug():
    # Mask the API keys for security but show if they're loaded
    gemini_status = "Not set" if not GEMINI_API_KEY else f"Set (length: {len(GEMINI_API_KEY)})"
    mistral_status = "Not set" if not MISTRAL_API_KEY else f"Set (length: {len(MISTRAL_API_KEY)})"
    
    return {
        "mock_mode": MOCK_MODE,
        "gemini_api_key": gemini_status,
        "mistral_api_key": mistral_status,
        "gemini_api_key_placeholder": GEMINI_API_KEY == "your_gemini_api_key_here",
        "mistral_api_key_placeholder": MISTRAL_API_KEY == "your_mistral_api_key_here",
    }

@app.post("/generate_map", response_model=MapResponse)
async def generate_map(request: MapRequest):
    try:
        print(f"Generate map request for: '{request.text}', Research mode: {request.research_mode}")
        
        if request.research_mode:
            # If research mode is enabled, perform web search and create mind map
            nlp_result = await research_and_extract(request.text)
            
            # Set API used based on response
            api_used = nlp_result.get("api_used", "unknown")
            
            # Ensure prefix for research mode
            if "mistral" in api_used:
                api_used = "research+mistral"
            elif "gemini" in api_used:
                api_used = "research+gemini"
            elif api_used == "mock_mode":
                api_used = "mock_mode (research)"
            else:
                api_used = f"research+{api_used}"
        else:
            # Direct text mode - uses Mistral only as per updated logic
            nlp_result = await extract_concepts_and_relationships(request.text)
            
            # In non-research mode, will always be Mistral unless in mock mode
            api_used = nlp_result.get("api_used", "mistral")
        
        # Pass the original query text to the formatter to ensure it's used as the main topic
        mermaid = to_mermaid(nlp_result.get("nodes", []), nlp_result.get("edges", []), main_topic=request.text)
        print(f"Generated mind map with API: {api_used}")
        return MapResponse(mermaid=mermaid, api_used=api_used)
    except Exception as e:
        print(f"Error generating mind map: {str(e)}")
        if MOCK_MODE:
            raise HTTPException(status_code=500, detail=f"Error in mock mode: {str(e)}. To use real AI models, provide valid API keys in .env file.") 
        else:
            raise HTTPException(status_code=500, detail=f"Failed to generate mind map: {str(e)}") 