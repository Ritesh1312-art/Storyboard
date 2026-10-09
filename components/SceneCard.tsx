
import React, { useState, useEffect } from 'react';
import { GeneratedAsset } from '../types';
import { Play, Image as ImageIcon, Video, Mic, Loader2, Edit2, RefreshCw, Save, X, Film, Eye, AlertCircle, MessageSquare, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { playPCMData } from '../services/audioUtils';
import { motion, AnimatePresence } from 'framer-motion';

interface SceneCardProps {
  asset: GeneratedAsset;
  index: number;
  onUpdate: (id: string, updates: Partial<GeneratedAsset>) => void;
  onRegenerateImage: (id: string, feedback?: string) => void;
  onRegenerateAudio: (id: string) => void;
  onGenerateVideo: (id: string) => void;
}

const SceneCard: React.FC<SceneCardProps> = ({ asset, index, onUpdate, onRegenerateImage, onRegenerateAudio, onGenerateVideo }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [tempNarration, setTempNarration] = useState(asset.narration);
  const [tempVisual, setTempVisual] = useState(asset.visualDescription);
  const [feedback, setFeedback] = useState(asset.userFeedback || "");

  return (
    <motion.div layout className="rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row border border-white/5 bg-[#08080c] shadow-2xl transition-all hover:border-indigo-500/30">
      {/* Media Side */}
      <div className="w-full md:w-5/12 bg-black relative aspect-[4/5] md:aspect-auto flex flex-col border-r border-white/5">
        <div className="flex-1 relative overflow-hidden group">
          <AnimatePresence mode="wait">
            {(asset.isGeneratingImage || asset.isWaitingForQuota) ? (
              <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 bg-[#0a0a14] flex flex-col items-center justify-center p-8 text-center gap-6">
                 <div className="relative">
                   <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse" />
                   {asset.isWaitingForQuota ? (
                     <Clock size={48} className="text-amber-400 animate-bounce relative" />
                   ) : (
                     <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="absolute w-full h-full">
                          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/5" />
                          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="251" strokeDashoffset={251 - (251 * (asset.imageProgress || 0)) / 100} className="text-indigo-500 transition-all duration-300" strokeLinecap="round" />
                        </svg>
                        <span className="text-white font-black text-xl">{asset.imageProgress}%</span>
                     </div>
                   )}
                 </div>
                 <div className="space-y-2">
                   <p className={`text-[10px] font-black uppercase tracking-[0.4em] animate-pulse ${asset.isWaitingForQuota ? 'text-amber-400' : 'text-indigo-400'}`}>
                     {asset.isWaitingForQuota ? 'WAITING FOR API SLOT...' : 'RENDERING IMAGE...'}
                   </p>
                   <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                     {asset.isWaitingForQuota ? 'Safety lock active' : 'Consolidating Visual DNA...'}
                   </p>
                 </div>
              </motion.div>
            ) : asset.imageUrl ? (
              <motion.img key="image" src={asset.imageUrl} className="w-full h-full object-cover" initial={{ scale: 1.1 }} animate={{ scale: 1 }} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-800">
                <ImageIcon size={60} />
              </div>
            )}
          </AnimatePresence>

          <div className="absolute top-6 left-6 flex gap-2 z-30">
            <span className="bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-2xl">Scene {asset.sceneNumber}</span>
            {asset.imageUrl && <span className="bg-emerald-500/80 backdrop-blur-xl border border-emerald-500/20 p-1.5 rounded-full text-white shadow-2xl"><CheckCircle2 size={12}/></span>}
          </div>
        </div>

        {/* Director's Correction Panel */}
        <div className="p-6 bg-[#0c0c14] border-t border-white/5 space-y-4">
           <div className="space-y-2">
              <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={12} /> Visual Instruction
              </label>
              <textarea 
                value={feedback} onChange={e => setFeedback(e.target.value)}
                placeholder="Ex: 'Zoom in', 'Change expression', 'Add rain'..."
                className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[11px] text-zinc-300 h-24 resize-none focus:ring-1 focus:ring-indigo-500 shadow-inner outline-none"
              />
           </div>
           <div className="flex gap-2">
             <button 
               onClick={() => onRegenerateImage(asset.id, feedback)}
               disabled={asset.isGeneratingImage || asset.isWaitingForQuota}
               className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white text-[10px] font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all uppercase"
             >
               {asset.isGeneratingImage ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} 
               REWORK IMAGE
             </button>
           </div>
        </div>
      </div>

      {/* Content Side */}
      <div className="w-full md:w-7/12 p-12 space-y-10 overflow-y-auto max-h-[850px] custom-scrollbar bg-[#08080c]">
         <div className="flex justify-between items-center border-b border-white/5 pb-6">
            <div className="flex items-center gap-4">
              <h3 className="text-sm font-black text-indigo-500 uppercase tracking-[0.3em]">Narration Context</h3>
              {asset.isGeneratingAudio && (
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full">
                  <Loader2 size={10} className="animate-spin text-indigo-400" />
                  <span className="text-[9px] font-black text-indigo-400">{asset.audioProgress}%</span>
                </div>
              )}
            </div>
            <button onClick={() => isEditing ? (onUpdate(asset.id, { narration: tempNarration, visualDescription: tempVisual }), setIsEditing(false)) : setIsEditing(true)} className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors">
              {isEditing ? <><Save size={14} /> Save Changes</> : <><Edit2 size={14} /> Edit Script</>}
            </button>
         </div>

         <div className="space-y-6">
            <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2"><Mic size={14} /> Voiceover Text</label>
                 <div className="flex items-center gap-2">
                   <span className="text-[9px] font-bold text-zinc-500 uppercase">Style:</span>
                   <select 
                     value={asset.voiceStyle || 'STORY_NARRATOR'} 
                     onChange={(e) => onUpdate(asset.id, { voiceStyle: e.target.value as any })}
                     className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                   >
                     <option value="STORY_NARRATOR">Story Narrator</option>
                     <option value="MOTIVATIONAL">Motivational</option>
                     <option value="HORROR">Horror</option>
                     <option value="KIDS_STORYTELLER">Kids Storyteller</option>
                     <option value="NEWS_NARRATOR">News Narrator</option>
                     <option value="POEMETIC">Poemetic</option>
                   </select>
                 </div>
               </div>
               {isEditing ? (
                 <textarea value={tempNarration} onChange={e => setTempNarration(e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl p-5 text-sm text-white h-24 outline-none focus:border-indigo-500" />
               ) : (
                 <p className="text-xl font-medium text-zinc-100 leading-relaxed italic">"{asset.narration || 'No narration provided'}"</p>
               )}
               {asset.audioData && !asset.isGeneratingAudio && (
                 <button onClick={() => playPCMData(asset.audioData!)} className="flex items-center gap-2 text-[10px] font-black text-indigo-400 bg-indigo-500/5 px-6 py-2.5 rounded-full border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest">
                   <Play size={12} fill="currentColor" /> Play Voiceover
                 </button>
               )}
            </div>

            <div className="space-y-3 pt-6 border-t border-white/5">
               <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2"><Eye size={14} /> Scene Blueprint</label>
               {isEditing ? (
                 <textarea value={tempVisual} onChange={e => setTempVisual(e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl p-5 text-xs text-zinc-400 font-mono h-32 outline-none focus:border-indigo-500" />
               ) : (
                 <div className="bg-black/40 p-6 rounded-3xl border border-white/5 text-[11px] text-zinc-500 leading-relaxed font-mono italic">
                   {asset.visualDescription}
                 </div>
               )}
            </div>
         </div>
      </div>
    </motion.div>
  );
};

export default SceneCard;
