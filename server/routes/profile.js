// server/routes/profile.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateEmail } from '../profile/email.js';
import { validateMobile, sendOtpSMS } from '../profile/sms.js';
import { requestMobileOTP, requestEmailOTP, verifyOTP } from '../profile/otp.js';
import { SECURITY_QUESTIONS, validateSecurityAnswers, hashSecurityAnswers, verifySecurityAnswer } from '../profile/security.js';
import auth from '../auth.js';
import userManager from '../userManager.js';

const router = express.Router();

// Get user profile
router.get('/profile', requireAuth, (req, res) => {
    const user = auth.getUser(req.session.user.username);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Don't send sensitive data
    const { password, ...safeUser } = user;
    res.json(safeUser);
});

// Update profile
router.put('/profile', requireAuth, async (req, res) => {
    const { fullName, mobile, email, securityQuestions } = req.body;
    const username = req.session.user.username;
    
    const user = auth.getUser(username);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Validate email if changing
    if (email && email !== user.email) {
        const emailValid = validateEmail(email);
        if (!emailValid.valid) {
            return res.status(400).json({ error: emailValid.error });
        }
        user.email = email;
    }
    
    // Validate mobile if changing
    if (mobile && mobile !== user.mobile) {
        const mobileValid = validateMobile(mobile);
        if (!mobileValid.valid) {
            return res.status(400).json({ error: mobileValid.error });
        }
        user.mobile = mobileValid.mobile;
    }
    
    // Update security questions
    if (securityQuestions) {
        const valid = validateSecurityAnswers(securityQuestions);
        if (!valid.valid) {
            return res.status(400).json({ error: valid.error });
        }
        user.securityQuestions = await hashSecurityAnswers(securityQuestions);
    }
    
    if (fullName) user.fullName = fullName;
    
    auth.saveUsers();
    res.json({ success: true, message: 'Profile updated' });
});

// Request OTP for password reset (via mobile)
router.post('/forgot-password/mobile', async (req, res) => {
    const { mobile } = req.body;
    
    // Check if user exists with this mobile
    const users = auth.getAllUsers();
    const user = Object.values(users).find(u => u.mobile === mobile);
    
    if (!user) {
        return res.status(404).json({ error: 'No account found with this mobile number' });
    }
    
    const result = await requestMobileOTP(mobile);
    res.json(result);
});

// Request OTP for password reset (via email)
router.post('/forgot-password/email', async (req, res) => {
    const { email } = req.body;
    
    const emailValid = validateEmail(email);
    if (!emailValid.valid) {
        return res.status(400).json({ error: emailValid.error });
    }
    
    // Check if user exists with this email
    const users = auth.getAllUsers();
    const user = Object.values(users).find(u => u.email === email);
    
    if (!user) {
        return res.status(404).json({ error: 'No account found with this email' });
    }
    
    const result = await requestEmailOTP(email);
    res.json(result);
});

// Verify OTP and reset password
router.post('/reset-password', async (req, res) => {
    const { identifier, otp, newPassword, type } = req.body;
    
    // Verify OTP
    const verifyResult = verifyOTP(identifier, otp, type);
    if (!verifyResult.success) {
        return res.status(400).json(verifyResult);
    }
    
    // Find user by mobile or email
    const users = auth.getAllUsers();
    let user = null;
    let username = null;
    
    if (type === 'mobile') {
        const userEntry = Object.entries(users).find(([_, u]) => u.mobile === identifier);
        if (userEntry) {
            [username, user] = userEntry;
        }
    } else {
        const userEntry = Object.entries(users).find(([_, u]) => u.email === identifier);
        if (userEntry) {
            [username, user] = userEntry;
        }
    }
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Reset password
    const result = auth.resetUserPassword(username, newPassword);
    res.json(result);
});

// Get security questions for user
router.post('/security-questions', async (req, res) => {
    const { username } = req.body;
    
    const user = auth.getUser(username);
    if (!user || !user.securityQuestions) {
        return res.status(404).json({ error: 'Security questions not set' });
    }
    
    // Return only questions (not answers)
    const questions = user.securityQuestions.map(q => q.question);
    res.json({ questions });
});

// Verify security answers
router.post('/verify-security', async (req, res) => {
    const { username, answers } = req.body;
    
    const user = auth.getUser(username);
    if (!user || !user.securityQuestions) {
        return res.status(404).json({ error: 'Security questions not set' });
    }
    
    // Verify each answer
    for (let i = 0; i < answers.length; i++) {
        const valid = await verifySecurityAnswer(
            user.securityQuestions[i].answer,
            answers[i].answer
        );
        if (!valid) {
            return res.status(400).json({ error: 'Incorrect answer' });
        }
    }
    
    // Generate temporary token for password reset
    const tempToken = crypto.randomBytes(32).toString('hex');
    // Store token temporarily (use Redis in production)
    
    res.json({ success: true, token: tempToken });
});

// Get all security questions (for dropdown)
router.get('/security-questions/list', (req, res) => {
    res.json(SECURITY_QUESTIONS);
});

export default router;