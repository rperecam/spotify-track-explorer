// backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

/**
 * @openapi
 * /dashboard/genre-stats:
 *   get:
 *     summary: Estadísticas por género
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Estadísticas por género
 */
router.get('/genre-stats', dashboardController.getGenreStats);

/**
 * @openapi
 * /dashboard/top-popular:
 *   get:
 *     summary: Top pistas populares
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Lista de pistas populares
 */
router.get('/top-popular', dashboardController.getTopPopular);

/**
 * @openapi
 * /dashboard/artist-stats:
 *   get:
 *     summary: Estadísticas de artistas
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Estadísticas de artistas
 */
router.get('/artist-stats', dashboardController.getArtistStats);

/**
 * @openapi
 * /dashboard/explicit-by-genre:
 *   get:
 *     summary: Contenido explícito por género
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Datos de explícitos por género
 */
router.get('/explicit-by-genre', dashboardController.getExplicitByGenre);

/**
 * @openapi
 * /dashboard/explicit-stats:
 *   get:
 *     summary: Estadísticas de contenido explícito
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Estadísticas de explícitos
 */
router.get('/explicit-stats', dashboardController.getExplicitStats);

/**
 * @openapi
 * /dashboard/popularity-distribution:
 *   get:
 *     summary: Distribución de popularidad
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Distribución de popularidad
 */
router.get('/popularity-distribution', dashboardController.getPopularityDistribution);

module.exports = router;
