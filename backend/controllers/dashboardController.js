const Track = require('../models/Track');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Public
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalTracks,
      avgMetrics,
      topArtist,
      topTracks,
      explicitStats
    ] = await Promise.all([
      // Total de pistas
      Track.countDocuments(),

      // Métricas promedio
      Track.aggregate([
        {
          $group: {
            _id: null,
            avgPopularity: { $avg: '$popularity' },
            avgDuration: { $avg: '$duration_ms' }
          }
        }
      ]),

      // Artista Top (por cantidad de tracks)
      Track.aggregate([
        {
          $group: {
            _id: '$artist_name',
            track_count: { $sum: 1 },
            avg_popularity: { $avg: '$popularity' }
          }
        },
        { $sort: { track_count: -1 } },
        { $limit: 1 },
        {
          $project: {
            artist_name: '$_id',
            track_count: 1,
            avg_popularity: 1,
            _id: 0
          }
        }
      ]),

      // Top 10 pistas más populares
      Track.find()
        .sort({ popularity: -1 })
        .limit(10)
        .select('name artist_name popularity genre'),

      // Estadísticas de contenido explícito
      Track.aggregate([
        {
          $facet: {
            explicit: [
              { $match: { explicit: true } },
              { $count: 'count' }
            ]
          }
        }
      ])
    ]);

    const explicitCount = explicitStats[0].explicit[0]?.count || 0;

    res.json({
      totalTracks,
      avgPopularity: Math.round(avgMetrics[0]?.avgPopularity || 0),
      avgDuration: Math.round((avgMetrics[0]?.avgDuration || 0) / 60000 * 10) / 10,
      topArtist: topArtist[0]?.artist_name || 'N/A',
      explicitCount,
      explicitPercentage: Math.round((explicitCount / totalTracks) * 100),
      topTracks: topTracks.map(track => ({
        id: track._id.toString(),
        name: track.name,
        artist_name: track.artist_name,
        popularity: track.popularity,
        genre: track.genre
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all tracks for dashboard analysis
// @route   GET /api/dashboard/all-tracks
// @access  Public
exports.getAllTracksForDashboard = async (req, res) => {
  try {
    const tracks = await Track.find()
      .select('popularity energy danceability valence duration_ms')
      .lean();

    res.json(
      tracks.map(track => ({
        id: track._id.toString(),
        popularity: track.popularity,
        energy: track.energy,
        danceability: track.danceability,
        valence: track.valence,
        duration_ms: track.duration_ms
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get explicit content statistics
// @route   GET /api/dashboard/explicit-stats
// @access  Public
exports.getExplicitStats = async (req, res) => {
  try {
    const [totalTracks, explicitCount] = await Promise.all([
      Track.countDocuments(),
      Track.countDocuments({ explicit: true })
    ]);

    res.json({
      totalTracks,
      explicitCount,
      explicitPercentage: Math.round((explicitCount / totalTracks) * 100)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get popularity distribution
// @route   GET /api/dashboard/popularity-distribution
// @access  Public
exports.getPopularityDistribution = async (req, res) => {
  try {
    const distribution = await Track.aggregate([
      {
        $group: {
          _id: '$popularity',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          popularity: '$_id',
          count: 1,
          _id: 0
        }
      },
      { $sort: { popularity: 1 } }
    ]);

    res.json(distribution);
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
          track_count: { $sum: 1 }
        }
      },
      { $sort: { track_count: -1 } },
      { $limit: 7 },
      {
        $project: {
          artist_name: '$_id',
          track_count: 1,
          _id: 0
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get genre statistics
// @route   GET /api/dashboard/genre-stats
// @access  Public
exports.getGenreStats = async (req, res) => {
  try {
    const stats = await Track.aggregate([
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 },
          avg_tempo: { $avg: '$tempo' },
          avg_energy: { $avg: '$energy' },
          avg_popularity: { $avg: '$popularity' },
          avg_danceability: { $avg: '$danceability' }
        }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          genre: '$_id',
          count: 1,
          avg_tempo: 1,
          avg_energy: 1,
          avg_popularity: 1,
          avg_danceability: 1,
          _id: 0
        }
      }
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
          total_count: { $sum: 1 },
          explicit_count: {
            $sum: { $cond: ['$explicit', 1, 0] }
          }
        }
      },
      {
        $project: {
          genre: '$_id',
          total_count: 1,
          explicit_count: 1,
          explicit_percentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ['$explicit_count', '$total_count'] },
                  100
                ]
              },
              2
            ]
          },
          _id: 0
        }
      },
      { $sort: { explicit_percentage: -1 } },
      { $limit: 5 }
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
    const tracks = await Track.find()
      .sort({ popularity: -1 })
      .limit(5)
      .select('name artist_name popularity genre');

    res.json(tracks.map(track => ({
      id: track._id.toString(),
      name: track.name,
      artist_name: track.artist_name,
      popularity: track.popularity,
      genre: track.genre
    })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
