import express from 'express';
import payments from '../payments.js';
import userManager from '../userManager.js';

const router = express.Router();

router.get('/plans', (req, res) => {
    res.json({
        free: {
            scenes: 3,
            dna: 'basic',
            quality: 'standard',
            watermark: true,
            castMode: false
        },
        pro: {
            monthly: {
                price: 99,
                scenes: 'Unlimited',
                dna: 'advanced',
                quality: 'hd',
                watermark: false,
                castMode: true
            },
            yearly: {
                price: 999,
                scenes: 'Unlimited',
                dna: 'advanced',
                quality: 'hd',
                watermark: false,
                castMode: true,
                discount: '16% off'
            }
        }
    });
});

router.post('/create-payment', requireAuth, (req, res) => {
    const { plan } = req.body;
    const amount = plan === 'monthly' ? 99 : 999;
    
    const payment = payments.createPaymentLink(
        amount, 
        req.session.user.username,
        plan
    );
    
    res.json({
        ...payment,
        upi: payments.getUpiDetails(),
        instructions: [
            '1. Click payment link or scan QR code',
            '2. Complete payment via UPI/Card/NetBanking',
            '3. You\'ll be redirected back automatically',
            '4. Pro features activated instantly'
        ]
    });
});

router.get('/success', (req, res) => {
    const { user, payment_id, order_id } = req.query;
    
    if (user) {
        userManager.upgradeToPro(user, {
            paymentId: payment_id,
            orderId: order_id,
            date: new Date().toISOString()
        });
    }
    
    res.redirect('/?upgrade=success');
});

router.post('/webhook', (req, res) => {
    const { event, payload } = req.body;
    
    if (event === 'payment.captured') {
        const user = payload.payment.entity.notes?.username;
        if (user) {
            userManager.upgradeToPro(user, payload);
        }
    }
    
    res.json({ received: true });
});

function requireAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Please login first' });
    }
}

export default router;