export class MetadataTab {
    constructor({ state, onExportZip, onExportTxt, onPreview, onUpgrade }) {
        this.state = state;
        this.onExportZip = onExportZip;
        this.onExportTxt = onExportTxt;
        this.onPreview = onPreview;
        this.onUpgrade = onUpgrade;
    }

    render() {
        const container = document.createElement('div');
        container.className = 'flex items-center justify-center min-h-[60vh] fade-in';

        const card = document.createElement('div');
        card.className = 'card';
        card.style.maxWidth = '900px';
        card.style.width = '100%';

        const readyCount = this.state.assets.filter(a => a.imageUrl).length;
        const totalCount = this.state.assets.length;

        card.innerHTML = `
            <div class="flex gap-8">
                <div class="w-5/12">
                    <div class="aspect-square bg-darker rounded-2xl overflow-hidden border border-border">
                        ${this.state.thumbnailUrl 
                            ? `<img src="${this.state.thumbnailUrl}" class="w-full h-full object-cover">`
                            : `<div class="w-full h-full flex items-center justify-center text-gray">
                                <span class="text-6xl">🎬</span>
                            </div>`
                        }
                    </div>
                </div>

                <div class="w-7/12 space-y-6">
                    <div>
                        <h3 class="text-3xl font-black uppercase tracking-tighter">${this.state.metadata?.title || 'Story Project'}</h3>
                        <p class="text-gray text-sm mt-2">${this.state.metadata?.description || 'Ready for export'}</p>
                    </div>

                    <div class="space-y-2">
                        <div class="text-xs font-bold text-primary">Hashtags</div>
                        <div class="text-sm">${this.state.metadata?.hashtags || '#storyboard #ai'}</div>
                    </div>

                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(readyCount/totalCount)*100}%"></div>
                    </div>

                    <div class="text-xs text-gray">
                        ${readyCount}/${totalCount} scenes ready
                    </div>

                    ${this.state.user?.plan !== 'pro' && this.state.user?.role !== 'admin' ? `
                        <div class="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                            <p class="text-xs text-warning">
                                <span class="font-bold">Free Version:</span> Watermark will be added
                            </p>
                            <button class="btn btn-primary w-full mt-2 text-xs" id="upgrade-btn">
                                Upgrade to Pro (₹99/month) - Remove Watermark
                            </button>
                        </div>
                    ` : ''}

                    <div class="space-y-3">
                        <button class="btn btn-primary w-full" id="export-zip">
                            <span>📦</span> Export All Files (ZIP)
                        </button>

                        <button class="btn btn-secondary w-full" id="export-txt">
                            <span>📄</span> Export Production Data (TXT)
                        </button>

                        ${readyCount > 0 ? `
                            <button class="btn btn-secondary w-full" id="preview">
                                <span>▶️</span> Preview Production
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        card.querySelector('#export-zip').addEventListener('click', this.onExportZip);
        card.querySelector('#export-txt').addEventListener('click', this.onExportTxt);
        card.querySelector('#preview')?.addEventListener('click', this.onPreview);
        card.querySelector('#upgrade-btn')?.addEventListener('click', this.onUpgrade);

        container.appendChild(card);
        return container;
    }
}