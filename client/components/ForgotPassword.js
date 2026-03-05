// client/components/ForgotPassword.js
export class ForgotPassword {
    constructor({ onClose, onSuccess }) {
        this.onClose = onClose;
        this.onSuccess = onSuccess;
        this.step = 'choose'; // choose, verify, reset
        this.identifier = null;
        this.type = null; // mobile or email
        this.loading = false;
        this.message = null;
    }

    render() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[1000] flex items-center justify-center p-4';
        modal.style.background = 'rgba(0, 0, 0, 0.8)';
        modal.style.backdropFilter = 'blur(8px)';

        modal.innerHTML = `
            <div class="glass" style="max-width: 400px; width: 100%;">
                <div class="p-6 border-b border-border flex justify-between items-center">
                    <h2 class="text-xl font-black uppercase tracking-wider">Reset Password</h2>
                    <button class="text-gray hover:text-white p-2" id="close-modal">✕</button>
                </div>

                <div class="p-6">
                    ${this.message ? `
                        <div class="mb-4 p-3 ${this.message.type === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'} rounded-lg">
                            ${this.message.text}
                        </div>
                    ` : ''}

                    ${this.renderStep()}
                </div>
            </div>
        `;

        modal.querySelector('#close-modal').addEventListener('click', this.onClose);

        // Add event listeners based on step
        this.addStepListeners(modal);

        return modal;
    }

    renderStep() {
        switch(this.step) {
            case 'choose':
                return `
                    <div class="space-y-4">
                        <p class="text-sm text-gray">Choose how to reset your password:</p>
                        
                        <button class="btn btn-secondary w-full" id="reset-mobile">
                            📱 Via Mobile Number (SMS OTP)
                        </button>
                        
                        <button class="btn btn-secondary w-full" id="reset-email">
                            📧 Via Email Address
                        </button>
                        
                        <button class="btn btn-secondary w-full" id="reset-security">
                            🔐 Via Security Questions
                        </button>
                        
                        <p class="text-xs text-gray text-center mt-4">
                            OTP will be sent to your registered mobile/email
                        </p>
                    </div>
                `;
                
            case 'verify':
                return `
                    <div class="space-y-4">
                        <p class="text-sm">We've sent an OTP to:</p>
                        <p class="text-lg font-bold text-primary">${this.identifier}</p>
                        
                        <div class="form-group">
                            <label class="form-label">Enter OTP</label>
                            <input type="text" class="form-control text-center text-2xl tracking-widest" id="otp" maxlength="6" placeholder="------">
                        </div>
                        
                        <button class="btn btn-primary w-full" id="verify-otp" ${this.loading ? 'disabled' : ''}>
                            ${this.loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        
                        <div class="flex justify-between text-xs">
                            <button class="text-primary" id="resend-otp">Resend OTP</button>
                            <button class="text-gray" id="back-choose">Back</button>
                        </div>
                    </div>
                `;
                
            case 'reset':
                return `
                    <div class="space-y-4">
                        <p class="text-sm text-success">✓ OTP Verified</p>
                        
                        <div class="form-group">
                            <label class="form-label">New Password</label>
                            <input type="password" class="form-control" id="new-password">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Confirm Password</label>
                            <input type="password" class="form-control" id="confirm-password">
                        </div>
                        
                        <button class="btn btn-primary w-full" id="reset-password" ${this.loading ? 'disabled' : ''}>
                            ${this.loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>
                `;
                
            default:
                return '';
        }
    }

    addStepListeners(modal) {
        if (this.step === 'choose') {
            modal.querySelector('#reset-mobile')?.addEventListener('click', () => {
                this.requestOTP('mobile');
            });
            
            modal.querySelector('#reset-email')?.addEventListener('click', () => {
                this.requestOTP('email');
            });
            
            modal.querySelector('#reset-security')?.addEventListener('click', () => {
                // Show security questions flow
                alert('Security questions feature coming soon');
            });
        }
        
        if (this.step === 'verify') {
            modal.querySelector('#verify-otp')?.addEventListener('click', () => {
                this.verifyOTP();
            });
            
            modal.querySelector('#resend-otp')?.addEventListener('click', () => {
                this.requestOTP(this.type);
            });
            
            modal.querySelector('#back-choose')?.addEventListener('click', () => {
                this.step = 'choose';
                this.render();
            });
        }
        
        if (this.step === 'reset') {
            modal.querySelector('#reset-password')?.addEventListener('click', () => {
                this.resetPassword();
            });
        }
    }

    async requestOTP(type) {
        this.type = type;
        this.loading = true;
        this.message = null;
        this.render();
        
        // In real app, show input dialog for mobile/email
        const identifier = prompt(`Enter your ${type === 'mobile' ? '10 digit mobile number' : 'email address'}:`);
        if (!identifier) {
            this.loading = false;
            this.render();
            return;
        }
        
        this.identifier = identifier;
        
        try {
            const endpoint = type === 'mobile' ? '/api/forgot-password/mobile' : '/api/forgot-password/email';
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(type === 'mobile' ? { mobile: identifier } : { email: identifier })
            });
            
            const data = await res.json();
            
            if (data.success) {
                this.step = 'verify';
                this.message = { type: 'success', text: 'OTP sent successfully!' };
            } else {
                this.message = { type: 'error', text: data.error || 'Failed to send OTP' };
            }
        } catch (error) {
            this.message = { type: 'error', text: 'Network error. Please try again.' };
        }
        
        this.loading = false;
        this.render();
    }

    async verifyOTP() {
        const otp = document.getElementById('otp')?.value;
        if (!otp || otp.length !== 6) {
            this.message = { type: 'error', text: 'Please enter 6-digit OTP' };
            this.render();
            return;
        }
        
        this.loading = true;
        this.message = null;
        this.render();
        
        try {
            const res = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: this.identifier,
                    otp,
                    type: this.type
                })
            });
            
            const data = await res.json();
            
            if (data.success) {
                this.step = 'reset';
                this.message = { type: 'success', text: 'OTP verified! Set new password.' };
            } else {
                this.message = { type: 'error', text: data.error || 'Invalid OTP' };
            }
        } catch (error) {
            this.message = { type: 'error', text: 'Verification failed' };
        }
        
        this.loading = false;
        this.render();
    }

    async resetPassword() {
        const newPass = document.getElementById('new-password')?.value;
        const confirmPass = document.getElementById('confirm-password')?.value;
        
        if (!newPass || newPass.length < 6) {
            this.message = { type: 'error', text: 'Password must be at least 6 characters' };
            this.render();
            return;
        }
        
        if (newPass !== confirmPass) {
            this.message = { type: 'error', text: 'Passwords do not match' };
            this.render();
            return;
        }
        
        this.loading = true;
        this.message = null;
        this.render();
        
        try {
            const res = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: this.identifier,
                    otp: 'verified', // Already verified
                    newPassword: newPass,
                    type: this.type
                })
            });
            
            const data = await res.json();
            
            if (data.success) {
                alert('Password reset successfully! Please login with new password.');
                this.onClose();
                this.onSuccess?.();
            } else {
                this.message = { type: 'error', text: data.error || 'Failed to reset password' };
            }
        } catch (error) {
            this.message = { type: 'error', text: 'Password reset failed' };
        }
        
        this.loading = false;
        this.render();
    }
}