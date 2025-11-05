const Track = require('../models/Track');

// @desc    Get all tracks with filters
// @route   GET /api/tracks
// @access  Public
exports.getTracks = async (req, res) => {
  try {
    const { 
      search, 
      energy_min, 
      energy_max, 
      danceability_min, 
      danceability_max,
      popularity_min,
      popularity_max,
      limit = 50,
      page = 1
    } = req.query;

    let query = {};

    // Text search (simulates MongoDB $text search)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { artist_name: { $regex: search, $options: 'i' } }
      ];
    }

    // Numeric range filters
    if (energy_min || energy_max) {
      query.energy = {};
      if (energy_min) query.energy.$gte = parseFloat(energy_min);
      if (energy_max) query.energy.$lte = parseFloat(energy_max);
    }

    if (danceability_min || danceability_max) {
      query.danceability = {};
      if (danceability_min) query.danceability.$gte = parseFloat(danceability_min);
      if (danceability_max) query.danceability.$lte = parseFloat(danceability_max);
    }

    if (popularity_min || popularity_max) {
      query.popularity = {};
      if (popularity_min) query.popularity.$gte = parseInt(popularity_min);
      if (popularity_max) query.popularity.$lte = parseInt(popularity_max);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tracks = await Track.find(query)
      .sort({ popularity: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Track.countDocuments(query);

    res.json({
      tracks,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single track
// @route   GET /api/tracks/:id
// @access  Public
exports.getTrack = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    res.json(track);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create new track
// @route   POST /api/tracks
// @access  Private/Admin
exports.createTrack = async (req, res) => {
  try {
    const track = await Track.create(req.body);
    res.status(201).json(track);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// @desc    Update track
// @route   PUT /api/tracks/:id
// @access  Private/Admin
exports.updateTrack = async (req, res) => {
  try {
    const track = await Track.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    res.json(track);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// @desc    Delete track
// @route   DELETE /api/tracks/:id
// @access  Private/Admin
exports.deleteTrack = async (req, res) => {
  try {
    const track = await Track.findByIdAndDelete(req.params.id);

    if (!track) {
      return res.status(404).json({ error: 'Track not found' });
    }

    res.json({ message: 'Track deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
