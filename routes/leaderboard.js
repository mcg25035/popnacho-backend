const express = require('express');
const leaderboardController = require('../controllers/leaderboardController');

const router = express.Router();

router.get('/', leaderboardController.getLeaderboard);
router.get('/user/rank', leaderboardController.getUserRank);
router.get('/user/rank/nearby', leaderboardController.getNearbyUsers);

module.exports = router;
