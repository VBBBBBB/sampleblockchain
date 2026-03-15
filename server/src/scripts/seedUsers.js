const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' }); // Adjusted for running from server root or scripts dir

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
        
        // Create District (Regional)
        const district = new User({
            username: 'district_01',
            password: 'password123',
            role: 'District'
        });
        await district.save();
        console.log('✅ Created District Hub: district_01 / password123');

        // Create Shop (Shop)
        const shop = new User({
            username: 'shop_01',
            password: 'password123',
            role: 'Shop'
        });
        await shop.save();
        console.log('✅ Created Shop Dealer: shop_01 / password123');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedUsers();
