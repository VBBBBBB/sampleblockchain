const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        if (token === 'null' || !token) {
            return res.status(401).json({ success: false, error: 'Not authorized, please log out and back in.' });
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ success: false, error: 'User identity changed. Please log out and log back in.' });
            }
            next();
        } catch (error) {
            console.error("Token Error:", error.message);
            res.status(401).json({ success: false, error: `Token failed: ${error.message}` });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, error: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, error: `User role ${req.user.role} is not authorized` });
        }
        next();
    };
};

module.exports = { protect, authorize };
