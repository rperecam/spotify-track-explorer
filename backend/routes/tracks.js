const express = require('express');
const router = express.Router();
const {
  getTracks,
  getAllTracks, // Importado correctamente
  getTrackById,
  createTrack,
  updateTrack,
  deleteTrack
} = require('../controllers/tracksController');
const { protect, admin } = require('../middleware/auth');

// ==========================================
// Rutas Públicas
// ==========================================

// Obtener pistas con paginación y filtros (Búsqueda optimizada)
router.get('/', getTracks);

// Obtener TODAS las pistas (sin paginación)
// IMPORTANTE: Esta ruta debe ir ANTES de /:id
router.get('/all', getAllTracks);

// Obtener una pista específica por ID
router.get('/:id', getTrackById);

// ==========================================
// Rutas Protegidas (Admin)
// ==========================================
router.post('/', protect, admin, createTrack);
router.put('/:id', protect, admin, updateTrack);
router.delete('/:id', protect, admin, deleteTrack);

module.exports = router;