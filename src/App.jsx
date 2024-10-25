import { useState, useEffect, useRef } from 'react';
import { TwitchExtensionManager } from './TwitchManager';
import { createRoot } from 'react-dom/client';

// Combined styles including both shadow DOM container and disco lights
const shadowStyles = `
    #shadow-root-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
    }

    .stage {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background-color: rgba(0, 0, 0, 0.05);
    }

    .background-glow {
        position: absolute;
        inset: 0;
        pointer-events: none;
        mix-blend-mode: screen;
        animation: backgroundPulse 8s infinite ease-in-out;
    }

    .red-glow {
        background: radial-gradient(
            circle at 30% 50%, 
            rgba(255, 0, 0, 0.15), 
            transparent 60%
        );
        animation-delay: -4s;
    }

    .blue-glow {
        background: radial-gradient(
            circle at 70% 50%, 
            rgba(0, 50, 255, 0.15), 
            transparent 60%
        );
    }

    .light-rig {
        position: absolute;
        top: 0;
        width: 100%;
        padding: 20px;
    }

    .light-beam {
        position: absolute;
        top: 0;
        width: 8px;
        transform-origin: top;
        filter: blur(4px);
        animation: lightBeam 6s infinite ease-in-out;
    }

    .red-light {
        background: linear-gradient(
            180deg, 
            rgba(255, 30, 0, 0.9) 0%, 
            transparent 100%
        );
        box-shadow: 
            0 0 20px rgba(255, 0, 0, 0.4),
            0 0 40px rgba(255, 0, 0, 0.2);
    }

    .blue-light {
        background: linear-gradient(
            180deg, 
            rgba(0, 50, 255, 0.9) 0%, 
            transparent 100%
        );
        box-shadow: 
            0 0 20px rgba(0, 50, 255, 0.4),
            0 0 40px rgba(0, 50, 255, 0.2);
    }

    @keyframes lightBeam {
        0% { 
            transform: rotate(-45deg); 
            height: 70vh; 
            opacity: 0.7;
        }
        25% { 
            transform: rotate(0deg); 
            height: 85vh; 
            opacity: 0.9;
        }
        50% { 
            transform: rotate(45deg); 
            height: 75vh; 
            opacity: 0.8;
        }
        75% { 
            transform: rotate(0deg); 
            height: 85vh; 
            opacity: 0.9;
        }
        100% { 
            transform: rotate(-45deg); 
            height: 70vh; 
            opacity: 0.7;
        }
    }

    @keyframes backgroundPulse {
        0% { 
            opacity: 0.3; 
            transform: scale(1);
        }
        50% { 
            opacity: 0.7; 
            transform: scale(1.2);
        }
        100% { 
            opacity: 0.3; 
            transform: scale(1);
        }
    }
`;

const DiscoLights = () => {
    const numberOfLights = 12;
    const lightBeams = Array.from({ length: numberOfLights }, (_, i) => ({
        id: `light-${i}`,
        type: i % 2 === 0 ? 'red-light' : 'blue-light',
        position: `${(i / numberOfLights) * 100}%`,
        delay: `${i * 0.3}s`
    }));

    return (
        <div className="stage">
            <div className="background-glow red-glow" />
            <div className="background-glow blue-glow" />
            <div className="light-rig">
                {lightBeams.map(({ id, type, position, delay }) => (
                    <div
                        key={id}
                        className={`light-beam ${type}`}
                        style={{
                            left: position,
                            animationDelay: delay,
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

const ShadowContent = () => {
    return (
        <>
            <DiscoLights />
        </>
    );
};

function App() {
    const [isAuthorized, setIsAuthorized] = useState(false);
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

    // Set up Shadow DOM
    useEffect(() => {
        if (!containerRef.current) return;

        const setupShadowDOM = () => {
            // Create Shadow DOM
            shadowRootRef.current = containerRef.current.attachShadow({ mode: 'open' });

            // Create style element
            const styleElement = document.createElement('style');
            styleElement.textContent = shadowStyles;
            shadowRootRef.current.appendChild(styleElement);

            // Create container for React
            const reactContainer = document.createElement('div');
            reactContainer.id = 'shadow-root-container';
            shadowRootRef.current.appendChild(reactContainer);

            // Create React root
            shadowReactRootRef.current = createRoot(reactContainer);
            shadowReactRootRef.current.render(<ShadowContent />);
        };

        if (!shadowRootRef.current) {
            setupShadowDOM();
        }

        return () => {
            if (shadowReactRootRef.current) {
                shadowReactRootRef.current.unmount();
            }
        };
    }, [isAuthorized]);

    if (!isAuthorized) {
        return <div>Waiting for Twitch authorization...</div>;
    }

    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

export default App;