
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SceneRaw, GeneratedAsset, GenderProfile, VoiceStyle, ImageStyle, AspectRatio, ScriptAnalysisResponse, VideoDuration, CastImages } from "../types";
import { decodeBase64 } from "./audioUtils";

const MODEL_ANALYSIS = 'gemini-3-flash-preview'; 
const MODEL_IMAGE = 'gemini-2.5-flash-image'; 
const MODEL_TTS = 'gemini-2.5-flash-preview-tts';

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

async function withRetry<T>(
  fn: () => Promise<T>, 
  onQuotaWait?: (isWaiting: boolean) => void,
  retries = 60,
  initialDelay = 15000 
): Promise<T> {
  let delay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      if (onQuotaWait) onQuotaWait(false);
      return await fn();
    } catch (error: any) {
      const errorMsg = (error?.message || "").toLowerCase();
      const isQuotaError = 
        errorMsg.includes('429') || 
        errorMsg.includes('quota') || 
        errorMsg.includes('limit') ||
        errorMsg.includes('exceeded') ||
        errorMsg.includes('congested');
      
      if (isQuotaError && i < retries - 1) {
        if (onQuotaWait) onQuotaWait(true);
        const waitTime = i < 5 ? 45000 : 60000; 
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  throw new Error("System is busy. Please wait 1 minute before generating next scene.");
}

export const analyzeScript = async (script: string, duration: VideoDuration, sceneCount: number, isCastMode: boolean): Promise<ScriptAnalysisResponse> => {
  return withRetry(async () => {
    const ai = getAI();
    const castPrompt = isCastMode ? 
      `Identify which specific character (hero, heroine, father, mother, sister, neighbor, community, dada, or dadi) is the focus of each scene and set the 'assignedCharacter' field accordingly. The focus character MUST be one of the listed roles if they are present or mentioned. Also list ALL characters present in the 'presentCharacters' array.` : 
      `The story focuses on a single main character. List 'main character' in 'presentCharacters' if they are in the scene.`;

    const response = await ai.models.generateContent({
      model: MODEL_ANALYSIS,
      contents: `
        Analyze and break this script into exactly ${sceneCount} logical scenes.
        
        CRITICAL STORY COMPREHENSION & CONTINUITY RULES:
        0. UNDERSTAND THE FULL STORY FIRST: Before generating scenes, deeply analyze the plot, character motivations, and the physical state of the world.
        1. LOGICAL PROGRESSION: The actions in a scene MUST logically follow the previous scene. If an object (like a wooden cage) is introduced in scene 1, and characters interact with "wood" in scene 2, they are interacting with the cage, not random wood on the ground.
        2. VISUAL DESCRIPTION (CRITICAL): Detail the specific ACTION and physical context. Do not just say "boys pulling wood". Say "boys pulling wooden sticks from the cage that was shown in the previous scene". Be extremely explicit about WHERE things are happening and HOW characters are interacting with objects established in previous scenes.
        3. STORY FLOW PLAN: Create a high-level plan of the story's progression, noting major location shifts, character entrances/exits, and the state of key objects (e.g., "cage is intact" -> "cage is broken").
        4. LOCATION TRACKING: For each scene, specify the 'locationName'. If the scene is in the same location as the previous one, use the EXACT SAME 'locationName'.
        5. CHARACTER TRACKING: For each scene, list EVERY character visible in 'presentCharacters'. Do NOT include characters who are mentioned but not physically present.
        6. NARRATION & VOICE (CRITICAL): The narration MUST be in HINDI ONLY. It should sound like someone telling THEIR OWN STORY (First-person perspective, highly immersive, emotional).
        7. DYNAMIC VOICE STYLE: Analyze the emotion of EACH scene and assign the most appropriate 'voiceStyle' (e.g., HORROR for scary scenes, MOTIVATIONAL for inspiring scenes, STORY_NARRATOR for general).
        8. STATE TRACKING (CRITICAL): You MUST track the exact physical state of objects. If a cage is broken in scene 2, scene 3 must know it's broken.
        9. DNA DEFINITIONS: 
           - Character DNA: Define face, age, and hair for all major roles (Hero, Heroine, etc.).
           - Outfit DNA (CRITICAL): Define specific clothing color, style, and unique details for EVERY major character. Ensure they stay in the same clothes throughout the story for consistency.
           - Environment DNA: Define the overall world/location style.
        10. CONTINUITY NOTES: Explain what remains constant from the previous scene AND the state of key objects (e.g., "Same jungle, the wooden cage is now partially broken").
        11. ${castPrompt}
        
        Script: ${script}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            seoTitle: { type: Type.STRING },
            seoHashtags: { type: Type.STRING },
            seoDescription: { type: Type.STRING },
            mainCharacterDescription: { type: Type.STRING },
            outfitDNA: { type: Type.STRING },
            globalSettingDescription: { type: Type.STRING },
            keyObjectsDescription: { type: Type.STRING },
            storyFlowPlan: { type: Type.STRING },
            thumbnailPrompt: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneNumber: { type: Type.INTEGER },
                  narration: { type: Type.STRING },
                  visualDescription: { type: Type.STRING },
                  spatialLayout: { type: Type.STRING },
                  locationName: { type: Type.STRING },
                  presentCharacters: { type: Type.ARRAY, items: { type: Type.STRING } },
                  videoGenPrompt: { type: Type.STRING },
                  videoPromptHindi: { type: Type.STRING },
                  continuityNotes: { type: Type.STRING },
                  assignedCharacter: { type: Type.STRING, enum: ['hero', 'heroine', 'father', 'mother', 'sister', 'neighbor', 'community', 'dada', 'dadi', 'none'] },
                  voiceStyle: { type: Type.STRING, enum: ['STORY_NARRATOR', 'MOTIVATIONAL', 'HORROR', 'KIDS_STORYTELLER', 'NEWS_NARRATOR', 'POEMETIC'] },
                  sceneEmotion: { type: Type.STRING }
                },
                required: ["sceneNumber", "narration", "visualDescription", "spatialLayout", "locationName", "presentCharacters", "videoGenPrompt", "videoPromptHindi", "continuityNotes", "assignedCharacter", "voiceStyle", "sceneEmotion"]
              }
            }
          },
          required: ["seoTitle", "seoHashtags", "seoDescription", "mainCharacterDescription", "outfitDNA", "globalSettingDescription", "keyObjectsDescription", "storyFlowPlan", "thumbnailPrompt", "scenes"]
        }
      }
    });
    return JSON.parse(response.text.trim()) as ScriptAnalysisResponse;
  });
};

export const generateSceneImage = async (
  prompt: string, 
  style: ImageStyle, 
  aspectRatio: AspectRatio,
  charDNA: string,
  outfitDNA: string,
  settingDNA: string,
  keyObjectsDNA: string,
  spatialLayout: string,
  onQuotaWait?: (isWaiting: boolean) => void,
  refImage?: string,
  roleName?: string,
  feedback?: string,
  continuityNotes?: string,
  prevSceneVisual?: string,
  charID: string = "CHARACTER_01",
  locationName?: string,
  presentCharacters?: string[],
  storyFlowPlan?: string
): Promise<string> => {
  return withRetry(async () => {
    const ai = getAI();
    const styleStr = style === ImageStyle.Realistic 
      ? "Cinematic film still, photorealistic, 8k, hyper-detailed, dramatic lighting." 
      : "Stylized 3D animated feature film, Disney/Pixar style, soft lighting, expressive faces.";
    
    const masterPrompt = `
      [PRIMARY IDENTITY LOCK]
      ${refImage ? `CRITICAL: THE ATTACHED REFERENCE IMAGE IS THE CHARACTER "${roleName || 'Main Character'}". USE IT AS THE ABSOLUTE SOURCE OF TRUTH FOR THEIR FACIAL FEATURES, AGE, AND HAIR STYLE.` : ''}
      ${charDNA ? `MAIN CHARACTER DNA (BACKUP/REFINEMENT): ${charDNA}` : ''}
      ${outfitDNA ? `OUTFIT DNA (REQUIRED): ${outfitDNA}` : ''}
      GLOBAL SETTING: ${settingDNA}
      PROPS: ${keyObjectsDNA}

      [SCENE SPECIFICS]
      LOCATION: ${locationName || 'As described in setting'}
      CHARACTERS PRESENT: ${presentCharacters?.join(', ') || 'Main character'}
      ${roleName ? `FOCUS: The scene centers on the character "${roleName}".` : (presentCharacters?.length ? `FOCUS: The scene centers on the character "${presentCharacters[0]}".` : '')}
      ACTION: ${prompt}
      CAMERA: ${spatialLayout}
      STYLE: ${styleStr}
      
      [CONTINUITY GUARD]
      CRITICAL: The characters MUST look EXACTLY as shown in the REFERENCE IMAGE or described in DNA. Do not change their facial structure, age, hair, or clothing.
      ${storyFlowPlan ? `Overall Story Context: ${storyFlowPlan}` : ''}
      ${continuityNotes ? `Continuity Context: ${continuityNotes}` : ''}
      ${prevSceneVisual ? `Previous Scene was: ${prevSceneVisual}` : ''}
      ${feedback ? `Director Edit Instruction: ${feedback}` : ''}
      
      CRITICAL: Read the 'Previous Scene' and 'Continuity Context' carefully. Ensure the current action logically follows the previous state.
      CRITICAL: Only show characters listed in 'CHARACTERS PRESENT'.
      CRITICAL: The face of the character "${roleName || 'Main Character'}" MUST be an EXACT match to the face in the ATTACHED REFERENCE IMAGE. DO NOT GENERATE A NEW FACE. REPLICATE THE REFERENCE FACE.
    `.trim();

    const contents: any = { parts: [{ text: masterPrompt }] };
    if (refImage) {
      contents.parts.unshift({
        inlineData: { mimeType: 'image/png', data: refImage.replace(/^data:image\/(png|jpeg|jpg);base64,/, '') }
      });
    }

    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents,
      config: { imageConfig: { aspectRatio } }
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error("Image generation engine failed to return data.");
    return `data:image/png;base64,${part.inlineData.data}`;
  }, onQuotaWait);
};

export const generateSceneAudio = async (
  text: string, 
  gender: GenderProfile,
  style: VoiceStyle = VoiceStyle.StoryNarrator,
  onQuotaWait?: (isWaiting: boolean) => void
): Promise<Uint8Array> => {
  if (!text || gender === GenderProfile.Silence) return new Uint8Array(0);
  return withRetry(async () => {
    const ai = getAI();
    const voice = gender === GenderProfile.Male ? 'Puck' : 'Kore';
    
    let styleInstruction = "";
    switch (style) {
      case VoiceStyle.StoryNarrator:
        styleInstruction = "as a professional theatrical storyteller. Use dramatic pauses, vary your pitch and speed to build suspense, and express deep emotions. Perform it like a classic radio drama narrator, making every word engaging and immersive.";
        break;
      case VoiceStyle.Motivational:
        styleInstruction = "with high energy, inspiration, and powerful conviction. Use strong emphasis on key words to motivate and ignite passion in the audience.";
        break;
      case VoiceStyle.Horror:
        styleInstruction = "in a dark, suspenseful tone. Speak slightly slower to build tension, but keep it sounding natural and clear. Do not make it overly exaggerated, weird, or too slow.";
        break;
      case VoiceStyle.KidsStoryteller:
        styleInstruction = "in a very playful, cheerful, and animated way. Use funny voices for different characters, exaggerated expressions, and a warm, friendly tone that children would love.";
        break;
      case VoiceStyle.NewsNarrator:
        styleInstruction = "in a formal, clear, and authoritative news anchor style. Maintain a steady pace with neutral but professional intonation.";
        break;
      case VoiceStyle.Poemetic:
        styleInstruction = "with a rhythmic, soulful, and artistic flow. Emphasize the beauty of the words, use soft pauses, and create a melodic, emotional experience like a professional poet.";
        break;
    }

    const audioPrompt = `
      ACT AS A PROFESSIONAL STORYTELLER. 
      PERFORM THE TEXT WITH DEEP EMOTION, DRAMATIC PAUSES, AND VARIED INTONATION. 
      DO NOT JUST READ THE TEXT PLAINLY. 
      SAY THIS IN HINDI ONLY. DO NOT USE ENGLISH.
      
      STYLE: ${styleInstruction}
      TEXT TO PERFORM: ${text}
    `.trim();
    
    const response = await ai.models.generateContent({
      model: MODEL_TTS,
      contents: [{ parts: [{ text: audioPrompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
      },
    });
    const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64) throw new Error("TTS Engine timed out.");
    return decodeBase64(base64);
  }, onQuotaWait);
};
