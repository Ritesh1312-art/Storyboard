// client/components/Profile.js
export class Profile {
    constructor({ user, onClose, onUpdate }) {
        this.user = user;
        this.onClose = onClose;
        this.onUpdate = onUpdate;
        this.loading = false;
        this.message = null;
    }

    async loadUserData() {
        try {
            const res = await fetch('/api/profile');
            const data = await res.json();
            return data;
        } catch (error) {
            console.error('Failed to load profile:', error);
            return null;
        }
    }

    async saveProfile(formData) {
        this.loading = true;
        this.render();
        
        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await res.json();
            
            if (data.success) {
                this.message = { type: 'success', text: 'Profile updated successfully' };
                this.onUpdate();
            } else {
                this.message = { type: 'error', text: data.error || 'Update failed' };
            }
        } catch (error) {
            this.message = { type: 'error', text: 'Failed to update profile' };
        }
        
        this.loading = false;
        this.render();
    }

    render() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[1000] flex items-center justify-center p-4';
        modal.style.background = 'rgba(0, 0, 0, 0.8)';
        modal.style.backdropFilter = 'blur(8px)';

        const userData = this.user;

        modal.innerHTML = `
            <div class="glass" style="max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto;">
                <div class="flex justify-between items-center p-6 border-b border-border">
                    <h2 class="text-xl font-black uppercase tracking-wider">Your Profile</h2>
                    <button class="text-gray hover:text-white p-2" id="close-profile">✕</button>
                </div>

                <div class="p-6">
                    ${this.message ? `
                        <div class="mb-4 p-3 ${this.message.type === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'} rounded-lg">
                            ${this.message.text}
                        </div>
                    ` : ''}

                    <form id="profile-form" class="space-y-6">
                        <div class="form-group">
                            <label class="form-label">Username</label>
                            <input type="text" class="form-control" value="${userData.username}" readonly disabled>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Full Name</label>
                            <input type="text" class="form-control" id="full-name" value="${userData.fullName || ''}" placeholder="Enter your full name">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Email Address</label>
                            <input type="email" class="form-control" id="email" value="${userData.email || ''}" placeholder="Only Gmail, Outlook, etc.">
                            <p class="text-xs text-gray mt-1">Temporary emails not allowed</p>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Mobile Number</label>
                            <input type="tel" class="form-control" id="mobile" value="${userData.mobile || ''}" placeholder="10 digit mobile number">
                            <p class="text-xs text-gray mt-1">Indian mobile number (starts with 6-9)</p>
                        </div>

                        <div class="border-t border-border pt-4">
                            <h3 class="text-sm font-bold mb-4">Security Questions (Optional)</h3>
                            <p class="text-xs text-gray mb-4">Set these to recover your account if you forget password</p>
                            
                            <div id="security-questions">
                                ${this.renderSecurityQuestions(userData.securityQuestions)}
                            </div>
                            
                            <button type="button" class="btn btn-secondary text-xs mt-2" id="add-question">
                                + Add Another Question
                            </button>
                        </div>

                        <div class="flex gap-2 pt-4">
                            <button type="submit" class="btn btn-primary flex-1" ${this.loading ? 'disabled' : ''}>
                                ${this.loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button type="button" class="btn btn-secondary" id="cancel-profile">Cancel</button>
                        </div>
                    </form>

                    <div class="mt-6 pt-4 border-t border-border">
                        <h3 class="text-sm font-bold mb-2">Account Security</h3>
                        <div class="grid grid-2 gap-2">
                            <button class="btn btn-secondary text-xs" id="change-password">
                                🔐 Change Password
                            </button>
                            <button class="btn btn-secondary text-xs" id="two-factor">
                                📱 Setup 2FA (Coming Soon)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.querySelector('#close-profile').addEventListener('click', this.onClose);
        modal.querySelector('#cancel-profile').addEventListener('click', this.onClose);
        
        modal.querySelector('#change-password').addEventListener('click', () => {
            // Show change password modal
            import('./ChangePassword.js').then(module => {
                const changePassword = new module.ChangePassword({ 
                    user: this.user,
                    onClose: () => modal.remove()
                });
                modal.appendChild(changePassword.render());
            });
        });

        const form = modal.querySelector('#profile-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                fullName: document.getElementById('full-name').value,
                email: document.getElementById('email').value,
                mobile: document.getElementById('mobile').value,
                securityQuestions: this.getSecurityAnswers()
            };
            
            this.saveProfile(formData);
        });

        modal.querySelector('#add-question').addEventListener('click', () => {
            this.addQuestionRow();
        });

        return modal;
    }

    renderSecurityQuestions(questions = []) {
        if (!questions || questions.length === 0) {
            return this.getQuestionRow(0);
        }
        
        return questions.map((q, index) => this.getQuestionRow(index, q.question, q.answer)).join('');
    }

    getQuestionRow(index, question = '', answer = '') {
        const questions = [
            "What was your childhood nickname?",
            "What is the name of your first pet?",
            "What was your first car?",
            "What elementary school did you attend?",
            "What is the name of the town where you were born?",
            "What is your mother's maiden name?",
            "What was your favorite food as a child?",
            "Who was your childhood hero?",
            "What is your favorite book?",
            "What is your favorite movie?",
            "What was the name of your first teacher?",
            "What is the name of your best friend?"
        ];

        return `
            <div class="question-row mb-4 p-3 bg-darker rounded-lg" data-index="${index}">
                <select class="form-control mb-2" id="question-${index}">
                    <option value="">Select a question</option>
                    ${questions.map(q => `<option value="${q}" ${q === question ? 'selected' : ''}>${q}</option>`).join('')}
                </select>
                <input type="text" class="form-control" id="answer-${index}" value="${answer}" placeholder="Your answer">
                <button type="button" class="text-danger text-xs mt-1 remove-question">Remove</button>
            </div>
        `;
    }

    addQuestionRow() {
        const container = document.getElementById('security-questions');
        const index = container.children.length;
        const div = document.createElement('div');
        div.innerHTML = this.getQuestionRow(index);
        container.appendChild(div.firstChild);
        
        div.querySelector('.remove-question').addEventListener('click', (e) => {
            e.target.closest('.question-row').remove();
        });
    }

    getSecurityAnswers() {
        const rows = document.querySelectorAll('.question-row');
        const answers = [];
        
        rows.forEach(row => {
            const index = row.dataset.index;
            const question = document.getElementById(`question-${index}`)?.value;
            const answer = document.getElementById(`answer-${index}`)?.value;
            
            if (question && answer) {
                answers.push({ question, answer });
            }
        });
        
        return answers;
    }
}