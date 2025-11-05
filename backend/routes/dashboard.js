const express = require('express');
const router = express.Router();
const { getGenreStats, getTopPopular } = require('../controllers/dashboardController');

router.get('/genre-stats', getGenreStats);
router.get('/top-popular', getTopPopular);

module.exports = router;
