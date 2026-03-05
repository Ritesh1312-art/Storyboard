import bcrypt from 'bcrypt';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import CryptoJS from 'crypto-js';
import userManager from './userManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AuthManager {
    constructor() {
        this.dbFile = path.join(__dirname, 'users.enc');
        this.encryptionKey = process.env.ENCRYPTION_KEY || 'defaultkey123456789012345678901234';
        this.users = this.loadUsers();
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

        // Default admin user
        return {
            admin: {
                username: 'admin',
                password: bcrypt.hashSync('admin123', 10),
                role: 'admin',
                email: 'admin@storyboard.com',
                plan: 'unlimited',
                scenesGenerated: 0,
                scenesLimit: Infinity,
                created: new Date().toISOString(),
                lastLogin: null
            }
        };
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

    async register(username, password, email) {
        if (this.users[username]) {
            return { success: false, error: 'Username already exists' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        this.users[username] = {
            username,
            password: hashedPassword,
            email,
            role: 'user',
            plan: 'free',
            scenesGenerated: 0,
            scenesLimit: 3,
            created: new Date().toISOString(),
            lastLogin: null
        };

        if (this.saveUsers()) {
            return { 
                success: true, 
                user: { 
                    username, 
                    email, 
                    role: 'user',
                    plan: 'free' 
                } 
            };
        }
        return { success: false, error: 'Failed to save user' };
    }

    async login(username, password) {
        const user = this.users[username];
        if (!user) {
            return { success: false, error: 'Invalid username or password' };
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return { success: false, error: 'Invalid username or password' };
        }

        user.lastLogin = new Date().toISOString();
        this.saveUsers();

        return {
            success: true,
            user: {
                username: user.username,
                email: user.email,
                role: user.role,
                plan: user.plan
            }
        };
    }

    getAllUsers() {
        return Object.values(this.users).map(({ password, ...user }) => user);
    }

    deleteUser(username) {
        if (username === 'admin') {
            return { success: false, error: 'Cannot delete admin user' };
        }
        
        if (this.users[username]) {
            delete this.users[username];
            this.saveUsers();
            return { success: true };
        }
        return { success: false, error: 'User not found' };
    }

    resetUserPassword(username, newPassword) {
        if (!this.users[username]) {
            return { success: false, error: 'User not found' };
        }

        this.users[username].password = bcrypt.hashSync(newPassword, 10);
        this.saveUsers();
        return { success: true };
    }
}

export default new AuthManager();