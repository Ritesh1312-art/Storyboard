// server/profile/sms.js
import twilio from 'twilio'; // npm install twilio

// Initialize Twilio (you'll need to sign up at twilio.com)
const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// Indian mobile number validation
export function validateMobile(mobile) {
    // Indian mobile number validation
    const mobileRegex = /^[6-9]\d{9}$/; // 10 digits, starting with 6-9
    
    if (!mobileRegex.test(mobile)) {
        return { valid: false, error: 'Invalid Indian mobile number. Must be 10 digits starting with 6-9' };
    }
    
    return { valid: true, mobile: '+91' + mobile };
}

// Send OTP via SMS
export async function sendOtpSMS(mobile, otp) {
    try {
        // For development/testing - just log
        if (process.env.NODE_ENV === 'development') {
            console.log(`📱 OTP for ${mobile}: ${otp}`);
            return { success: true };
        }
        
        // For production with Twilio
        if (!client) {
            throw new Error('SMS service not configured');
        }
        
        await client.messages.create({
            body: `Your StoryBoard Pro OTP is: ${otp}. Valid for 10 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: mobile
        });
        
        return { success: true };
    } catch (error) {
        console.error('SMS sending error:', error);
        return { success: false, error: error.message };
    }
}

// Alternative: Use MSG91 (Indian service - cheaper)
// npm install msg91
export async function sendOtpMSG91(mobile, otp) {
    // MSG91 integration code here
    // This is cheaper for Indian numbers
}