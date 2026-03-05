// client/components/ResetPassword.js
export class ResetPassword {
    constructor({ user, onClose, onSuccess }) {
        this.user = user;
        this.onClose = onClose;
        this.onSuccess = onSuccess;
        this.step = 'current'; // current, new, confirm
        this.loading = false;
        this.message = null;
        this.passwordData = {
            current: '',
            new: '',
            confirm: ''
        };
    }

    render() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[1000] flex items-center justify-center p-4';
        modal.style.background = 'rgba(0, 0, 0, 0.8)';
        modal.style.backdropFilter = 'blur(8px)';

        modal.innerHTML = `
            <div class="glass" style="max-width: 400px; width: 100%;">
                <div class="p-6 border-b border-border flex justify-between items-center">
                    <h2 class="text-xl font-black uppercase tracking-wider">
                        ${this.getTitle()}
                    </h2>
                    <button class="text-gray hover:text-white p-2" id="close-modal">✕</button>
                </div>

                <div class="p-6">
                    ${this.message ? `
                        <div class="mb-4 p-3 ${this.message.type === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'} rounded-lg">
                            ${this.message.text}
                        </div>
                    ` : ''}

                    ${this.renderStep()}

                    <div class="mt-4 flex justify-between text-xs">
                        ${this.step !== 'current' ? `
                            <button class="text-primary" id="back-step">← Back</button>
                        ` : '<div></div>'}
                        
                        <div class="text-gray">
                            Step ${this.getStepNumber()}/3
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.querySelector('#close-modal').addEventListener('click', this.onClose);
        
        if (this.step !== 'current') {
            modal.querySelector('#back-step')?.addEventListener('click', () => {
                this.goBack();
            });
        }

        this.addStepListeners(modal);

        return modal;
    }

    getTitle() {
        switch(this.step) {
            case 'current': return 'Verify Current Password';
            case 'new': return 'Set New Password';
            case 'confirm': return 'Confirm New Password';
            default: return 'Change Password';
        }
    }

    getStepNumber() {
        switch(this.step) {
            case 'current': return '1';
            case 'new': return '2';
            case 'confirm': return '3';
            default: return '1';
        }
    }

    renderStep() {
        switch(this.step) {
            case 'current':
                return `
                    <div class="space-y-4">
                        <div class="text-center mb-4">
                            <div class="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-2xl">
                                🔐
                            </div>
                            <p class="text-sm text-gray mt-2">Enter your current password to continue</p>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Current Password</label>
                            <div class="relative">
                                <input type="password" class="form-control" id="current-password" placeholder="••••••••">
                                <button type="button" class="absolute right-3 top-3 text-gray hover:text-white" id="toggle-current">
                                    👁️
                                </button>
                            </div>
                        </div>

                        <button class="btn btn-primary w-full" id="verify-current" ${this.loading ? 'disabled' : ''}>
                            ${this.loading ? 'Verifying...' : 'Verify & Continue'}
                        </button>

