// Authentication middleware
export function requireAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Please login first' });
    }
}

// Admin only middleware
export function requireAdmin(req, res, next) {
    if (req.session.user?.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
}

// Optional: Check if user is logged in (doesn't block, just adds user to req)
export function optionalAuth(req, res, next) {
    if (req.session.user) {
        req.user = req.session.user;
    }
    next();
}