import React, { useState, useEffect, useRef } from 'react';
import { ModelType, AspectRatio, GeneratedImage } from './types';
import { GeminiService } from './services/geminiService';
import { Button, Select, Label } from './components/UIComponents';
import { Sparkles, Image as ImageIcon, Download, Settings2, AlertCircle, Maximize2, Wand2 } from 'lucide-react';

// Default prompt from user request
const DEFAULT_PROMPT = "A highly stylized 3D render of a featureless human figure with no facial features, fully smooth and reflective (shiny gray-white material), in a minimalistic suburban Puerto Rico home interior near a doorway. The figure is positioned forcefully slamming a door outward with one arm while twisting its body to run, wearing jogging shorts and a light athletic t-shirt. The scene is lit with harsh morning light cutting through the doorway, dynamic shadows, high tension, and the background is simple and slightly blurred to emphasize the subject. The figure’s surface is perfectly seamless and ultra-polished, no lines, no seams, no joints, no cracks, no artifacts. Cinematic angle dynamic action shot, slightly tilted. Ultra-realistic 3D rendering.";

export default function App() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [model, setModel] = useState<ModelType>(ModelType.FLASH);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [keySelectionNeeded, setKeySelectionNeeded] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setKeySelectionNeeded(false);

    try {
      const imageUrl = await GeminiService.generateImage(prompt, model, aspectRatio);
      
      const newImage: GeneratedImage = {
        url: imageUrl,
        prompt: prompt,
        timestamp: Date.now(),
        model: model
      };
      
      setCurrentImage(newImage);
      
      // Scroll to result on mobile
      setTimeout(() => {
        if (window.innerWidth < 768) {
            resultRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);

    } catch (err: any) {
      if (err.message === "API_KEY_REQUIRED" || err.message === "API_KEY_INVALID") {
        setKeySelectionNeeded(true);
      } else {
        setError(err.message || "An unexpected error occurred while generating the image.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeySelection = async () => {
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        // Assume success if no error thrown, user will click generate again
        setKeySelectionNeeded(false);
        // Automatically retry generation? Safer to let user click again to avoid loops.
      } else {
        setError("AI Studio environment not detected.");
      }
    } catch (e) {
      console.error("Key selection failed", e);
      setError("Failed to select API key. Please try again.");
    }
  };

  const handleDownload = () => {
    if (!currentImage) return;
    const link = document.createElement('a');
    link.href = currentImage.url;
    link.download = `hyper-render-${currentImage.timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-primary-500/30">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-tr from-primary-500 to-indigo-600 p-2 rounded-lg">
               <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              HyperRender
            </h1>
          </div>
          <div className="flex items-center space-x-4">
             <span className="text-xs text-slate-500 font-mono hidden sm:inline-block">Powered by Gemini 3</span>
             <a href="https://ai.google.dev" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
               <Settings2 className="w-5 h-5" />
             </a>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Controls Column */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4 text-primary-400">
              <Wand2 className="w-5 h-5" />
              <h2 className="font-semibold text-white">Generation Settings</h2>
            </div>

            <div className="space-y-6">
              {/* Prompt Input */}
              <div>
                <Label htmlFor="prompt">Prompt Description</Label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full h-40 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none leading-relaxed"
                  placeholder="Describe your imagination in detail..."
                />
              </div>

              {/* Model Selection */}
              <Select 
                label="Model Version" 
                value={model} 
                onChange={(e) => setModel(e.target.value as ModelType)}
              >
                <option value={ModelType.FLASH}>Gemini 2.5 Flash (Fast)</option>
                <option value={ModelType.PRO}>Gemini 3 Pro (High Quality/4K)</option>
              </Select>

              {/* Aspect Ratio */}
              <Select 
                label="Aspect Ratio" 
                value={aspectRatio} 
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
              >
                <option value={AspectRatio.SQUARE}>1:1 (Square)</option>
                <option value={AspectRatio.LANDSCAPE}>16:9 (Landscape)</option>
                <option value={AspectRatio.PORTRAIT}>9:16 (Portrait)</option>
                <option value={AspectRatio.WIDE}>4:3 (Classic)</option>
                <option value={AspectRatio.TALL}>3:4 (Vertical)</option>
              </Select>

              {/* Generate Button */}
              <Button 
                onClick={handleGenerate} 
                isLoading={isLoading} 
                className="w-full h-12 text-lg"
              >
                {isLoading ? 'Rendering...' : 'Generate Image'}
              </Button>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-900/20 border border-red-800/50 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              {/* API Key Prompt for Pro Model */}
              {keySelectionNeeded && (
                <div className="p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-lg">
                  <h3 className="text-sm font-semibold text-indigo-200 mb-2">Pro Model Access Required</h3>
                  <p className="text-xs text-indigo-300 mb-3">
                    High-quality generation with Gemini 3 Pro requires a selected API key from a billing-enabled project.
                  </p>
                  <Button variant="secondary" onClick={handleKeySelection} className="w-full text-xs">
                    Select API Key
                  </Button>
                  <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noreferrer"
                    className="block text-center mt-2 text-[10px] text-indigo-400 hover:underline"
                  >
                    Learn about billing
                  </a>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">Tips</h3>
            <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4">
               <li>Use "Cinematic lighting" for dramatic effects.</li>
               <li>Specify textures like "Polished", "Rough", "Matte".</li>
               <li>Try Gemini 3 Pro for 4K resolution output.</li>
            </ul>
          </div>
        </div>

        {/* Output Column */}
        <div className="w-full lg:w-2/3 flex flex-col h-full min-h-[500px]" ref={resultRef}>
          <div className="relative flex-grow bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center group">
            
            {currentImage ? (
              <>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
                <img 
                  src={currentImage.url} 
                  alt="Generated Output" 
                  className="max-w-full max-h-[80vh] object-contain shadow-2xl transition-transform duration-700 ease-in-out"
                />
                
                {/* Overlay Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between">
                  <div className="max-w-[70%]">
                     <p className="text-xs text-slate-400 font-mono mb-1 truncate">
                        {currentImage.model === ModelType.PRO ? 'Gemini 3 Pro' : 'Gemini 2.5 Flash'} • {new Date(currentImage.timestamp).toLocaleTimeString()}
                     </p>
                     <p className="text-sm text-white line-clamp-2 opacity-90">{currentImage.prompt}</p>
                  </div>
                  <div className="flex gap-2">
                     <Button variant="secondary" className="!p-2 !rounded-full" title="View Fullscreen" onClick={() => window.open(currentImage.url, '_blank')}>
                        <Maximize2 className="w-5 h-5" />
                     </Button>
                     <Button onClick={handleDownload} className="!p-2 !rounded-full" title="Download">
                        <Download className="w-5 h-5" />
                     </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center p-8 max-w-md">
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-20 h-20 mb-6">
                       <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                       <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                       <div className="absolute inset-4 bg-slate-800 rounded-full flex items-center justify-center animate-pulse">
                          <Sparkles className="w-6 h-6 text-primary-400" />
                       </div>
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">Creating Masterpiece</h3>
                    <p className="text-slate-400 text-sm">Validating prompt and rendering pixels...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center opacity-40">
                    <ImageIcon className="w-24 h-24 mb-4 text-slate-600" />
                    <h3 className="text-lg font-medium text-slate-300">Ready to Imagine</h3>
                    <p className="text-slate-500 text-sm mt-2">Enter a detailed prompt and select your model to generate high-fidelity 3D art.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}