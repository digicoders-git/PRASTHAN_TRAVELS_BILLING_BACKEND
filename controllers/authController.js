const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const exists = await Admin.findOne({ email });
        
        if (exists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const admin = await Admin.create({
            name,
            email,
            password
        });

        if (admin) {
            res.status(201).json({
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                token: generateToken(admin._id)
            });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (admin && (await admin.matchPassword(password))) {
            res.json({
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                token: generateToken(admin._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getProfile = async (req, res) => {
    const admin = await Admin.findById(req.user._id).select('-password');
    res.json(admin);
};

const updateProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.user._id);

        if (admin) {
            admin.name = req.body.name || admin.name;
            admin.email = req.body.email || admin.email;
            
            if (req.body.password) {
                admin.password = req.body.password;
            }

            const updatedUser = await admin.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { registerAdmin, loginAdmin, getProfile, updateProfile };
