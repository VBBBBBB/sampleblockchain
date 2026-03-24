const mongoose = require('mongoose');

const CitizenSchema = new mongoose.Schema({
    aadhaarHash: { 
        type: String, 
        required: true, 
        unique: true 
    },
    familyMembers: {
        type: Number,
        required: true,
        default: 1
    },
    registeredAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Citizen', CitizenSchema);
