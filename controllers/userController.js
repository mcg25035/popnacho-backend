const bcrypt = require('bcrypt');
const User = require('../models/user');

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword,
            joinTime: new Date()
        });

        await newUser.save();

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Registration failed' });
    }
};
