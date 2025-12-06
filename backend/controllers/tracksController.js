const Track = require('../models/Track');

// Función auxiliar para mapear _id a id
const mapTrackResponse = (track) => {
  // Al usar .lean(), track no tiene métodos, es un POJO (Plain Old JS Object)
  return {
    ...track,
    id: track._id ? track._id.toString() : track.id,
    artist_name: Array.isArray(track.artist_name)
      ? track.artist_name
      : track.artist_name
  };
};

// @desc    Get all tracks without pagination (Optimized for internal use/lists)
exports.getAllTracks = async (req, res) => {
  try {
    // Limitamos a 2000 para seguridad y usamos lean() para rendimiento
    const tracks = await Track.find()
      .sort({ popularity: -1 })
      .limit(2000)
      .lean();

    res.json(tracks.map(mapTrackResponse));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get tracks with Atlas Search (Hybrid) & Pagination
// @route   GET /api/tracks
exports.getTracks = async (req, res) => {
  try {
    const {
      search,
      energy_min, energy_max,
      danceability_min, danceability_max,
      popularity_min, popularity_max,
      page = 1, limit = 50
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Valores por defecto para lógica de filtrado
    const defaults = { eMin: 0, eMax: 1, dMin: 0, dMax: 1, pMin: 0, pMax: 100 };

    // Parseo seguro
    const eMin = parseFloat(energy_min) ?? 0;
    const eMax = parseFloat(energy_max) ?? 1;
    const dMin = parseFloat(danceability_min) ?? 0;
    const dMax = parseFloat(danceability_max) ?? 1;
    const pMin = parseInt(popularity_min) ?? 0;
    const pMax = parseInt(popularity_max) ?? 100;

    let pipeline = [];

    // =================================================================================
    // CASO A: BÚSQUEDA HÍBRIDA (Texto + Filtros Atlas)
    // =================================================================================
    if (search) {
      // 1. Construir cláusulas de filtro para Atlas Search
      const filterClauses = [];

      // Solo agregamos filtros si los valores difieren de los defaults (Optimización)
      if (eMin > defaults.eMin || eMax < defaults.eMax) {
        filterClauses.push({ range: { path: "energy", gte: eMin, lte: eMax } });
      }
      if (dMin > defaults.dMin || dMax < defaults.dMax) {
        filterClauses.push({ range: { path: "danceability", gte: dMin, lte: dMax } });
      }
      if (pMin > defaults.pMin || pMax < defaults.pMax) {
        filterClauses.push({ range: { path: "popularity", gte: pMin, lte: pMax } });
      }

      // 2. Stage $search
      pipeline.push({
        $search: {
          index: "default",
          compound: {
            // SHOULD: Afecta el SCORE (Relevancia)
            should: [
              {
                autocomplete: {
                  query: search,
                  path: "name",
                  tokenOrder: "sequential",
                  fuzzy: { maxEdits: 1 }
                }
              },
              {
                autocomplete: {
                  query: search,
                  path: "artist_name",
                  tokenOrder: "sequential",
                  fuzzy: { maxEdits: 1 }
                }
              }
            ],
            minimumShouldMatch: 1,
            // FILTER: Recorta resultados (Rápido, binario)
            filter: filterClauses
          }
        }
      });

      // 3. Proyección optimizada (Solo campos necesarios para la UI)
      pipeline.push({
        $project: {
          name: 1, artist_name: 1, album_name: 1, genre: 1,
          explicit: 1, duration_ms: 1, popularity: 1,
          danceability: 1, energy: 1, valence: 1, tempo: 1,
          _id: 1
        }
      });

    } else {
      // =================================================================================
      // CASO B: FILTRADO ESTÁNDAR (Sin Texto - Usa Índices Compuestos de MongoDB)
      // =================================================================================
      const matchStage = {};

      if (eMin > defaults.eMin || eMax < defaults.eMax) matchStage.energy = { $gte: eMin, $lte: eMax };
      if (dMin > defaults.dMin || dMax < defaults.dMax) matchStage.danceability = { $gte: dMin, $lte: dMax };
      if (pMin > defaults.pMin || pMax < defaults.pMax) matchStage.popularity = { $gte: pMin, $lte: pMax };

      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

      // Siempre ordenamos por popularidad si no hay búsqueda por relevancia
      pipeline.push({ $sort: { popularity: -1 } });
    }

    // =================================================================================
    // PAGINACIÓN EFICIENTE ($facet)
    // =================================================================================
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limitNum }]
      }
    });

    const result = await Track.aggregate(pipeline);
    const data = result[0].data;
    const total = result[0].metadata[0] ? result[0].metadata[0].total : 0;

    res.json({
      tracks: data.map(mapTrackResponse),
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error("Error en getTracks:", error);
    res.status(500).json({ error: error.message });
  }
};

// --- MÉTODOS CRUD ESTÁNDAR (Optimizados con lean donde aplica) ---

exports.getTrackById = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id).lean();
    if (!track) return res.status(404).json({ error: 'Pista no encontrada' });
    res.json(mapTrackResponse(track));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTrack = async (req, res) => {
  try {
    const track = await Track.create(req.body);
    // Create no soporta lean(), devuelve el documento hidratado
    res.status(201).json(mapTrackResponse(track));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateTrack = async (req, res) => {
  try {
    const track = await Track.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).lean();
    if (!track) return res.status(404).json({ error: 'Pista no encontrada' });
    res.json(mapTrackResponse(track));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTrack = async (req, res) => {
  try {
    const track = await Track.findByIdAndDelete(req.params.id).lean();
    if (!track) return res.status(404).json({ error: 'Pista no encontrada' });
    res.json({ message: 'Pista eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};