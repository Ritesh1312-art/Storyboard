export class PlanningTab {
    constructor({ state, onUpdateScene, onAddScene, onRemoveScene, onStartProduction }) {
        this.state = state;
        this.onUpdateScene = onUpdateScene;
        this.onAddScene = onAddScene;
        this.onRemoveScene = onRemoveScene;
        this.onStartProduction = onStartProduction;
    }

    render() {
        const container = document.createElement('div');
        container.className = 'space-y-4 fade-in';

        const dnaCard = document.createElement('div');
        dnaCard.className = 'card';
        dnaCard.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xs font-black uppercase tracking-wider text-primary">Master Visual Lock</h3>
                <div>
                    <span class="text-[9px] text-gray font-bold mr-2">${this.state.createSubTab === 'CAST' ? 'Reference Images Active' : 'Text DNA Active'}</span>
                    ${this.state.user?.role === 'admin' ? `
                        <span class="text-[9px] bg-success/20 text-success px-2 py-1 rounded-full font-bold">ADMIN</span>
                    ` : this.state.user?.plan === 'pro' ? `
                        <span class="text-[9px] bg-success/20 text-success px-2 py-1 rounded-full font-bold">PRO</span>
                    ` : `
                        <span class="text-[9px] bg-warning/20 text-warning px-2 py-1 rounded-full font-bold">FREE (3/3)</span>
                    `}
                </div>
            </div>

            <!-- Rest of your DNA card content -->
            <div class="grid grid-4 gap-4">
                ${this.state.createSubTab === 'SINGLE' ? `
                    <div>
                        <label class="text-[9px] font-black text-primary uppercase block mb-2">Character</label>
                        <textarea class="form-control text-xs" id="main-character" style="min-height: 80px;">${this.state.mainCharacter}</textarea>
                    </div>
                    <div>
                        <label class="text-[9px] font-black text-primary uppercase block mb-2">Outfit</label>
                        <textarea class="form-control text-xs" id="outfit-dna" style="min-height: 80px;">${this.state.outfitDNA}</textarea>
                    </div>
                ` : ''}
                <div>
                    <label class="text-[9px] font-black text-success uppercase block mb-2">Environment</label>
                    <textarea class="form-control text-xs" id="global-setting" style="min-height: 80px;">${this.state.globalSetting}</textarea>
                </div>
                <div>
                    <label class="text-[9px] font-black text-success uppercase block mb-2">Objects</label>
                    <textarea class="form-control text-xs" id="key-objects" style="min-height: 80px;">${this.state.keyObjects}</textarea>
                </div>
            </div>

            <div class="mt-4">
                <label class="text-[9px] font-black text-warning uppercase block mb-2">Story Flow Plan</label>
                <textarea class="form-control text-xs" id="story-flow" style="min-height: 60px;">${this.state.storyFlowPlan}</textarea>
            </div>
        `;

        dnaCard.querySelector('#main-character')?.addEventListener('input', (e) => {
            this.state.mainCharacter = e.target.value;
        });

        dnaCard.querySelector('#outfit-dna')?.addEventListener('input', (e) => {
            this.state.outfitDNA = e.target.value;
        });

        dnaCard.querySelector('#global-setting').addEventListener('input', (e) => {
            this.state.globalSetting = e.target.value;
        });

        dnaCard.querySelector('#key-objects').addEventListener('input', (e) => {
            this.state.keyObjects = e.target.value;
        });

        dnaCard.querySelector('#story-flow').addEventListener('input', (e) => {
            this.state.storyFlowPlan = e.target.value;
        });

        container.appendChild(dnaCard);

        // Header
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center';
        header.innerHTML = `
            <h2 class="text-2xl font-black text-white flex items-center gap-2">
                <span>✨</span> Storyboard Planning
            </h2>
            <button class="btn btn-primary" id="start-production">
                <span>✅</span> Finalize & Start Production
            </button>
        `;

        header.querySelector('#start-production').addEventListener('click', () => {
            if (this.state.assets.length > 0) {
                this.onStartProduction();
            }
        });

        container.appendChild(header);

        // Scenes
        const scenesContainer = document.createElement('div');
        scenesContainer.className = 'space-y-4';

        this.state.assets.forEach(scene => {
            const sceneCard = this.createSceneCard(scene);
            scenesContainer.appendChild(sceneCard);
        });

        // Add scene button
        const addBtn = document.createElement('button');
        addBtn.className = 'btn btn-secondary w-full py-8 border-2 border-dashed';
        addBtn.innerHTML = '<span>➕</span> ADD SCENE MANUALLY';
        addBtn.addEventListener('click', this.onAddScene);

        scenesContainer.appendChild(addBtn);
        container.appendChild(scenesContainer);

        return container;
    }

    createSceneCard(scene) {
        const card = document.createElement('div');
        card.className = 'scene-card';
        card.dataset.id = scene.id;

        const getCastIcon = (role) => {
            const icons = {
                hero: '👨', heroine: '👩', father: '👨', mother: '👩',
                sister: '👧', dada: '👴', dadi: '👵', neighbor: '🧔', community: '👥'
            };
            return icons[role] || '👤';
        };

        card.innerHTML = `
            <div class="scene-media relative">
                <div class="scene-number">
                    SCENE ${scene.sceneNumber}
                </div>
                ${this.state.createSubTab === 'CAST' && scene.assignedCharacter && scene.assignedCharacter !== 'none' ? `
                    <div class="absolute top-1 right-1 bg-primary/20 border border-primary/30 rounded-full px-3 py-1 text-[9px] font-black uppercase flex items-center gap-1">
                        <span>${getCastIcon(scene.assignedCharacter)}</span>
                        <span>${scene.assignedCharacter}</span>
                    </div>
                ` : ''}
            </div>

            <div class="scene-content">
                <div class="flex justify-between items-start mb-4">
                    <div class="text-xs font-black text-gray uppercase tracking-wider">Scene Details</div>
                    <button class="text-danger hover:text-danger/80" data-remove="${scene.id}">
                        <span>🗑️</span>
                    </button>
                </div>

                <div class="grid grid-2 gap-4">
                    <div class="form-group">
                        <label class="form-label">Hindi Narration</label>
                        <textarea class="form-control text-sm" data-field="narration" data-id="${scene.id}" style="min-height: 100px;">${scene.narration || ''}</textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Visual Description</label>
                        <textarea class="form-control text-sm" data-field="visualDescription" data-id="${scene.id}" style="min-height: 100px;">${scene.visualDescription || ''}</textarea>
                    </div>
                </div>

                <div class="grid grid-2 gap-4 mt-2">
                    <div class="form-group">
                        <label class="form-label">Location</label>
                        <input type="text" class="form-control" data-field="locationName" data-id="${scene.id}" value="${scene.locationName || ''}">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Characters Present</label>
                        <input type="text" class="form-control" data-field="presentCharacters" data-id="${scene.id}" value="${(scene.presentCharacters || []).join(', ')}" placeholder="hero, mother, etc">
                    </div>
                </div>

                <div class="form-group mt-2">
                    <label class="form-label">Continuity Notes</label>
                    <input type="text" class="form-control" data-field="continuityNotes" data-id="${scene.id}" value="${scene.continuityNotes || ''}">
                </div>
            </div>
        `;

        card.querySelectorAll('[data-field]').forEach(input => {
            input.addEventListener('input', (e) => {
                const field = e.target.dataset.field;
                let value = e.target.value;
                
                if (field === 'presentCharacters') {
                    value = value.split(',').map(s => s.trim()).filter(Boolean);
                }
                
                this.onUpdateScene(scene.id, { [field]: value });
            });
        });

        card.querySelector('[data-remove]')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this scene?')) {
                this.onRemoveScene(scene.id);
            }
        });

        return card;
    }
}