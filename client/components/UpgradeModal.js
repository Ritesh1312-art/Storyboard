export class UpgradeModal {
    constructor({ onClose, onSuccess }) {
        this.onClose = onClose;
        this.onSuccess = onSuccess;
    }

    render() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[1000] flex items-center justify-center p-4';
        modal.style.background = 'rgba(0, 0, 0, 0.9)';
        modal.style.backdropFilter = 'blur(8px)';

        modal.innerHTML = `
            <div class="glass" style="max-width: 900px; width: 100%; max-height: 80vh; overflow-y: auto;">
                <div class="p-6 border-b border-border flex justify-between items-center">
                    <h2 class="text-2xl font-black uppercase tracking-wider">🚀 Upgrade to Pro</h2>
                    <button class="text-gray hover:text-white text-2xl" id="close-modal">&times;</button>
                </div>

                <div class="p-6">
                    <div class="grid grid-2 gap-6 mb-8">
                        <div class="bg-darker p-6 rounded-xl border border-border">
                            <h3 class="text-lg font-black mb-4">FREE</h3>
                            <ul class="space-y-3">
                                <li class="flex items-center gap-2">
                                    <span class="text-success">✅</span>
                                    <span>3 scenes free</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-success">✅</span>
                                    <span>Basic DNA system</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-warning">⚠️</span>
                                    <span>Standard quality images</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-warning">⚠️</span>
                                    <span>Watermarked exports</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-danger">❌</span>
                                    <span>No Cast mode</span>
                                </li>
                            </ul>
                        </div>

                        <div class="bg-primary/10 p-6 rounded-xl border-2 border-primary relative">
                            <div class="absolute -top-3 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-black">
                                POPULAR
                            </div>
                            <h3 class="text-lg font-black mb-4 text-primary">PRO</h3>
                            <ul class="space-y-3">
                                <li class="flex items-center gap-2">
                                    <span class="text-success">✅</span>
                                    <span><span class="font-bold">Unlimited scenes</span></span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-success">✅</span>
                                    <span>Advanced DNA + Cast mode</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-success">✅</span>
                                    <span>HD/4K quality images</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-success">✅</span>
                                    <span>No watermark</span>
                                </li>
                                <li class="flex items-center gap-2">
                                    <span class="text-success">✅</span>
                                    <span>Priority generation</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="grid grid-2 gap-6 mb-8">
                        <div class="text-center p-6 bg-darker rounded-xl">
                            <div class="text-4xl font-black">₹99</div>
                            <div class="text-gray text-sm">per month</div>
                            <button class="btn btn-primary w-full mt-4" data-plan="monthly">
                                Choose Monthly
                            </button>
                        </div>
                        <div class="text-center p-6 bg-darker rounded-xl border-2 border-primary">
                            <div class="text-4xl font-black">₹999</div>
                            <div class="text-gray text-sm">per year (save 16%)</div>
                            <button class="btn btn-primary w-full mt-4" data-plan="yearly">
                                Choose Yearly
                            </button>
                        </div>
                    </div>

                    <div class="text-center space-y-4">
                        <div class="text-sm text-gray">Payment Methods</div>
                        <div class="flex justify-center gap-4">
                            <span class="px-4 py-2 bg-white/5 rounded-lg">📱 UPI</span>
                            <span class="px-4 py-2 bg-white/5 rounded-lg">💳 Card</span>
                            <span class="px-4 py-2 bg-white/5 rounded-lg">🏦 NetBanking</span>
                        </div>
                        <p class="text-xs text-gray mt-4">
                            🔒 Secure payment via Razorpay<br>
                            Instant activation after payment
                        </p>
                    </div>
                </div>
            </div>
        `;

        modal.querySelector('#close-modal').addEventListener('click', this.onClose);
        
        modal.querySelector('[data-plan="monthly"]').addEventListener('click', () => {
            this.initiatePayment('monthly');
        });
        
        modal.querySelector('[data-plan="yearly"]').addEventListener('click', () => {
            this.initiatePayment('yearly');
        });

        return modal;
    }

    async initiatePayment(plan) {
        try {
            const res = await fetch('/api/payments/create-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan })
            });
            
            const data = await res.json();
            
            const paymentDiv = document.createElement('div');
            paymentDiv.className = 'fixed inset-0 z-[1001] flex items-center justify-center p-4';
            paymentDiv.style.background = 'rgba(0,0,0,0.95)';
            
            paymentDiv.innerHTML = `
                <div class="glass p-8 max-w-md">
                    <h3 class="text-xl font-black mb-4">Complete Payment</h3>
                    
                    <div class="space-y-4">
                        <a href="${data.link}" target="_blank" class="btn btn-primary w-full">
                            Pay Online (Card/UPI/NetBanking)
                        </a>
                        
                        <div class="text-center text-gray">OR</div>
                        
                        <div class="text-center">
                            <p class="mb-2">Scan QR code with any UPI app</p>
                            <div class="w-48 h-48 mx-auto bg-white p-2 rounded-lg flex items-center justify-center text-black">
                                [QR Code Placeholder]
                            </div>
                            <p class="text-sm mt-2">UPI ID: <strong>${data.upi.upiId}</strong></p>
                        </div>
                        
                        <div class="text-xs text-gray space-y-1">
                            ${data.instructions.map(i => `<div>• ${i}</div>`).join('')}
                        </div>
                    </div>
                    
                    <button class="btn btn-secondary w-full mt-4" id="close-payment">Close</button>
                </div>
            `;
            
            paymentDiv.querySelector('#close-payment').addEventListener('click', () => {
                paymentDiv.remove();
            });
            
            document.body.appendChild(paymentDiv);
            
        } catch (error) {
            alert('Payment initiation failed. Please try again.');
        }
    }
}