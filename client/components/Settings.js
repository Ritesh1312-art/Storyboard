export class Settings {
    constructor({ user, onClose, onUpdate }) {
        this.user = user;
        this.onClose = onClose;
        this.onUpdate = onUpdate;
        this.activeTab = 'general';
    }

    render() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-[1000] flex items-center justify-center p-4';
        modal.style.background = 'rgba(0, 0, 0, 0.8)';
        modal.style.backdropFilter = 'blur(8px)';

        const content = document.createElement('div');
        content.className = 'settings-modal glass';
        content.style.maxWidth = '600px';
        content.style.width = '100%';
        content.style.maxHeight = '80vh';
        content.style.overflowY = 'auto';

        content.innerHTML = `
            <div class="flex justify-between items-center p-6 border-b border-border">
                <h2 class="text-xl font-black uppercase tracking-wider">Settings</h2>
                <button class="text-gray hover:text-white p-2" id="close-settings">✕</button>
            </div>

            <div class="flex border-b border-border">
                <button class="tab ${this.activeTab === 'general' ? 'active' : ''}" data-tab="general">General</button>
                ${this.user?.role === 'admin' ? `
                    <button class="tab ${this.activeTab === 'admin' ? 'active' : ''}" data-tab="admin">Admin</button>
                    <button class="tab ${this.activeTab === 'users' ? 'active' : ''}" data-tab="users">Users</button>
                ` : ''}
                <button class="tab ${this.activeTab === 'account' ? 'active' : ''}" data-tab="account">Account</button>
            </div>

            <div class="p-6" id="settings-content"></div>
        `;

        content.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.activeTab = tab.dataset.tab;
                this.renderContent(content.querySelector('#settings-content'));
            });
        });

        content.querySelector('#close-settings').addEventListener('click', this.onClose);

        this.renderContent(content.querySelector('#settings-content'));

        modal.appendChild(content);
        return modal;
    }

    renderContent(container) {
        if (!container) return;

        switch (this.activeTab) {
            case 'general':
                this.renderGeneral(container);
                break;
            case 'admin':
                this.renderAdmin(container);
                break;
            case 'users':
                this.renderUsers(container);
                break;
            case 'account':
                this.renderAccount(container);
                break;
        }
    }

    renderGeneral(container) {
        container.innerHTML = `
            <div class="space-y-6">
                <div class="form-group">
                    <label class="form-label">Theme</label>
                    <select class="form-control">
                        <option>Dark (Default)</option>
                        <option disabled>Light (Coming Soon)</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Language</label>
                    <select class="form-control">
                        <option>English</option>
                        <option>Hindi</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Auto-save</label>
                    <select class="form-control">
                        <option>Every 5 minutes</option>
                        <option>Every 15 minutes</option>
                        <option>Never</option>
                    </select>
                </div>

                <button class="btn btn-primary w-full">Save Settings</button>
            </div>
        `;
    }

    renderAdmin(container) {
        container.innerHTML = `
            <div class="space-y-6">
                <h3 class="text-sm font-black uppercase tracking-wider text-primary">Gemini API Configuration</h3>
                
                <div class="form-group">
                    <label class="form-label">API Key</label>
                    <div class="flex gap-2">
                        <input type="password" class="form-control" id="api-key" placeholder="Enter new API key">
                        <button class="btn btn-primary" id="update-api">Update</button>
                    </div>
                    <p class="text-xs text-gray mt-1">Current: ********</p>
                </div>

                <div class="border-t border-border my-4"></div>

                <h3 class="text-sm font-black uppercase tracking-wider text-primary">User Password</h3>
                
                <div class="form-group">
                    <label class="form-label">New User Password</label>
                    <div class="flex gap-2">
                        <input type="password" class="form-control" id="user-password" placeholder="Enter new password">
                        <button class="btn btn-primary" id="update-user-pass">Update</button>
                    </div>
                    <p class="text-xs text-gray mt-1">Default: 1111</p>
                </div>

                <div class="border-t border-border my-4"></div>

                <h3 class="text-sm font-black uppercase tracking-wider text-primary">Admin Password</h3>
                
                <div class="form-group">
                    <label class="form-label">Current Password</label>
                    <input type="password" class="form-control" id="current-admin-pass">
                </div>

                <div class="form-group">
                    <label class="form-label">New Password</label>
                    <input type="password" class="form-control" id="new-admin-pass">
                </div>

                <button class="btn btn-primary w-full" id="update-admin-pass">Change Admin Password</button>
            </div>
        `;

        container.querySelector('#update-api').addEventListener('click', async () => {
            const key = document.getElementById('api-key').value;
            if (!key) return;

            try {
                const res = await fetch('/api/admin/config/gemini', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ apiKey: key })
                });

                const data = await res.json();
                if (data.success) {
                    alert('API key updated successfully');
                }
            } catch (error) {
                alert('Failed to update API key');
            }
        });

        container.querySelector('#update-user-pass').addEventListener('click', async () => {
            const password = document.getElementById('user-password').value;
            if (!password) return;

            try {
                const res = await fetch('/api/admin/config/user-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });

                const data = await res.json();
                if (data.success) {
                    alert('User password updated successfully');
                }
            } catch (error) {
                alert('Failed to update password');
            }
        });

        container.querySelector('#update-admin-pass').addEventListener('click', async () => {
            const oldPass = document.getElementById('current-admin-pass').value;
            const newPass = document.getElementById('new-admin-pass').value;

            if (!oldPass || !newPass) return;

            try {
                const res = await fetch('/api/admin/config/admin-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass })
                });

                const data = await res.json();
                if (data.success) {
                    alert('Admin password updated successfully');
                } else {
                    alert(data.error || 'Failed to update password');
                }
            } catch (error) {
                alert('Failed to update password');
            }
        });
    }

    renderUsers(container) {
        container.innerHTML = `
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-sm font-black uppercase tracking-wider text-primary">User Management</h3>
                    <button class="btn btn-secondary text-xs" id="refresh-users">Refresh</button>
                </div>

                <div id="users-list" class="space-y-2">
                    <div class="text-center text-gray py-4">Loading users...</div>
                </div>
            </div>
        `;

        this.loadUsers(container);

        container.querySelector('#refresh-users').addEventListener('click', () => {
            this.loadUsers(container);
        });
    }

    async loadUsers(container) {
        try {
            const res = await fetch('/api/admin/users');
            const users = await res.json();

            const list = container.querySelector('#users-list');
            
            if (users.length === 0) {
                list.innerHTML = '<div class="text-center text-gray py-4">No users found</div>';
                return;
            }

            list.innerHTML = users.map(user => `
                <div class="flex items-center justify-between p-3 bg-darker rounded-lg border border-border">
                    <div>
                        <div class="font-bold">${user.username}</div>
                        <div class="text-xs text-gray">${user.email} | Plan: ${user.plan || 'free'}</div>
                        <div class="text-xs text-gray">Joined: ${new Date(user.created).toLocaleDateString()}</div>
                    </div>
                    <div class="flex gap-2">
                        <button class="btn btn-secondary text-xs" data-reset="${user.username}">Reset Password</button>
                        ${user.username !== 'admin' ? `
                            <button class="btn btn-danger text-xs" data-delete="${user.username}">Delete</button>
                        ` : ''}
                    </div>
                </div>
            `).join('');

            list.querySelectorAll('[data-reset]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const username = btn.dataset.reset;
                    const newPass = prompt(`Enter new password for ${username}:`);
                    
                    if (newPass) {
                        try {
                            const res = await fetch('/api/admin/user/reset-password', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ username, newPassword: newPass })
                            });

                            const data = await res.json();
                            if (data.success) {
                                alert('Password reset successfully');
                            }
                        } catch (error) {
                            alert('Failed to reset password');
                        }
                    }
                });
            });

            list.querySelectorAll('[data-delete]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const username = btn.dataset.delete;
                    
                    if (confirm(`Are you sure you want to delete user ${username}?`)) {
                        try {
                            const res = await fetch(`/api/admin/user/${username}`, {
                                method: 'DELETE'
                            });

                            const data = await res.json();
                            if (data.success) {
                                this.loadUsers(container);
                            }
                        } catch (error) {
                            alert('Failed to delete user');
                        }
                    }
                });
            });

        } catch (error) {
            console.error('Failed to load users:', error);
            container.querySelector('#users-list').innerHTML = `
                <div class="text-center text-danger py-4">Failed to load users</div>
            `;
        }
    }

    renderAccount(container) {
        container.innerHTML = `
            <div class="space-y-6">
                <div class="form-group">
                    <label class="form-label">Username</label>
                    <input type="text" class="form-control" value="${this.user?.username || ''}" readonly disabled>
                </div>

                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-control" value="${this.user?.email || ''}" readonly disabled>
                </div>

                <div class="form-group">
                    <label class="form-label">Plan</label>
                    <input type="text" class="form-control" value="${this.user?.plan === 'pro' ? 'PRO' : 'FREE'}" readonly disabled>
                </div>

                <div class="border-t border-border my-4"></div>

                <h3 class="text-sm font-black uppercase tracking-wider text-primary">Change Password</h3>

                <div class="form-group">
                    <label class="form-label">Current Password</label>
                    <input type="password" class="form-control" id="current-pass">
                </div>

                <div class="form-group">
                    <label class="form-label">New Password</label>
                    <input type="password" class="form-control" id="new-pass">
                </div>

                <div class="form-group">
                    <label class="form-label">Confirm New Password</label>
                    <input type="password" class="form-control" id="confirm-pass">
                </div>

                <button class="btn btn-primary w-full" id="change-pass">Change Password</button>
            </div>
        `;

        container.querySelector('#change-pass').addEventListener('click', () => {
            const current = document.getElementById('current-pass').value;
            const newPass = document.getElementById('new-pass').value;
            const confirm = document.getElementById('confirm-pass').value;

            if (!current || !newPass || !confirm) {
                alert('Please fill all fields');
                return;
            }

            if (newPass !== confirm) {
                alert('New passwords do not match');
                return;
            }

            alert('Password change functionality will be implemented');
        });
    }
}