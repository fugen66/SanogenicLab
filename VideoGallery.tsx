
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
// Fix: Use ImageResultItem as VideoResultItem is not exported from types
import { AspectRatio, ImageResultItem } from '../types';
import { DownloadIcon, SparklesIcon, PlusIcon, FileImageIcon } from './icons';
// @ts-ignore
import gifshot from 'gifshot';

interface VideoGalleryProps {
  // Fix: Replaced VideoResultItem with ImageResultItem
  items: ImageResultItem[];
  onNew: () => void;
  // Fix: Replaced VideoResultItem with ImageResultItem
  onExtend: (item: ImageResultItem) => void;
  aspectRatio: AspectRatio;
}

const VideoGallery: React.FC<VideoGalleryProps> = ({ items, onNew, onExtend, aspectRatio }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isConvertingGif, setIsConvertingGif] = useState(false);
  const activeItem = items[activeIndex];
  const isPortrait = aspectRatio === AspectRatio.PORTRAIT;
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDownloadGif = async (frames: number) => {
    if (!activeItem.objectUrl) return;
    
    setIsConvertingGif(true);
    
    try {
      const video = document.createElement('video');
      video.src = activeItem.objectUrl;
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";

      await new Promise((resolve) => {
        if (video.readyState >= 1) {
          resolve(null);
        } else {
          video.onloadedmetadata = () => resolve(null);
        }
      });

      const duration = video.duration;
      const width = isPortrait ? 360 : 640;
      const height = isPortrait ? 640 : 360;
      const step = duration / frames;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      const images: string[] = [];

      for (let i = 0; i < frames; i++) {
        const time = i * step;
        if (time > 0) {
          video.currentTime = time;
          await new Promise((resolve) => {
             const onSeeked = () => {
               video.removeEventListener('seeked', onSeeked);
               resolve(null);
             };
             video.addEventListener('seeked', onSeeked);
          });
        }
        
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          images.push(canvas.toDataURL('image/jpeg', 0.8));
        }
      }

      gifshot.createGIF({
        images: images,
        interval: 0.1,
        gifWidth: width,
        gifHeight: height,
        numFrames: frames,
        sampleInterval: 10,
      }, (obj: any) => {
        if (!obj.error) {
          const link = document.createElement('a');
          link.href = obj.image;
          link.download = `veo-studio-variant-${activeIndex + 1}.gif`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          console.error('GIF generation failed:', obj.error);
        }
        setIsConvertingGif(false);
      });

    } catch (error) {
      console.error('Error preparing GIF:', error);
      setIsConvertingGif(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Your Creations</h2>
          <p className="text-gray-500 text-sm">Generated {items.length} variant{items.length > 1 ? 's' : ''} based on your vision.</p>
        </div>
        <button onClick={onNew} className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 border border-white/5">
          <PlusIcon className="w-4 h-4" /> New Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className={`relative w-full rounded-3xl bg-black overflow-hidden shadow-2xl border border-white/5 ${isPortrait ? 'aspect-[9/16] max-h-[70vh] mx-auto' : 'aspect-video'}`}>
             <video 
               ref={videoRef}
               key={activeItem.objectUrl} 
               src={activeItem.objectUrl} 
               controls 
               autoPlay 
               loop 
               className="w-full h-full object-contain" 
             />
          </div>

          <div className="flex flex-wrap gap-4">
             <a href={activeItem.objectUrl} download="veo-studio.mp4" className="flex items-center gap-2 px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all shadow-xl shadow-white/5 text-sm">
                <DownloadIcon className="w-5 h-5" /> DOWNLOAD MP4
             </a>
             
             <div className="relative group">
                <button 
                  disabled={isConvertingGif}
                  onClick={() => handleDownloadGif(Math.floor((videoRef.current?.duration || 8) * 10))}
                  className="flex items-center gap-2 px-8 py-4 bg-amber-600 text-white font-black rounded-2xl hover:bg-amber-500 transition-all shadow-xl shadow-amber-600/20 text-sm disabled:opacity-50 disabled:cursor-wait"
                >
                   {isConvertingGif ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   ) : (
                     <FileImageIcon className="w-5 h-5" />
                   )}
                   {isConvertingGif ? 'CONVERTING...' : 'SAVE AS GIF'}
                </button>
                
                {!isConvertingGif && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-30">
                    <button onClick={() => handleDownloadGif(20)} className="w-full text-left px-4 py-3 text-xs text-gray-400 hover:bg-gray-800 hover:text-white border-b border-gray-800 transition-colors">2s Preview</button>
                    <button onClick={() => handleDownloadGif(40)} className="w-full text-left px-4 py-3 text-xs text-gray-400 hover:bg-gray-800 hover:text-white border-b border-gray-800 transition-colors">4s Preview</button>
                    <button onClick={() => handleDownloadGif(80)} className="w-full text-left px-4 py-3 text-xs text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">Full Duration</button>
                  </div>
                )}
             </div>

             <button onClick={() => onExtend(activeItem)} className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 text-sm">
                <SparklesIcon className="w-5 h-5" /> EXTEND 7s
             </button>
          </div>
        </div>

        <div className="space-y-4">
           <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-1">Variants</h3>
           <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 overflow-y-auto lg:max-h-[60vh] pr-2 scrollbar-thin">
              {items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative rounded-2xl overflow-hidden border-2 transition-all group ${activeIndex === idx ? 'border-indigo-500 ring-4 ring-indigo-500/20' : 'border-transparent opacity-60 hover:opacity-100 hover:border-white/20'}`}
                >
                  <div className={`w-full ${isPortrait ? 'aspect-[9/16]' : 'aspect-video'} bg-gray-900`}>
                     <video src={item.objectUrl} muted className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                     <span className="text-[10px] font-bold text-white uppercase">Variant {idx + 1}</span>
                  </div>
                </button>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default VideoGallery;
