import os
import httpx
import json
import sys
from dotenv import load_dotenv
from typing import List, Dict, Tuple
import asyncio

# Add print statements to debug
print("Starting nlp_service.py")

try:
    # Load environment variables
    print("Loading environment variables...")
    load_dotenv()
    
    # Get API keys and print their lengths for debugging
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
    MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "").strip()
    SERPER_API_KEY = os.getenv("SERPER_API_KEY", "").strip()  # For web search
    
    print(f"API Keys loaded - Gemini: {len(GEMINI_API_KEY)} chars, Mistral: {len(MISTRAL_API_KEY)} chars")
    
    # Simple validation for API keys
    VALID_GEMINI_API = len(GEMINI_API_KEY) >= 10
    VALID_MISTRAL_API = len(MISTRAL_API_KEY) >= 10
    
    print(f"=== API KEY STATUS ===")
    print(f"Gemini API key length: {len(GEMINI_API_KEY)} (Valid: {VALID_GEMINI_API})")
    print(f"Mistral API key length: {len(MISTRAL_API_KEY)} (Valid: {VALID_MISTRAL_API})")
    print(f"======================")

    # If we have no valid API keys, set mock mode
    MOCK_MODE = not (VALID_GEMINI_API or VALID_MISTRAL_API)
    
    # API URLs - Updated to use Gemini 1.5 Flash model with fixed API endpoint structure
    GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
    MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
    SERPER_API_URL = "https://google.serper.dev/search"
except Exception as e:
    print(f"Error initializing nlp_service: {str(e)}")
    print(f"Exception type: {type(e)}")
    print(f"Exception traceback: {sys.exc_info()}")
    # Set defaults
    MOCK_MODE = True
    GEMINI_API_KEY = ""
    MISTRAL_API_KEY = ""
    SERPER_API_KEY = ""
    VALID_GEMINI_API = False
    VALID_MISTRAL_API = False
    GEMINI_API_URL = ""
    MISTRAL_API_URL = ""
    SERPER_API_URL = ""

