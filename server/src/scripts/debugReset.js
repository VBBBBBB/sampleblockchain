const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log('Connected to DB...');

        // Delete existing
        await User.deleteMany({ username: 'admin' });

        // Manually hash password to be absolutely sure
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Create Admin (Govt) bypasses pre-save hook for this test
        // We use insertOne to avoid the pre-save hook potentially re-hashing
        const admin = new User({
            username: 'admin',
            password: hashedPassword, // Manually hashed
            role: 'Govt'
        });

        // We use save() but we need to make sure pre-save doesn't double hash
        // In our model: if (!this.isModified('password')) return next();
        // Since it's new, it is modified. So let's rely on the pre-save hook being CORRECT.
        // Or, disabling the hook? No, let's fix the model logically.

        // actually, let's just use the model's create method, which triggers the hook.
        // If the hook is broken, we fix the hook.

        const user = await User.create({
            username: 'admin',
            password: 'password123',
            role: 'Govt'
        });

        console.log(`✅ Created User: ${user.username}`);
        console.log(`🔑 Stored Hash: ${user.password}`);

        // Verify immediately
        const isMatch = await bcrypt.compare('password123', user.password);
        console.log(`🔍 Immediate Verification: ${isMatch ? 'SUCCESS' : 'FAILED'}`);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetUser();
