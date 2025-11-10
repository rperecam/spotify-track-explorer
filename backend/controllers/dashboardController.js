const Track = require('../models/Track');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Public
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalTracks,
      avgMetrics,
      genreStats,
      artistStats,
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
            avgDuration: { $avg: '$duration_ms' },
            avgEnergy: { $avg: '$energy' },
            avgDanceability: { $avg: '$danceability' },
            avgTempo: { $avg: '$tempo' }
          }
        }
      ]),

      // Estadísticas por género (top 10)
      Track.aggregate([
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
        { $limit: 10 },
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
      ]),

      // Estadísticas por artista (top 10)
      Track.aggregate([
        {
          $group: {
            _id: '$artist_name',
            track_count: { $sum: 1 },
            avg_popularity: { $avg: '$popularity' }
          }
        },
        { $sort: { avg_popularity: -1 } },
        { $limit: 10 },
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
            ],
            byGenre: [
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
                    $multiply: [
                      { $divide: ['$explicit_count', '$total_count'] },
                      100
                    ]
                  },
                  _id: 0
                }
              },
              { $sort: { explicit_percentage: -1 } },
              { $limit: 5 }
            ]
          }
        }
      ])
    ]);

    const explicitCount = explicitStats[0].explicit[0]?.count || 0;
    const explicitByGenre = explicitStats[0].byGenre;

    res.json({
      totalTracks,
      totalGenres: genreStats.length,
      avgPopularity: Math.round(avgMetrics[0]?.avgPopularity || 0),
      avgDuration: Math.round((avgMetrics[0]?.avgDuration || 0) / 60000 * 10) / 10,
      avgEnergy: Math.round((avgMetrics[0]?.avgEnergy || 0) * 100),
      avgDanceability: Math.round((avgMetrics[0]?.avgDanceability || 0) * 100),
      avgTempo: Math.round(avgMetrics[0]?.avgTempo || 0),
      explicitCount,
      explicitPercentage: Math.round((explicitCount / totalTracks) * 100),
      topGenreByPopularity: genreStats[0]?.genre || 'N/A',
      stats: genreStats,
      artistStats,
      topTracks: topTracks.map(track => ({
        id: track._id.toString(),
        name: track.name,
        artist_name: track.artist_name,
        popularity: track.popularity,
        genre: track.genre
      })),
      explicitByGenre
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get all tracks for dashboard
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

// @desc    Get top popular tracks
// @route   GET /api/dashboard/top-popular
// @access  Public
exports.getTopPopular = async (req, res) => {
  try {
    const tracks = await Track.find()
      .sort({ popularity: -1 })
      .limit(10)
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
      { $sort: { avg_popularity: -1 } },
      { $limit: 7 },
      {
        $project: {
          artist_name: '$_id',
          track_count: 1,
          avg_popularity: 1,
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
      { $limit: 10 }
    ]);

    res.json(stats);
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
