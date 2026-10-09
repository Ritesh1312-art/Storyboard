# AI Storyboard & Video Production Suite
> **Developed by Ritesh Gupta**

---

## 📖 Introduction (परिचय)
यह एक Advanced Full-Stack AI Storyboard & Video Scene Production software है जो किसी भी raw script या कहानी को logical scenes, high-quality consistent images, structured emotional voiceovers, aur meta-tags (SEO optimized title, description, and hashtags) mein badalta hai. 

Is software ka sabse bada core feature hai iski **Story Comprehension (कहानी की समझ)** aur **Visual/Voice Consistency (पात्र और आवाज़ की निरंतरता)**। AI har scene ke emotion aur context ko samajhta hai taaki output ekdum realistic, fluid aur cohesive (एक सूत्र में बंधा हुआ) dikhe.

---

## 🛠️ How It Works (यह कैसे काम करता है - मुख्य तकनीक)

यह सॉफ़्टवेयर मुख्य रूप से तीन AI इंजनों पर काम करता है:

### 1. Script Analysis Engine (स्क्रिप्ट विश्लेषण और निरंतरता)
* **Model used:** `gemini-3-flash-preview`
* **Working Method:** Story input hote hi, system script ko deeply scan karta hai. 
* **State Tracking:** Yeh pichle scenes ke objects (jaise toota hua pinjra, talwar, kuan) ka physical state dhyan mein rakhta hai taaki agle scene mein wo change na ho.
* **Hindi First-Person Narrative:** Narration text hamesha Hindi mein aise likhta hai jaise koi apni hi dastan suna raha ho (First-person immersive narration).
* **Dynamic Voice Style Selector:** Scene ke mood ko analyze karke automatically voiceover style assign karta hai (jaise: HORROR, MOTIVATIONAL, KIDS_STORYTELLER, etc.).

### 2. Consistent Identity Image Lock Engine (इमेज जनरेशन और निरंतरता)
* **Model used:** `gemini-2.5-flash-image`
* **Core Concept:** 
  * **SINGLE Mode Consistency:** Agar user ne koi reference photo nahi di hai, toh scene 1 mein jo first character face generate hota hai, use save karke aage ke saare scenes ke liye **Reference Image (Identity Lock)** ki tarah use kiya jata hai.
  * **CAST Mode (Role-Based Locking):** User alag-alag roles (Hero, Heroine, Mother, Father, Dada, Dadi, etc.) ke liye specific faces upload kar sakta hai. System har scene ke generation prompt mein in images ko link karke strictly likhta hai: `THE ATTACHED REFERENCE IMAGE IS THE CHARACTER "HERO". DO NOT GENERATE A NEW FACE.`
  * **Outfit DNA & Global Settings:** pure story ke liye ek global outline taiyaar hoti hai (jaise: `Red jacket, blue jeans for hero`). Har scene mein character ke wahi kapde aur physical details repeat hoti hain.

### 3. Dynamic Text-to-Speech (TTS) Voiceover Engine
* **Model used:** `gemini-2.5-flash-preview-tts`
* **Custom Pacing & Emotions:** Har assigned voice style (jaise Horror, Motivational) ke liye alag tone setup hai.
  * **Horror Style:** Horror scenes mein voice ko suspenseful, deep aur dark banaya jata hai jisme voice natural lage par pacing bilkul perfect ho (over-exaggerated ya bekar slow nahi).
  * **Theatrical Narrator:** Ek classical radio drama style jo dramatic pauses aur speed change se sunne wale ko story mein baandh rakhta hai.

---

## 📂 Project Output & File Tree (प्रोजेक्ट फ़ाइल संरचना)

### Root Directory Structure (मुख्य ढांचा)
```markdown
├── .env.example              # Environment variables template for API Key configuration
├── .gitignore                # Git compile assets ignore control list
├── App.tsx                   # Main React Application UI and core state managers
├── index.html                # Basic HTML entrypoint
├── index.css                 # Global styles and tailwind configuration with Google Fonts
├── package.json              # Dependencies (React, Express v5, @google/genai, Framer Motion)
├── server.ts                 # Full-stack backend to handle static assets & routing in Express v5
├── types.ts                  # Shared TS interfaces, enums and types for consistency
├── vite.config.ts            # Vite bundler options
├── components/               # UI Component Files
│   ├── AuthGuard.tsx         # Checks and verifies API Key entry from local storage
│   ├── MoviePreview.tsx      # Handles the final playback mode (Story slider, images & audio play)
│   ├── PlanningTab.tsx       # Intermediate tab for editing scene scripts and blueprints before production
│   └── SceneCard.tsx         # Detailed editor card for editing individual scene parameters
└── services/                 # API Connections and Helper Utilities
    ├── audioUtils.ts         # Handles base64 PCM dynamic decoding and playbacks
    └── geminiService.ts      # Main logic for Gemini Script analysis, Image & Voiceover generation
```

