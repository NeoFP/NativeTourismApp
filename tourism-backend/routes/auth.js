const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// User Registration
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Force role to be 'user'
        const role = 'user';

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        user = new User({
            username,
            email,
            password: hashedPassword,
            role
        });

        await user.save();

        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// User Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Custom welcome messages based on role
        const welcomeMessage = user.role === 'admin' 
            ? {
                title: "Welcome back, Administrator!",
                message: "Your dashboard is ready for management.",
                features: [
                    "Manage user accounts",
                    "Monitor system activity",
                    "View analytics"
                ]
            }
            : {
                title: `Welcome back, ${user.username}!`,
                message: "Ready for your next adventure?",
                features: [
                    "Browse destinations",
                    "Book your stay",
                    "View your trips"
                ]
            };

        res.json({ 
            token,
            role: user.role,
            username: user.username,
            welcome: welcomeMessage
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 