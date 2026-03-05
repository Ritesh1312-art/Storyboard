import { Auth } from './components/Auth.js';
import { CreateTab } from './components/CreateTab.js';
import { PlanningTab } from './components/PlanningTab.js';
import { ProductionTab } from './components/ProductionTab.js';
import { MetadataTab } from './components/MetadataTab.js';
import { Settings } from './components/Settings.js';
import { UpgradeModal } from './components/UpgradeModal.js';
import { AdminStats } from './components/AdminStats.js';
import { WatermarkPreview } from './components/WatermarkPreview.js';
import { AdminPanel } from './components/AdminPanel.js'; // ✅ ADD THIS
import { Profile } from './components/Profile.js'; // ✅ ADD THIS
import { ForgotPassword } from './components/ForgotPassword.js'; // ✅ ADD THIS

class App {
    constructor() {
        this.state = {
            authenticated: false,
            user: null,
            activeTab: 'CREATE',
            createSubTab: 'SINGLE',
            script: '',
            refImage: null,
            castImages: {
                hero: null, heroine: null, father: null, mother: null,
                sister: null, dada: null, dadi: null, neighbor: null, community: null
            },
            mainCharacter: '',
            outfitDNA: '',
            globalSetting: '',
            keyObjects: '',
            style: 'REALISTIC',
            aspectRatio: '16:9',
            voiceGender: 'MALE',
            sceneCount: 10,
            assets: [],
            storyFlowPlan: '',
            thumbnailUrl: null,
            metadata: null,
            loading: false,
            error: null,
            showSettings: false,
            showPreview: false,
            showUpgrade: false,
            showProfile: false // ✅ ADD THIS
        };

        this.container = document.getElementById('app');
        this.init();
    }

    async init() {
        this.createStars();
        await this.checkAuth();
        this.render();
        this.addEventListeners();
    }

