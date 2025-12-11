// backend/routes/tracks.js
const express = require('express');
const router = express.Router();
const {
  getTracks,
  getAllTracks,
  getTrackById,
  createTrack,
  updateTrack,
  deleteTrack
} = require('../controllers/tracksController');
const { protect, admin } = require('../middleware/auth');

/**
 * @openapi
 * /tracks:
 *   get:
 *     summary: Listar pistas con filtros y paginación
 *     tags:
 *       - Tracks
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista paginada de pistas
 */
router.get('/', getTracks);

/**
 * @openapi
 * /tracks/all:
 *   get:
 *     summary: Obtener todas las pistas (limitado internamente)
 *     tags:
 *       - Tracks
 *     responses:
 *       200:
 *         description: Lista de pistas
 */
router.get('/all', getAllTracks);

/**
 * @openapi
 * /tracks/{id}:
 *   get:
 *     summary: Obtener pista por ID
 *     tags:
 *       - Tracks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pista encontrada
 *       404:
 *         description: Pista no encontrada
 */
router.get('/:id', getTrackById);

/**
 * @openapi
 * /tracks:
 *   post:
 *     summary: Crear una nueva pista
 *     tags:
 *       - Tracks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Pista creada
 *       401:
 *         description: No autorizado
 */
router.post('/', protect, admin, createTrack);

/**
 * @openapi
 * /tracks/{id}:
 *   put:
 *     summary: Actualizar una pista
 *     tags:
 *       - Tracks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pista actualizada
 *       404:
 *         description: Pista no encontrada
 */
router.put('/:id', protect, admin, updateTrack);

/**
 * @openapi
 * /tracks/{id}:
 *   delete:
 *     summary: Eliminar una pista
 *     tags:
 *       - Tracks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pista eliminada
 *       404:
 *         description: Pista no encontrada
 */
router.delete('/:id', protect, admin, deleteTrack);

module.exports = router;
