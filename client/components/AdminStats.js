export class AdminStats {
    constructor({ user }) {
        this.user = user;
    }

    render() {
        const container = document.createElement('div');
        container.className = 'glass p-6 mb-4';

        container.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-2xl">
                    👑
                </div>
                <div class="flex-1">
                    <div class="text-sm font-black text-primary uppercase tracking-wider">Admin Mode</div>
                    <div class="text-2xl font-black">${this.user.username}</div>
                </div>
                <div class="text-right">
                    <div class="text-xs text-gray">Your Status</div>
                    <div class="text-lg font-black text-success">UNLIMITED</div>
                    <div class="text-xs text-gray">No restrictions • No watermark • HD quality</div>
                </div>
            </div>

            <div class="grid grid-4 gap-4 mt-4 pt-4 border-t border-border">
                <div class="text-center">
                    <div class="text-2xl font-black text-primary">∞</div>
                    <div class="text-xs text-gray">Scenes</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-black text-success">HD</div>
                    <div class="text-xs text-gray">Quality</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-black text-indigo-400">✓</div>
                    <div class="text-xs text-gray">No Watermark</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-black text-purple-400">👥</div>
                    <div class="text-xs text-gray">Cast Mode</div>
                </div>
            </div>
        `;

        return container;
    }
}