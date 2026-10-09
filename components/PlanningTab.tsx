
import React from 'react';
import { GeneratedAsset, ImageStyle, AspectRatio, GenderProfile, VoiceStyle, CastImages, GenerationMode } from '../types';
import { motion } from 'framer-motion';
import { CheckCircle2, Wand2, PlusCircle, MinusCircle, Mic, Eye, Settings, VolumeX, Trash2, Database, Shirt, Box, ShieldCheck, Globe, User, Heart, Users, Home, Network, Smile, Baby, Layers, Image as ImageIcon, Play } from 'lucide-react';

interface PlanningTabProps {
  assets: GeneratedAsset[];
  onUpdateScene: (id: string, updated: Partial<GeneratedAsset>) => void;
  onAddScene: () => void;
  onRemoveScene: (id: string) => void;
  onStartProduction: () => void;
  style: ImageStyle; setStyle: (s: ImageStyle) => void;
  aspectRatio: AspectRatio; setAspectRatio: (a: AspectRatio) => void;
  voiceGender: GenderProfile; setVoiceGender: (v: GenderProfile) => void;
  voiceStyle: VoiceStyle; setVoiceStyle: (v: VoiceStyle) => void;
  mainCharacter: string; setMainCharacter: (s: string) => void;
  outfitDNA: string; setOutfitDNA: (s: string) => void;
  globalSetting: string; setGlobalSetting: (s: string) => void;
  keyObjects: string; setKeyObjects: (s: string) => void;
  createSubTab: 'SINGLE' | 'CAST';
  storyFlowPlan: string; setStoryFlowPlan: (s: string) => void;
  generationMode: GenerationMode; setGenerationMode: (m: GenerationMode) => void;
}

