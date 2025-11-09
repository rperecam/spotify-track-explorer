const express = require('express');
const router = express.Router();
const {
  getTracks,
  getTrackById,
  createTrack,
  updateTrack,
  deleteTrack,
  getAllTracks // Asegúrate de que esta función esté importada
} = require('../controllers/tracksController');
const { protect, admin } = require('../middleware/auth');

// Rutas públicas
router.get('/', getTracks);
router.get('/all', getAllTracks); // Mueve esta ruta ANTES de /:id
router.get('/:id', getTrackById);

// Rutas protegidas (requieren autenticación y rol admin)
router.post('/', protect, admin, createTrack);
router.put('/:id', protect, admin, updateTrack);
router.delete('/:id', protect, admin, deleteTrack);

module.exports = router;