async def web_search(query: str, num_results: int = 5) -> List[Dict]:
    """Perform a web search using Serper API (Google Search API alternative)."""
    try:
        if not SERPER_API_KEY:
            print("No SERPER_API_KEY found. Skipping web search.")
            return []
        
        headers = {
            "X-API-KEY": SERPER_API_KEY,
            "Content-Type": "application/json"
        }
        payload = {
            "q": query,
            "num": num_results
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(SERPER_API_URL, json=payload, headers=headers, timeout=30)
                response.raise_for_status()
                data = response.json()
                
                results = []
                if "organic" in data:
                    for item in data["organic"]:
                        results.append({
                            "title": item.get("title", ""),
                            "snippet": item.get("snippet", ""),
                            "link": item.get("link", "")
                        })
                return results
        except Exception as e:
            print(f"Web search error: {e}")
            return []
    except Exception as e:
        print(f"Error in web_search: {str(e)}")
        return []

async def extract_info_from_search_results(search_results: List[Dict], topic: str) -> str:
    """Combine search results into a single text for further processing."""
    if not search_results:
        return f"Information about {topic}."
    
    combined_text = f"Research on {topic}:\n\n"
    for i, result in enumerate(search_results, 1):
        combined_text += f"Source {i}:\n"
        combined_text += f"Title: {result['title']}\n"
        combined_text += f"Summary: {result['snippet']}\n\n"
    
    return combined_text

async def call_gemini(text: str, is_research_mode: bool = False) -> Dict:
    """Call the Gemini API to extract concepts and relationships."""
    example_structure = """
    Example structure similar to:
    - Main Topic: "Agentic AI Development Methodologies" 
    - Main categories:
      - "Architectural Approaches" → connects to "Multi-Agent Systems", "Hierarchical Reinforcement Learning", "Goal-Directed Model Architectures"
      - "Learning Paradigms" → connects to "Supervised Learning", "Unsupervised Learning", "Reinforcement Learning"
      - "Training and Evaluation Techniques" → connects to "Situation-Based Testing", "Curriculum Learning", "Multi-Task Learning"
      - "Tools and Frameworks" → connects to "OpenAI Gym", "Unity ML-Agents", "TensorFlow Agents", "PyMARL", "Rasa"
    
    Use simple, direct relationships without verbose descriptions. Focus on clear hierarchy and organization.
    """

    base_prompt = f"""
    Create a structured mind map about the given topic that matches the following example structure.
    
    {example_structure}
    
    Return ONLY a valid JSON object with these fields:
    - 'nodes': A list of concept names (15-25 total nodes)
    - 'edges': A list of [source, target, ""] triples (use empty string for the relationship)
    
    Important requirements:
    1. Create a hierarchical structure with ONE central topic and 3-5 main categories
    2. Each main category should have 2-5 subcategories/examples
    3. Ensure connections are simple with NO verbose text descriptions
    4. Focus on organization similar to the example structure
    5. Produce a balanced mind map with clean concepts
    """
    
    research_prompt = f"""
    Create a comprehensive structured mind map based on your research that matches the following example structure.
    
    {example_structure}
    
    Return ONLY a valid JSON object with these fields:
    - 'nodes': A list of concept names (20-30 total nodes)
    - 'edges': A list of [source, target, ""] triples (use empty string for the relationship)
    
    Important requirements:
    1. Create a hierarchical structure with ONE central topic and 4-6 main categories
    2. Each main category should have 3-6 subcategories/examples
    3. Ensure connections are simple with NO verbose text descriptions
    4. Focus on organization similar to the example structure
    5. Produce a balanced mind map with clean concepts
    """
    
    prompt = research_prompt if is_research_mode else base_prompt
    prompt += f"\n\nText: {text}"
    
    # Updated payload structure for the Gemini 1.5 Flash model
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "topP": 0.8,
            "topK": 40,
            "maxOutputTokens": 2048
        },
        "safetySettings": [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_ONLY_HIGH"
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_ONLY_HIGH"
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_ONLY_HIGH"
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_ONLY_HIGH"
            }
        ]
    }
    
    try:
        print(f"Calling Gemini API with model: {GEMINI_API_URL}")
        async with httpx.AsyncClient() as client:
            response = await client.post(GEMINI_API_URL, json=payload, timeout=45)
            
            if response.status_code != 200:
                print(f"Gemini API error status: {response.status_code}")
                print(f"Response content: {response.text[:500]}")
                
            response.raise_for_status()
            data = response.json()
            
            # Parse Gemini's response to extract nodes and edges
            text_response = data["candidates"][0]["content"]["parts"][0]["text"]
            
            # Find the JSON part in the response (handles potential text wrapper)
            json_start = text_response.find('{')
            json_end = text_response.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = text_response[json_start:json_end]
                result = json.loads(json_str)
                # Add info about which API was used
                result["api_used"] = "gemini"
                return result
            else:
                print("Could not find valid JSON in Gemini response")
                return {"nodes": [], "edges": [], "api_used": "gemini_failed"}
                
    except Exception as e:
        print(f"Gemini API error: {e}")
        return {"nodes": [], "edges": [], "api_used": "gemini_failed"}

async def call_mistral(text: str, is_research_mode: bool = False) -> Dict:
    """Call the Mistral API to extract concepts and relationships."""
    example_structure = """
    Example structure similar to:
    - Main Topic: "Agentic AI Development Methodologies" 
    - Main categories:
      - "Architectural Approaches" → connects to "Multi-Agent Systems", "Hierarchical Reinforcement Learning", "Goal-Directed Model Architectures"
      - "Learning Paradigms" → connects to "Supervised Learning", "Unsupervised Learning", "Reinforcement Learning"
      - "Training and Evaluation Techniques" → connects to "Situation-Based Testing", "Curriculum Learning", "Multi-Task Learning"
      - "Tools and Frameworks" → connects to "OpenAI Gym", "Unity ML-Agents", "TensorFlow Agents", "PyMARL", "Rasa"
    
    Use simple, direct relationships without verbose descriptions. Focus on clear hierarchy and organization.
    """

    base_prompt = f"""
    Create a structured mind map about the given topic that matches the following example structure.
    
    {example_structure}
    
    Return ONLY a valid JSON object with these fields:
    - 'nodes': A list of concept names (15-25 total nodes)
    - 'edges': A list of [source, target, ""] triples (use empty string for the relationship)
    
    Important requirements:
    1. Create a hierarchical structure with ONE central topic and 3-5 main categories
    2. Each main category should have 2-5 subcategories/examples
    3. Ensure connections are simple with NO verbose text descriptions
    4. Focus on organization similar to the example structure
    5. Produce a balanced mind map with clean concepts
    """
    
    research_prompt = f"""
    Create a comprehensive structured mind map based on your research that matches the following example structure.
    
    {example_structure}
    
    Return ONLY a valid JSON object with these fields:
    - 'nodes': A list of concept names (20-30 total nodes)
    - 'edges': A list of [source, target, ""] triples (use empty string for the relationship)
    
    Important requirements:
    1. Create a hierarchical structure with ONE central topic and 4-6 main categories
    2. Each main category should have 3-6 subcategories/examples
    3. Ensure connections are simple with NO verbose text descriptions
    4. Focus on organization similar to the example structure
    5. Produce a balanced mind map with clean concepts
    """
    
    prompt = research_prompt if is_research_mode else base_prompt
    prompt += f"\n\nText: {text}"
    
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "mistral-tiny",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(MISTRAL_API_URL, headers=headers, json=payload, timeout=45)
            response.raise_for_status()
            data = response.json()
            
            # Get the text response
            text_response = data["choices"][0]["message"]["content"]
            
            # Find the JSON part in the response (handles potential text wrapper)
            json_start = text_response.find('{')
            json_end = text_response.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = text_response[json_start:json_end]
                result = json.loads(json_str)
                # Add info about which API was used
                result["api_used"] = "mistral"
                return result
            else:
                print("Could not find valid JSON in Mistral response")
                return {"nodes": [], "edges": [], "api_used": "mistral_failed"}
                
    except Exception as e:
        print(f"Mistral API error: {e}")
        return {"nodes": [], "edges": [], "api_used": "mistral_failed"}

