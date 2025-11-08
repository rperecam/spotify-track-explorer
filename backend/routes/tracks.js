const express = require('express');
const router = express.Router();
const {
  getTracks,
  getAllTracks,
  getTrack,
  createTrack,
  updateTrack,
  deleteTrack
} = require('../controllers/tracksController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getTracks);
router.get('/all', getAllTracks);
router.get('/:id', getTrack);
router.post('/', protect, admin, createTrack);
router.put('/:id', protect, admin, updateTrack);
router.delete('/:id', protect, admin, deleteTrack);

module.exports = router;
