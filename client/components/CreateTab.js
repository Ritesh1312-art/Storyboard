export class CreateTab {
    constructor({ state, onUpdate, onAnalyze, onRefImageChange, onCastImageChange }) {
        this.state = state;
        this.onUpdate = onUpdate;
        this.onAnalyze = onAnalyze;
        this.onRefImageChange = onRefImageChange;
        this.onCastImageChange = onCastImageChange;
    }

    render() {
        const container = document.createElement('div');
        container.className = 'grid grid-2 gap-4 fade-in';

        // Left column
        const leftCol = document.createElement('div');
        leftCol.className = 'space-y-4';

        // Sub tabs
        const subTabs = document.createElement('div');
        subTabs.className = 'flex gap-2 mb-4';
        subTabs.innerHTML = `
            <button class="btn ${this.state.createSubTab === 'SINGLE' ? 'btn-primary' : 'btn-secondary'}" data-subtab="SINGLE">Single Lead</button>
            <button class="btn ${this.state.createSubTab === 'CAST' ? 'btn-primary' : 'btn-secondary'}" data-subtab="CAST">Cast Production</button>
        `;

        subTabs.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.onUpdate({ createSubTab: btn.dataset.subtab });
            });
        });

        leftCol.appendChild(subTabs);

        // Character section
        if (this.state.createSubTab === 'SINGLE') {
            const charSection = document.createElement('div');
            charSection.className = 'grid grid-2 gap-4';
            charSection.innerHTML = `
                <div class="form-group">
                    <label class="form-label">Character Reference</label>
                    <div class="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary transition-all" id="ref-image-upload">
                        ${this.state.refImage 
                            ? `<img src="${this.state.refImage}" class="max-w-full h-32 mx-auto object-contain">`
                            : `<div>
                                <div class="text-3xl mb-2">📷</div>
                                <div class="text-xs font-bold uppercase">Upload Face Reference</div>
                            </div>`
                        }
                    </div>
                    <input type="file" id="ref-image-input" accept="image/*" style="display: none;">
                </div>

                <div class="space-y-4">
                    <div class="form-group">
                        <label class="form-label">Character DNA</label>
                        <textarea class="form-control" id="main-character" placeholder="Age, facial features, hair style, eye color...">${this.state.mainCharacter}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Outfit DNA</label>
                        <textarea class="form-control" id="outfit-dna" placeholder="Clothing type, colors, style...">${this.state.outfitDNA}</textarea>
                    </div>
                </div>
            `;

            charSection.querySelector('#ref-image-upload').addEventListener('click', () => {
                document.getElementById('ref-image-input').click();
            });

            charSection.querySelector('#ref-image-input').addEventListener('change', (e) => {
                if (e.target.files[0]) {
                    this.onRefImageChange(e.target.files[0]);
                }
            });

            charSection.querySelector('#main-character').addEventListener('input', (e) => {
                this.onUpdate({ mainCharacter: e.target.value });
            });

            charSection.querySelector('#outfit-dna').addEventListener('input', (e) => {
                this.onUpdate({ outfitDNA: e.target.value });
            });

            leftCol.appendChild(charSection);
        } else {
            const castSection = document.createElement('div');
            castSection.className = 'grid grid-3 gap-4';
            
            const roles = [
                { id: 'hero', label: 'Hero', icon: '👨' },
                { id: 'heroine', label: 'Heroine', icon: '👩' },
                { id: 'father', label: 'Father', icon: '👨' },
                { id: 'mother', label: 'Mother', icon: '👩' },
                { id: 'sister', label: 'Sister', icon: '👧' },
                { id: 'dada', label: 'Dada', icon: '👴' },
                { id: 'dadi', label: 'Dadi', icon: '👵' },
                { id: 'neighbor', label: 'Neighbor', icon: '🧔' },
                { id: 'community', label: 'Community', icon: '👥' }
            ];

            castSection.innerHTML = roles.map(role => `
                <div class="form-group">
                    <label class="form-label">${role.label}</label>
                    <div class="border-2 border-dashed border-border rounded-xl p-2 text-center cursor-pointer hover:border-primary transition-all aspect-square flex flex-col items-center justify-center" id="cast-${role.id}">
                        ${this.state.castImages[role.id] 
                            ? `<img src="${this.state.castImages[role.id]}" class="w-full h-full object-cover rounded-lg">`
                            : `<div>
                                <div class="text-2xl mb-1">${role.icon}</div>
                                <div class="text-[8px] font-bold uppercase">Upload</div>
                            </div>`
                        }
                    </div>
                    <input type="file" id="cast-input-${role.id}" accept="image/*" style="display: none;">
                </div>
            `).join('');

            roles.forEach(role => {
                castSection.querySelector(`#cast-${role.id}`).addEventListener('click', () => {
                    document.getElementById(`cast-input-${role.id}`).click();
                });

                castSection.querySelector(`#cast-input-${role.id}`).addEventListener('change', (e) => {
                    if (e.target.files[0]) {
                        this.onCastImageChange(role.id, e.target.files[0]);
                    }
                });
            });

            leftCol.appendChild(castSection);
        }

        // Environment and Objects
        const envSection = document.createElement('div');
        envSection.className = 'grid grid-2 gap-4 mt-4';
        envSection.innerHTML = `
            <div class="form-group">
                <label class="form-label">Environment DNA</label>
                <textarea class="form-control" id="global-setting" placeholder="World setting, atmosphere, time of day...">${this.state.globalSetting}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Object DNA</label>
                <textarea class="form-control" id="key-objects" placeholder="Essential props, items...">${this.state.keyObjects}</textarea>
            </div>
        `;

        envSection.querySelector('#global-setting').addEventListener('input', (e) => {
            this.onUpdate({ globalSetting: e.target.value });
        });

        envSection.querySelector('#key-objects').addEventListener('input', (e) => {
            this.onUpdate({ keyObjects: e.target.value });
        });

        leftCol.appendChild(envSection);

        // Script
        const scriptSection = document.createElement('div');
        scriptSection.className = 'form-group mt-4';
        scriptSection.innerHTML = `
            <label class="form-label">Story Script</label>
            <textarea class="form-control" id="script" placeholder="Paste your story here..." style="min-height: 200px;">${this.state.script}</textarea>
        `;

        scriptSection.querySelector('#script').addEventListener('input', (e) => {
            this.onUpdate({ script: e.target.value });
        });

        leftCol.appendChild(scriptSection);

        // Analyze button
        const analyzeBtn = document.createElement('button');
        analyzeBtn.className = 'btn btn-primary w-full mt-4';
        analyzeBtn.innerHTML = '<span>⚡</span> START PRODUCTION PIPELINE';
        analyzeBtn.addEventListener('click', this.onAnalyze);
        leftCol.appendChild(analyzeBtn);

        // Right column - Settings
        const rightCol = document.createElement('div');
        rightCol.className = 'space-y-4';

        rightCol.innerHTML = `
            <div class="card">
                <h3 class="text-xs font-black uppercase tracking-wider text-gray mb-4">Global Configuration</h3>
                
                <div class="form-group">
                    <label class="form-label">Art Style</label>
                    <div class="grid grid-2 gap-2">
                        <button class="btn ${this.state.style === 'REALISTIC' ? 'btn-primary' : 'btn-secondary'}" data-style="REALISTIC">3D Cinema</button>
                        <button class="btn ${this.state.style === 'ANIMATED_3D' ? 'btn-primary' : 'btn-secondary'}" data-style="ANIMATED_3D">Pixar Style</button>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Aspect Ratio</label>
                    <div class="grid grid-2 gap-2">
                        <button class="btn ${this.state.aspectRatio === '16:9' ? 'btn-primary' : 'btn-secondary'}" data-ratio="16:9">16:9 Wide</button>
                        <button class="btn ${this.state.aspectRatio === '9:16' ? 'btn-primary' : 'btn-secondary'}" data-ratio="9:16">9:16 Reels</button>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Voice</label>
                    <div class="grid grid-3 gap-2">
                        <button class="btn ${this.state.voiceGender === 'MALE' ? 'btn-primary' : 'btn-secondary'}" data-voice="MALE">Male</button>
                        <button class="btn ${this.state.voiceGender === 'FEMALE' ? 'btn-primary' : 'btn-secondary'}" data-voice="FEMALE">Female</button>
                        <button class="btn ${this.state.voiceGender === 'SILENCE' ? 'btn-primary' : 'btn-secondary'}" data-voice="SILENCE">🔇</button>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Scene Count</label>
                    <select class="form-control" id="scene-count">
                        ${[10, 15, 20, 25, 30, 40, 50, 60].map(n => 
                            `<option value="${n}" ${this.state.sceneCount === n ? 'selected' : ''}>${n} Scenes</option>`
                        ).join('')}
                    </select>
                </div>

                ${this.state.user?.role !== 'admin' && this.state.user?.plan !== 'pro' ? `
                    <div class="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                        <p class="text-xs text-warning">
                            <span class="font-bold">Free Plan:</span> 3 scenes only
                        </p>
                    </div>
                ` : this.state.user?.role === 'admin' ? `
                    <div class="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
                        <p class="text-xs text-success">
                            <span class="font-bold">Admin Plan:</span> Unlimited scenes, no watermark
                        </p>
                    </div>
                ` : this.state.user?.plan === 'pro' ? `
                    <div class="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
                        <p class="text-xs text-success">
                            <span class="font-bold">Pro Plan:</span> Unlimited scenes, no watermark
                        </p>
                    </div>
                ` : ''}
            </div>
        `;

        // Event listeners for right column
        rightCol.querySelectorAll('[data-style]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.onUpdate({ style: btn.dataset.style });
            });
        });

        rightCol.querySelectorAll('[data-ratio]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.onUpdate({ aspectRatio: btn.dataset.ratio });
            });
        });

        rightCol.querySelectorAll('[data-voice]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.onUpdate({ voiceGender: btn.dataset.voice });
            });
        });

        rightCol.querySelector('#scene-count').addEventListener('change', (e) => {
            this.onUpdate({ sceneCount: parseInt(e.target.value) });
        });

        container.appendChild(leftCol);
        container.appendChild(rightCol);

        return container;
    }
}