async def research_and_extract(text: str):
    """Perform web search and then extract concepts and relationships."""
    try:
        print(f"Starting research_and_extract for: {text}")
        
        # If we're in mock mode, return mock data
        if MOCK_MODE:
            print("Using MOCK_MODE for research")
            mock_nodes = ["Java Agent Development", "Agent Architecture", "Java APIs", "Libraries", "Frameworks", 
                          "JADE", "JACK", "Jason", "Jadex", "Java Agent Development Framework",
                          "BDI Model", "Communication Protocols", "FIPA Standards", "ACL Messages",
                          "Concurrency", "Multithreading", "Distributed Systems", "Agent Mobility"]
            mock_edges = [
                ["Java Agent Development", "Agent Architecture", ""],
                ["Java Agent Development", "Java APIs", ""],
                ["Java Agent Development", "Libraries", ""],
                ["Java Agent Development", "Frameworks", ""],
                ["Frameworks", "JADE", ""],
                ["Frameworks", "JACK", ""],
                ["Frameworks", "Jason", ""],
                ["Frameworks", "Jadex", ""],
                ["JADE", "Java Agent Development Framework", "is"],
                ["Agent Architecture", "BDI Model", "includes"],
                ["Java APIs", "Communication Protocols", ""],
                ["Communication Protocols", "FIPA Standards", "follows"],
                ["Communication Protocols", "ACL Messages", "uses"],
                ["Java APIs", "Concurrency", "supports"],
                ["Concurrency", "Multithreading", "through"],
                ["Java Agent Development", "Distributed Systems", "enables"],
                ["Distributed Systems", "Agent Mobility", "supports"]
            ]
            return {"nodes": mock_nodes, "edges": mock_edges, "api_used": "mock_mode"}
        
        # Perform web search - we'll extract top results
        search_results = await web_search(text)
        
        # Combine search results with original query
        research_text = await extract_info_from_search_results(search_results, text)
        
        print(f"Research completed, now generating mind map with {'Gemini' if VALID_GEMINI_API else 'Mistral'}")
        
        # Always try Gemini first for research mode (as it handles complexity better)
        if VALID_GEMINI_API:
            try:
                result = await call_gemini(research_text, True)
                if result.get("nodes") and result.get("edges"):
                    return result
            except Exception as e:
                print(f"Gemini API error in research mode: {e}")
        
        # Fall back to Mistral if Gemini fails or isn't available
        if VALID_MISTRAL_API:
            try:
                result = await call_mistral(research_text, True)
                return result
            except Exception as e:
                print(f"Mistral API error in research mode: {e}")
        
        # If both fail, return a simplified mock response
        print("Both APIs failed, returning mock data")
        mock_nodes = ["Java Agent Development", "Failed to process with APIs"]
        mock_edges = [["Java Agent Development", "Failed to process with APIs", "error"]]
        return {"nodes": mock_nodes, "edges": mock_edges, "api_used": "api_failure"}
        
    except Exception as e:
        print(f"Error in research_and_extract: {str(e)}")
        error_nodes = ["Error", "Processing Failed"]
        error_edges = [["Error", "Processing Failed", str(e)]]
        return {"nodes": error_nodes, "edges": error_edges, "api_used": "error"}

