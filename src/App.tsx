import { useEffect, useRef, useState } from 'react';

function App() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scriptError, setScriptError] = useState<string | null>(null);

  useEffect(() => {
    // Load the Three.js implementation
    const script = document.createElement('script');
    script.src = './3dviewer.js';
    script.async = true;

    script.onerror = () => {
      console.error('Failed to load 3D viewer script');
      setScriptError('Failed to load 3D viewer script. Please check your connection and try again.');
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <header className="py-6 w-full text-center">
        <h1 className="text-5xl font-bold tracking-wider">PokeficationCZ</h1>
      </header>

      <main className="flex-1 w-full flex justify-center items-center px-4">
        <div
          ref={canvasRef}
          id="canvas-container"
          className="w-full max-w-4xl h-[75vh] relative rounded-lg overflow-hidden"
          style={{
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)'
          }}
        >
          {scriptError && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-800 bg-opacity-70 p-4 rounded-lg max-w-md text-center">
              <p className="text-white">{scriptError}</p>
            </div>
          )}
        </div>
      </main>

      <footer className="py-4 text-center opacity-50 mt-4">
        <p>© 2025 PokeficationCZ</p>
      </footer>
    </div>
  );
}

export default App;
