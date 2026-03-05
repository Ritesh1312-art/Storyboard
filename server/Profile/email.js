// server/profile/email.js
import nodemailer from 'nodemailer';

// List of temporary email domains (block these)
const TEMP_EMAIL_DOMAINS = [
    'tempmail.com', 'temp-mail.org', 'guerrillamail.com', '10minutemail.com',
    'mailinator.com', 'yopmail.com', 'throwawaymail.com', 'trashmail.com',
    'fakeinbox.com', 'maildrop.cc', 'getnada.com', 'tmpmail.net',
    'tempemail.net', 'disposablemail.com', 'spamgourmet.com'
];

// Allowed email providers
const ALLOWED_EMAIL_PROVIDERS = [
    'gmail.com', 'googlemail.com',  // Google
    'outlook.com', 'hotmail.com', 'live.com', 'msn.com',  // Microsoft
    'yahoo.com', 'yahoo.co.in',  // Yahoo
    'rediffmail.com', 'rediff.com',  // Rediff
    'aol.com',  // AOL
    'protonmail.com', 'proton.me',  // Proton
    'icloud.com', 'me.com',  // Apple
    'zoho.com',  // Zoho
    'yandex.com', 'yandex.ru'  // Yandex
];

export function validateEmail(email) {
    const domain = email.split('@')[1]?.toLowerCase();
    
    // Check if it's a temporary email
    if (TEMP_EMAIL_DOMAINS.includes(domain)) {
        return { valid: false, error: 'Temporary email not allowed. Use genuine email like Gmail, Outlook, etc.' };
    }
    
    // Optional: Strict mode - only allow specific providers
    // if (!ALLOWED_EMAIL_PROVIDERS.includes(domain)) {
    //     return { valid: false, error: 'Only Gmail, Outlook, Yahoo, and other major providers allowed' };
    // }
    
    return { valid: true };
}

// Email sending configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export async function sendEmail(to, subject, html) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        };
        
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email sending error:', error);
        return { success: false, error: error.message };
    }
}

// Welcome email template
export function getWelcomeEmail(username) {
    return `
        <h2>Welcome to StoryBoard Pro!</h2>
        <p>Hi ${username},</p>
        <p>Thank you for registering with StoryBoard Pro. Your account has been successfully created.</p>
        <p>You can now:</p>
        <ul>
            <li>Create up to 3 free storyboards</li>
            <li>Use basic DNA system</li>
            <li>Export with watermark</li>
        </ul>
        <p>Upgrade to Pro for unlimited access!</p>
        <br>
        <p>Happy Storyboarding!</p>
        <p>Team StoryBoard Pro</p>
    `;
}

// OTP email template
export function getOtpEmail(otp) {
    return `
        <h2>Password Reset OTP</h2>
        <p>Your OTP for password reset is:</p>
        <h1 style="font-size: 32px; color: #6366f1; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
    `;
}