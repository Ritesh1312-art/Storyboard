import dotenv from 'dotenv';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import CryptoJS from 'crypto-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ConfigManager {
    constructor() {
        this.configFile = path.join(__dirname, 'config.enc');
        this.envFile = path.join(__dirname, '..', '.env');
        this.encryptionKey = process.env.ENCRYPTION_KEY || 'defaultkey123456789012345678901234';
        this.config = this.loadConfig();
    }

    loadConfig() {
        try {
            if (fs.existsSync(this.configFile)) {
                const encrypted = fs.readFileSync(this.configFile, 'utf8');
                const bytes = CryptoJS.AES.decrypt(encrypted, this.encryptionKey);
                const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                if (decrypted) {
                    return JSON.parse(decrypted);
                }
            }
        } catch (error) {
            console.error('Error loading config:', error);
        }

        // Default config
        return {
            geminiApiKey: process.env.GEMINI_API_KEY || '',
            userPassword: '1111',
            adminPassword: 'admin123',
            models: {
                analysis: 'gemini-2.0-flash-exp',
                image: 'gemini-2.0-flash-exp-image-generation',
                tts: 'gemini-2.0-flash-exp'
            },
            settings: {
                maxScenes: 60,
                maxRetries: 60,
                retryDelay: 15000,
                enableVideo: false
            }
        };
    }

    saveConfig() {
        try {
            const encrypted = CryptoJS.AES.encrypt(
                JSON.stringify(this.config, null, 2),
                this.encryptionKey
            ).toString();
            fs.writeFileSync(this.configFile, encrypted);
            
            if (this.config.geminiApiKey !== process.env.GEMINI_API_KEY) {
                this.updateEnvFile('GEMINI_API_KEY', this.config.geminiApiKey);
            }
            return true;
        } catch (error) {
            console.error('Error saving config:', error);
            return false;
        }
    }

    updateEnvFile(key, value) {
        try {
            let envContent = '';
            if (fs.existsSync(this.envFile)) {
                envContent = fs.readFileSync(this.envFile, 'utf8');
            }
            
            const regex = new RegExp(`^${key}=.*`, 'm');
            if (envContent.match(regex)) {
                envContent = envContent.replace(regex, `${key}=${value}`);
            } else {
                envContent += `\n${key}=${value}`;
            }
            
            fs.writeFileSync(this.envFile, envContent);
            process.env[key] = value;
        } catch (error) {
            console.error('Error updating .env file:', error);
        }
    }

    get(key) {
        return key.split('.').reduce((obj, k) => obj?.[k], this.config);
    }

    set(key, value) {
        const keys = key.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, k) => {
            if (!obj[k]) obj[k] = {};
            return obj[k];
        }, this.config);
        
        target[lastKey] = value;
        return this.saveConfig();
    }

    validateAdminPassword(password) {
        return password === this.config.adminPassword;
    }

    validateUserPassword(password) {
        return password === this.config.userPassword;
    }

    updateUserPassword(newPassword) {
        this.config.userPassword = newPassword;
        return this.saveConfig();
    }

    updateAdminPassword(newPassword) {
        this.config.adminPassword = newPassword;
        return this.saveConfig();
    }

    updateGeminiApiKey(newKey) {
        this.config.geminiApiKey = newKey;
        return this.saveConfig();
    }
}

export default new ConfigManager();