async def extract_concepts_and_relationships(text: str, is_research_mode: bool = False):
    """Extract concepts and relationships from text using AI."""
    try:
        if MOCK_MODE:
            print("Using MOCK_MODE for extraction")
            mock_nodes = ["Java Developer", "Skills", "Technologies", "Roles", "Education",
                        "Java", "Spring", "Hibernate", "SQL", "Git",
                        "Backend Developer", "Software Engineer", "Application Developer",
                        "CS Degree", "Java Certification"]
            mock_edges = [
                ["Java Developer", "Skills", "needs"],
                ["Java Developer", "Technologies", "uses"],
                ["Java Developer", "Roles", "can be"],
                ["Java Developer", "Education", "requires"],
                ["Skills", "Java", "includes"],
                ["Skills", "SQL", "includes"],
                ["Skills", "Git", "includes"],
                ["Technologies", "Spring", "includes"],
                ["Technologies", "Hibernate", "includes"],
                ["Roles", "Backend Developer", "such as"],
                ["Roles", "Software Engineer", "such as"],
                ["Roles", "Application Developer", "such as"],
                ["Education", "CS Degree", "like"],
                ["Education", "Java Certification", "or"]
            ]
            return {"nodes": mock_nodes, "edges": mock_edges, "api_used": "mock_mode"}
        
        print(f"Extraction started for: {text} with research_mode: {is_research_mode}")
        
        # For standard mode (not research) - use Mistral
        if VALID_MISTRAL_API:
            try:
                result = await call_mistral(text, is_research_mode)
                return result
            except Exception as e:
                print(f"Mistral API error: {e}")
        
        # Fall back to Gemini only if Mistral fails
        if VALID_GEMINI_API:
            try:
                result = await call_gemini(text, is_research_mode)
                return result
            except Exception as e:
                print(f"Gemini API error: {e}")
                
        # If both fail, return an error map
        error_nodes = ["Error", "API Processing Failed"]
        error_edges = [["Error", "API Processing Failed", "Both Mistral and Gemini failed"]]
        return {"nodes": error_nodes, "edges": error_edges, "api_used": "api_failure"}
            
    except Exception as e:
        print(f"Error in extract_concepts_and_relationships: {str(e)}")
        error_nodes = ["Error", "Processing Failed"]
        error_edges = [["Error", "Processing Failed", str(e)]]
        return {"nodes": error_nodes, "edges": error_edges, "api_used": "error"}

def validate_and_fix_result(result: Dict) -> Dict:
    """Validate and fix the structure of nodes and edges to ensure they are well-formed."""
    if not result:
        return {"nodes": [], "edges": [], "api_used": "validation_failed"}
    
    # Ensure we have nodes and edges
    nodes = result.get("nodes", [])
    edges = result.get("edges", [])
    api_used = result.get("api_used", "unknown")
    
    # Filter out any None or empty nodes
    valid_nodes = [node for node in nodes if node and isinstance(node, str)]
    
    # Validate and fix edges
    valid_edges = []
    for edge in edges:
        if not edge or not isinstance(edge, list):
            continue
            
        # Must have at least source and target
        if len(edge) < 2:
            continue
            
        # Ensure both source and target are strings and not empty
        if not isinstance(edge[0], str) or not edge[0] or not isinstance(edge[1], str) or not edge[1]:
            continue
            
        # Ensure source and target are in nodes
        if edge[0] not in valid_nodes or edge[1] not in valid_nodes:
            # Try to find them case-insensitively
            source_found = False
            target_found = False
            
            for node in valid_nodes:
                if node.lower() == edge[0].lower():
                    edge[0] = node  # Use the correct case
                    source_found = True
                if node.lower() == edge[1].lower():
                    edge[1] = node  # Use the correct case
                    target_found = True
            
            # Skip edges with nodes not in the nodes list
            if not source_found or not target_found:
                continue
        
        # Ensure edge has 3 elements [source, target, relation]
        if len(edge) == 2:
            valid_edges.append([edge[0], edge[1], ""])
        elif len(edge) >= 3:
            valid_edges.append([edge[0], edge[1], edge[2]])
    
    return {
        "nodes": valid_nodes,
        "edges": valid_edges,
        "api_used": api_used
    } 