export class ProductionTab {
    constructor({ state, onUpdateScene, onRegenerateImage }) {
        this.state = state;
        this.onUpdateScene = onUpdateScene;
        this.onRegenerateImage = onRegenerateImage;
    }

    render() {
        const container = document.createElement('div');
        container.className = 'space-y-4 fade-in';

        // Header
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center mb-4';
        header.innerHTML = `
            <h2 class="text-2xl font-black text-white flex items-center gap-2">
                <span>🎬</span> Production Pipeline
            </h2>
            <div class="text-sm font-bold text-primary">
                Progress: ${this.state.assets.filter(a => a.imageUrl).length}/${this.state.assets.length}
            </div>
        `;

        container.appendChild(header);

        // Scenes
        this.state.assets.forEach((asset, index) => {
            const sceneCard = this.createSceneCard(asset, index);
            container.appendChild(sceneCard);
        });

        return container;
    }

    createSceneCard(asset, index) {
        const card = document.createElement('div');
        card.className = 'scene-card';
        card.dataset.id = asset.id;

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
                    SCENE ${asset.sceneNumber}
                </div>

                ${asset.isGeneratingImage ? `
                    <div class="absolute inset-0 bg-darker flex flex-col items-center justify-center">
                        <div class="spinner mb-2"></div>
                        <div class="text-xs font-bold text-primary">Generating ${asset.imageProgress}%</div>
                    </div>
                ` : asset.imageUrl ? `
                    <img src="${asset.imageUrl}" alt="Scene ${asset.sceneNumber}">
                ` : `
                    <div class="absolute inset-0 flex items-center justify-center text-gray">
                        <span>🖼️ No Image</span>
                    </div>
                `}

                ${this.state.createSubTab === 'CAST' && asset.assignedCharacter && asset.assignedCharacter !== 'none' ? `
                    <div class="absolute top-1 right-1 bg-primary/20 border border-primary/30 rounded-full px-3 py-1 text-[9px] font-black uppercase flex items-center gap-1">
                        <span>${getCastIcon(asset.assignedCharacter)}</span>
                        <span>${asset.assignedCharacter}</span>
                    </div>
                ` : ''}
            </div>

            <div class="scene-content">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <span class="text-xs font-black text-gray uppercase tracking-wider">Scene ${asset.sceneNumber}</span>
                        <div class="text-sm text-gray mt-1">${asset.locationName || 'Unknown Location'}</div>
                    </div>
                    ${asset.imageUrl ? `
                        <button class="btn btn-secondary text-xs" data-regenerate="${asset.id}">
                            <span>🔄</span> Regenerate
                        </button>
                    ` : ''}
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="form-label">Narration</label>
                        <div class="text-lg italic">"${asset.narration || 'No narration'}"</div>
                    </div>

                    <div>
                        <label class="form-label">Visual Description</label>
                        <div class="text-xs text-gray bg-darker p-3 rounded-lg">${asset.visualDescription || 'No description'}</div>
                    </div>

                    ${asset.imageUrl ? `
                        <div class="form-group">
                            <label class="form-label">Feedback for Regeneration</label>
                            <textarea class="form-control" id="feedback-${asset.id}" placeholder="e.g., Zoom in, change expression, add rain..." style="min-height: 60px;">${asset.userFeedback || ''}</textarea>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        card.querySelector('[data-regenerate]')?.addEventListener('click', () => {
            const feedback = document.getElementById(`feedback-${asset.id}`)?.value;
            this.onRegenerateImage(asset.id, feedback);
        });

        return card;
    }
}