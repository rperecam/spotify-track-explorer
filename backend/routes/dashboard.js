const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/genre-stats', dashboardController.getGenreStats);
router.get('/top-popular', dashboardController.getTopPopular);
router.get('/artist-stats', dashboardController.getArtistStats);
router.get('/explicit-by-genre', dashboardController.getExplicitByGenre);

module.exports = router;
