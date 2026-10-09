
import React, { useState, useEffect, useRef } from 'react';
import { GeneratedAsset } from '../types';
import { X, Play, Pause, SkipForward, SkipBack, Film, Download, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playPCMData } from '../services/audioUtils';

interface MoviePreviewProps {
  assets: GeneratedAsset[];
  onClose: () => void;
  onDownloadAll?: () => void;
}

const MoviePreview: React.FC<MoviePreviewProps> = ({ assets, onClose, onDownloadAll }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true); // Changed to true for auto-play
  const [isMuted, setIsMuted] = useState(false);
  const audioSourceRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);

  const currentAsset = assets[currentIndex];

  const stopAll = () => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch(e) {}
      audioSourceRef.current = null;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const nextScene = () => {
    if (currentIndex < assets.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      stopAll();
      setIsPlaying(false);
      // Optional: Keep it at the end or loop back
    }
  };

  const startScene = async () => {
    if (!currentAsset || !isPlaying) return;

    if (currentAsset.audioData && currentAsset.audioData.length > 0 && !isMuted) {
      try {
        const source = await playPCMData(currentAsset.audioData);
        audioSourceRef.current = source;
        source.onended = () => {
          timeoutRef.current = setTimeout(nextScene, 800); 
        };
      } catch (e) {
        timeoutRef.current = setTimeout(nextScene, 5000);
      }
    } else {
      // Default duration if no audio
      timeoutRef.current = setTimeout(nextScene, 5000);
    }
  };

  useEffect(() => {
    stopAll();
    if (isPlaying) {
      startScene();
    }
    return () => stopAll();
  }, [currentIndex, isPlaying]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4 md:p-8"
    >
      <div className="absolute inset-0 bg-radial-gradient from-indigo-900/10 to-transparent pointer-events-none" />
      
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-[110]">
         <div className="flex items-center gap-3">
           <div className="p-2 bg-indigo-600 rounded-lg"><Film className="text-white w-4 h-4" /></div>
           <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Cinematic Production Preview</span>
         </div>
         <div className="flex gap-4">
           {onDownloadAll && (
             <button onClick={onDownloadAll} className="px-6 py-2.5 bg-white text-black rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all shadow-xl">
               <Download size={14} /> Download Entire Project
             </button>
           )}
           <button onClick={onClose} className="text-white/50 hover:text-white p-3 bg-white/5 rounded-full border border-white/10 transition-all hover:scale-110">
             <X size={24} />
           </button>
         </div>
      </div>

      <div className="w-full max-w-[1100px] aspect-video relative rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.2)] bg-[#050508] border border-white/5">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAsset?.id}
            className="w-full h-full relative"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <motion.img
              src={currentAsset?.imageUrl}
              className="w-full h-full object-cover"
              animate={{ 
                scale: [1, 1.12],
                x: [0, -15],
              }}
              transition={{ 
                duration: 7, 
                ease: "linear",
              }}
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-12 md:p-16 flex flex-col justify-end">
           <motion.div key={`text-${currentIndex}`} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-3">
                <span className="px-4 py-1.5 rounded-full bg-indigo-600/90 text-[9px] font-black uppercase tracking-widest text-white">Shot {currentIndex + 1}</span>
                {currentAsset?.assignedCharacter && currentAsset.assignedCharacter !== 'none' && (
                   <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[9px] font-black uppercase tracking-widest text-indigo-300 border border-white/5">{currentAsset.assignedCharacter} focus</span>
                )}
              </div>
              <p className="text-xl md:text-2xl font-bold text-white drop-shadow-2xl leading-relaxed">
                {currentAsset?.narration}
              </p>
           </motion.div>
        </div>
      </div>

      <div className="mt-10 w-full max-w-3xl space-y-8 flex flex-col items-center">
         <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden border border-white/5">
            <motion.div className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]" initial={{ width: "0%" }} animate={{ width: `${((currentIndex + 1) / assets.length) * 100}%` }} transition={{ duration: 0.5 }} />
         </div>

         <div className="flex items-center gap-10">
            <button disabled={currentIndex === 0} onClick={() => { stopAll(); setCurrentIndex(prev => prev - 1); }} className="text-white/20 hover:text-indigo-400 transition-all disabled:opacity-0 hover:scale-110"><SkipBack size={36} /></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-all shadow-2xl">
              {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>
            <button disabled={currentIndex === assets.length - 1} onClick={() => { stopAll(); setCurrentIndex(prev => prev + 1); }} className="text-white/20 hover:text-indigo-400 transition-all disabled:opacity-0 hover:scale-110"><SkipForward size={36} /></button>
         </div>

         <div className="flex items-center gap-4">
           <button onClick={() => setIsMuted(!isMuted)} className={`p-3 rounded-full border transition-all ${isMuted ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-white/5 border-white/10 text-zinc-500 hover:text-white'}`}>
             {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
           </button>
           <div className="px-5 py-2 bg-white/5 rounded-full border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-widest">
             Production Progress: <span className="text-indigo-400 ml-1">{currentIndex + 1} / {assets.length}</span>
           </div>
         </div>
      </div>
    </motion.div>
  );
};

export default MoviePreview;
