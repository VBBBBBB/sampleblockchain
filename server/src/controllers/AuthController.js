const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'your_secret_key', {
        expiresIn: '30d',
    });
};

exports.register = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const userExists = await User.findOne({ username });

        if (userExists) {
            res.status(400).json({ success: false, error: 'User already exists' });
        }

        const user = await User.create({ username, password, role });
        res.status(201).json({
            success: true,
            id: user._id,
            username: user.username,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (user && (await user.matchPassword(password))) {
            res.json({
                success: true,
                id: user._id,
                username: user.username,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
