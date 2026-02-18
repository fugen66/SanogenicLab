
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { ImageResultItem, AspectRatio } from '../types';
import { DownloadIcon, PlusIcon } from './icons';

interface ImageGalleryProps {
  items: ImageResultItem[];
  onNew: () => void;
  aspectRatio: AspectRatio;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ items, onNew, aspectRatio }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex];
  
  const isPortrait = aspectRatio === AspectRatio.PORTRAIT;
  const isSquare = aspectRatio === AspectRatio.SQUARE;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Gallery</h2>
          <p className="text-gray-500 text-sm">Created {items.length} unique variant{items.length > 1 ? 's' : ''}.</p>
        </div>
        <button onClick={onNew} className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 border border-white/5">
          <PlusIcon className="w-4 h-4" /> New Artwork
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className={`relative w-full rounded-3xl bg-[#0a0a0a] overflow-hidden shadow-2xl border border-white/5 group ${isPortrait ? 'aspect-[9/16] max-h-[75vh] mx-auto' : isSquare ? 'aspect-square max-h-[75vh] mx-auto' : 'aspect-video'}`}>
             <img 
               src={activeItem.objectUrl} 
               alt="Generated artwork"
               className="w-full h-full object-contain" 
             />
             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <p className="text-white font-medium px-4 py-2 bg-black/60 rounded-full backdrop-blur-md border border-white/10">Variant {activeIndex + 1}</p>
             </div>
          </div>

          <div className="flex justify-center lg:justify-start">
             <a 
               href={activeItem.objectUrl} 
               download={`lumina-art-${activeIndex + 1}.png`} 
               className="flex items-center gap-3 px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-indigo-50 transition-all shadow-xl shadow-white/5 text-sm uppercase tracking-wider"
             >
                <DownloadIcon className="w-5 h-5" /> Save Image
             </a>
          </div>
        </div>

        <div className="space-y-4">
           <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-1">Iterative Variants</h3>
           <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 overflow-y-auto lg:max-h-[60vh] pr-2 scrollbar-thin">
              {items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative rounded-2xl overflow-hidden border-2 transition-all ${activeIndex === idx ? 'border-indigo-500 ring-4 ring-indigo-500/20 scale-[0.98]' : 'border-transparent opacity-50 hover:opacity-100 hover:border-white/10'}`}
                >
                  <div className={`w-full ${isPortrait ? 'aspect-[9/16]' : isSquare ? 'aspect-square' : 'aspect-video'} bg-gray-900`}>
                     <img src={item.objectUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                </button>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
