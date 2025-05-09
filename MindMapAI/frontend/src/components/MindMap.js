import React, { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid with basic settings - prioritizing reliability
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  logLevel: 'info', // Changed to 'info' to see more debugging info
  fontFamily: 'Arial, sans-serif',
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
    useMaxWidth: true
  }
});

const MindMap = ({ mermaidCode }) => {
  const [svg, setSvg] = useState('');
  const [scale, setScale] = useState(0.85);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  
  // Function to clean potentially problematic characters from mermaid code
  const sanitizeMermaidCode = (code) => {
    if (!code) return '';
    
    // Replace any non-ASCII characters with their ASCII equivalents or remove them
    let sanitized = code.replace(/[^\x00-\x7F]/g, '');
    
    // Ensure line endings are consistent
    sanitized = sanitized.replace(/\r\n/g, '\n');
    
    // Fix common syntax issues
    sanitized = sanitized.replace(/linkStyle default[^;]*;?/g, '');
    
    console.log("Sanitized mermaid code:", sanitized);
    return sanitized;
  };
  
  useEffect(() => {
    if (!mermaidCode) return;
    
    console.log("Original mermaid code received:", mermaidCode);
    
    const renderChart = async () => {
      try {
        // Clear any previous renderings to avoid conflicts
        if (svgRef.current) {
          svgRef.current.innerHTML = '';
        }
        
        // Generate a unique ID
        const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
        
        // Sanitize the code before rendering
        const cleanCode = sanitizeMermaidCode(mermaidCode);
        
        console.log("Attempting to render sanitized mermaid code");
        
        // Use mermaid render directly with sanitized code
        mermaid.render(id, cleanCode, (svgCode) => {
          console.log("SVG code generated successfully");
          
          // Apply simple enhancements to make nodes more colorful
          let enhancedSvg = svgCode;
          
          try {
            // Use simpler styling replacements that match the image
            enhancedSvg = enhancedSvg.replace(
              /.root \{[^}]*\}/g,
              `.root { fill:white;stroke:#F08BC3;color:#333333;stroke-width:2; }`
            );
            
            enhancedSvg = enhancedSvg.replace(
              /.mainCategory \{[^}]*\}/g,
              `.mainCategory { fill:white;stroke:#6495ED;color:#333333;stroke-width:2; }`
            );
            
            enhancedSvg = enhancedSvg.replace(
              /.default \{[^}]*\}/g,
              `.default { fill:white;stroke:#A6ABFF;color:#333333;stroke-width:1.5; }`
            );
          } catch (styleError) {
            console.warn("Error applying styles:", styleError);
            // Continue with the original SVG if styling fails
          }
          
          // Set the SVG content
          setSvg(enhancedSvg);
          setPosition({ x: 0, y: 0 });
        });
      } catch (error) {
        console.error('Failed to render mermaid diagram:', error);
        setSvg(`<div style="color: #6a3ee8; padding: 20px; border: 1px solid rgba(106, 62, 232, 0.3); background: rgba(106, 62, 232, 0.05); border-radius: 8px; text-align: center; font-family: Arial, sans-serif;">
                  <p style="font-weight: 500; margin-bottom: 10px;">Error rendering diagram: ${error.message}</p>
                  <p style="opacity: 0.8; font-size: 14px;">Please try a different topic or format.</p>
                </div>`);
      }
    };
    
    renderChart();
  }, [mermaidCode]);

  // Effect to auto-fit the diagram after it renders
  useEffect(() => {
    if (svg && svgRef.current) {
      const timer = setTimeout(() => {
        try {
          const svgElement = svgRef.current.querySelector('svg');
          if (svgElement) {
            // Default width to something reasonable
            const containerWidth = containerRef.current?.clientWidth || window.innerWidth - 40;
            const svgWidth = svgElement.getBoundingClientRect().width || 500;
            
            // Calculate scale to fit
            const optimalScale = Math.min((containerWidth / svgWidth) * 0.85, 1);
            setScale(optimalScale);
            
            console.log(`Container width: ${containerWidth}, SVG width: ${svgWidth}, Scale: ${optimalScale}`);
          }
        } catch (err) {
          console.error('Error auto-fitting diagram:', err);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [svg]);

  // Handle zoom functionality
  const handleZoom = (direction) => {
    if (direction === 'in' && scale < 2) {
      setScale(prev => prev + 0.1);
    } else if (direction === 'out' && scale > 0.3) {
      setScale(prev => prev - 0.1);
    } else if (direction === 'reset') {
      setScale(0.85);
      setPosition({ x: 0, y: 0 });
    } else if (direction === 'fit') {
      if (svgRef.current) {
        const svgElement = svgRef.current.querySelector('svg');
        if (svgElement) {
          const containerWidth = containerRef.current?.clientWidth || window.innerWidth - 40;
          const svgWidth = svgElement.getBoundingClientRect().width || 500;
          const optimalScale = Math.min((containerWidth / svgWidth) * 0.85, 1);
          setScale(optimalScale);
          setPosition({ x: 0, y: 0 });
        }
      }
    }
  };

  // Handle mouse events for panning
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    setPosition(prev => ({ 
      x: prev.x + dx, 
      y: prev.y + dy 
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div style={{ position: 'relative', marginTop: 20 }}>
      {/* Zoom controls */}
      <div style={{ 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        zIndex: 100,
        display: 'flex',
        gap: '8px'
      }}>
        <button onClick={() => handleZoom('in')} style={zoomButtonStyle}>+</button>
        <button onClick={() => handleZoom('out')} style={zoomButtonStyle}>-</button>
        <button onClick={() => handleZoom('fit')} style={{
          ...zoomButtonStyle, 
          width: 'auto', 
          padding: '0 10px', 
          background: 'linear-gradient(135deg, rgba(74, 108, 247, 0.1) 0%, rgba(106, 62, 232, 0.1) 100%)',
          color: '#4a6cf7',
          fontWeight: '600'
        }}>Fit</button>
        <button onClick={() => handleZoom('reset')} style={{
          ...zoomButtonStyle, 
          width: 'auto', 
          padding: '0 10px',
          background: 'linear-gradient(135deg, rgba(74, 108, 247, 0.1) 0%, rgba(106, 62, 232, 0.1) 100%)',
          color: '#4a6cf7',
          fontWeight: '600'
        }}>Reset</button>
      </div>
      
      {/* Container with simplified styling to match image */}
      <div 
        ref={containerRef}
        className="mind-map-container"
        style={{ 
          overflow: 'hidden', 
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '20px',
          position: 'relative',
          minHeight: '400px',
          background: 'white',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Updated watermark with new text */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Arial, sans-serif',
            userSelect: 'none',
            zIndex: 0,
            color: 'rgba(106, 62, 232, 0.05)'
          }}
        >
          <div
            style={{
              fontSize: '120px',
              fontWeight: 'bold',
              transform: 'rotate(45deg)',
              width: '100%',
              textAlign: 'center'
            }}
          >
            MindMapAI
          </div>
          <div
            style={{
              fontSize: '30px',
              fontWeight: 'bold',
              transform: 'rotate(45deg)',
              marginTop: '20px',
              color: 'rgba(106, 62, 232, 0.08)', // Slightly darker to be more visible
              width: '100%',
              textAlign: 'center'
            }}
          >
            github @adhi982
          </div>
        </div>

        {/* Loading state */}
        {mermaidCode && !svg && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            height: '200px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(74, 108, 247, 0.1)',
              borderTop: '3px solid #4a6cf7',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '15px'
            }}></div>
            <div style={{ color: '#6a3ee8', fontSize: '14px' }}>Generating mind map...</div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}
        
        {/* SVG content */}
        {svg && (
          <div 
            ref={svgRef}
            dangerouslySetInnerHTML={{ __html: svg }} 
            style={{
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
              transformOrigin: 'center center',
              cursor: isDragging ? 'grabbing' : 'grab',
              height: '100%',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              zIndex: 1
            }}
          />
        )}
      </div>
      
      {/* Instructions */}
      {svg && (
        <div style={{ 
          fontSize: '12px', 
          color: 'rgba(106, 62, 232, 0.8)', 
          marginTop: '8px',
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          Tip: Use the +/- buttons to zoom, "Fit" to auto-fit the diagram, or click and drag to pan.
        </div>
      )}
    </div>
  );
};

// Simplified button style
const zoomButtonStyle = {
  width: '30px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'white',
  border: '1px solid rgba(74, 108, 247, 0.3)',
  borderRadius: '6px',
  color: '#4a6cf7',
  fontSize: '16px',
  cursor: 'pointer',
  fontWeight: '500',
  boxShadow: '0 2px 5px rgba(74, 108, 247, 0.1)'
};

export default MindMap; 