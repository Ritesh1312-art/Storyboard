
export enum VoiceName {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr'
}

export enum GenderProfile {
  Male = 'MALE',
  Female = 'FEMALE',
  Silence = 'SILENCE'
}

export enum VoiceStyle {
  StoryNarrator = 'STORY_NARRATOR',
  Motivational = 'MOTIVATIONAL',
  Horror = 'HORROR',
  KidsStoryteller = 'KIDS_STORYTELLER',
  NewsNarrator = 'NEWS_NARRATOR',
  Poemetic = 'POEMETIC'
}

export enum ImageStyle {
  Realistic = 'REALISTIC',
  Animated3D = 'ANIMATED_3D'
}

export enum GenerationMode {
  FULL = 'FULL',
  IMAGE_ONLY = 'IMAGE_ONLY',
  AUDIO_ONLY = 'AUDIO_ONLY'
}

export type AspectRatio = '16:9' | '9:16';

export type VideoDuration = '30 sec' | '1 min' | '2 min' | '3 min' | '5 min' | '10 min' | '20 min';

export type SceneCount = 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 55 | 60;

export interface CastImages {
  hero: string | null;
  heroine: string | null;
  father: string | null;
  mother: string | null;
  sister: string | null;
  dada: string | null;
  dadi: string | null;
  neighbor: string | null;
  community: string | null;
}

export interface SceneRaw {
  sceneNumber: number;
  narration: string;
  visualDescription: string;
  spatialLayout: string;
  locationName: string;
  presentCharacters: string[];
  videoGenPrompt: string;
  videoPromptHindi: string; 
  continuityNotes?: string;
  assignedCharacter?: keyof CastImages | 'none'; 
  voiceStyle?: VoiceStyle;
}

export interface GeneratedAsset extends SceneRaw {
  id: string;
  isGeneratingImage: boolean;
  isGeneratingAudio: boolean;
  isGeneratingVideo: boolean;
  isWaitingForQuota?: boolean;
  imageProgress?: number;
  audioProgress?: number;
  imageUrl?: string;
  videoUrl?: string;
  audioData?: Uint8Array;
  userFeedback?: string;
}

export interface ScriptAnalysisResponse {
  mainCharacterDescription: string;
  globalSettingDescription: string;
  keyObjectsDescription: string;
  outfitDNA: string;
  storyFlowPlan: string;
  seoTitle: string;
  seoHashtags: string;
  seoDescription: string;
  thumbnailPrompt: string; 
  scenes: SceneRaw[];
}