const PlanningTab: React.FC<PlanningTabProps> = ({ 
  assets, onUpdateScene, onAddScene, onRemoveScene, onStartProduction,
  style, setStyle, aspectRatio, setAspectRatio, voiceGender, setVoiceGender, voiceStyle, setVoiceStyle,
  mainCharacter, setMainCharacter, outfitDNA, setOutfitDNA, globalSetting, setGlobalSetting, keyObjects, setKeyObjects,
  createSubTab, storyFlowPlan, setStoryFlowPlan, generationMode, setGenerationMode
}) => {
  
  const getCastIcon = (role: string) => {
    switch(role) {
      case 'hero': return <User size={12} />;
      case 'heroine': return <Heart size={12} />;
      case 'father': return <User size={12} />;
      case 'mother': return <Smile size={12} />;
      case 'sister': return <Baby size={12} />;
      case 'dada': return <User size={12} />;
      case 'dadi': return <Smile size={12} />;
      case 'neighbor': return <Home size={12} />;
      case 'community': return <Network size={12} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-10 pb-32">
      <div className="bg-[#0f0f1a]/80 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl space-y-10">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={14} /> Master Visual Lock (DNA)</h3>
          <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest italic">{createSubTab === 'CAST' ? 'Reference Images used for characters' : 'Text DNA used for characters'}</span>
        </div>

        <div className={`grid gap-6 ${createSubTab === 'SINGLE' ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2'}`}>
          {createSubTab === 'SINGLE' && (
            <>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><Database size={12} /> Character DNA</label>
                <textarea value={mainCharacter} onChange={e => setMainCharacter(e.target.value)} placeholder="Facial features, age, hair..." className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-[11px] text-white h-24 focus:ring-1 focus:ring-indigo-500 outline-none resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><Shirt size={12} /> Outfit DNA</label>
                <textarea value={outfitDNA} onChange={e => setOutfitDNA(e.target.value)} placeholder="Clothing colors, style, accessories..." className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-[11px] text-white h-24 focus:ring-1 focus:ring-indigo-500 outline-none resize-none" />
              </div>
            </>
          )}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><Globe size={12} /> Environment DNA</label>
            <textarea value={globalSetting} onChange={e => setGlobalSetting(e.target.value)} placeholder="World setting, atmosphere, time..." className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-[11px] text-white h-24 focus:ring-1 focus:ring-emerald-500 outline-none resize-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><Box size={12} /> Object DNA</label>
            <textarea value={keyObjects} onChange={e => setKeyObjects(e.target.value)} placeholder="Crucial props, vehicles, tools..." className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-[11px] text-white h-24 focus:ring-1 focus:ring-emerald-500 outline-none resize-none" />
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-white/5">
          <label className="text-[9px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2"><Layers size={12} /> Story Continuity Plan</label>
          <textarea value={storyFlowPlan} onChange={e => setStoryFlowPlan(e.target.value)} placeholder="Overall story progression and continuity logic..." className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-[11px] text-white h-24 focus:ring-1 focus:ring-amber-500 outline-none resize-none" />
        </div>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-white/5 pb-8 gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          <h2 className="text-2xl font-black text-white flex items-center gap-3"><Wand2 className="text-indigo-400" /> Storyboard Planning</h2>
          
          <div className="flex bg-[#0f0f1a] p-1.5 rounded-2xl border border-white/5 w-fit">
             {[
               { id: GenerationMode.IMAGE_ONLY, label: 'Image Only', icon: <ImageIcon size={12} /> },
               { id: GenerationMode.AUDIO_ONLY, label: 'Voice Over Only', icon: <Mic size={12} /> },
               { id: GenerationMode.FULL, label: 'Full', icon: <Play size={12} /> }
             ].map(m => (
               <button 
                 key={m.id} 
                 onClick={() => setGenerationMode(m.id)} 
                 className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${generationMode === m.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                 {m.icon}
                 {m.label}
               </button>
             ))}
          </div>

          <div className="flex bg-[#0f0f1a] p-1.5 rounded-2xl border border-white/5 w-fit hidden lg:flex">
             {[
               { id: VoiceStyle.StoryNarrator, label: 'Narrator' },
               { id: VoiceStyle.Motivational, label: 'Motivational' },
               { id: VoiceStyle.Horror, label: 'Horror' },
               { id: VoiceStyle.KidsStoryteller, label: 'Kids' },
               { id: VoiceStyle.NewsNarrator, label: 'News' },
               { id: VoiceStyle.Poemetic, label: 'Poetic' }
             ].map(v => (
               <button 
                 key={v.id} 
                 onClick={() => setVoiceStyle(v.id)} 
                 className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${voiceStyle === v.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
               >
                 {v.label}
               </button>
             ))}
          </div>
        </div>
        <button 
          onClick={onStartProduction}
          disabled={assets.length === 0}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black px-12 py-5 rounded-xl uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-20 w-full xl:w-auto"
        >
          <CheckCircle2 size={16} /> Finalize & Start Production
        </button>
      </div>

      <div className="grid gap-6">
        {assets.map((scene) => (
          <motion.div 
            layout key={scene.id}
            className="bg-[#0a0a0f] border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row gap-8 transition-all hover:border-indigo-500/20 shadow-xl relative"
          >
            {createSubTab === 'CAST' && scene.assignedCharacter && scene.assignedCharacter !== 'none' && (
               <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full">
                  <span className="text-indigo-400">{getCastIcon(scene.assignedCharacter)}</span>
                  <span className="text-[9px] font-black uppercase text-indigo-400 tracking-tighter">{scene.assignedCharacter}</span>
               </div>
            )}

            <div className="md:w-1/12 flex flex-col items-center justify-between py-2">
              <div className="text-center">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Scene</span>
                <span className="text-3xl font-black text-white">{scene.sceneNumber}</span>
              </div>
              <button onClick={() => onRemoveScene(scene.id)} className="text-red-500/30 hover:text-red-500 p-2 transition-all"><Trash2 size={20} /></button>
            </div>
            
            <div className="flex-1 grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><Mic size={12} /> Hindi Narration</label>
                  <textarea 
                    value={scene.narration}
                    onChange={(e) => onUpdateScene(scene.id, { narration: e.target.value })}
                    placeholder="Type Hindi story narration..."
                    className="w-full bg-black/40 border border-white/5 rounded-xl p-5 text-sm text-zinc-200 h-32 focus:ring-1 focus:ring-indigo-500 resize-none outline-none shadow-inner"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><Home size={10} /> Location</label>
                    <input 
                      type="text"
                      value={scene.locationName || ''}
                      onChange={(e) => onUpdateScene(scene.id, { locationName: e.target.value })}
                      className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-[11px] text-white focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><Users size={10} /> Characters Present</label>
                    <input 
                      type="text"
                      value={scene.presentCharacters?.join(', ') || ''}
                      onChange={(e) => onUpdateScene(scene.id, { presentCharacters: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-[11px] text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><Eye size={12} /> Visual Description</label>
                <textarea 
                  value={scene.visualDescription}
                  onChange={(e) => onUpdateScene(scene.id, { visualDescription: e.target.value })}
                  placeholder="Image prompt details..."
                  className="w-full bg-black/40 border border-white/5 rounded-xl p-5 text-sm text-zinc-400 h-full focus:ring-1 focus:ring-indigo-500 resize-none outline-none font-mono italic shadow-inner"
                />
              </div>
            </div>
          </motion.div>
        ))}
        
        <button 
          onClick={onAddScene}
          className="w-full py-10 rounded-[2rem] border-2 border-dashed border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/5 text-zinc-600 hover:text-indigo-400 transition-all flex flex-col items-center justify-center gap-3 group"
        >
          <PlusCircle size={40} className="group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em]">Add Scene Manually</span>
        </button>
      </div>
    </div>
  );
};

export default PlanningTab;
