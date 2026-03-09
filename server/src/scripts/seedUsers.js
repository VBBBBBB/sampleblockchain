const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log('Connected to DB...');

        // Clear existing
        await User.deleteMany();

        // Create Admin (Govt)
        const admin = new User({
            username: 'admin',
            password: 'password123',
            role: 'Govt'
        });
        await admin.save();
        console.log('✅ Created Govt Admin: admin / password123');

        // Create Shop (Shop)
        const shop = new User({
            username: 'shop',
            password: 'password123',
            role: 'Shop'
        });
        await shop.save();
        console.log('✅ Created Shop Dealer: shop / password123');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedUsers();
