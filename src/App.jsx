import { useState, useEffect, useRef } from 'react';
import { TwitchExtensionManager } from './TwitchManager';
import { createRoot } from 'react-dom/client';

// Styles that will be injected into Shadow DOM
const shadowStyles = `
    #shadow-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        background: transparent;
    }
    
    .color-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: transparent;
        pointer-events: none;
    }
    
    .controls {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 8px;
        pointer-events: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
        color: white;
        font-family: Arial, sans-serif;
        z-index: 1000;
    }
    
    .control-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    
    .color-picker {
        width: 50px;
        height: 30px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .opacity-slider {
        width: 150px;
        cursor: pointer;
    }
`;

function OverlayContent({ overlayColor, opacity, setOverlayColor, setOpacity }) {
    return (
        <div id="shadow-container">
            <div 
                className="color-overlay" 
                style={{
                    backgroundColor: `${overlayColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
                }}
            />
            <div className="controls">
                <div className="control-group">
                    <label>Color:</label>
                    <input 
                        type="color" 
                        value={overlayColor}
                        onChange={(e) => setOverlayColor(e.target.value)}
                        className="color-picker"
                    />
                </div>
                <div className="control-group">
                    <label>Opacity: {(opacity * 100).toFixed(0)}%</label>
                    <input 
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={opacity}
                        onChange={(e) => setOpacity(parseFloat(e.target.value))}
                        className="opacity-slider"
                    />
                </div>
            </div>
        </div>
    );
}

function App() {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [overlayColor, setOverlayColor] = useState('#FF0000');
    const [opacity, setOpacity] = useState(0.3);
    const containerRef = useRef(null);
    const shadowRootRef = useRef(null);
    const shadowReactRootRef = useRef(null);

    // Initialize Twitch authorization
    useEffect(() => {
        const twitchManager = TwitchExtensionManager.getInstance();
        twitchManager.onAuthorized(() => {
            setIsAuthorized(true);
        });
    }, []);

    // Set up Shadow DOM after component mounts
    useEffect(() => {
        if (!containerRef.current) return;

        // Create Shadow DOM if it doesn't exist
        if (!shadowRootRef.current) {
            shadowRootRef.current = containerRef.current.attachShadow({ mode: 'open' });
            
            // Add styles
            const style = document.createElement('style');
            style.textContent = shadowStyles;
            shadowRootRef.current.appendChild(style);

            // Create container for React
            const shadowContainer = document.createElement('div');
            shadowContainer.id = 'shadow-root-container';
            shadowRootRef.current.appendChild(shadowContainer);

            // Create React root
            shadowReactRootRef.current = createRoot(shadowContainer);
        }

        // Render content
        if (shadowReactRootRef.current) {
            shadowReactRootRef.current.render(
                <OverlayContent 
                    overlayColor={overlayColor}
                    opacity={opacity}
                    setOverlayColor={setOverlayColor}
                    setOpacity={setOpacity}
                />
            );
        }

        // Cleanup
        return () => {
            if (shadowReactRootRef.current) {
                shadowReactRootRef.current.unmount();
            }
        };
    }, [overlayColor, opacity, isAuthorized]);

    if (!isAuthorized) {
        return <div>Waiting for Twitch authorization...</div>;
    }

    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

export default App;