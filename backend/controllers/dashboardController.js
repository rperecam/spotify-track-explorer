const Track = require('../models/Track');

// @desc    Get genre statistics
// @route   GET /api/dashboard/genre-stats
// @access  Public
exports.getGenreStats = async (req, res) => {
  try {
    const stats = await Track.aggregate([
      {
        $group: {
          _id: '$genre',
          genre: { $first: '$genre' },
          track_count: { $sum: 1 },
          avg_tempo: { $avg: '$tempo' },
          avg_energy: { $avg: '$energy' },
          avg_popularity: { $avg: '$popularity' }
        }
      },
      {
        $sort: { track_count: -1 }
      }
    ]);

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get top popular tracks
// @route   GET /api/dashboard/top-popular
// @access  Public
exports.getTopPopular = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const tracks = await Track.find()
      .sort({ popularity: -1 })
      .limit(limit)
      .select('name artist_name popularity genre year');

    res.json(tracks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
