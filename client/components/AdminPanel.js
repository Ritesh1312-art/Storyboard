// client/components/AdminPanel.js
export class AdminPanel {
    constructor({ user, onClose }) {
        this.user = user;
        this.onClose = onClose;
        this.activeTab = 'dashboard';
        this.stats = null;
        this.users = [];
        this.config = null;
        this.loading = false;
        this.message = null;
    }

    async loadData() {
        this.loading = true;
        this.render();

        try {
            // Load users
            const usersRes = await fetch('/api/admin/users');
            const usersData = await usersRes.json();
            this.users = usersData;

            // Load config
            const configRes = await fetch('/api/admin/config');
            const configData = await configRes.json();
            this.config = configData;

            // Calculate stats
            this.stats = {
                totalUsers: this.users.length,
                proUsers: this.users.filter(u => u.plan === 'pro').length,
                freeUsers: this.users.filter(u => u.plan === 'free').length,
                totalScenes: this.users.reduce((acc, u) => acc + (u.scenesGenerated || 0), 0),
                newToday: this.users.filter(u => {
                    const today = new Date().toDateString();
                    return new Date(u.created).toDateString() === today;
                }).length
            };

        } catch (error) {
            console.error('Failed to load admin data:', error);
            this.message = { type: 'error', text: 'Failed to load data' };
        }

        this.loading = false;
        this.render();
    }