    createStars() {
        const stars = document.createElement('div');
        stars.className = 'stars';
        stars.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:-1;';
        
        for (let i = 0; i < 200; i++) {
            const star = document.createElement('div');
            star.style.cssText = `
                position: absolute;
                width: ${Math.random() * 2 + 1}px;
                height: ${Math.random() * 2 + 1}px;
                background: white;
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: ${Math.random() * 0.5 + 0.1};
                animation: twinkle ${Math.random() * 3 + 2}s infinite;
            `;
            stars.appendChild(star);
        }
        
        document.body.appendChild(stars);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes twinkle {
                0%, 100% { opacity: 0.1; transform: scale(0.5); }
                50% { opacity: 1; transform: scale(1.2); }
            }
        `;
        document.head.appendChild(style);
    }

    async checkAuth() {
        try {
            const res = await fetch('/api/auth/status');
            const data = await res.json();
            
            this.state.authenticated = data.authenticated;
            this.state.user = data.user;
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    }

    async login(username, password) {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const data = await res.json();
            
            if (data.success) {
                this.state.authenticated = true;
                this.state.user = data.user;
                this.render();
                this.showToast('Login successful!', 'success');
            } else {
                this.showToast(data.error || 'Login failed', 'error');
            }
            
            return data;
        } catch (error) {
            console.error('Login error:', error);
            this.showToast('Login failed', 'error');
        }
    }

    async register(username, password, email) {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, email })
            });
            
            const data = await res.json();
            
            if (data.success) {
                this.state.authenticated = true;
                this.state.user = data.user;
                this.render();
                this.showToast('Registration successful!', 'success');
            } else {
                this.showToast(data.error || 'Registration failed', 'error');
            }
            
            return data;
        } catch (error) {
            console.error('Registration error:', error);
            this.showToast('Registration failed', 'error');
        }
    }

    async logout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            this.state.authenticated = false;
            this.state.user = null;
            this.render();
            this.showToast('Logged out successfully', 'success');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    setLoading(loading, message = 'Processing...') {
        this.state.loading = loading;
        
        if (loading) {
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.id = 'loading-overlay';
            
            const spinner = document.createElement('div');
            spinner.className = 'spinner';
            
            const msg = document.createElement('div');
            msg.className = 'mt-2 text-sm font-bold uppercase tracking-widest text-primary';
            msg.textContent = message;
            
            overlay.appendChild(spinner);
            overlay.appendChild(msg);
            document.body.appendChild(overlay);
        } else {
            const overlay = document.getElementById('loading-overlay');
            if (overlay) overlay.remove();
        }
    }

    setError(error) {
        this.state.error = error;
        if (error) {
            this.showToast(error, 'error');
        }
        this.render();
    }

    showUpgradeModal() {
        const modal = new UpgradeModal({
            onClose: () => {
                document.getElementById('upgrade-modal')?.remove();
                this.state.showUpgrade = false;
            },
            onSuccess: () => {
                this.state.user.plan = 'pro';
                this.render();
            }
        });
        
        const modalEl = modal.render();
        modalEl.id = 'upgrade-modal';
        document.body.appendChild(modalEl);
        this.state.showUpgrade = true;
    }

    async analyzeScript() {
        if (!this.state.script.trim()) {
            this.showToast('Please enter a script', 'warning');
            return;
        }

        if (this.state.user?.plan !== 'pro' && this.state.user?.role !== 'admin' && this.state.assets.length >= 3) {
            this.showUpgradeModal();
            return;
        }

        this.setLoading(true, 'Analyzing script...');

        try {
            const res = await fetch('/api/gemini/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    script: this.state.script,
                    sceneCount: this.state.sceneCount,
                    isCastMode: this.state.createSubTab === 'CAST'
                })
            });

            const data = await res.json();

            if (data.error) {
                throw new Error(data.error);
            }

            this.state.metadata = {
                title: data.seoTitle,
                hashtags: data.seoHashtags,
                description: data.seoDescription,
                thumbnailPrompt: data.thumbnailPrompt
            };

            this.state.mainCharacter = data.mainCharacterDescription;
            this.state.outfitDNA = data.outfitDNA || '';
            this.state.globalSetting = data.globalSettingDescription;
            this.state.keyObjects = data.keyObjectsDescription;
            this.state.storyFlowPlan = data.storyFlowPlan || '';
            
            this.state.assets = data.scenes.map((s, i) => ({
                id: `scene-${i}-${Date.now()}`,
                ...s,
                isGeneratingImage: false,
                isGeneratingAudio: false,
                isGeneratingVideo: false,
                imageProgress: 0,
                audioProgress: 0
            }));

            this.state.activeTab = 'PLANNING';
            this.render();
            this.showToast('Analysis complete!', 'success');
        } catch (error) {
            console.error('Analysis error:', error);
            this.setError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    async startProduction() {
        this.state.activeTab = 'PRODUCTION';
        this.render();

        if (this.state.metadata?.thumbnailPrompt) {
            this.setLoading(true, 'Creating thumbnail...');
            try {
                const res = await fetch('/api/gemini/image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: this.state.metadata.thumbnailPrompt,
                        style: this.state.style,
                        aspectRatio: this.state.aspectRatio,
                        charDNA: this.state.mainCharacter,
                        outfitDNA: this.state.outfitDNA,
                        settingDNA: this.state.globalSetting,
                        keyObjectsDNA: this.state.keyObjects,
                        spatialLayout: 'Wide Shot'
                    })
                });

                const data = await res.json();
                if (data.image) {
                    this.state.thumbnailUrl = data.image;
                    this.render();
                }
            } catch (error) {
                console.error('Thumbnail error:', error);
            } finally {
                this.setLoading(false);
            }
        }

        for (let i = 0; i < this.state.assets.length; i++) {
            const asset = this.state.assets[i];
            
            this.setLoading(true, `Generating scene ${i + 1}/${this.state.assets.length}...`);
            
            try {
                let activeRef = this.state.refImage;
                if (this.state.createSubTab === 'CAST' && asset.assignedCharacter && asset.assignedCharacter !== 'none') {
                    activeRef = this.state.castImages[asset.assignedCharacter];
                }

                const imgRes = await fetch('/api/gemini/image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: asset.visualDescription,
                        style: this.state.style,
                        aspectRatio: this.state.aspectRatio,
                        charDNA: this.state.createSubTab === 'SINGLE' ? this.state.mainCharacter : '',
                        outfitDNA: this.state.createSubTab === 'SINGLE' ? this.state.outfitDNA : '',
                        settingDNA: this.state.globalSetting,
                        keyObjectsDNA: this.state.keyObjects,
                        spatialLayout: asset.spatialLayout,
                        refImage: activeRef,
                        continuityNotes: asset.continuityNotes,
                        prevSceneVisual: i > 0 ? this.state.assets[i-1].visualDescription : undefined,
                        locationName: asset.locationName,
                        presentCharacters: asset.presentCharacters
                    })
                });

                const imgData = await imgRes.json();
                
                if (imgData.image) {
                    asset.imageUrl = imgData.image;
                    
                    if (imgData.features?.watermark) {
                        this.showToast('Free version: Watermark added', 'warning');
                    }
                }

                if (this.state.voiceGender !== 'SILENCE' && asset.narration) {
                    const audioRes = await fetch('/api/gemini/audio', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            text: asset.narration,
                            gender: this.state.voiceGender
                        })
                    });

                    const audioData = await audioRes.json();
                    if (audioData.audio) {
                        asset.audioData = audioData.audio;
                    }
                }

                this.render();
                await new Promise(r => setTimeout(r, 2000));
                
            } catch (error) {
                console.error(`Scene ${i + 1} error:`, error);
                this.showToast(`Scene ${i + 1} failed: ${error.message}`, 'error');
            }
        }

        this.setLoading(false);
        this.showToast('Production complete!', 'success');
    }

    addEventListeners() {
        window.addEventListener('click', (e) => {
            if (this.state.showSettings && !e.target.closest('.settings-modal')) {
                this.state.showSettings = false;
                this.render();
            }
            if (this.state.showProfile && !e.target.closest('.profile-modal')) {
                this.state.showProfile = false;
                this.render();
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.state.showSettings) {
                    this.state.showSettings = false;
                    this.render();
                }
                if (this.state.showPreview) {
                    this.state.showPreview = false;
                    this.render();
                }
                if (this.state.showProfile) {
                    this.state.showProfile = false;
                    this.render();
                }
                if (this.state.showUpgrade) {
                    document.getElementById('upgrade-modal')?.remove();
                    this.state.showUpgrade = false;
                }
            }
        });
    }

    render() {
        if (!this.state.authenticated) {
            this.container.innerHTML = '';
            const auth = new Auth({
                onLogin: (username, password) => this.login(username, password),
                onRegister: (username, password, email) => this.register(username, password, email)
            });
            this.container.appendChild(auth.render());
            return;
        }

        const main = document.createElement('div');
        main.className = 'main-app';

        // Header
        const header = document.createElement('header');
        header.className = 'header';
        
        // Create tabs array based on user role
        const tabs = ['CREATE', 'PLANNING', 'PRODUCTION', 'METADATA'];
        if (this.state.user?.role === 'admin') {
            tabs.push('ADMIN');
        }

        header.innerHTML = `
            <div class="logo" style="cursor: pointer;" id="logo-btn">
                <div class="logo-icon">🎬</div>
                <div class="logo-text">StoryBoard Pro</div>
            </div>
            <div class="flex items-center gap-2">
                <div class="tabs">
                    ${tabs.map(tab => `
                        <button class="tab ${this.state.activeTab === tab ? 'active' : ''}" data-tab="${tab}">${tab}</button>
                    `).join('')}
                </div>
                <button class="btn btn-secondary" id="profile-btn" title="Profile">
                    <span>👤</span>
                </button>
                <button class="btn btn-secondary" id="logout-btn" title="Logout">
                    <span>🚪</span>
                </button>
                <div class="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                    <span>${this.state.user?.username || 'User'}</span>
                    ${this.state.user?.role === 'admin' ? '<span class="text-warning">👑</span>' : ''}
                    ${this.state.user?.plan === 'pro' ? '<span class="text-success">⭐</span>' : ''}
                </div>
            </div>
        `;

        main.appendChild(header);

        // Logo click to home
        header.querySelector('#logo-btn').addEventListener('click', () => {
            this.state.activeTab = 'CREATE';
            this.render();
        });

        // Admin stats (show at top for admin)
        if (this.state.user?.role === 'admin' && this.state.activeTab !== 'ADMIN') {
            const adminStats = new AdminStats({ user: this.state.user });
            main.appendChild(adminStats.render());
        }

        // Watermark warning for free users
        if (this.state.user?.plan !== 'pro' && this.state.user?.role !== 'admin' && this.state.assets.length > 0) {
            const watermarkPreview = new WatermarkPreview({ onUpgrade: () => this.showUpgradeModal() });
            main.appendChild(watermarkPreview.render());
        }

        // Tab content
        const content = document.createElement('div');
        content.className = 'container';

        switch (this.state.activeTab) {
            case 'CREATE':
                const createTab = new CreateTab({
                    state: this.state,
                    onUpdate: (updates) => {
                        Object.assign(this.state, updates);
                        this.render();
                    },
                    onAnalyze: () => this.analyzeScript(),
                    onRefImageChange: (file) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            this.state.refImage = reader.result;
                            this.render();
                        };
                        reader.readAsDataURL(file);
                    },
                    onCastImageChange: (role, file) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            this.state.castImages[role] = reader.result;
                            this.render();
                        };
                        reader.readAsDataURL(file);
                    }
                });
                content.appendChild(createTab.render());
                break;

            case 'PLANNING':
                const planningTab = new PlanningTab({
                    state: this.state,
                    onUpdateScene: (id, updates) => {
                        const asset = this.state.assets.find(a => a.id === id);
                        if (asset) {
                            Object.assign(asset, updates);
                            this.render();
                        }
                    },
                    onAddScene: () => {
                        const nextNumber = this.state.assets.length > 0 
                            ? Math.max(...this.state.assets.map(a => a.sceneNumber)) + 1 
                            : 1;
                        
                        this.state.assets.push({
                            id: `manual-${Date.now()}`,
                            sceneNumber: nextNumber,
                            narration: '',
                            visualDescription: '',
                            spatialLayout: 'Medium Shot',
                            locationName: 'Unknown',
                            presentCharacters: [],
                            videoGenPrompt: '',
                            videoPromptHindi: '',
                            continuityNotes: 'Sequence from last shot',
                            assignedCharacter: 'none',
                            isGeneratingImage: false,
                            isGeneratingAudio: false,
                            isGeneratingVideo: false,
                            imageProgress: 0,
                            audioProgress: 0
                        });
                        this.render();
                    },
                    onRemoveScene: (id) => {
                        this.state.assets = this.state.assets.filter(a => a.id !== id);
                        this.render();
                    },
                    onStartProduction: () => this.startProduction()
                });
                content.appendChild(planningTab.render());
                break;

            case 'PRODUCTION':
                const productionTab = new ProductionTab({
                    state: this.state,
                    onUpdateScene: (id, updates) => {
                        const asset = this.state.assets.find(a => a.id === id);
                        if (asset) {
                            Object.assign(asset, updates);
                            this.render();
                        }
                    },
                    onRegenerateImage: async (id, feedback) => {
                        const asset = this.state.assets.find(a => a.id === id);
                        if (!asset) return;

                        this.setLoading(true, 'Regenerating image...');

                        try {
                            const activeRef = this.state.createSubTab === 'CAST' && asset.assignedCharacter && asset.assignedCharacter !== 'none'
                                ? this.state.castImages[asset.assignedCharacter]
                                : this.state.refImage;

                            const res = await fetch('/api/gemini/image', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    prompt: asset.visualDescription,
                                    style: this.state.style,
                                    aspectRatio: this.state.aspectRatio,
                                    charDNA: this.state.createSubTab === 'SINGLE' ? this.state.mainCharacter : '',
                                    outfitDNA: this.state.createSubTab === 'SINGLE' ? this.state.outfitDNA : '',
                                    settingDNA: this.state.globalSetting,
                                    keyObjectsDNA: this.state.keyObjects,
                                    spatialLayout: asset.spatialLayout,
                                    refImage: activeRef,
                                    feedback,
                                    continuityNotes: asset.continuityNotes,
                                    locationName: asset.locationName,
                                    presentCharacters: asset.presentCharacters
                                })
                            });

                            const data = await res.json();
                            if (data.image) {
                                asset.imageUrl = data.image;
                                asset.userFeedback = feedback;
                                this.render();
                                this.showToast('Image regenerated!', 'success');
                            }
                        } catch (error) {
                            console.error('Regeneration error:', error);
                            this.setError(error.message);
                        } finally {
                            this.setLoading(false);
                        }
                    }
                });
                content.appendChild(productionTab.render());
                break;

            case 'METADATA':
                const metadataTab = new MetadataTab({
                    state: this.state,
                    onExportZip: () => this.exportZip(),
                    onExportTxt: () => this.exportTxt(),
                    onPreview: () => {
                        this.state.showPreview = true;
                        this.render();
                    },
                    onUpgrade: () => this.showUpgradeModal()
                });
                content.appendChild(metadataTab.render());
                break;

            case 'ADMIN':
                // Import dynamically to avoid circular dependency
                import('./components/AdminPanel.js').then(module => {
                    const AdminPanel = module.AdminPanel;
                    const adminPanel = new AdminPanel({
                        user: this.state.user,
                        onClose: () => {
                            this.state.activeTab = 'CREATE';
                            this.render();
                        }
                    });
                    content.innerHTML = '';
                    content.appendChild(adminPanel.render());
                });
                break;
        }

        main.appendChild(content);

        // Profile modal
        if (this.state.showProfile) {
            import('./components/Profile.js').then(module => {
                const Profile = module.Profile;
                const profile = new Profile({
                    user: this.state.user,
                    onClose: () => {
                        this.state.showProfile = false;
                        this.render();
                    },
                    onUpdate: () => {
                        this.checkAuth();
                    }
                });
                profile.render().then(modal => {
                    main.appendChild(modal);
                });
            });
        }

        // Preview modal
        if (this.state.showPreview) {
            const preview = this.createPreview();
            main.appendChild(preview);
        }

        this.container.innerHTML = '';
        this.container.appendChild(main);

        // Event listeners
        document.querySelectorAll('.tab').forEach(btn => {
            btn.addEventListener('click', () => {
                this.state.activeTab = btn.dataset.tab;
                this.render();
            });
        });

        document.getElementById('profile-btn')?.addEventListener('click', () => {
            this.state.showProfile = true;
            this.render();
        });

        document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
    }

    createPreview() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4';
        modal.style.animation = 'fadeIn 0.3s ease-out';

        const assets = this.state.assets.filter(a => a.imageUrl);
        let currentIndex = 0;

        const renderPreview = () => {
            const asset = assets[currentIndex];
            
            modal.innerHTML = `
                <div class="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                    <div class="flex items-center gap-3">
                        <div class="p-2 bg-primary rounded-lg">
                            <span class="text-white text-xs">🎬</span>
                        </div>
                        <span class="text-xs font-black uppercase tracking-widest text-gray">Scene ${currentIndex + 1}/${assets.length}</span>
                    </div>
                    <button class="text-gray hover:text-white p-3 bg-white/5 rounded-full border border-border transition-all" id="close-preview">
                        ✕
                    </button>
                </div>

                <div class="w-full max-w-5xl aspect-video relative rounded-2xl overflow-hidden shadow-2xl bg-darker border border-border">
                    <img src="${asset.imageUrl}" class="w-full h-full object-cover" style="animation: slowZoom 7s linear infinite;">
                    
                    <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-12">
                        <div class="space-y-4 max-w-3xl">
                            <span class="px-4 py-1.5 rounded-full bg-primary text-xs font-black uppercase tracking-widest">
                                ${asset.assignedCharacter && asset.assignedCharacter !== 'none' ? asset.assignedCharacter : 'Main Character'}
                            </span>
                            <p class="text-2xl font-bold text-white drop-shadow-2xl">
                                "${asset.narration}"
                            </p>
                        </div>
                    </div>
                </div>

                <div class="mt-10 flex items-center gap-8">
                    <button class="text-gray hover:text-primary transition-all disabled:opacity-20" id="prev-scene" ${currentIndex === 0 ? 'disabled' : ''}>
                        <span style="font-size: 2rem;">⏮️</span>
                    </button>
                    
                    <button class="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-all shadow-2xl" id="play-pause">
                        <span style="font-size: 2rem;">⏸️</span>
                    </button>
                    
                    <button class="text-gray hover:text-primary transition-all disabled:opacity-20" id="next-scene" ${currentIndex === assets.length - 1 ? 'disabled' : ''}>
                        <span style="font-size: 2rem;">⏭️</span>
                    </button>
                </div>

                <style>
                    @keyframes slowZoom {
                        0% { transform: scale(1); }
                        100% { transform: scale(1.1); }
                    }
                </style>
            `;

            modal.querySelector('#close-preview').addEventListener('click', () => {
                this.state.showPreview = false;
                this.render();
            });

            modal.querySelector('#prev-scene')?.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    renderPreview();
                }
            });

            modal.querySelector('#next-scene')?.addEventListener('click', () => {
                if (currentIndex < assets.length - 1) {
                    currentIndex++;
                    renderPreview();
                }
            });
        };

        renderPreview();
        return modal;
    }

    async exportZip() {
        this.setLoading(true, 'Creating ZIP...');
        
        try {
            const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js')).default;
            const zip = new JSZip();

            if (this.state.thumbnailUrl) {
                zip.file("thumbnail.png", this.state.thumbnailUrl.split(',')[1], { base64: true });
            }

            let text = `StoryBoard Production Data\n`;
            text += `Title: ${this.state.metadata?.title || 'Untitled'}\n`;
            text += `Hashtags: ${this.state.metadata?.hashtags || ''}\n\n`;
            text += `Description: ${this.state.metadata?.description || ''}\n\n`;
            text += `================================\n\n`;

            this.state.assets.forEach((a, i) => {
                text += `Scene ${i + 1}\n`;
                text += `Narration: ${a.narration}\n`;
                text += `Location: ${a.locationName}\n`;
                text += `Characters: ${a.presentCharacters?.join(', ') || 'None'}\n`;
                text += `Visual: ${a.visualDescription}\n`;
                text += `Video Prompt: ${a.videoPromptHindi || a.videoGenPrompt}\n`;
                text += `--------------------------------\n\n`;

                if (a.imageUrl) {
                    zip.folder("images").file(`scene_${i + 1}.png`, a.imageUrl.split(',')[1], { base64: true });
                }
            });

            zip.file("production_data.txt", text);

            const blob = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.state.metadata?.title || 'storyboard'}_export.zip`;
            a.click();
            URL.revokeObjectURL(url);

            this.showToast('ZIP exported successfully!', 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.setError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    exportTxt() {
        let text = `StoryBoard Production Data\n`;
        text += `Title: ${this.state.metadata?.title || 'Untitled'}\n`;
        text += `Hashtags: ${this.state.metadata?.hashtags || ''}\n\n`;
        text += `Description: ${this.state.metadata?.description || ''}\n\n`;
        text += `================================\n\n`;

        this.state.assets.forEach((a, i) => {
            text += `Scene ${i + 1}\n`;
            text += `Narration: ${a.narration}\n`;
            text += `Location: ${a.locationName}\n`;
            text += `Characters: ${a.presentCharacters?.join(', ') || 'None'}\n`;
            text += `Visual: ${a.visualDescription}\n`;
            text += `Video Prompt: ${a.videoPromptHindi || a.videoGenPrompt}\n`;
            text += `--------------------------------\n\n`;
        });

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.state.metadata?.title || 'storyboard'}_data.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Text exported successfully!', 'success');
    }
}

// Initialize app
new App();