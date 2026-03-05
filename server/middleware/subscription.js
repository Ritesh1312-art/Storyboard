import userManager from '../userManager.js';

export function checkSubscription(req, res, next) {
    const user = req.session.user;
    
    if (!user) {
        return res.status(401).json({ error: 'Please login first' });
    }

    if (!userManager.canGenerateScene(user.username)) {
        return res.status(402).json({
            error: 'Free limit reached. Please upgrade to pro.',
            upgrade: true,
            remaining: 0,
            plans: {
                monthly: { price: 99, scenes: 'Unlimited' },
                yearly: { price: 999, scenes: 'Unlimited' }
            }
        });
    }

    req.userFeatures = {
        watermark: userManager.checkWatermark(user.username),
        quality: userManager.getImageQuality(user.username),
        dna: userManager.getDnaFeatures(user.username),
        remaining: userManager.getRemainingScenes(user.username)
    };

    next();
}

export function incrementCounter(req, res, next) {
    const oldJson = res.json;
    
    res.json = function(data) {
        if (res.statusCode === 200) {
            userManager.incrementSceneCount(req.session.user.username);
        }
        return oldJson.call(this, data);
    };
    
    next();
}