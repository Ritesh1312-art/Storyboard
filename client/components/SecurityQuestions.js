// client/components/SecurityQuestions.js
export class SecurityQuestions {
    constructor({ user, onClose, onSuccess, mode = 'setup' }) {
        this.user = user;
        this.onClose = onClose;
        this.onSuccess = onSuccess;
        this.mode = mode; // 'setup', 'verify', 'recover'
        this.loading = false;
        this.message = null;
        this.questions = [];
        this.selectedQuestions = [];
        this.answers = {};
    }

    async loadQuestions() {
        try {
            const res = await fetch('/api/security-questions/list');
            const data = await res.json();
            this.questions = data;
            return data;
        } catch (error) {
            console.error('Failed to load questions:', error);
            return [];
        }
    }

    async loadUserQuestions() {
        try {
            const res = await fetch('/api/security-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: this.user.username })
            });
            const data = await res.json();
            return data.questions || [];
        } catch (error) {
            console.error('Failed to load user questions:', error);
            return [];
        }
    }

    async render() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[1000] flex items-center justify-center p-4';
        modal.style.background = 'rgba(0, 0, 0, 0.8)';
        modal.style.backdropFilter = 'blur(8px)';

        // Load questions based on mode
        if (this.mode === 'setup') {
            await this.loadQuestions();
        } else if (this.mode === 'verify' || this.mode === 'recover') {
            const userQuestions = await this.loadUserQuestions();
            this.selectedQuestions = userQuestions;
        }

        modal.innerHTML = `
            <div class="glass" style="max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto;">
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

                    ${this.renderContent()}

                    <div class="mt-6 flex gap-2">
                        ${this.mode !== 'setup' ? `
                            <button class="btn btn-secondary flex-1" id="cancel-btn">Cancel</button>
                        ` : ''}
                        
                        <button class="btn btn-primary flex-1" id="save-questions" ${this.loading ? 'disabled' : ''}>
                            ${this.loading ? 'Saving...' : this.getButtonText()}
                        </button>
                    </div>

                    ${this.mode === 'setup' ? `
                        <p class="text-xs text-gray text-center mt-4">
                            <span class="text-warning">⚠️</span> 
                            These questions will help you recover your account if you forget your password.
                            Choose answers you'll remember easily.
                        </p>
                    ` : ''}
                </div>
            </div>
        `;

        modal.querySelector('#close-modal').addEventListener('click', this.onClose);
        modal.querySelector('#cancel-btn')?.addEventListener('click', this.onClose);
        
        modal.querySelector('#save-questions').addEventListener('click', () => {
            this.saveQuestions();
        });

        // Add question rows based on mode
        if (this.mode === 'setup') {
            this.addSetupRows(modal);
        } else {
            this.addVerifyRows(modal);
        }

        return modal;
    }

    getTitle() {
        switch(this.mode) {
            case 'setup': return 'Setup Security Questions';
            case 'verify': return 'Verify Security Questions';
            case 'recover': return 'Account Recovery';
            default: return 'Security Questions';
        }
    }

    getButtonText() {
        switch(this.mode) {
            case 'setup': return 'Save Questions';
            case 'verify': return 'Verify Answers';
            case 'recover': return 'Recover Account';
            default: return 'Continue';
        }
    }

    renderContent() {
        if (this.mode === 'setup') {
            return `
                <div class="space-y-4">
                    <p class="text-sm text-gray mb-4">
                        Select 3 security questions and provide answers. 
                        <span class="text-primary font-bold">Remember these answers!</span>
                    </p>
                    
                    <div id="questions-container" class="space-y-4">
                        ${this.renderQuestionRows()}
                    </div>

                    <button class="btn btn-secondary w-full text-xs" id="add-question">
                        + Add Another Question
                    </button>
                </div>
            `;
        } else {
            return `
                <div class="space-y-4">
                    <p class="text-sm text-gray mb-4">
                        Please answer your security questions to verify your identity.
                    </p>
                    
                    <div id="questions-container" class="space-y-4">
                        ${this.renderVerifyRows()}
                    </div>
                </div>
            `;
        }
    }

    renderQuestionRows() {
        let html = '';
        for (let i = 0; i < Math.min(3, this.selectedQuestions.length || 3); i++) {
            html += this.getQuestionRow(i);
        }
        return html;
    }

    getQuestionRow(index) {
        const selected = this.selectedQuestions[index] || '';
        
        return `
            <div class="question-row p-4 bg-darker rounded-lg" data-index="${index}">
                <div class="form-group">
                    <label class="form-label">Question ${index + 1}</label>
                    <select class="form-control question-select" data-index="${index}">
                        <option value="">Select a security question</option>
                        ${this.questions.map(q => `
                            <option value="${q}" ${q === selected ? 'selected' : ''}>${q}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Your Answer</label>
                    <input type="text" class="form-control answer-input" 
                           data-index="${index}" 
                           value="${this.answers[index] || ''}"
                           placeholder="Enter your answer">
                </div>
                
                ${index > 2 ? `
                    <button class="text-danger text-xs remove-question" data-index="${index}">
                        Remove Question
                    </button>
                ` : ''}
            </div>
        `;
    }

    renderVerifyRows() {
        if (!this.selectedQuestions || this.selectedQuestions.length === 0) {
            return `
                <div class="text-center text-gray py-8">
                    <p>No security questions set up.</p>
                    <p class="text-xs mt-2">Please contact admin for account recovery.</p>
                </div>
            `;
        }

        return this.selectedQuestions.map((question, index) => `
            <div class="p-4 bg-darker rounded-lg">
                <p class="text-sm font-bold mb-2">Question ${index + 1}:</p>
                <p class="text-xs text-gray mb-3">${question}</p>
                
                <div class="form-group">
                    <label class="form-label">Your Answer</label>
                    <input type="text" class="form-control verify-answer" 
                           data-index="${index}"
                           placeholder="Enter your answer">
                </div>
            </div>
        `).join('');
    }

    addSetupRows(modal) {
        // Question select listeners
        modal.querySelectorAll('.question-select').forEach(select => {
            select.addEventListener('change', (e) => {
                const index = e.target.dataset.index;
                this.selectedQuestions[index] = e.target.value;
            });
        });

        // Answer input listeners
        modal.querySelectorAll('.answer-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = e.target.dataset.index;
                this.answers[index] = e.target.value;
            });
        });

        // Add question button
        modal.querySelector('#add-question')?.addEventListener('click', () => {
            const container = document.getElementById('questions-container');
            const newIndex = container.children.length;
            
            const div = document.createElement('div');
            div.innerHTML = this.getQuestionRow(newIndex);
            div.firstChild.classList.add('fade-in');
            
            container.appendChild(div.firstChild);
            
            // Add listeners to new row
            const newRow = container.lastElementChild;
            newRow.querySelector('.question-select').addEventListener('change', (e) => {
                this.selectedQuestions[e.target.dataset.index] = e.target.value;
            });
            newRow.querySelector('.answer-input').addEventListener('input', (e) => {
                this.answers[e.target.dataset.index] = e.target.value;
            });
            newRow.querySelector('.remove-question')?.addEventListener('click', (e) => {
                e.target.closest('.question-row').remove();
            });
        });
    }

    addVerifyRows(modal) {
        modal.querySelectorAll('.verify-answer').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = e.target.dataset.index;
                this.answers[index] = e.target.value;
            });
        });
    }

    async saveQuestions() {
        if (this.mode === 'setup') {
            await this.saveSetupQuestions();
        } else if (this.mode === 'verify') {
            await this.verifyAnswers();
        } else if (this.mode === 'recover') {
            await this.recoverAccount();
        }
    }

    async saveSetupQuestions() {
        // Validate at least 3 questions answered
        const answers = [];
        
        for (let i = 0; i < 3; i++) {
            const question = this.selectedQuestions[i];
            const answer = this.answers[i];
            
            if (!question || !answer || answer.trim().length < 3) {
                this.message = { 
                    type: 'error', 
                    text: `Please answer question ${i + 1} with at least 3 characters` 
                };
                this.render();
                return;
            }
            
            answers.push({ question, answer });
        }

        this.loading = true;
        this.message = null;
        this.render();

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ securityQuestions: answers })
            });

            const data = await res.json();

            if (data.success) {
                this.message = { type: 'success', text: 'Security questions saved successfully!' };
                setTimeout(() => {
                    this.onClose();
                    this.onSuccess?.();
                }, 2000);
            } else {
                this.message = { type: 'error', text: data.error || 'Failed to save questions' };
            }
        } catch (error) {
            this.message = { type: 'error', text: 'Failed to save questions' };
        }

        this.loading = false;
        this.render();
    }

    async verifyAnswers() {
        const answers = [];
        
        for (let i = 0; i < this.selectedQuestions.length; i++) {
            const answer = this.answers[i];
            if (!answer) {
                this.message = { type: 'error', text: `Please answer question ${i + 1}` };
                this.render();
                return;
            }
            answers.push({ 
                question: this.selectedQuestions[i], 
                answer 
            });
        }

        this.loading = true;
        this.message = null;
        this.render();

        try {
            const res = await fetch('/api/verify-security', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: this.user.username,
                    answers
                })
            });

            const data = await res.json();

            if (data.success) {
                this.message = { type: 'success', text: 'Verified successfully!' };
                // Store token for password reset
                localStorage.setItem('recovery_token', data.token);
                setTimeout(() => {
                    this.onClose();
                    this.onSuccess?.(data.token);
                }, 1500);
            } else {
                this.message = { type: 'error', text: data.error || 'Verification failed' };
            }
        } catch (error) {
            this.message = { type: 'error', text: 'Verification failed' };
        }

        this.loading = false;
        this.render();
    }

    async recoverAccount() {
        // Similar to verify but redirects to password reset
        await this.verifyAnswers();
    }
}