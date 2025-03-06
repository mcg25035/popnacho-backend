const User = require('../models/user');
const PopCount = require('../models/popCount');

exports.getLeaderboard = async (req, res) => {
    try {
        const topUsers = await PopCount.find()
            .sort({ count: -1 })
            .limit(100)
            .populate('user', 'username avatar');

        return res.json(topUsers);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to get leaderboard' });
    }
};

exports.getUserRank = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const userId = req.user.id;

        const userPopCount = await PopCount.findOne({ user: userId });
        if (!userPopCount) {
            return res.status(404).json({ message: 'User pop count not found' });
        }

        const rank = await PopCount.countDocuments({ count: { $gt: userPopCount.count } }) + 1;

        return res.json({ rank });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to get user rank' });
    }
};

exports.getNearbyUsers = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const userId = req.user.id;

        const userPopCount = await PopCount.findOne({ user: userId });
        if (!userPopCount) {
            return res.status(404).json({ message: 'User pop count not found' });
        }

        const rank = await PopCount.countDocuments({ count: { $gt: userPopCount.count } });

        const nearbyUsers = await PopCount.find()
            .sort({ count: -1 })
            .skip(Math.max(0, rank - 10))
            .limit(20)
            .populate('user', 'username avatar');

        return res.json(nearbyUsers);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to get nearby users' });
    }
};