    render() {
        const container = document.createElement('div');
        container.className = 'fixed inset-0 z-[1000] flex items-center justify-center p-4';
        container.style.background = 'rgba(0, 0, 0, 0.9)';
        container.style.backdropFilter = 'blur(8px)';

        container.innerHTML = `
            <div class="glass" style="width: 1200px; max-width: 100%; height: 80vh; display: flex; flex-direction: column;">
                <!-- Header -->
                <div class="p-6 border-b border-border flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-xl">
                            👑
                        </div>
                        <div>
                            <h2 class="text-xl font-black uppercase tracking-wider">Admin Control Panel</h2>
                            <p class="text-xs text-gray">Welcome back, ${this.user.username}</p>
                        </div>
                    </div>
                    <button class="text-gray hover:text-white p-2" id="close-admin">✕</button>
                </div>

                <!-- Tabs -->
                <div class="flex border-b border-border px-6">
                    ${this.renderTabs()}
                </div>

                <!-- Content -->
                <div class="flex-1 overflow-y-auto p-6" id="admin-content">
                    ${this.loading ? this.renderLoading() : this.renderContent()}
                </div>
            </div>
        `;

        container.querySelector('#close-admin').addEventListener('click', this.onClose);

        // Tab click handlers
        container.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.activeTab = tab.dataset.tab;
                this.render();
            });
        });

        // Load data on first render
        if (!this.stats) {
            this.loadData();
        }

        return container;
    }

    renderTabs() {
        const tabs = [
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'users', icon: '👥', label: 'User Management' },
            { id: 'config', icon: '⚙️', label: 'Configuration' },
            { id: 'analytics', icon: '📈', label: 'Analytics' },
            { id: 'logs', icon: '📝', label: 'System Logs' },
            { id: 'backup', icon: '💾', label: 'Backup' }
        ];

        return tabs.map(tab => `
            <button class="admin-tab px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all
                ${this.activeTab === tab.id 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-gray hover:text-white'}"
                data-tab="${tab.id}">
                <span class="mr-2">${tab.icon}</span>
                ${tab.label}
            </button>
        `).join('');
    }

    renderLoading() {
        return `
            <div class="h-full flex items-center justify-center">
                <div class="text-center">
                    <div class="spinner mb-4"></div>
                    <p class="text-gray">Loading admin data...</p>
                </div>
            </div>
        `;
    }

    renderContent() {
        switch(this.activeTab) {
            case 'dashboard':
                return this.renderDashboard();
            case 'users':
                return this.renderUserManagement();
            case 'config':
                return this.renderConfiguration();
            case 'analytics':
                return this.renderAnalytics();
            case 'logs':
                return this.renderLogs();
            case 'backup':
                return this.renderBackup();
            default:
                return this.renderDashboard();
        }
    }

    renderDashboard() {
        return `
            <div class="space-y-6">
                <!-- Stats Grid -->
                <div class="grid grid-4 gap-4">
                    <div class="bg-darker p-6 rounded-xl border border-border">
                        <div class="text-3xl mb-2">👥</div>
                        <div class="text-2xl font-black">${this.stats?.totalUsers || 0}</div>
                        <div class="text-xs text-gray">Total Users</div>
                        <div class="text-xs text-success mt-2">+${this.stats?.newToday || 0} today</div>
                    </div>

                    <div class="bg-darker p-6 rounded-xl border border-border">
                        <div class="text-3xl mb-2">⭐</div>
                        <div class="text-2xl font-black">${this.stats?.proUsers || 0}</div>
                        <div class="text-xs text-gray">Pro Users</div>
                        <div class="text-xs text-primary mt-2">${((this.stats?.proUsers / this.stats?.totalUsers) * 100 || 0).toFixed(1)}% conversion</div>
                    </div>

                    <div class="bg-darker p-6 rounded-xl border border-border">
                        <div class="text-3xl mb-2">🆓</div>
                        <div class="text-2xl font-black">${this.stats?.freeUsers || 0}</div>
                        <div class="text-xs text-gray">Free Users</div>
                    </div>

                    <div class="bg-darker p-6 rounded-xl border border-border">
                        <div class="text-3xl mb-2">🎬</div>
                        <div class="text-2xl font-black">${this.stats?.totalScenes || 0}</div>
                        <div class="text-xs text-gray">Scenes Generated</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="grid grid-2 gap-4">
                    <div class="bg-darker p-6 rounded-xl border border-border">
                        <h3 class="text-sm font-bold mb-4">Quick Actions</h3>
                        <div class="space-y-2">
                            <button class="btn btn-secondary w-full text-left" id="quick-add-user">
                                ➕ Add New User
                            </button>
                            <button class="btn btn-secondary w-full text-left" id="quick-backup">
                                💾 Create Backup
                            </button>
                            <button class="btn btn-secondary w-full text-left" id="quick-clear-cache">
                                🧹 Clear Cache
                            </button>
                        </div>
                    </div>

                    <div class="bg-darker p-6 rounded-xl border border-border">
                        <h3 class="text-sm font-bold mb-4">System Status</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-gray">Server</span>
                                <span class="text-success">● Online</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray">API</span>
                                <span class="text-success">● Connected</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray">Database</span>
                                <span class="text-success">● Encrypted</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray">Memory</span>
                                <span class="text-warning">● 128MB used</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="bg-darker p-6 rounded-xl border border-border">
                    <h3 class="text-sm font-bold mb-4">Recent Activity</h3>
                    <div class="space-y-3">
                        ${this.users.slice(0, 5).map(user => `
                            <div class="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition">
                                <div class="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                    ${user.username.charAt(0).toUpperCase()}
                                </div>
                                <div class="flex-1">
                                    <p class="text-sm font-bold">${user.username}</p>
                                    <p class="text-xs text-gray">Joined ${new Date(user.created).toLocaleDateString()}</p>
                                </div>
                                <span class="text-xs px-2 py-1 rounded-full ${user.plan === 'pro' ? 'bg-success/20 text-success' : 'bg-gray/20 text-gray'}">
                                    ${user.plan || 'free'}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderUserManagement() {
        return `
            <div class="space-y-4">
                <!-- Search and Filters -->
                <div class="flex gap-2 mb-4">
                    <input type="text" class="form-control flex-1" id="user-search" placeholder="Search users...">
                    <select class="form-control w-40" id="user-filter">
                        <option value="all">All Users</option>
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="admin">Admin</option>
                    </select>
                    <button class="btn btn-primary" id="add-user">➕ Add User</button>
                </div>

                <!-- Users Table -->
                <div class="bg-darker rounded-xl border border-border overflow-hidden">
                    <table class="w-full">
                        <thead class="bg-black/50">
                            <tr>
                                <th class="p-3 text-left text-xs font-bold uppercase text-gray">User</th>
                                <th class="p-3 text-left text-xs font-bold uppercase text-gray">Email</th>
                                <th class="p-3 text-left text-xs font-bold uppercase text-gray">Plan</th>
                                <th class="p-3 text-left text-xs font-bold uppercase text-gray">Scenes</th>
                                <th class="p-3 text-left text-xs font-bold uppercase text-gray">Joined</th>
                                <th class="p-3 text-left text-xs font-bold uppercase text-gray">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.users.map(user => `
                                <tr class="border-t border-border hover:bg-white/5">
                                    <td class="p-3">
                                        <div class="flex items-center gap-2">
                                            <div class="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm">
                                                ${user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p class="font-bold">${user.username}</p>
                                                <p class="text-xs text-gray">${user.fullName || '—'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="p-3 text-sm">${user.email || '—'}</td>
                                    <td class="p-3">
                                        <span class="px-2 py-1 rounded-full text-xs font-bold
                                            ${user.plan === 'pro' ? 'bg-success/20 text-success' : 
                                              user.plan === 'admin' ? 'bg-primary/20 text-primary' : 
                                              'bg-gray/20 text-gray'}">
                                            ${user.plan || 'free'}
                                        </span>
                                    </td>
                                    <td class="p-3 text-sm">${user.scenesGenerated || 0}</td>
                                    <td class="p-3 text-sm">${new Date(user.created).toLocaleDateString()}</td>
                                    <td class="p-3">
                                        <div class="flex gap-2">
                                            <button class="text-primary hover:text-primary/80" data-edit="${user.username}">✏️</button>
                                            <button class="text-success hover:text-success/80" data-reset="${user.username}">🔄</button>
                                            ${user.username !== 'admin' ? `
                                                <button class="text-danger hover:text-danger/80" data-delete="${user.username}">🗑️</button>
                                            ` : ''}
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="flex justify-between items-center">
                    <p class="text-sm text-gray">Showing ${this.users.length} users</p>
                    <div class="flex gap-2">
                        <button class="btn btn-secondary text-xs" disabled>← Previous</button>
                        <button class="btn btn-secondary text-xs" disabled>Next →</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderConfiguration() {
        return `
            <div class="space-y-6">
                <!-- Gemini API -->
                <div class="bg-darker p-6 rounded-xl border border-border">
                    <h3 class="text-sm font-bold mb-4 flex items-center gap-2">
                        <span class="text-primary">🤖</span> Gemini API Configuration
                    </h3>
                    
                    <div class="space-y-4">
                        <div class="form-group">
                            <label class="form-label">API Key</label>
                            <div class="flex gap-2">
                                <input type="password" class="form-control" id="api-key" 
                                       value="********" placeholder="Enter new API key">
                                <button class="btn btn-primary" id="update-api">Update</button>
                            </div>
                            <p class="text-xs text-gray mt-1">Current key is masked for security</p>
                        </div>

                        <div class="grid grid-3 gap-4">
                            <div>
                                <label class="form-label">Analysis Model</label>
                                <select class="form-control" id="model-analysis">
                                    <option>gemini-2.0-flash-exp</option>
                                    <option>gemini-2.0-pro-exp</option>
                                </select>
                            </div>
                            <div>
                                <label class="form-label">Image Model</label>
                                <select class="form-control" id="model-image">
                                    <option>gemini-2.0-flash-exp-image-generation</option>
                                </select>
                            </div>
                            <div>
                                <label class="form-label">TTS Model</label>
                                <select class="form-control" id="model-tts">
                                    <option>gemini-2.0-flash-exp</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- User Settings -->
                <div class="bg-darker p-6 rounded-xl border border-border">
                    <h3 class="text-sm font-bold mb-4 flex items-center gap-2">
                        <span class="text-success">👥</span> User Settings
                    </h3>
                    
                    <div class="grid grid-2 gap-4">
                        <div class="form-group">
                            <label class="form-label">Default User Password</label>
                            <div class="flex gap-2">
                                <input type="password" class="form-control" id="user-password" 
                                       value="********" placeholder="New default password">
                                <button class="btn btn-primary" id="update-user-pass">Update</button>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Free Plan Scenes</label>
                            <input type="number" class="form-control" id="free-scenes" value="3" min="1" max="10">
                        </div>
                    </div>
                </div>

                <!-- Admin Security -->
                <div class="bg-darker p-6 rounded-xl border border-border">
                    <h3 class="text-sm font-bold mb-4 flex items-center gap-2">
                        <span class="text-warning">🔐</span> Admin Security
                    </h3>
                    
                    <div class="space-y-4">
                        <div class="form-group">
                            <label class="form-label">Current Admin Password</label>
                            <input type="password" class="form-control" id="current-admin-pass">
                        </div>

                        <div class="grid grid-2 gap-4">
                            <div class="form-group">
                                <label class="form-label">New Password</label>
                                <input type="password" class="form-control" id="new-admin-pass">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Confirm Password</label>
                                <input type="password" class="form-control" id="confirm-admin-pass">
                            </div>
                        </div>

                        <button class="btn btn-primary" id="update-admin-pass">Change Admin Password</button>
                    </div>
                </div>

                <!-- System Settings -->
                <div class="bg-darker p-6 rounded-xl border border-border">
                    <h3 class="text-sm font-bold mb-4 flex items-center gap-2">
                        <span class="text-info">⚙️</span> System Settings
                    </h3>
                    
                    <div class="grid grid-2 gap-4">
                        <div>
                            <label class="form-label">Maintenance Mode</label>
                            <select class="form-control">
                                <option value="off">Off</option>
                                <option value="on">On</option>
                            </select>
                        </div>

                        <div>
                            <label class="form-label">Registration</label>
                            <select class="form-control">
                                <option value="open">Open</option>
                                <option value="closed">Closed</option>
                                <option value="invite">Invite Only</option>
                            </select>
                        </div>

                        <div>
                            <label class="form-label">Session Timeout</label>
                            <select class="form-control">
                                <option value="1">1 hour</option>
                                <option value="24">24 hours</option>
                                <option value="168">1 week</option>
                            </select>
                        </div>

                        <div>
                            <label class="form-label">Rate Limit</label>
                            <select class="form-control">
                                <option value="100">100 requests/15min</option>
                                <option value="200">200 requests/15min</option>
                                <option value="500">500 requests/15min</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderAnalytics() {
        return `
            <div class="space-y-6">
                <div class="grid grid-2 gap-4">
                    <!-- User Growth Chart -->
                    <div class="bg-darker p-6 rounded-xl border border-border">
                        <h3 class="text-sm font-bold mb-4">User Growth</h3>
                        <div class="h-64 flex items-end justify-around">
                            ${this.generateChartBars()}
                        </div>
                    </div>

                    <!-- Plan Distribution -->
                    <div class="bg-darker p-6 rounded-xl border border-border">
                        <h3 class="text-sm font-bold mb-4">Plan Distribution</h3>
                        <div class="space-y-3">
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span>Free</span>
                                    <span>${this.stats?.freeUsers || 0} users</span>
                                </div>
                                <div class="w-full bg-gray/20 h-2 rounded-full">
                                    <div class="bg-gray h-2 rounded-full" 
                                         style="width: ${((this.stats?.freeUsers / this.stats?.totalUsers) * 100) || 0}%">
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span>Pro</span>
                                    <span>${this.stats?.proUsers || 0} users</span>
                                </div>
                                <div class="w-full bg-gray/20 h-2 rounded-full">
                                    <div class="bg-success h-2 rounded-full" 
                                         style="width: ${((this.stats?.proUsers / this.stats?.totalUsers) * 100) || 0}%">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Revenue Stats -->
                <div class="bg-darker p-6 rounded-xl border border-border">
                    <h3 class="text-sm font-bold mb-4">Revenue Overview</h3>
                    <div class="grid grid-4 gap-4">
                        <div>
                            <div class="text-2xl font-black">₹${this.stats?.proUsers * 99 || 0}</div>
                            <div class="text-xs text-gray">Monthly Recurring</div>
                        </div>
                        <div>
                            <div class="text-2xl font-black">₹${this.stats?.proUsers * 999 || 0}</div>
                            <div class="text-xs text-gray">Yearly Projected</div>
                        </div>
                        <div>
                            <div class="text-2xl font-black">${this.stats?.proUsers || 0}</div>
                            <div class="text-xs text-gray">Paying Users</div>
                        </div>
                        <div>
                            <div class="text-2xl font-black">${((this.stats?.proUsers / this.stats?.totalUsers) * 100 || 0).toFixed(1)}%</div>
                            <div class="text-xs text-gray">Conversion Rate</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderLogs() {
        return `
            <div class="space-y-4">
                <div class="flex gap-2 mb-4">
                    <select class="form-control w-32">
                        <option>All Levels</option>
                        <option>Error</option>
                        <option>Warning</option>
                        <option>Info</option>
                    </select>
                    <select class="form-control w-32">
                        <option>Last 24h</option>
                        <option>Last 7d</option>
                        <option>Last 30d</option>
                    </select>
                    <button class="btn btn-secondary">Download Logs</button>
                    <button class="btn btn-danger">Clear Logs</button>
                </div>

                <div class="bg-darker rounded-xl border border-border overflow-hidden">
                    <div class="p-4 bg-black/50 font-mono text-sm space-y-2" style="height: 400px; overflow-y: auto;">
                        <div class="text-gray">[2024-01-01 10:23:45] INFO: Server started</div>
                        <div class="text-gray">[2024-01-01 10:23:46] INFO: Database connected</div>
                        <div class="text-success">[2024-01-01 10:24:12] ✓ User 'john' logged in</div>
                        <div class="text-primary">[2024-01-01 10:25:30] 🔄 User 'jane' upgraded to Pro</div>
                        <div class="text-warning">[2024-01-01 10:26:15] ⚠ Rate limit reached for IP 192.168.1.1</div>
                        <div class="text-danger">[2024-01-01 10:27:00] ✗ Failed login attempt for user 'admin'</div>
                        <div class="text-success">[2024-01-01 10:28:22] ✓ Payment successful for user 'mike'</div>
                        <div class="text-gray">[2024-01-01 10:29:45] INFO: Backup completed</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderBackup() {
        return `
            <div class="space-y-6">
                <div class="bg-darker p-6 rounded-xl border border-border">
                    <h3 class="text-sm font-bold mb-4">Create Backup</h3>
                    <div class="space-y-4">
                        <div class="flex gap-4">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" checked> Users Database
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" checked> Configuration
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox"> Logs
                            </label>
                        </div>
                        <button class="btn btn-primary">Create Backup Now</button>
                    </div>
                </div>

                <div class="bg-darker p-6 rounded-xl border border-border">
                    <h3 class="text-sm font-bold mb-4">Previous Backups</h3>
                    <div class="space-y-2">
                        <div class="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                            <div>
                                <p class="font-bold">backup-2024-01-01.zip</p>
                                <p class="text-xs text-gray">Size: 2.3 MB | Created: 2024-01-01</p>
                            </div>
                            <button class="btn btn-secondary text-xs">Download</button>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                            <div>
                                <p class="font-bold">backup-2023-12-31.zip</p>
                                <p class="text-xs text-gray">Size: 2.1 MB | Created: 2023-12-31</p>
                            </div>
                            <button class="btn btn-secondary text-xs">Download</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateChartBars() {
        // Generate last 7 days
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const maxUsers = Math.max(...this.users.map((_, i) => i + 1)) || 1;
        
        return days.map((day, i) => {
            const height = ((i + 1) / maxUsers) * 100;
            return `
                <div class="flex flex-col items-center gap-2">
                    <div class="w-8 bg-primary/20 rounded-t" style="height: ${height}px">
                        <div class="w-full bg-primary rounded-t" style="height: ${height * 0.7}px"></div>
                    </div>
                    <span class="text-xs">${day}</span>
                </div>
            `;
        }).join('');
    }
}