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
          avg_tempo: { $avg: '$tempo' },
          avg_energy: { $avg: '$energy' },
          avg_popularity: { $avg: '$popularity' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          genre: '$_id',
          avg_tempo: 1,
          avg_energy: 1,
          avg_popularity: 1,
          count: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get artist statistics
// @route   GET /api/dashboard/artist-stats
// @access  Public
exports.getArtistStats = async (req, res) => {
  try {
    const stats = await Track.aggregate([
      {
        $group: {
          _id: '$artist_name',
          track_count: { $sum: 1 },
          avg_popularity: { $avg: '$popularity' }
        }
      },
      {
        $project: {
          artist_name: '$_id',
          track_count: 1,
          avg_popularity: 1,
          _id: 0
        }
      },
      { $sort: { avg_popularity: -1 } },
      { $limit: 20 }
    ]);

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get explicit content by genre
// @route   GET /api/dashboard/explicit-by-genre
// @access  Public
exports.getExplicitByGenre = async (req, res) => {
  try {
    const stats = await Track.aggregate([
      {
        $group: {
          _id: '$genre',
          explicit_count: {
            $sum: { $cond: ['$explicit', 1, 0] }
          },
          total_count: { $sum: 1 }
        }
      },
      {
        $project: {
          genre: '$_id',
          explicit_count: 1,
          total_count: 1,
          explicit_percentage: {
            $multiply: [
              { $divide: ['$explicit_count', '$total_count'] },
              100
            ]
          },
          _id: 0
        }
      },
      { $sort: { explicit_percentage: -1 } }
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
      .select('name artist_name popularity genre');

    res.json(tracks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
