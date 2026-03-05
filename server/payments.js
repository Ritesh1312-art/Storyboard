import crypto from 'crypto';

class PaymentManager {
    constructor() {
        this.razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_xxxx';
        this.razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'test_secret';
    }

    createPaymentLink(amount, username, planType) {
        const paymentData = {
            amount: amount * 100,
            currency: 'INR',
            description: `StoryBoard Pro - ${planType}`,
            customer: {
                name: username
            },
            notify: {
                email: true,
                sms: false
            },
            reminder_enable: true,
            callback_url: `http://localhost:3000/payment/success?user=${username}`,
            callback_method: 'get'
        };

        const signature = crypto
            .createHmac('sha256', this.razorpayKeySecret)
            .update(JSON.stringify(paymentData))
            .digest('hex');

        return {
            link: `https://rzp.io/l/storyboard-pro?amount=${amount}`,
            orderId: 'order_' + Date.now(),
            signature
        };
    }

    getUpiDetails() {
        return {
            upiId: 'storyboard@okhdfcbank',
            name: 'StoryBoard Pro',
            qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...' // Base64 QR code
        };
    }

    verifyPayment(orderId, paymentId, signature) {
        const body = orderId + '|' + paymentId;
        const expectedSignature = crypto
            .createHmac('sha256', this.razorpayKeySecret)
            .update(body)
            .digest('hex');
        
        return expectedSignature === signature;
    }
}

export default new PaymentManager();