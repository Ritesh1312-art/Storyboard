import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { requireAuth, requireAdmin, optionalAuth } from './middleware/auth.js';
import { checkSubscription, incrementCounter } from './middleware/subscription.js';
import { validateScript, validateImageRequest, validateAudioRequest, sanitizeInput } from './middleware/validation.js';
import { apiLimiter, imageGenLimiter, loginLimiter } from './middleware/rateLimiter.js';
import config from './config.js';
import auth from './auth.js';
import userManager from './userManager.js';
import paymentsRouter from './routes/payments.js';
import watermark from './watermark.js';
import profileRouter from './routes/profile.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== SECURITY MIDDLEWARE ====================

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict'
    },
    name: 'storyboard.sid'
}));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'client')));

// ==================== AUTHENTICATION ROUTES ====================

// Register new user
app.post('/api/auth/register', async (req, res) => {
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
        return res.status(400).json({ error: 'All fields required' });
    }

    if (username === 'admin') {
        return res.status(400).json({ error: 'Username not available' });
    }

    const result = await auth.register(username, password, email);
    if (result.success) {
        req.session.user = result.user;
        res.json(result);
    } else {
        res.status(400).json(result);
    }
});

// Login
app.post('/api/auth/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;
    
    // Check admin
    if (username === 'admin') {
        const adminPass = config.get('adminPassword');
        if (password === adminPass) {
            req.session.user = { 
                username: 'admin', 
                role: 'admin',
                plan: 'unlimited' 
            };
            return res.json({ 
                success: true, 
                user: { 
                    username: 'admin', 
                    role: 'admin' 
                } 
            });
        }
    }

    // Check regular users
    const result = await auth.login(username, password);
    if (result.success) {
        req.session.user = result.user;
        res.json(result);
    } else {
        res.status(401).json(result);
    }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Check auth status
app.get('/api/auth/status', (req, res) => {
    res.json({ 
        authenticated: !!req.session.user,
        user: req.session.user || null
    });
});

app.use('/api/payments', paymentsRouter);
app.use('/api', profileRouter);

let genAI = null;

function getGeminiAI() {
    if (!genAI) {
        const apiKey = config.get('geminiApiKey');
        if (!apiKey) {
            throw new Error('Gemini API key not configured. Please contact admin.');
        }
        genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI;
}

// Retry utility
async function withRetry(fn, maxRetries = 60, baseDelay = 15000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            
            const isQuotaError = error.message?.includes('429') || 
                                 error.message?.includes('quota') ||
                                 error.message?.includes('limit');
            
            const delay = isQuotaError ? 45000 : baseDelay * Math.pow(2, i);
            console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Analyze script
// Analyze script route - add validation
app.post('/api/gemini/analyze', requireAuth, validateScript, sanitizeInput, async (req, res) => {
    const { script, sceneCount, isCastMode } = req.body;
    
    try {
        const ai = getGeminiAI();
        const model = ai.getGenerativeModel({ 
            model: config.get('models.analysis') || 'gemini-2.0-flash-exp'
        });

        const castPrompt = isCastMode ? 
            `Identify which specific character (hero, heroine, father, mother, sister, neighbor, community, dada, or dadi) is the focus of each scene and set the 'assignedCharacter' field accordingly. Also list ALL characters present in the 'presentCharacters' array.` : 
            `The story focuses on a single main character. List 'main character' in 'presentCharacters' if they are in the scene.`;

        const prompt = `
            Analyze and break this script into exactly ${sceneCount} logical scenes.
            
            CRITICAL RULES FOR CONSISTENCY:
            1. LOCATION CONSISTENCY: Track locations carefully. If a scene is in the same place as previous, use EXACT same location name.
            2. CHARACTER CONSISTENCY: Never add or remove characters randomly. Only show characters explicitly mentioned.
            3. TIME CONSISTENCY: Maintain chronological order. Track day/night.
            4. NARRATION: MUST be in HINDI ONLY. Natural conversational Hindi.
            5. VISUAL DESCRIPTION: Be specific about poses, expressions, and actions.
            
            Return JSON with this structure:
            {
                "seoTitle": "string",
                "seoHashtags": "string",
                "seoDescription": "string",
                "mainCharacterDescription": "string",
                "outfitDNA": "string",
                "globalSettingDescription": "string",
                "keyObjectsDescription": "string",
                "storyFlowPlan": "string",
                "thumbnailPrompt": "string",
                "scenes": [
                    {
                        "sceneNumber": number,
                        "narration": "string (Hindi)",
                        "visualDescription": "string",
                        "spatialLayout": "string",
                        "locationName": "string",
                        "presentCharacters": ["string"],
                        "videoGenPrompt": "string",
                        "videoPromptHindi": "string",
                        "continuityNotes": "string",
                        "assignedCharacter": "string"
                    }
                ]
            }
            
            Script: ${script}
        `;

        const result = await withRetry(async () => {
            const response = await model.generateContent(prompt);
            const text = response.response.text();
            return JSON.parse(text.replace(/```json|```/g, '').trim());
        });

        res.json(result);
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Generate image
// Generate image route - add all middleware
app.post('/api/gemini/image', 
    requireAuth, 
    imageGenLimiter,
    checkSubscription, 
    validateImageRequest,
    sanitizeInput,
    incrementCounter, 
    async (req, res) => {
        const { 
            prompt, style, aspectRatio, charDNA, outfitDNA, settingDNA, 
            keyObjectsDNA, spatialLayout, refImage, feedback, continuityNotes,
            prevSceneVisual, locationName, presentCharacters 
        } = req.body;
        
        try {
            const username = req.session.user.username;
            const features = req.userFeatures;
            
            const ai = getGeminiAI();
            const model = ai.getGenerativeModel({ 
                model: config.get('models.image') || 'gemini-2.0-flash-exp-image-generation'
            });

            const styleStr = style === 'REALISTIC' 
                ? "Cinematic film still, photorealistic, 8k, hyper-detailed, dramatic lighting." 
                : "Stylized 3D animated feature film, Disney/Pixar style, soft lighting, expressive faces.";

            const masterPrompt = `
                [PRIMARY IDENTITY LOCK - CRITICAL]
                ${charDNA ? `MAIN CHARACTER DNA (MUST USE EXACTLY): ${charDNA}` : ''}
                ${outfitDNA ? `OUTFIT DNA (MUST USE EXACTLY): ${outfitDNA}` : ''}
                GLOBAL SETTING (MUST MAINTAIN): ${settingDNA}
                PROPS (MUST INCLUDE): ${keyObjectsDNA}

                [SCENE SPECIFICS - MUST FOLLOW EXACTLY]
                LOCATION: ${locationName || 'As described in setting'}
                CHARACTERS PRESENT (ONLY THESE CHARACTERS): ${presentCharacters?.join(', ') || 'Main character'}
                ACTION (MUST SHOW): ${prompt}
                CAMERA ANGLE: ${spatialLayout}
                STYLE: ${styleStr}
                
                [CONTINUITY GUARD - CRITICAL]
                PREVIOUS SCENE: ${prevSceneVisual || 'First scene'}
                CONTINUITY CONTEXT: ${continuityNotes || 'Maintain consistency'}
                ${feedback ? `DIRECTOR FEEDBACK: ${feedback}` : ''}
                
                CRITICAL RULES:
                1. DO NOT change character appearance
                2. DO NOT add extra characters not listed
                3. DO NOT change location unless specified
                4. DO NOT change outfits mid-scene
                5. Maintain exact same environment
            `.trim();

            const parts = [{ text: masterPrompt }];
            
            if (refImage) {
                parts.unshift({
                    inlineData: {
                        mimeType: 'image/png',
                        data: refImage.replace(/^data:image\/\w+;base64,/, '')
                    }
                });
            }

            const result = await withRetry(async () => {
                const response = await model.generateContent({
                    contents: [{ role: 'user', parts }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 8192
                    }
                });

                const imagePart = response.response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
                if (!imagePart?.inlineData) {
                    throw new Error('No image generated');
                }

                return Buffer.from(imagePart.inlineData.data, 'base64');
            });

            // Add watermark for free users
            let finalImage = result;
            if (features.watermark) {
                if (result.length > 1000000) {
                    finalImage = await watermark.addWatermarkPattern(result);
                } else {
                    finalImage = await watermark.addWatermark(result, username);
                }
            }

            const base64Image = finalImage.toString('base64');
            
            res.json({ 
                image: `data:image/png;base64,${base64Image}`,
                features: {
                    remaining: features.remaining,
                    watermark: features.watermark,
                    plan: userManager.getUserPlan(username)
                }
            });
            
        } catch (error) {
            console.error('Image generation error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

// Generate audio
// Generate audio route - add validation
app.post('/api/gemini/audio', 
    requireAuth, 
    checkSubscription, 
    validateAudioRequest,
    sanitizeInput,
    incrementCounter, 
    async (req, res) => {
        const { text, gender } = req.body;
        
        if (!text || gender === 'SILENCE') {
            return res.json({ audio: null });
        }
        
        try {
            const ai = getGeminiAI();
            const model = ai.getGenerativeModel({ 
                model: config.get('models.tts') || 'gemini-2.0-flash-exp'
            });

            const voiceName = gender === 'MALE' ? 'en-IN-Puck' : 'en-IN-Kore';
            const audioPrompt = `Speak in Hindi only: ${text}`;

            const result = await withRetry(async () => {
                const response = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: audioPrompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 8192
                    }
                });

                return response.response.text();
            });

            res.json({ audio: result });
        } catch (error) {
            console.error('Audio generation error:', error);
            res.status(500).json({ error: error.message });
        }
    }
);

// Get subscription plans
app.get('/api/plans', (req, res) => {
    res.json({
        free: {
            scenes: 3,
            dna: 'basic',
            quality: 'standard',
            watermark: true,
            castMode: false
        },
        pro: {
            monthly: {
                price: 99,
                scenes: 'Unlimited',
                dna: 'advanced',
                quality: 'hd',
                watermark: false,
                castMode: true
            },
            yearly: {
                price: 999,
                scenes: 'Unlimited',
                dna: 'advanced',
                quality: 'hd',
                watermark: false,
                castMode: true,
                discount: '16% off'
            }
        }
    });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('=================================');
    console.log(`🚀 StoryBoard Pro Server Running`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`👑 Admin: admin / admin123`);
    console.log(`👤 User: Register or password: 1111`);
    console.log(`💰 Pro Plan: ₹99/month`);
    console.log('=================================');
});