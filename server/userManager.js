import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import CryptoJS from 'crypto-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class UserManager {
    constructor() {
        this.dbFile = path.join(__dirname, 'users.enc');
        this.encryptionKey = process.env.ENCRYPTION_KEY || 'defaultkey123456789012345678901234';
        this.users = this.loadUsers();
        this.adminUsername = 'admin';
    }

    loadUsers() {
        try {
            if (fs.existsSync(this.dbFile)) {
                const encrypted = fs.readFileSync(this.dbFile, 'utf8');
                const bytes = CryptoJS.AES.decrypt(encrypted, this.encryptionKey);
                const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                if (decrypted) {
                    return JSON.parse(decrypted);
                }
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
        
        return {
            admin: {
                username: 'admin',
                email: 'admin@storyboard.com',
                password: '$2b$10$dummyhash',
                role: 'admin',
                plan: 'unlimited',
                scenesGenerated: 0,
                scenesLimit: Infinity,
                joined: new Date().toISOString(),
                lastLogin: null
            }
        };
    }

    isAdmin(username) {
        return username === this.adminUsername;
    }

    getUser(username) {
        return this.users[username] || null;
    }

    canGenerateScene(username) {
        if (this.isAdmin(username)) return true;
        
        const user = this.users[username];
        if (!user) return false;
        if (user.plan === 'pro' || user.plan === 'unlimited') return true;
        return user.scenesGenerated < user.scenesLimit;
    }

    incrementSceneCount(username) {
        if (this.isAdmin(username)) return;
        
        if (this.users[username]) {
            this.users[username].scenesGenerated++;
            this.saveUsers();
        }
    }

    getRemainingScenes(username) {
        if (this.isAdmin(username)) return Infinity;
        
        const user = this.users[username];
        if (!user) return 0;
        if (user.plan === 'pro' || user.plan === 'unlimited') return Infinity;
        return Math.max(0, user.scenesLimit - user.scenesGenerated);
    }

    checkWatermark(username) {
        if (this.isAdmin(username)) return false;
        
        const user = this.users[username];
        if (!user) return true;
        if (user.plan === 'pro' || user.plan === 'unlimited') return false;
        return true;
    }

    getImageQuality(username) {
        if (this.isAdmin(username)) return 'hd';
        
        const user = this.users[username];
        if (!user) return 'standard';
        if (user.plan === 'pro' || user.plan === 'unlimited') return 'hd';
        return 'standard';
    }

    getDnaFeatures(username) {
        if (this.isAdmin(username)) {
            return {
                basicDna: true,
                advancedDna: true,
                castMode: true
            };
        }
        
        const user = this.users[username];
        if (!user) return { basicDna: true, advancedDna: false, castMode: false };
        
        return {
            basicDna: true,
            advancedDna: user.plan === 'pro' || user.plan === 'unlimited',
            castMode: user.plan === 'pro' || user.plan === 'unlimited'
        };
    }

    getUserPlan(username) {
        if (this.isAdmin(username)) return 'ADMIN';
        
        const user = this.users[username];
        if (!user) return 'UNKNOWN';
        return user.plan.toUpperCase();
    }

    saveUsers() {
        try {
            const encrypted = CryptoJS.AES.encrypt(
                JSON.stringify(this.users, null, 2),
                this.encryptionKey
            ).toString();
            fs.writeFileSync(this.dbFile, encrypted);
            return true;
        } catch (error) {
            console.error('Error saving users:', error);
            return false;
        }
    }
}

export default new UserManager();