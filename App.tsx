
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Video, Settings, Wand2, Play, Download, Loader2, Plus, Zap, Film, AlertCircle, Package, ImagePlus, RefreshCw, Image as ImageIcon, Database, Box, Shirt, VolumeX, Sparkles, Key, ShieldCheck, ExternalLink, FileText, PlusCircle, MinusCircle, Globe, Layers, User, Heart, Users, Home, Network, FileDown, Smile, Baby, Mic } from 'lucide-react';
import { analyzeScript, generateSceneImage, generateSceneAudio } from './services/geminiService';
import { GeneratedAsset, ImageStyle, AspectRatio, GenderProfile, VoiceStyle, SceneCount, CastImages, GenerationMode } from './types';
import SceneCard from './components/SceneCard';
import PlanningTab from './components/PlanningTab';
import MoviePreview from './components/MoviePreview';
import { createWavBlob } from './services/audioUtils';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';

import { AuthGuard } from './components/AuthGuard';

export default function App() {
  return (
    <AuthGuard>
      <MainApp />
    </AuthGuard>
  );
}

function MainApp() {
  const [activeTab, setActiveTab] = useState<'CREATE' | 'PLANNING' | 'PRODUCTION' | 'METADATA'>('CREATE');
  const [createSubTab, setCreateSubTab] = useState<'SINGLE' | 'CAST'>('SINGLE');
  const [script, setScript] = useState('');
  const [refImage, setRefImage] = useState<string | null>(null);
  
  const [castImages, setCastImages] = useState<CastImages>({
    hero: null,
    heroine: null,
    father: null,
    mother: null,
    sister: null,
    dada: null,
    dadi: null,
    neighbor: null,
    community: null
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingTxt, setIsExportingTxt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const characterUUID = useMemo(() => `CHAR_${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`, []);

  const [mainCharacter, setMainCharacter] = useState("");
  const [outfitDNA, setOutfitDNA] = useState("");
  const [globalSetting, setGlobalSetting] = useState("");
  const [keyObjects, setKeyObjects] = useState("");
  
  const [style, setStyle] = useState<ImageStyle>(ImageStyle.Animated3D); 
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [voiceGender, setVoiceGender] = useState<GenderProfile>(GenderProfile.Male);
  const [voiceStyle, setVoiceStyle] = useState<VoiceStyle>(VoiceStyle.StoryNarrator);
  const [sceneCount, setSceneCount] = useState<SceneCount>(10);
  const [generationMode, setGenerationMode] = useState<GenerationMode>(GenerationMode.FULL);
  
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [storyFlowPlan, setStoryFlowPlan] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [metadata, setMetadata] = useState<{ title: string; hashtags: string; description: string; thumbnailPrompt: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleError = (err: any) => {
    const msg = err.message || "An unexpected error occurred.";
    setError(msg);
    setTimeout(() => setError(null), 15000);
  };

  const simulateProgress = (id: string, type: 'IMAGE' | 'AUDIO', duration: number = 20000) => {
    const interval = 100;
    const steps = duration / interval;
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = Math.min(Math.floor((currentStep / steps) * 98), 99);
      setAssets(prev => prev.map(a => a.id === id ? { ...a, [type === 'IMAGE' ? 'imageProgress' : 'audioProgress']: progress } : a));
      if (currentStep >= steps) clearInterval(timer);
    }, interval);
    return () => {
      clearInterval(timer);
      setAssets(prev => prev.map(a => a.id === id ? { ...a, [type === 'IMAGE' ? 'imageProgress' : 'audioProgress']: 100 } : a));
    };
  };

  const handleRefImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setRefImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCastImageChange = (role: keyof CastImages, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCastImages(prev => ({ ...prev, [role]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!script.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const resp = await analyzeScript(script, '1 min', sceneCount, createSubTab === 'CAST');
      setMetadata({ title: resp.seoTitle, hashtags: resp.seoHashtags, description: resp.seoDescription, thumbnailPrompt: resp.thumbnailPrompt });
      
      setMainCharacter(resp.mainCharacterDescription);
      setOutfitDNA(resp.outfitDNA || "");
      setGlobalSetting(resp.globalSettingDescription);
      setKeyObjects(resp.keyObjectsDescription);
      setStoryFlowPlan(resp.storyFlowPlan || "");
      
      setAssets(resp.scenes.map((s, i) => ({
        id: `scene-${i}-${Date.now()}`,
        ...s,
        isGeneratingImage: false, isGeneratingAudio: false, isGeneratingVideo: false,
        imageProgress: 0, audioProgress: 0
      })));
      setActiveTab('PLANNING');
    } catch (err) { handleError(err); } finally { setIsProcessing(false); }
  };

  const addBlankScene = () => {
    const nextNumber = assets.length > 0 ? Math.max(...assets.map(a => a.sceneNumber)) + 1 : 1;
    setAssets(prev => [...prev, {
      id: `manual-${Date.now()}`, sceneNumber: nextNumber, narration: '', visualDescription: '', spatialLayout: 'Medium Shot', locationName: 'Unknown', presentCharacters: [], videoGenPrompt: '', videoPromptHindi: '', continuityNotes: 'Sequence from last shot', assignedCharacter: 'none',
      isGeneratingImage: false, isGeneratingAudio: false, isGeneratingVideo: false, imageProgress: 0, audioProgress: 0
    }]);
  };

  const startProduction = async () => {
    setActiveTab('PRODUCTION');
    setIsGeneratingThumbnail(true);
    
    try {
       const thumb = await generateSceneImage(metadata?.thumbnailPrompt || "Cinematic Movie Poster", style, aspectRatio, mainCharacter, outfitDNA, globalSetting, keyObjects, "Wide");
       setThumbnailUrl(thumb);
    } catch(e) { console.error("Thumbnail fail", e); }
    setIsGeneratingThumbnail(false);

    for (let i = 0; i < assets.length; i++) {
      const item = assets[i];
      const shouldGenerateImage = generationMode === GenerationMode.FULL || generationMode === GenerationMode.IMAGE_ONLY;
      const shouldGenerateAudio = (generationMode === GenerationMode.FULL || generationMode === GenerationMode.AUDIO_ONLY) && voiceGender !== GenderProfile.Silence && item.narration.trim();

      if ((!shouldGenerateImage || item.imageUrl) && (!shouldGenerateAudio || item.audioData)) continue;
      
      const prevAsset = i > 0 ? assets[i-1] : null;

      let activeRef = refImage;
      if (createSubTab === 'CAST' && item.assignedCharacter && item.assignedCharacter !== 'none') {
         activeRef = castImages[item.assignedCharacter as keyof CastImages];
      } else if (createSubTab === 'SINGLE' && !refImage && i > 0) {
         const firstGeneratedImage = assets.find(a => a.imageUrl)?.imageUrl;
         if (firstGeneratedImage) activeRef = firstGeneratedImage;
      }

      setAssets(prev => prev.map(a => a.id === item.id ? { 
        ...a, 
        isGeneratingImage: shouldGenerateImage && !a.imageUrl, 
        isGeneratingAudio: shouldGenerateAudio && !a.audioData, 
        imageProgress: shouldGenerateImage && !a.imageUrl ? 5 : 100, 
        audioProgress: shouldGenerateAudio && !a.audioData ? 5 : 100 
      } : a));

      const stopImageSim = shouldGenerateImage && !item.imageUrl ? simulateProgress(item.id, 'IMAGE', 25000) : () => {};
      const stopAudioSim = shouldGenerateAudio && !item.audioData ? simulateProgress(item.id, 'AUDIO', 15000) : () => {};

      try {
        const currentMainDNA = createSubTab === 'CAST' ? "" : mainCharacter;
        const currentOutfitDNA = outfitDNA;

        const [imgRes, audRes] = await Promise.allSettled([
          shouldGenerateImage && !item.imageUrl
            ? generateSceneImage(
                item.visualDescription, 
                style, 
                aspectRatio, 
                currentMainDNA, 
                currentOutfitDNA, 
                globalSetting, 
                keyObjects, 
                item.spatialLayout, 
                (w) => setAssets(prev => prev.map(a => a.id === item.id ? { ...a, isWaitingForQuota: w } : a)), 
                activeRef || undefined, 
                item.assignedCharacter && item.assignedCharacter !== 'none' ? item.assignedCharacter : undefined,
                undefined, 
                item.continuityNotes, 
                prevAsset?.visualDescription, 
                characterUUID, 
                item.locationName, 
                item.presentCharacters, 
                storyFlowPlan
              )
            : Promise.resolve(item.imageUrl || ""),
          shouldGenerateAudio && !item.audioData
            ? generateSceneAudio(item.narration, voiceGender, item.voiceStyle || voiceStyle, (w) => setAssets(prev => prev.map(a => a.id === item.id ? { ...a, isWaitingForQuota: w } : a)))
            : Promise.resolve(item.audioData || new Uint8Array(0))
        ]);

        stopImageSim(); stopAudioSim();
        let up: Partial<GeneratedAsset> = { isGeneratingImage: false, isGeneratingAudio: false, imageProgress: 100, audioProgress: 100, isWaitingForQuota: false };
        if (imgRes.status === 'fulfilled' && imgRes.value) up.imageUrl = imgRes.value as string;
        if (audRes.status === 'fulfilled' && audRes.value && (audRes.value as Uint8Array).length > 0) up.audioData = audRes.value as Uint8Array;
        
        setAssets(prev => prev.map(a => a.id === item.id ? { ...a, ...up } : a));
        await new Promise(r => setTimeout(r, 5000));
      } catch (err) { 
        stopImageSim(); stopAudioSim(); 
        handleError(err); 
      }
    }
  };

  const reworkImage = useCallback(async (id: string, fb?: string) => {
    const asset = assets.find(x => x.id === id);
    if (!asset) return;
    const idx = assets.indexOf(asset);
    const prevAsset = idx > 0 ? assets[idx-1] : null;

    let activeRef = refImage;
    if (createSubTab === 'CAST' && asset.assignedCharacter && asset.assignedCharacter !== 'none') {
       activeRef = castImages[asset.assignedCharacter as keyof CastImages];
    }

    setAssets(prev => prev.map(a => a.id === id ? { ...a, isGeneratingImage: true, imageProgress: 10, userFeedback: fb } : a));
    const stop = simulateProgress(id, 'IMAGE', 20000);
    try {
      const currentMainDNA = createSubTab === 'CAST' ? "" : mainCharacter;
      const currentOutfitDNA = outfitDNA;

      const url = await generateSceneImage(
        asset.visualDescription, 
        style, 
        aspectRatio, 
        currentMainDNA, 
        currentOutfitDNA, 
        globalSetting, 
        keyObjects, 
        asset.spatialLayout, 
        (w) => setAssets(prev => prev.map(x => x.id === id ? { ...x, isWaitingForQuota: w } : x)), 
        activeRef || undefined, 
        asset.assignedCharacter && asset.assignedCharacter !== 'none' ? asset.assignedCharacter : undefined,
        fb, 
        asset.continuityNotes, 
        prevAsset?.visualDescription, 
        characterUUID, 
        asset.locationName, 
        asset.presentCharacters, 
        storyFlowPlan
      );
      stop();
      setAssets(prev => prev.map(x => x.id === id ? { ...x, imageUrl: url, isGeneratingImage: false, imageProgress: 100, isWaitingForQuota: false } : x));
    } catch (err) { stop(); handleError(err); }
  }, [assets, mainCharacter, outfitDNA, globalSetting, keyObjects, style, aspectRatio, refImage, castImages, createSubTab, characterUUID]);

  const generateProductionTxt = () => {
    if (!metadata) return "";
    let text = `Develop by Ritesh Gupta\n\n`;
    text += `1. SEO-Optimised Title: ${metadata.title}\n`;
    text += `SEO-Optimised Hashtags: ${metadata.hashtags}\n\n`;
    text += `2. SEO-Optimised Hindi Description:\n${metadata.description}\n\n`;
    text += `--------------------------------------------------\n\n`;
    
    assets.forEach((a, i) => {
      text += `3. Scene (${i + 1})\n`;
      text += `Narration in hindi:\n${a.narration}\n\n`;
      text += `Image Prompt:\n${a.visualDescription}\n\n`;
      text += `Image to Video Prompt in Hindi:\n${a.videoPromptHindi}\n\n`;
      text += `--------------------------------------------------\n\n`;
    });
    return text;
  };

  const handleExportTxtOnly = () => {
    if (!metadata) return;
    setIsExportingTxt(true);
    try {
      const text = generateProductionTxt();
      const blob = new Blob([text], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${metadata.title}_Production_Data.txt`;
      link.click();
    } catch (err) { handleError(err); } finally { setIsExportingTxt(false); }
  };

  const handleExportZip = async () => {
    if (!metadata || assets.length === 0) return;
    setIsExporting(true);
    try {
      const zip = new JSZip();
      if (thumbnailUrl) zip.file("00_MASTER_THUMBNAIL.png", thumbnailUrl.split(',')[1], {base64: true});
      
      const text = generateProductionTxt();
      zip.file("PRODUCTION_DATA.txt", text);
      
      assets.forEach((a, i) => {
        if (a.imageUrl) zip.folder("Images")?.file(`scene_${i+1}.png`, a.imageUrl.split(',')[1], {base64: true});
        if (a.audioData) zip.folder("Audio")?.file(`scene_${i+1}.wav`, createWavBlob(a.audioData));
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${metadata.title}_Storyboard_Project.zip`;
      link.click();
    } catch (err) { handleError(err); } finally { setIsExporting(false); }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden selection:bg-indigo-500/30">
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-indigo-600 rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.5)]">
                <Video className="text-white w-6 h-6" />
              </div>
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Storyboard</h1>
            </div>
            <p className="text-zinc-500 text-[10px] font-black tracking-[0.5em] uppercase">Develop by Ritesh Gupta</p>
          </motion.div>
          <div className="flex bg-[#0f0f1a] p-2 rounded-[1.5rem] border border-white/5 shadow-2xl overflow-x-auto no-scrollbar">
            {['CREATE', 'PLANNING', 'PRODUCTION', 'METADATA'].map(t => (
              <button key={t} onClick={() => setActiveTab(t as any)} className={`px-8 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all whitespace-nowrap ${activeTab === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>
                {t}
              </button>
            ))}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'CREATE' && (
            <motion.div key="create" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-10">
                <div className="magic-border rounded-[3rem] p-1">
                  <div className="bg-[#08080c] rounded-[2.9rem] p-10 space-y-10">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <h2 className="text-2xl font-black text-white flex items-center gap-4"><Sparkles className="text-indigo-400" /> Story Engine</h2>
                        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
                           <button onClick={() => setCreateSubTab('SINGLE')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${createSubTab === 'SINGLE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>Single Lead</button>
                           <button onClick={() => setCreateSubTab('CAST')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all ${createSubTab === 'CAST' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>Cast Production</button>
                        </div>
                     </div>
                     
                     {createSubTab === 'SINGLE' ? (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-4">
                              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><ImagePlus size={14} /> Character Reference</label>
                             <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/10 rounded-[2.5rem] cursor-pointer hover:bg-white/5 transition-all group overflow-hidden">
                                {refImage ? <img src={refImage} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center gap-2 text-zinc-600"><Plus size={40} /><span className="text-[10px] font-black uppercase">Upload Face</span></div>}
                                <input type="file" accept="image/*" className="hidden" onChange={handleRefImageChange} />
                             </label>
                          </div>
                          <div className="grid grid-rows-2 gap-4">
                             <div className="space-y-2">
                               <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><Database size={12} /> Character DNA</label>
                               <textarea value={mainCharacter} onChange={e => setMainCharacter(e.target.value)} placeholder="Age, facial features, hair style, eye color..." className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[11px] text-white focus:ring-1 focus:ring-indigo-500 outline-none h-full resize-none shadow-inner" />
                             </div>
                             <div className="space-y-2">
                               <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><Shirt size={12} /> Outfit DNA</label>
                               <textarea value={outfitDNA} onChange={e => setOutfitDNA(e.target.value)} placeholder="Clothing type, shirt color, pants style..." className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[11px] text-white focus:ring-1 focus:ring-indigo-500 outline-none h-full resize-none shadow-inner" />
                             </div>
                          </div>
                       </div>
                     ) : (
                       <div className="space-y-8">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Users size={14} /> Cast Reference Library (DNA Priority: Visual)</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                             {[
                               { id: 'hero', label: 'Hero', icon: <User size={18} /> },
                               { id: 'heroine', label: 'Heroine', icon: <Heart size={18} /> },
                               { id: 'father', label: 'Father', icon: <User size={18} /> },
                               { id: 'mother', label: 'Mother', icon: <Smile size={18} /> },
                               { id: 'sister', label: 'Sister', icon: <Baby size={18} /> },
                               { id: 'dada', label: 'Dada', icon: <User size={18} /> },
                               { id: 'dadi', label: 'Dadi', icon: <Smile size={18} /> },
                               { id: 'neighbor', label: 'Neighbor', icon: <Home size={18} /> },
                               { id: 'community', label: 'Community', icon: <Network size={18} /> }
                             ].map(role => (
                               <label key={role.id} className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-white/10 rounded-3xl cursor-pointer hover:bg-indigo-500/10 hover:border-indigo-500/40 transition-all group overflow-hidden relative shadow-inner">
                                  {castImages[role.id as keyof CastImages] ? (
                                    <img src={castImages[role.id as keyof CastImages]!} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="flex flex-col items-center gap-2 text-zinc-600 group-hover:text-indigo-400">
                                       {role.icon}
                                       <span className="text-[8px] font-black uppercase tracking-widest">{role.label}</span>
                                    </div>
                                  )}
                                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCastImageChange(role.id as keyof CastImages, e)} />
                               </label>
                             ))}
                          </div>
                       </div>
                     )}

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><Globe size={12} /> Environment DNA</label>
                           <textarea value={globalSetting} onChange={e => setGlobalSetting(e.target.value)} placeholder="World setting, atmosphere, time of day..." className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[11px] text-white h-24 focus:ring-1 focus:ring-emerald-500 outline-none resize-none shadow-inner" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><Box size={12} /> Object DNA</label>
                           <textarea value={keyObjects} onChange={e => setKeyObjects(e.target.value)} placeholder="Essential props, items character interacts with..." className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-[11px] text-white h-24 focus:ring-1 focus:ring-emerald-500 outline-none resize-none shadow-inner" />
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Story Script</label>
                        <textarea value={script} onChange={e => setScript(e.target.value)} placeholder="Paste your story here. AI will identify cast members automatically..." className="w-full h-64 bg-black/40 border border-white/5 rounded-[2.5rem] p-10 text-white text-xl leading-relaxed outline-none focus:ring-1 focus:ring-indigo-500 shadow-inner" />
                     </div>
                     
                     <button onClick={handleAnalyze} disabled={isProcessing} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-7 rounded-[2.5rem] flex items-center justify-center gap-4 transition-all shadow-xl">
                       {isProcessing ? <Loader2 className="animate-spin" /> : <Zap fill="currentColor" />} {isProcessing ? 'ANALYZING STORY FLOW...' : 'START PRODUCTION PIPELINE'}
                     </button>
                     {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs flex items-center gap-2 animate-pulse"><AlertCircle size={16} /> {error}</div>}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-[#0f0f1a]/80 backdrop-blur-3xl border border-white/5 p-10 rounded-[3rem] shadow-2xl space-y-10">
                   <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Settings size={14} /> Global Config</h3>
                   
                   <div className="space-y-4">
                     <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Layers size={12} /> Art Style</label>
                     <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setStyle(ImageStyle.Realistic)} className={`py-4 rounded-xl border text-[9px] font-black uppercase transition-all ${style === ImageStyle.Realistic ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg' : 'border-white/5 bg-white/5 text-zinc-600'}`}>3D Cinema</button>
                        <button onClick={() => setStyle(ImageStyle.Animated3D)} className={`py-4 rounded-xl border text-[9px] font-black uppercase transition-all ${style === ImageStyle.Animated3D ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg' : 'border-white/5 bg-white/5 text-zinc-600'}`}>Pixar style</button>
                     </div>
                   </div>

                   <div className="space-y-4">
                     <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Layers size={12}/> Aspect Ratio</label>
                     <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setAspectRatio('16:9')} className={`py-4 rounded-xl border text-[9px] font-black uppercase transition-all ${aspectRatio === '16:9' ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg' : 'border-white/5 bg-white/5 text-zinc-600'}`}>16:9 Wide</button>
                        <button onClick={() => setAspectRatio('9:16')} className={`py-4 rounded-xl border text-[9px] font-black uppercase transition-all ${aspectRatio === '9:16' ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg' : 'border-white/5 bg-white/5 text-zinc-600'}`}>9:16 Reels</button>
                     </div>
                   </div>

                   <div className="space-y-4">
                     <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Natural Indian Voice</label>
                     <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => setVoiceGender(GenderProfile.Male)} className={`py-4 rounded-xl border text-[9px] font-black uppercase transition-all ${voiceGender === GenderProfile.Male ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg' : 'border-white/5 bg-white/5 text-zinc-600'}`}>Male</button>
                        <button onClick={() => setVoiceGender(GenderProfile.Female)} className={`py-4 rounded-xl border text-[9px] font-black uppercase transition-all ${voiceGender === GenderProfile.Female ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg' : 'border-white/5 bg-white/5 text-zinc-600'}`}>Female</button>
                        <button onClick={() => setVoiceGender(GenderProfile.Silence)} className={`py-4 rounded-xl border text-[9px] font-black uppercase transition-all flex items-center justify-center ${voiceGender === GenderProfile.Silence ? 'border-red-500 bg-red-500/10 text-white shadow-lg' : 'border-white/5 bg-white/5 text-zinc-600'}`}><VolumeX size={14} /></button>
                     </div>
                   </div>

                   <div className="space-y-4">
                     <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Mic size={12} /> AI Voice Director</label>
                     <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: VoiceStyle.StoryNarrator, label: 'Story Narrator' },
                          { id: VoiceStyle.Motivational, label: 'Motivational' },
                          { id: VoiceStyle.Horror, label: 'Horror Voice' },
                          { id: VoiceStyle.KidsStoryteller, label: 'Kids Storyteller' },
                          { id: VoiceStyle.NewsNarrator, label: 'News Narrator' },
                          { id: VoiceStyle.Poemetic, label: 'Poemetic' }
                        ].map(v => (
                          <button 
                            key={v.id} 
                            onClick={() => setVoiceStyle(v.id)} 
                            className={`py-3 rounded-xl border text-[8px] font-black uppercase transition-all ${voiceStyle === v.id ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg' : 'border-white/5 bg-white/5 text-zinc-600'}`}
                          >
                            {v.label}
                          </button>
                        ))}
                     </div>
                   </div>

                   <div className="space-y-4">
                     <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Story Length</label>
                     <select value={sceneCount} onChange={e => setSceneCount(Number(e.target.value) as any)} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-6 text-[10px] font-black uppercase text-white outline-none focus:border-indigo-500">
                        {[5, 10, 15, 20, 25, 30, 40, 50, 60].map(n => <option key={n} value={n}>{n} Scenes Production</option>)}
                     </select>
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'PLANNING' && (
            <motion.div key="planning" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <PlanningTab 
                assets={assets} onUpdateScene={(id, up) => setAssets(prev => prev.map(a => a.id === id ? {...a, ...up} : a))} onAddScene={addBlankScene} onRemoveScene={(id) => setAssets(prev => prev.filter(a => a.id !== id))} onStartProduction={startProduction} 
                style={style} setStyle={setStyle} aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} voiceGender={voiceGender} setVoiceGender={setVoiceGender} 
                voiceStyle={voiceStyle} setVoiceStyle={setVoiceStyle}
                mainCharacter={mainCharacter} setMainCharacter={setMainCharacter} outfitDNA={outfitDNA} setOutfitDNA={setOutfitDNA} globalSetting={globalSetting} setGlobalSetting={setGlobalSetting} keyObjects={keyObjects} setKeyObjects={setKeyObjects} 
                createSubTab={createSubTab} storyFlowPlan={storyFlowPlan} setStoryFlowPlan={setStoryFlowPlan}
                generationMode={generationMode} setGenerationMode={setGenerationMode}
              />
            </motion.div>
          )}

          {activeTab === 'PRODUCTION' && (
            <motion.div key="production" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
              <div className="flex items-center justify-between border-b border-white/5 pb-10">
                <h2 className="text-3xl font-black text-white flex items-center gap-4"><Film className="text-indigo-400" /> Story Pipeline</h2>
                {assets.some(a => !!a.imageUrl) && (
                  <button onClick={() => setShowPreview(true)} className="group relative overflow-hidden bg-white text-black text-[11px] font-black px-12 py-5 rounded-full uppercase transition-all shadow-xl">
                    <span className="relative z-10 flex items-center gap-2"><Play fill="black" size={14} /> Cinema Preview</span>
                    <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                )}
              </div>
              <div className="space-y-14">
                {assets.map((asset, index) => (
                  <SceneCard key={asset.id} asset={asset} index={index} onUpdate={(id, up) => setAssets(prev => prev.map(a => a.id === id ? {...a, ...up} : a))} onRegenerateImage={reworkImage} onRegenerateAudio={() => {}} onGenerateVideo={() => {}} />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'METADATA' && (
            <motion.div key="metadata" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto py-12">
               <div className="bg-[#08080c] rounded-[4rem] border border-white/5 p-12 flex flex-col md:flex-row gap-20 shadow-2xl group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5"><Sparkles size={100} /></div>
                  <div className="w-full md:w-5/12 aspect-square bg-black rounded-[3rem] overflow-hidden relative border border-white/10 transition-transform hover:scale-105">
                    {thumbnailUrl ? <img src={thumbnailUrl} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-zinc-800 animate-pulse"><ImageIcon size={80} /></div>}
                  </div>
                  <div className="w-full md:w-7/12 space-y-8 relative">
                     <div className="space-y-3">
                        <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-tight">{metadata?.title || 'Story Project'}</h3>
                        <p className="text-zinc-500 text-sm line-clamp-4 leading-relaxed">{metadata?.description || 'Metadata ready for social media export.'}</p>
                     </div>
                     <div className="grid grid-cols-1 gap-4 pt-8 border-t border-white/5">
                       <button onClick={handleExportZip} disabled={isExporting} className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 shadow-xl hover:bg-indigo-500 transition-all">
                         {isExporting ? <Loader2 className="animate-spin" /> : <Package size={22} />} Export All Files (ZIP)
                       </button>
                       <button onClick={handleExportTxtOnly} disabled={isExportingTxt} className="w-full bg-white/5 text-white py-6 rounded-2xl font-black uppercase text-xs border border-white/10 flex items-center justify-center gap-3 hover:bg-indigo-600 hover:border-transparent transition-all">
                         {isExportingTxt ? <Loader2 className="animate-spin" /> : <FileDown size={22} />} Export Production Data (.txt)
                       </button>
                       <button onClick={() => setShowPreview(true)} className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all">
                         <Play size={22} fill="black" /> Preview Production
                       </button>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
        {showPreview && <MoviePreview assets={assets.filter(a => !!a.imageUrl)} onClose={() => setShowPreview(false)} onDownloadAll={handleExportZip} />}
      </main>
    </div>
  );
}