                        <p class="text-xs text-gray text-center">
                            <button class="text-primary" id="forgot-password">Forgot password?</button>
                        </p>
                    </div>
                `;

            case 'new':
                return `
                    <div class="space-y-4">
                        <div class="bg-warning/10 border border-warning/20 rounded-lg p-3 text-xs">
                            <p class="text-warning font-bold mb-1">Password Requirements:</p>
                            <ul class="text-gray list-disc pl-4">
                                <li>Minimum 8 characters</li>
                                <li>At least 1 uppercase letter</li>
                                <li>At least 1 number</li>
                                <li>At least 1 special character (!@#$%^&*)</li>
                            </ul>
                        </div>

                        <div class="form-group">
                            <label class="form-label">New Password</label>
                            <div class="relative">
                                <input type="password" class="form-control" id="new-password" placeholder="••••••••">
                                <button type="button" class="absolute right-3 top-3 text-gray hover:text-white" id="toggle-new">
                                    👁️
                                </button>
                            </div>
                            <div class="password-strength mt-2" id="password-strength"></div>
                        </div>

                        <button class="btn btn-primary w-full" id="continue-new" ${this.loading ? 'disabled' : ''}>
                            ${this.loading ? 'Checking...' : 'Continue'}
                        </button>
                    </div>
                `;

            case 'confirm':
                return `
                    <div class="space-y-4">
                        <div class="form-group">
                            <label class="form-label">Confirm New Password</label>
                            <div class="relative">
                                <input type="password" class="form-control" id="confirm-password" placeholder="••••••••">
                                <button type="button" class="absolute right-3 top-3 text-gray hover:text-white" id="toggle-confirm">
                                    👁️
                                </button>
                            </div>
                        </div>

                        <div class="flex gap-2">
                            <button class="btn btn-secondary flex-1" id="back-to-new">Back</button>
                            <button class="btn btn-primary flex-1" id="save-password" ${this.loading ? 'disabled' : ''}>
                                ${this.loading ? 'Saving...' : 'Save New Password'}
                            </button>
                        </div>
                    </div>
                `;

            default:
                return '';
        }
    }

    addStepListeners(modal) {
        // Toggle password visibility
        modal.querySelector('#toggle-current')?.addEventListener('click', (e) => {
            const input = document.getElementById('current-password');
            input.type = input.type === 'password' ? 'text' : 'password';
            e.target.textContent = input.type === 'password' ? '👁️' : '👁️‍🗨️';
        });

        modal.querySelector('#toggle-new')?.addEventListener('click', (e) => {
            const input = document.getElementById('new-password');
            input.type = input.type === 'password' ? 'text' : 'password';
            e.target.textContent = input.type === 'password' ? '👁️' : '👁️‍🗨️';
        });

        modal.querySelector('#toggle-confirm')?.addEventListener('click', (e) => {
            const input = document.getElementById('confirm-password');
            input.type = input.type === 'password' ? 'text' : 'password';
            e.target.textContent = input.type === 'password' ? '👁️' : '👁️‍🗨️';
        });

        // Password strength checker
        const newPasswordInput = modal.querySelector('#new-password');
        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', (e) => {
                this.checkPasswordStrength(e.target.value);
            });
        }

        // Step-specific buttons
        if (this.step === 'current') {
            modal.querySelector('#verify-current')?.addEventListener('click', () => {
                this.verifyCurrentPassword();
            });

            modal.querySelector('#forgot-password')?.addEventListener('click', () => {
                this.onClose();
                // Trigger forgot password flow
                import('./ForgotPassword.js').then(module => {
                    const forgot = new module.ForgotPassword({
                        onClose: () => {},
                        onSuccess: () => window.location.reload()
                    });
                    document.body.appendChild(forgot.render());
                });
            });
        }

        if (this.step === 'new') {
            modal.querySelector('#continue-new')?.addEventListener('click', () => {
                this.validateNewPassword();
            });
        }

        if (this.step === 'confirm') {
            modal.querySelector('#back-to-new')?.addEventListener('click', () => {
                this.step = 'new';
                this.render();
            });

            modal.querySelector('#save-password')?.addEventListener('click', () => {
                this.saveNewPassword();
            });
        }
    }

    goBack() {
        switch(this.step) {
            case 'new':
                this.step = 'current';
                break;
            case 'confirm':
                this.step = 'new';
                break;
        }
        this.message = null;
        this.render();
    }

    checkPasswordStrength(password) {
        const strengthBar = document.getElementById('password-strength');
        if (!strengthBar) return;

        let strength = 0;
        const checks = {
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*]/.test(password)
        };

        strength = Object.values(checks).filter(Boolean).length;

        const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const strengthColor = ['#ef4444', '#f59e0b', '#f59e0b', '#10b981', '#10b981'];
        
        strengthBar.innerHTML = `
            <div class="flex gap-1 h-1 mt-1">
                ${[1,2,3,4,5].map(i => `
                    <div class="flex-1 h-full rounded ${i <= strength ? 'bg-current' : 'bg-gray-600'}" 
                         style="background-color: ${i <= strength ? strengthColor[strength-1] : '#4b5563'}">
                    </div>
                `).join('')}
            </div>
            <p class="text-xs mt-1" style="color: ${strengthColor[strength-1] || '#9ca3af'}">
                ${strengthText[strength-1] || 'Enter password'}
            </p>
        `;
    }

    async verifyCurrentPassword() {
        const currentPass = document.getElementById('current-password')?.value;
        
        if (!currentPass) {
            this.message = { type: 'error', text: 'Please enter current password' };
            this.render();
            return;
        }

        this.loading = true;
        this.message = null;
        this.render();

        try {
            // Verify current password
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.user.username,
                    password: currentPass
                })
            });

            const data = await res.json();

            if (data.success) {
                this.passwordData.current = currentPass;
                this.step = 'new';
                this.message = null;
            } else {
                this.message = { type: 'error', text: 'Current password is incorrect' };
            }
        } catch (error) {
            this.message = { type: 'error', text: 'Verification failed' };
        }

        this.loading = false;
        this.render();
    }

    validateNewPassword() {
        const newPass = document.getElementById('new-password')?.value;
        
        if (!newPass) {
            this.message = { type: 'error', text: 'Please enter new password' };
            this.render();
            return;
        }

        // Check password strength
        const checks = {
            length: newPass.length >= 8,
            upper: /[A-Z]/.test(newPass),
            number: /[0-9]/.test(newPass),
            special: /[!@#$%^&*]/.test(newPass)
        };

        if (!checks.length) {
            this.message = { type: 'error', text: 'Password must be at least 8 characters' };
            this.render();
            return;
        }

        if (!checks.upper) {
            this.message = { type: 'error', text: 'Password must contain at least 1 uppercase letter' };
            this.render();
            return;
        }

        if (!checks.number) {
            this.message = { type: 'error', text: 'Password must contain at least 1 number' };
            this.render();
            return;
        }

        if (!checks.special) {
            this.message = { type: 'error', text: 'Password must contain at least 1 special character (!@#$%^&*)' };
            this.render();
            return;
        }

        this.passwordData.new = newPass;
        this.step = 'confirm';
        this.message = null;
        this.render();
    }

    async saveNewPassword() {
        const confirmPass = document.getElementById('confirm-password')?.value;
        
        if (!confirmPass) {
            this.message = { type: 'error', text: 'Please confirm your new password' };
            this.render();
            return;
        }

        if (this.passwordData.new !== confirmPass) {
            this.message = { type: 'error', text: 'Passwords do not match' };
            this.render();
            return;
        }

        this.loading = true;
        this.message = null;
        this.render();

        try {
            // Call admin reset password endpoint
            const res = await fetch('/api/admin/user/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.user.username,
                    newPassword: this.passwordData.new
                })
            });

            const data = await res.json();

            if (data.success) {
                this.message = { type: 'success', text: 'Password changed successfully!' };
                setTimeout(() => {
                    this.onClose();
                    this.onSuccess?.();
                }, 2000);
            } else {
                this.message = { type: 'error', text: data.error || 'Failed to change password' };
            }
        } catch (error) {
            this.message = { type: 'error', text: 'Password change failed' };
        }

        this.loading = false;
        this.render();
    }
}