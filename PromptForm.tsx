
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  AspectRatio,
  GenerateImageParams,
  GenerationMode,
  ImageFile,
  ImageModel,
} from '../types';
import {
  ArrowRightIcon,
  ChevronDownIcon,
  FramesModeIcon,
  PlusIcon,
  RectangleStackIcon,
  SparklesIcon,
  TextModeIcon,
  XMarkIcon,
} from './icons';
import {enhancePrompt} from '../services/geminiService';

const modeIcons: Record<GenerationMode, React.ReactNode> = {
  [GenerationMode.TEXT_TO_IMAGE]: <TextModeIcon className="w-5 h-5" />,
  [GenerationMode.IMAGE_TO_IMAGE]: <FramesModeIcon className="w-5 h-5" />,
};

const fileToBase64 = (file: File): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      if (base64) resolve({file, base64});
      else reject(new Error('Failed to read file.'));
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const ImageUpload: React.FC<{
  onSelect: (image: ImageFile) => void;
  onRemove?: () => void;
  image?: ImageFile | null;
  label: string;
}> = ({onSelect, onRemove, image, label}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imageFile = await fileToBase64(file);
        onSelect(imageFile);
      } catch (err) { console.error(err); }
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  if (image) {
    return (
      <div className="relative group w-24 h-24">
        <img src={URL.createObjectURL(image.file)} alt="preview" className="w-full h-full object-cover rounded-xl border border-white/10" />
        <button type="button" onClick={onRemove} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg"><XMarkIcon className="w-4 h-4"/></button>
      </div>
    );
  }

  return (
    <button type="button" onClick={() => inputRef.current?.click()} className="w-24 h-24 bg-gray-800/50 border border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-white transition-all hover:bg-gray-800">
      <PlusIcon className="w-5 h-5" />
      <span className="text-[10px] mt-1 font-bold uppercase tracking-tighter">{label}</span>
      <input type="file" ref={inputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
    </button>
  );
};

interface PromptFormProps {
  onGenerate: (params: GenerateImageParams) => void;
}

const PromptForm: React.FC<PromptFormProps> = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<ImageModel>(ImageModel.FLASH);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [generationMode, setGenerationMode] = useState<GenerationMode>(GenerationMode.TEXT_TO_IMAGE);
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [inputImage, setInputImage] = useState<ImageFile | null>(null);

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isModeSelectorOpen, setIsModeSelectorOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handleMagicEnhance = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    try {
      const enhanced = await enhancePrompt(prompt);
      setPrompt(enhanced);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      prompt, model, aspectRatio,
      mode: generationMode, numberOfImages,
      inputImage
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {generationMode === GenerationMode.IMAGE_TO_IMAGE && (
        <div className="flex justify-center animate-in fade-in slide-in-from-top-2">
           <ImageUpload label="Reference" image={inputImage} onSelect={setInputImage} onRemove={() => setInputImage(null)} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative">
        <div className="bg-[#111112] border border-white/10 rounded-3xl shadow-2xl overflow-hidden focus-within:border-indigo-500/50 transition-all">
          <div className="flex items-center px-5 py-3 bg-white/5 border-b border-white/5 justify-between">
            <button type="button" onClick={() => setIsModeSelectorOpen(!isModeSelectorOpen)} className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-widest transition-colors">
               {modeIcons[generationMode]} {generationMode} <ChevronDownIcon className="w-3 h-3" />
            </button>
            <button type="button" onClick={handleMagicEnhance} disabled={isEnhancing || !prompt} className="flex items-center gap-1.5 text-[10px] font-black text-indigo-400 hover:text-indigo-300 disabled:opacity-20 transition-all">
               <SparklesIcon className={`w-4 h-4 ${isEnhancing ? 'animate-pulse' : ''}`} /> {isEnhancing ? 'POLISHING...' : 'ENHANCE PROMPT'}
            </button>
          </div>

          <div className="p-5 flex gap-4 items-end">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={generationMode === GenerationMode.TEXT_TO_IMAGE ? "What should I visualize for you?" : "How should I modify the image?"}
              className="flex-grow bg-transparent border-none focus:ring-0 text-white placeholder-gray-600 resize-none min-h-[44px] max-h-[300px] py-1 text-lg leading-relaxed"
            />
            <button type="submit" disabled={!prompt.trim() || (generationMode === GenerationMode.IMAGE_TO_IMAGE && !inputImage)} className="p-4 bg-white text-black hover:bg-indigo-50 rounded-2xl shadow-xl disabled:bg-gray-800 disabled:text-gray-600 transition-all active:scale-95 group">
               <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="px-5 py-3 bg-white/5 flex items-center justify-between text-[10px] font-bold">
            <div className="flex gap-6 items-center">
              <div className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors">
                <RectangleStackIcon className="w-3.5 h-3.5" />
                <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value as AspectRatio)} className="bg-transparent border-none p-0 focus:ring-0 text-inherit cursor-pointer uppercase">
                   <option value={AspectRatio.SQUARE}>Square (1:1)</option>
                   <option value={AspectRatio.LANDSCAPE}>Landscape (16:9)</option>
                   <option value={AspectRatio.PORTRAIT}>Portrait (9:16)</option>
                   <option value={AspectRatio.PHOTO}>Classic (4:3)</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-500 uppercase tracking-tighter">
               <span className="opacity-50">Batch:</span>
               <div className="flex bg-black/40 rounded-full p-1 border border-white/5">
                  {[1, 2, 4].map(n => (
                    <button key={n} type="button" onClick={() => setNumberOfImages(n)} className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${numberOfImages === n ? 'bg-white text-black shadow-lg' : 'hover:text-gray-300'}`}>{n}</button>
                  ))}
               </div>
            </div>
          </div>
        </div>

        {isModeSelectorOpen && (
          <div className="absolute top-12 left-4 w-56 bg-[#161617] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Fix: Explicitly cast to GenerationMode[] to avoid 'unknown' type error during mapping */}
            {(Object.values(GenerationMode) as GenerationMode[]).map(m => (
              <button key={m} type="button" onClick={() => { setGenerationMode(m); setIsModeSelectorOpen(false); }} className={`w-full text-left px-5 py-3.5 text-xs font-bold hover:bg-white/5 transition-colors flex items-center gap-3 ${generationMode === m ? 'text-indigo-400 bg-indigo-500/5' : 'text-gray-400'}`}>
                {modeIcons[m]} {m}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default PromptForm;
