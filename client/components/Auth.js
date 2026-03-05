export class Auth {
    constructor({ onLogin, onRegister }) {
        this.onLogin = onLogin;
        this.onRegister = onRegister;
        this.mode = 'login';
    }

    render() {
        const container = document.createElement('div');
        container.className = 'auth-container';

        const card = document.createElement('div');
        card.className = 'auth-card';

        card.innerHTML = `
            <div class="text-center mb-4">
                <div class="logo-icon" style="width: 4rem; height: 4rem; margin: 0 auto 1rem;">🎬</div>
                <h1 class="text-2xl font-black uppercase tracking-wider">StoryBoard</h1>
                <p class="text-gray text-xs mt-1">Develop by Ritesh Gupta</p>
            </div>

            <div class="tabs mb-4" style="justify-content: center;">
                <button class="tab ${this.mode === 'login' ? 'active' : ''}" data-mode="login">Login</button>
                <button class="tab ${this.mode === 'register' ? 'active' : ''}" data-mode="register">Register</button>
            </div>

            <form id="auth-form">
                <div class="form-group">
                    <label class="form-label">Username</label>
                    <input type="text" class="form-control" id="username" required>
                </div>

                ${this.mode === 'register' ? `
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" id="email" required>
                    </div>
                ` : ''}

                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" required>
                </div>

                ${this.mode === 'register' ? `
                    <div class="form-group">
                        <label class="form-label">Confirm Password</label>
                        <input type="password" class="form-control" id="confirm-password" required>
                    </div>
                ` : ''}

                <button type="submit" class="btn btn-primary w-full">
                    ${this.mode === 'login' ? 'Login' : 'Register'}
                </button>
            </form>

            <p class="text-center text-gray text-xs mt-4">
                ${this.mode === 'login' 
                    ? "You're Welcome" 
                    : 'Create your account to start'}
            </p>
        `;

        card.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.mode = tab.dataset.mode;
                container.innerHTML = '';
                container.appendChild(this.render());
            });
        });

        const form = card.querySelector('#auth-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (this.mode === 'login') {
                await this.onLogin(username, password);
            } else {
                const email = document.getElementById('email').value;
                const confirm = document.getElementById('confirm-password').value;

                if (password !== confirm) {
                    alert('Passwords do not match');
                    return;
                }

                await this.onRegister(username, password, email);
            }
        });

        container.appendChild(card);
        return container;
    }
}