// server/profile/otp.js
import crypto from 'crypto';
import { sendOtpSMS } from './sms.js';
import { sendEmail, getOtpEmail } from './email.js';

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

// Generate 6-digit OTP
export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP to mobile
export async function requestMobileOTP(mobile) {
    // Validate mobile
    const validation = validateMobile(mobile);
    if (!validation.valid) {
        return { success: false, error: validation.error };
    }
    
    const formattedMobile = validation.mobile;
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // Store OTP
    otpStore.set(`mobile:${formattedMobile}`, {
        otp,
        expiresAt,
        attempts: 0
    });
    
    // Auto cleanup after 10 minutes
    setTimeout(() => {
        otpStore.delete(`mobile:${formattedMobile}`);
    }, 10 * 60 * 1000);
    
    // Send SMS
    const result = await sendOtpSMS(formattedMobile, otp);
    
    if (result.success) {
        return { success: true, message: 'OTP sent successfully' };
    } else {
        return { success: false, error: 'Failed to send OTP' };
    }
}

// Send OTP to email
export async function requestEmailOTP(email) {
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    
    otpStore.set(`email:${email}`, {
        otp,
        expiresAt,
        attempts: 0
    });
    
    setTimeout(() => {
        otpStore.delete(`email:${email}`);
    }, 10 * 60 * 1000);
    
    const result = await sendEmail(email, 'Password Reset OTP', getOtpEmail(otp));
    
    if (result.success) {
        return { success: true, message: 'OTP sent to email' };
    } else {
        return { success: false, error: 'Failed to send email' };
    }
}

// Verify OTP
export function verifyOTP(identifier, otp, type = 'mobile') {
    const key = `${type}:${identifier}`;
    const record = otpStore.get(key);
    
    if (!record) {
        return { success: false, error: 'OTP expired or not requested' };
    }
    
    // Check attempts
    record.attempts++;
    if (record.attempts > 3) {
        otpStore.delete(key);
        return { success: false, error: 'Too many attempts. Request new OTP.' };
    }
    
    // Check expiry
    if (Date.now() > record.expiresAt) {
        otpStore.delete(key);
        return { success: false, error: 'OTP expired' };
    }
    
    // Verify OTP
    if (record.otp !== otp) {
        return { success: false, error: 'Invalid OTP' };
    }
    
    // Success - delete OTP
    otpStore.delete(key);
    return { success: true };
}