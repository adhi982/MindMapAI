import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import MindMap from './MindMap';
import './MindMapGenerator.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '../contexts/AuthContext';
import { incrementUsage, logUsage, checkUsageLimits, getUserApiKeys, storeApiKey, supabase } from '../supabase';
import AuthModal from './auth/AuthModal';

// Component for the API key popup that will be rendered in a portal
const ApiKeyPopup = ({ onClose, selectedModel, setSelectedModel, apiKey, setApiKey, validateApiKey, user, onSave }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('users_with_email')
          .select('email')
          .eq('id', user.id)
          .single();
          
        if (!error && data) {
          setUserProfile(data);
        }
      }
    };
    
    fetchUserProfile();
  }, [user]);

  const handleSave = () => {
    if (validateApiKey()) {
      onSave(selectedModel, apiKey);
      onClose();
    }
  };

  const toggleShowApiKey = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowApiKey(!showApiKey);
    console.log("Toggle API key visibility:", !showApiKey);
  };

  return ReactDOM.createPortal(
    <div className="api-key-popup-overlay">
      <div className="api-key-popup">
        <div className="popup-content">
          <h3>Set Your API Key</h3>
          {user && (
            <div className="popup-user-info">
              <span className="popup-user-email">For account: {userProfile?.email || user.email}</span>
            </div>
          )}
          <div className="model-selector">
            <label htmlFor="model-select">Select Model:</label>
            <select 
              id="model-select" 
              value={selectedModel} 
              onChange={e => setSelectedModel(e.target.value)}
            >
              <option value="google">Gemini</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="cohere">Cohere</option>
            </select>
          </div>
          <div className="api-key-input">
            <label htmlFor="api-key">API Key:</label>
            <div className="input-with-button">
              <input 
                type={showApiKey ? "text" : "password"}
                id="api-key" 
                value={apiKey} 
                onChange={e => setApiKey(e.target.value)}
                placeholder="Your API Key"
                autoComplete="off"
              />
              <button 
                type="button" 
                className="toggle-visibility-btn"
                onClick={toggleShowApiKey}
                title={showApiKey ? "Hide API Key" : "Show API Key"}
              >
                {showApiKey ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                    <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                    <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div className="popup-actions">
            <button 
              type="button" 
              className="popup-action cancel" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="popup-action save" 
              onClick={handleSave}
              disabled={!validateApiKey()}
            >
              Save
            </button>
          </div>
          <div className="privacy-notice">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Your API key is stored {user ? 'securely in your account' : 'locally and encrypted'}. It is only used for your requests and never shared with any third parties.
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const MindMapGenerator = () => {
  const [input, setInput] = useState('');
  const [mermaidCode, setMermaidCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [researchMode, setResearchMode] = useState(false);
  const [apiUsed, setApiUsed] = useState('');
  const [showApiKeyPopup, setShowApiKeyPopup] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('google');
  const [specificError, setSpecificError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [remainingGen, setRemainingGen] = useState(0);
  
  const { user, sessionId, userApiKeys, loadUserApiKeys } = useAuth();

  // Initialize remaining generations count
  useEffect(() => {
    if (!user) {
      const localUsage = JSON.parse(localStorage.getItem('mindmap_usage') || '{"research": 0, "normal": 0}');
      const remaining = Math.max(0, 5 - localUsage.normal); // Default to normal mode on init
      setRemainingGen(remaining);
    }
  }, [user]);

  // Top models for each provider
  const getTopModelForProvider = (provider) => {
    switch(provider) {
      case 'google':
        return 'gemini-1.5-pro';
      case 'openai':
        return 'gpt-4o';
      case 'anthropic':
        return 'claude-3-opus';
      case 'cohere':
        return 'command-r';
      default:
        return null;
    }
  };

  // Effect to ensure loading is false once mermaidCode is set
  useEffect(() => {
    if (mermaidCode && loading) {
      console.log("Mind map generated, resetting loading state");
      setLoading(false);
      setTimeRemaining(0);
    }
  }, [mermaidCode, loading]);

  // Effect to countdown the estimated time
  useEffect(() => {
    let timer;
    if (loading && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loading, timeRemaining]);

  // Load user's API keys if logged in or from session storage on page reload
  useEffect(() => {
    const loadApiKeys = async () => {
      try {
        console.log("Attempting to load API keys...");
        
        if (user) {
          console.log(`Loading API keys for authenticated user: ${user.id}`);
          
          // First check if we already have the keys in the auth context
          let keys = userApiKeys;
          
          // If no keys in context, try to load them
          if (!keys) {
            console.log("No keys in auth context, loading from database...");
            keys = await loadUserApiKeys(user.id);
          }
          
          if (keys) {
            console.log("Successfully loaded API keys from auth context:");
            
            // Log which keys we have
            Object.entries(keys)
              .filter(([key, value]) => key.includes('_api_key') && value)
              .forEach(([key, value]) => {
                console.log(`Found key for ${key}: Length ${value?.length || 0}`);
              });
            
            // Set the API key based on the current selected model
            const modelKeyMap = {
              google: keys.gemini_api_key,
              openai: keys.openai_api_key,
              anthropic: keys.anthropic_api_key,
              cohere: keys.cohere_api_key
            };
            
            const keyForSelectedModel = modelKeyMap[selectedModel];
            if (keyForSelectedModel) {
              console.log(`Setting ${selectedModel} API key (length: ${keyForSelectedModel.length})`);
              // Only update the state if it's different to avoid re-renders
              if (apiKey !== keyForSelectedModel) {
                setApiKey(keyForSelectedModel);
              }
            } else {
              console.log(`No API key found for model: ${selectedModel}`);
              setApiKey(''); // Clear the API key if none exists for the selected model
            }
          } else {
            console.log("No API keys found for user");
            setApiKey(''); // Clear the API key if no keys found
          }
        } else {
          // For non-authenticated users, check localStorage
          console.log("No authenticated user, checking localStorage for API keys");
          const localApiKeys = JSON.parse(localStorage.getItem('api_keys') || '{}');
          const keyForSelectedModel = localApiKeys[selectedModel];
          if (keyForSelectedModel) {
            console.log(`Loading ${selectedModel} API key from localStorage`);
            // Only update the state if it's different
            if (apiKey !== keyForSelectedModel) {
              setApiKey(keyForSelectedModel);
            }
          } else {
            console.log(`No localStorage API key found for model: ${selectedModel}`);
            setApiKey(''); // Clear the API key if none exists for the selected model
          }
        }
      } catch (err) {
        console.error("Error loading API keys:", err);
        setApiKey(''); // Clear on error
      }
    };
    
    loadApiKeys();
  }, [user, selectedModel, userApiKeys, loadUserApiKeys]);

  // Check usage limits before generation
  const checkLimitsBeforeGeneration = (type) => {
    if (!user) {
      // For non-logged in users, check limits
      if (!checkUsageLimits(type)) {
        // User reached limit, show auth modal
        const message = type === 'research' 
          ? 'You have reached the limit of 2 research mode generations. Sign up to continue using research mode!'
          : 'You have reached the limit of 5 mind map generations. Sign up for unlimited generations!';
        
        setAuthMessage(message);
        setAuthMode('signup');
        setShowAuthModal(true);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted, sending POST to /generate_map");
    
    // Check if user has reached usage limits
    const generationType = researchMode ? 'research' : 'normal';
    if (!checkLimitsBeforeGeneration(generationType)) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSpecificError('');
    setMermaidCode('');
    setApiUsed('');
    
    // Set estimated time based on input length and research mode
    const baseTime = Math.floor(input.length / 50);
    const estimatedSeconds = researchMode 
      ? Math.max(15, Math.min(60, baseTime * 3)) // Longer time for research mode
      : Math.max(5, Math.min(20, baseTime));
    
    setTimeRemaining(estimatedSeconds);
    
    try {
      console.log("Submitting text:", input, "\nResearch mode:", researchMode);
      
      // Prepare the request payload
      const requestPayload = {
        text: input,
        research_mode: researchMode
      };
      
      // Flag to determine if using personal API key
      const isUsingPersonalApi = apiKey ? true : false;
      
      // Only add API key and model details if user provided an API key
      if (isUsingPersonalApi) {
        const topModel = getTopModelForProvider(selectedModel);
        requestPayload.api_key = apiKey;
        requestPayload.provider = selectedModel;
        requestPayload.model = topModel;
        requestPayload.use_user_api = true;
        console.log(`Using personal ${selectedModel} API key for generation`);
      } else {
        // Use default backend API (Mistral, or Gemini for research mode)
        requestPayload.use_user_api = false;
        console.log("Using MindMapAI default API for generation");
      }
      
      const apiUrl = process.env.REACT_APP_API_URL
        ? `${process.env.REACT_APP_API_URL}/generate_map`
        : 'https://mindmapai-lou5.onrender.com/generate_map';
      const response = await axios.post(apiUrl, requestPayload, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log("API response:", response.data);
      setMermaidCode(response.data.mermaid);
      
      // Track which API was actually used
      const apiProvider = response.data.api_used || 'unknown';
      setApiUsed(apiProvider);
      
      // Track usage
      await incrementUsage(user?.id, generationType);
      await logUsage(user?.id, sessionId, generationType, input, apiProvider);
      
      // Update the counter for non-logged in users
      if (!user) {
        const localUsage = JSON.parse(localStorage.getItem('mindmap_usage') || '{"research": 0, "normal": 0}');
        const remaining = generationType === 'research' 
          ? Math.max(0, 2 - localUsage.research) 
          : Math.max(0, 5 - localUsage.normal);
          
        setRemainingGen(remaining);
      }
      
    } catch (err) {
      console.log("API error:", err);
      
      // Extract more detailed error message if available
      if (err.response && err.response.data) {
        const errData = err.response.data;
        
        // Handle specific error cases
        if (errData.detail) {
          setError(`Error: ${errData.detail}`);
        } else if (errData.error) {
          setError(`Failed to generate mind map: ${errData.error}`);
        } else {
          setError(`Failed to generate mind map: ${err.message || 'Unknown error'}`);
        }
        
        // Set specific error messages based on common API error codes
        if (errData.code === 'insufficient_quota' || 
            (errData.error && errData.error.includes('quota')) || 
            (errData.detail && errData.detail.includes('credit'))) {
          setSpecificError('Your API key has insufficient credits. Please check your account balance.');
        } else if (errData.code === 'invalid_api_key' || 
                  (errData.error && errData.error.includes('invalid')) || 
                  (errData.detail && errData.detail.includes('invalid'))) {
          setSpecificError('The API key appears to be invalid. Please check and try again.');
        } else if (errData.code === 'model_not_available' || 
                  (errData.error && errData.error.includes('model')) || 
                  (errData.detail && errData.detail.includes('model'))) {
          setSpecificError('The requested model is not available with your API key tier.');
        }
      } else {
        setError(`Failed to generate mind map: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
      setTimeRemaining(0);
    }
  };
  
  const toggleApiKeyPopup = () => {
    if (!user && apiKey === '') {
      // If user is not logged in and wants to set API key, prompt to login first
      setAuthMessage('Create an account to securely store and use your API keys');
      setAuthMode('signup');
      setShowAuthModal(true);
    } else {
      setShowApiKeyPopup(!showApiKeyPopup);
    }
  };

  const validateApiKey = () => {
    // Different validation rules for different models
    if (!apiKey) return false;
    
    switch (selectedModel) {
      case 'openai':
        return apiKey.startsWith('sk-') && apiKey.length > 20;
      case 'anthropic':
        return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
      case 'cohere':
        return apiKey.length > 20;
      case 'google':
        return apiKey.startsWith('AIza') || (apiKey.length > 20);
      default:
        return apiKey.length > 10;
    }
  };

  const handleSaveApiKey = async (provider, key) => {
    try {
      console.log(`Saving ${provider} API key...`);
      
      // Update local state first for immediate feedback
      setApiKey(key);
      
      // Store API key securely if user is logged in
      if (user) {
        const result = await storeApiKey(user.id, provider, key);
        
        if (result) {
          console.log(`API key saved successfully for ${provider}`);
          
          // Reload the user's API keys to update the auth context
          await loadUserApiKeys(user.id);
          
          // Show visual confirmation
          const saveButton = document.querySelector('.popup-action.save');
          if (saveButton) {
            const originalText = saveButton.innerText;
            saveButton.innerText = 'Saved!';
            setTimeout(() => {
              saveButton.innerText = originalText;
            }, 1500);
          }
        } else {
          console.error(`Failed to save API key for ${provider}`);
          alert(`There was an issue saving your ${provider} API key. Please try again.`);
        }
      } else {
        // For non-logged in users, store in localStorage
        console.log('Storing API key in localStorage (user not logged in)');
        try {
          // Get existing keys or initialize empty object
          const localApiKeys = JSON.parse(localStorage.getItem('api_keys') || '{}');
          // Add the new key
          localApiKeys[provider] = key;
          // Save back to localStorage
          localStorage.setItem('api_keys', JSON.stringify(localApiKeys));
          console.log(`API key saved to localStorage for provider: ${provider}`);
        } catch (storageError) {
          console.error('Error storing API key in localStorage:', storageError);
          alert('Failed to save your API key. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error saving API key:', err);
      alert('Failed to save API key. Please try again.');
    }
  };
  
  // Function to export SVG as PDF
  const handleExportPdf = () => {
    try {
      const resultContainer = document.querySelector('.result-container');
      if (!resultContainer) return;
      
      const svgContainer = resultContainer.querySelector('.mind-map-container');
      if (!svgContainer) return;
      
      // Create filename from input text
      let filename = input.trim();
      
      // Limit length and remove invalid filename characters
      filename = filename
        .substring(0, 50) // Limit to 50 characters
        .replace(/[/\\?%*:|"<>]/g, '-') // Replace invalid filename chars
        .trim();
      
      // If the filename is empty (e.g., only had invalid chars), use a default
      if (!filename) {
        filename = `mind-map-${new Date().toISOString().split('T')[0]}`;
      } else {
        // Add suffix to the valid filename
        filename = `${filename}_Mind_Map`;
      }
      
      html2canvas(svgContainer, {
        backgroundColor: '#f5f8fa',
        scale: 2, // Higher scale for better quality
        logging: false,
        allowTaint: true,
        useCORS: true
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm'
        });
        
        // Calculate dimensions to fit the page
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height) * 0.9;
        
        // Calculate centered position
        const x = (pdfWidth - imgProps.width * ratio) / 2;
        const y = (pdfHeight - imgProps.height * ratio) / 2;
        
        // Add the image directly - the watermark will be captured from the DOM
        pdf.addImage(imgData, 'PNG', x, y, imgProps.width * ratio, imgProps.height * ratio);
        
        pdf.save(`${filename}.pdf`);
        
        // Show feedback
        const exportButton = document.querySelector('.action-btn.download');
        if (exportButton) {
          const originalText = exportButton.innerHTML;
          exportButton.innerHTML = '<span class="btn-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg></span> Exported!';
          setTimeout(() => {
            exportButton.innerHTML = originalText;
          }, 2000);
        }
      });
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Could not export the mind map as PDF. Please try again.');
    }
  };

  const getApiButtonText = () => {
    if (apiKey) return 'API Key ✓';
    return user ? 'Set API Key' : 'Use Your API Key';
  };

  // Get remaining generations for non-logged-in users
  const getRemainingGenerations = (type) => {
    if (user) return null; // No limit for logged-in users
    
    const localUsage = JSON.parse(localStorage.getItem('mindmap_usage') || '{"research": 0, "normal": 0}');
    if (type === 'research') {
      return Math.max(0, 2 - localUsage.research); // 2 total research generations
    } else {
      return Math.max(0, 5 - localUsage.normal); // 5 total normal generations
    }
  };

  // Update remaining generations count when research mode changes or after generation
  useEffect(() => {
    if (!user) {
      const type = researchMode ? 'research' : 'normal';
      const localUsage = JSON.parse(localStorage.getItem('mindmap_usage') || '{"research": 0, "normal": 0}');
      const remaining = type === 'research' 
        ? Math.max(0, 2 - localUsage.research) 
        : Math.max(0, 5 - localUsage.normal);
      
      setRemainingGen(remaining);
    }
  }, [researchMode, user, mermaidCode]); // adding mermaidCode as dependency to refresh after successful generation

  // Create a storage event listener to update counter when storage changes
  useEffect(() => {
    if (!user) {
      const handleStorageChange = () => {
        const type = researchMode ? 'research' : 'normal';
        const localUsage = JSON.parse(localStorage.getItem('mindmap_usage') || '{"research": 0, "normal": 0}');
        const remaining = type === 'research' 
          ? Math.max(0, 2 - localUsage.research) 
          : Math.max(0, 5 - localUsage.normal);
        
        setRemainingGen(remaining);
      };

      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [user, researchMode]);

  return (
    <div className="generator-container">
      <div className="generator-header">
        <h1>AI Mind Map Generator</h1>
        <p className="generator-description">
          Input your topic or text below and let AI create a structured mind map visualization for you.
        </p>
      </div>
      
      <div className="generator-card">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="mind-map-input">Your Text/Topic</label>
            <textarea
              id="mind-map-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={6}
              placeholder="Enter your topic or text here..."
              className="text-input"
            />
          </div>
          
          <div className="options-group">
            <div className="options-row">
              <label className="option-toggle">
                <input
                  type="checkbox"
                  checked={researchMode}
                  onChange={e => setResearchMode(e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Research Mode</span>
                <span className="toggle-description">Enhance with web search & deeper analysis</span>
              </label>
              
              <div className="api-key-section">
                {!user && (
                  <div className="remaining-generations">
                    <span className={`count-badge ${remainingGen <= 1 ? 'count-low' : remainingGen <= 2 ? 'count-warning' : ''}`}>
                      {researchMode ? 
                        `${remainingGen} of 2 research generations left` : 
                        `${remainingGen} of 5 generations left`}
                    </span>
                  </div>
                )}
                <button 
                  type="button" 
                  className="api-key-button" 
                  onClick={toggleApiKeyPopup}
                >
                  {getApiButtonText()}
                </button>
              </div>
            </div>
          </div>
          
          <button type="submit" disabled={loading || !input.trim()} className="generate-btn">
            {loading ? 'Generating...' : 'Generate Mind Map'}
          </button>
        </form>
      </div>
      
      {showApiKeyPopup && (
        <ApiKeyPopup 
          onClose={() => setShowApiKeyPopup(false)}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          apiKey={apiKey}
          setApiKey={setApiKey}
          validateApiKey={validateApiKey}
          user={user}
          onSave={handleSaveApiKey}
        />
      )}
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        message={authMessage}
      />
      
      {loading && !mermaidCode && (
        <div className="loading-container">
          <div className="pulse-container">
            <div className="pulse-ring"></div>
            <div className="pulse-circle"></div>
          </div>
          <p className="loading-text">
            {researchMode 
              ? `Researching and generating your mind map${timeRemaining > 0 ? ` (Estimated: ${timeRemaining}s)` : '...'}`
              : `Generating your mind map${timeRemaining > 0 ? ` (Estimated: ${timeRemaining}s)` : '...'}`
            }
          </p>
          {apiKey ? (
            <p className="api-note">Using your personal {selectedModel} API key</p>
          ) : (
            <p className="api-note system-api">Using MindMapAI default API</p>
          )}
        </div>
      )}
      
      {error && !loading && (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <p className="error-message">{error}</p>
            {specificError ? (
              <p className="error-hint">{specificError}</p>
            ) : error.includes('API key') && (
              <p className="error-hint">Please check that you have provided a valid API key.</p>
            )}
          </div>
        </div>
      )}
      
      {mermaidCode && !loading && (
        <div className="result-container" style={{
          background: 'linear-gradient(145deg, #f6f8ff, #edf1fc)', 
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          padding: '1.8rem',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.15), 0 5px 15px rgba(0, 0, 0, 0.05)',
          marginTop: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="api-usage-indicator">
            <span className={`api-badge ${!apiKey ? 'system-badge' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 8v4l3 3"></path>
              </svg>
              {apiKey && ['google', 'openai', 'anthropic', 'cohere'].includes(apiUsed.toLowerCase()) ? (
                `Generated using your personal ${apiUsed} API key`
              ) : (
                `Generated using MindMapAI default API`
              )}
            </span>
          </div>
          
          <MindMap mermaidCode={mermaidCode} />
          
          <div className="result-actions">
            <button className="action-btn download" 
              style={{
                background: 'linear-gradient(135deg, #4a6cf7 0%, #6a3ee8 100%)',
                border: 'none',
                color: 'white',
                boxShadow: '0 4px 10px rgba(74, 108, 247, 0.3)',
                transition: 'all 0.3s ease',
                fontWeight: '600'
              }}
              onClick={handleExportPdf}>
              <span className="btn-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z"/>
                </svg>
              </span> 
              Export as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindMapGenerator; 