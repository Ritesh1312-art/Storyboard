export class WatermarkPreview {
    constructor({ onUpgrade }) {
        this.onUpgrade = onUpgrade;
    }

    render() {
        const div = document.createElement('div');
        div.className = 'bg-warning/10 border border-warning/20 rounded-xl p-4 mb-4 flex items-center gap-3';
        
        div.innerHTML = `
            <div class="text-warning text-2xl">ℹ️</div>
            <div class="flex-1">
                <div class="text-sm font-bold text-warning">Free Plan Active</div>
                <div class="text-xs text-gray">Your exports will have a subtle StoryBoard watermark</div>
            </div>
            <button class="btn btn-primary text-xs" id="upgrade-now">
                Upgrade to Remove
            </button>
        `;

        div.querySelector('#upgrade-now').addEventListener('click', this.onUpgrade);

        return div;
    }
}