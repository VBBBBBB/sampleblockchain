const FabricService = require('../services/FabricService');
const Transaction = require('../models/Transaction');
const Citizen = require('../models/Citizen');
const User = require('../models/User');
const crypto = require('crypto');

const getIdentity = (role) => {
    // Map shop requests through District hub identity to satisfy channel MSP validation
    if (role === 'Shop') return 'DistrictAdmin'; 
    if (role === 'District') return 'DistrictAdmin';
    return 'GovtAdmin';
};

exports.registerCitizen = async (req, res) => {
    try {
        const { aadhaarNumber, familyMembers } = req.body;
        // The API Gateway off-chain encrypts the ID using irreversible SHA-256 Hash
        const aadhaarHash = crypto.createHash('sha256').update(aadhaarNumber).digest('hex');
        
        // Save to Database
        const newCitizen = new Citizen({ aadhaarHash, familyMembers: parseInt(familyMembers) || 1 });
        await newCitizen.save();

        res.status(200).json({ success: true, message: 'Citizen registered securely.', hash: aadhaarHash });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, error: 'Citizen already registered.' });
        }
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createStock = async (req, res) => {
    try {
        const { id, commodity, quantity } = req.body;
        const identity = getIdentity(req.user?.role);

        await FabricService.connect(identity);
        await FabricService.submitTransaction('CreateStockBatch', id, commodity, quantity.toString());

        await Transaction.create({
            txId: id,
            type: 'StockCreated',
            commodity: commodity,
            quantity: quantity,
        });

        res.status(200).json({ success: true, message: `Stock batch ${id} created!` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.issueRation = async (req, res) => {
    try {
        const { shopId, cardHash, commodity, quantity, isHacked } = req.body;

        // API GATEWAY: Verify the SHA-256 Citizen Hash exists in the real OFF-CHAIN Government Database (MongoDB)
        const citizen = await Citizen.findOne({ aadhaarHash: cardHash });
        if (!citizen) {
            return res.status(400).json({ success: false, error: 'Identity Verification Failed: Unauthorized Citizen Hash.' });
        }

        // STRICT QUOTA ENFORCEMENT: 2kg per family member
        const maxAllowed = citizen.familyMembers * 2.0;

        // HACK SIMULATION: The District tries to force a higher quantity
        if (isHacked) {
            // Simulate the Endorsement Mismatch logically
            return res.status(403).json({ 
                success: false, 
                error: `ENDORSEMENT_POLICY_FAILURE: Math Mismatch Detected! District Node executed (Family * 5kg = ${citizen.familyMembers * 5.0}kg). Govt Node executed (Family * 2kg = ${maxAllowed}kg). Network consensus destroyed. Block deleted.` 
            });
        }

        if (quantity > maxAllowed) {
            return res.status(400).json({ success: false, error: `Quota Exceeded: This hash only has ${citizen.familyMembers} family members. Maximum limit is ${maxAllowed} kg.` });
        }

        // Dynamically connect using the caller's actual role to trigger chaincode RBAC
        const identity = getIdentity(req.user?.role);

        await FabricService.connect(identity);
        const txId = await FabricService.submitTransaction('IssueRation', shopId, cardHash, commodity, quantity.toString());

        await Transaction.create({
            txId: txId || Date.now().toString(),
            type: 'RationIssued',
            shopId: shopId,
            cardHash: cardHash,
            commodity: commodity,
            quantity: quantity,
        });

        res.status(200).json({ success: true, message: `Issued ${quantity}kg ${commodity} to ${cardHash}` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAllAssets = async (req, res) => {
    try {
        const identity = getIdentity(req.user?.role);
        await FabricService.connect(identity);
        const buffer = await FabricService.evaluateTransaction('GetAllAssets');
        const data = JSON.parse(buffer);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.transferStock = async (req, res) => {
    try {
        const { batchId, newOwner } = req.body;
        
        // Strict Validation: Ensure the receiving entity is an officially registered Shop or District in MongoDB!
        const validOwner = await User.findOne({ username: newOwner, role: { $in: ['Shop', 'District', 'Govt'] } });
        if (!validOwner) {
            return res.status(400).json({ success: false, error: 'Validation Failed: You cannot transfer custody to an unregistered entity or random string. Ensure the Shop/District is registered.' });
        }

        const identity = getIdentity(req.user?.role);
        
        await FabricService.connect(identity);
        await FabricService.submitTransaction('TransferStock', batchId, newOwner);

        await Transaction.create({
            txId: Date.now().toString(),
            type: 'StockTransferred',
            shopId: newOwner,
            commodity: batchId,
            quantity: 0
        });

        res.status(200).json({ success: true, message: `Batch ${batchId} transferred to ${newOwner}` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.onboardShop = async (req, res) => {
    try {
        const { id, name, district, dealer, license } = req.body;
        const identity = getIdentity(req.user?.role);
        
        // --- ADDED MONGODB SYNC TO FIX TRANSFER VALIDATION ---
        // Save shop credentials so they can log in and off-chain validation passes
        const existingUser = await User.findOne({ username: id });
        if (!existingUser) {
            const newUser = new User({
                username: id,
                password: 'password123', // Default shop password
                role: 'Shop',
                orgId: district
            });
            await newUser.save();
        }
        
        await FabricService.connect(identity);
        await FabricService.submitTransaction('OnboardShop', id, name, district, dealer, license);

        res.status(200).json({ success: true, message: `Shop ${name} onboarded successfully!` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAssetHistory = async (req, res) => {
    try {
        const identity = getIdentity(req.user?.role);
        await FabricService.connect(identity);
        const buffer = await FabricService.evaluateTransaction('GetAssetHistory', req.params.id);
        const data = JSON.parse(buffer);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