### 📦 Exported ZIP Tree Structure (डाउनलोड की जाने वाली फ़ाइल)
Jab aap **"Download All Production Data"** par click karte hain, toh background mein ek zip file generate hoti hai jiska structure ye hota hai:
```markdown
[Project-Story-Folder].zip
├── metadata.txt              # Contains SEO title, hashtags, description, and overall script details
├── script_summary.txt        # The storyboard flow plan and overall narrative DNA
├── scenes/
│   ├── scene_1_visual.jpg    # Highly consistent scene image
│   ├── scene_1_audio.wav     # Hindi immersive voiceover clip (PCM decodable)
│   ├── scene_2_visual.jpg
│   ├── scene_2_audio.wav
│   └── ...
```

---

## 🎨 UI Design & Layout Details (यूआई डिज़ाइन और लेआउट)

Software ko ek elegant, premium **Cosmic Dark Theme** par design kiya gaya hai jisme andhere aur light-intensity colors ka balance hai:
* **Primary Background:** Deep Space Black `#08080c` aur Charcoal Obsidian `#0c0c14`
* **Accent Color:** Indigo Violet Glow (`indigo-500` / `violet-600`) - modern tech-look ke liye.
* **Micro-Animations:** Pure page, modal popup aur sliders par `framer-motion` ka dynamic slide, fade-in aur scale transitions use kiya gaya hai.
* **Visual Hierarchy:**
  * **Header:** Developer brand name **"Develop by Ritesh Gupta"** ke saath dynamic state control indicators (Online status, active frames).
  * **Input Section:** Script input area, scene count slider aur generation preferences.
  * **CAST & SINGLE Modes:** 
    * *SINGLE Mode:* 1 primary character layout unki reference image field ke sath.
    * *CAST Mode:* Grid layout jahan alag-alag family characters (Hero, Heroine, Father, Mother, Sister, Dada, Dadi, Neighbor, Community) ki pictures upload ki ja sakti hain.
  * **PRODUCTION MODE Selector:** Teen modes support hote hain:
    1. **Full (Default):** Image aur Voiceover dono generate honge.
    2. **Image Only:** Sirf images generate hongi, voiceover skip ho jayega.
    3. **Voice Over Only:** Sirf voiceover audio generate hoga, image skip ho jayegi.

---

## 🚀 Step-by-Step User Workflow (कदम-दर-कदम उपयोग का तरीक़ा)

### Step 1: Script Input & Scene Configuration
1. **Cast Select Karein:** Pehle screen par chunen ki kahani me ek hi main character hai ya puri cast hai.
2. **References Upload Karein:** Cast mode me un characters ke faces upload karein jinki aapko story me consistency chahiye.
3. **Script Paste Karein:** Script box mein apni kahani (Hindi, English ya Hinglish) likhein ya paste karein.
4. **Scenes Number Choose Karein:** Slider se set karein ki story ko kitne scenes me divide karna hai.
5. **Mode Select Karein:** Image Only, Voiceover Only, ya Full production.
6. **"Analyze Script & Plan"** par click karein.

### Step 2: Planning & Proofreading (संशोधन)
1. AI script analyze karke pure 10-50 scenes generate karega.
2. **SEO Metadata Preview:** Aapko page ke top par SEO titles aur trending hashtags dikhai denge.
3. **Scene Blueprints:** Har scene card par aapko character ka action aur voiceover script dikhai degi. Aap kisi bhi card ko manually change kar sakte hain.
4. **Voice Styles:** Aap har scene ke hisab se wahan voice style (Horror, News, kids) manually badal sakte hain.

### Step 3: Production & Rendering (रेंडरिंग)
1. **"Start Production"** button par click karein.
2. AI background me image aur audio render karna shuru karega. Har card par unique custom progress bar dikhayi degi.
3. Agar koi image sahi nahi banti, toh wahan **"Rework Image"** button ka use karke AI ko instruction de sakte hain (jaise: `add more lightning`, `change background to dark`). AI usi reference aur character face ko lock rakh kar image dobara theek kar dega.

### Step 4: Preview & Export (प्लेबैक और डाउनलोड)
1. Production poora hote hi video production controller active ho jayega.
2. Aap slides play karke full screen pe dynamic voiceover sun sakte hain aur graphics check kar sakte hain.
3. **"Download ZIP"** par click karke pure data ko apne local system par save kar sakte hain.

---

## ⚡ Technical Features list (मुख्य तकनीकी विशेषताएं)
* **Express v5 Integration:** Modern full-stack routing to avoid static file serving exceptions.
* **Auto-Recovery retry system:** API calls limits exceed hone par background me safe delay retry engine run hota hai jo production fail hone se bachata hai.
* **Low-Latency PCM Audio Playback:** Decodes floating raw binary audio instantly for smooth playback across mobile devices and desktop.
* **Tailwind CSS v4 & Lucide Icons:** Responsive grids, optimized touch-targets, aur aesthetic layout alignments.

---
*Created with Passion & Tech Excellence. Developed by Ritesh Gupta.*
