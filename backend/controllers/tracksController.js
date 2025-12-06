const Track = require('../models/Track');

// Función auxiliar para mapear _id a id
const mapTrackResponse = (track) => {
  const trackObj = track.toObject ? track.toObject() : track;
  return {
    ...trackObj,
    id: trackObj._id ? trackObj._id.toString() : trackObj.id,
    artist_name: Array.isArray(trackObj.artist_name)
      ? trackObj.artist_name
      : trackObj.artist_name
  };
};

// @desc    Get all tracks without pagination
// tracksController.js
exports.getAllTracks = async (req, res) => {
  try {
    // Agregamos .lean() aquí
    const tracks = await Track.find()
      .collation({ locale: 'en', strength: 2 })
      .sort({ popularity: -1 })
      .lean(); // <--- OPTIMIZACIÓN CRÍTICA

    res.json(tracks.map(mapTrackResponse));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

// @desc    Get all tracks with Smart Filtering and Pipeline Optimization
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

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // --- 1. PREPARACIÓN DE FILTROS (Lógica "Smart Filtering") ---
    // Calculamos el 'matchStage' ANTES de construir el pipeline para decidir el orden correcto.

    const DEFAULTS = {
      FLOAT_MIN: 0,
      FLOAT_MAX: 1,
      POP_MIN: 0,
      POP_MAX: 100
    };

    let matchStage = {};

    // Parseamos valores
    const eMin = parseFloat(energy_min) || 0;
    const eMax = parseFloat(energy_max) || 1;
    const dMin = parseFloat(danceability_min) || 0;
    const dMax = parseFloat(danceability_max) || 1;
    const pMin = parseInt(popularity_min) || 0;
    const pMax = parseInt(popularity_max) || 100;

    // ENERGÍA: Solo agregar si los valores NO son los de defecto (0 y 1)
    if (eMin > DEFAULTS.FLOAT_MIN || eMax < DEFAULTS.FLOAT_MAX) {
      matchStage.energy = {};
      if (eMin > DEFAULTS.FLOAT_MIN) matchStage.energy.$gte = eMin;
      if (eMax < DEFAULTS.FLOAT_MAX) matchStage.energy.$lte = eMax;
    }

    // BAILABILIDAD: Solo agregar si los valores NO son los de defecto
    if (dMin > DEFAULTS.FLOAT_MIN || dMax < DEFAULTS.FLOAT_MAX) {
      matchStage.danceability = {};
      if (dMin > DEFAULTS.FLOAT_MIN) matchStage.danceability.$gte = dMin;
      if (dMax < DEFAULTS.FLOAT_MAX) matchStage.danceability.$lte = dMax;
    }

    // POPULARIDAD (Filtro numérico): Solo agregar si NO son los de defecto
    if (pMin > DEFAULTS.POP_MIN || pMax < DEFAULTS.POP_MAX) {
      matchStage.popularity = {};
      if (pMin > DEFAULTS.POP_MIN) matchStage.popularity.$gte = pMin;
      if (pMax < DEFAULTS.POP_MAX) matchStage.popularity.$lte = pMax;
    }

    // --- 2. CONSTRUCCIÓN DEL PIPELINE (Orden Crítico) ---
    let pipeline = [];

    if (search) {
      // CASO A: Con Búsqueda de Texto (Atlas Search)
      // 1. $search siempre va primero
      pipeline.push({
        $search: {
          index: "default",
          compound: {
            should: [
              { autocomplete: { query: search, path: "name", fuzzy: { maxEdits: 1 } } },
              { autocomplete: { query: search, path: "artist_name", fuzzy: { maxEdits: 1 } } }
            ],
            minimumShouldMatch: 1
          }
        }
      });

      // 2. Aplicamos filtros después de la búsqueda
      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

      // Nota: No agregamos $sort aquí para mantener la relevancia (score) de la búsqueda.

    } else {
      // CASO B: Sin Búsqueda (Navegación / Sliders)
      // CORRECCIÓN IMPORTANTE: Aplicamos $match ANTES que $sort.
      // Esto permite que Mongo use el índice compuesto correcto (ej. danceability_1_popularity_-1)
      // para filtrar ("Equality/Range") antes de ordenar ("Sort").

      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

      // Siempre ordenamos por popularidad al final
      pipeline.push({ $sort: { popularity: -1 } });
    }

    // --- 3. PAGINACIÓN Y METADATA ---
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

// --- MÉTODOS CRUD ESTÁNDAR ---
exports.getTrackById = async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(404).json({ error: 'Pista no encontrada' });
    res.json(mapTrackResponse(track));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTrack = async (req, res) => {
  try {
    const track = await Track.create(req.body);
    res.status(201).json(mapTrackResponse(track));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateTrack = async (req, res) => {
  try {
    const track = await Track.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!track) return res.status(404).json({ error: 'Pista no encontrada' });
    res.json(mapTrackResponse(track));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTrack = async (req, res) => {
  try {
    const track = await Track.findByIdAndDelete(req.params.id);
    if (!track) return res.status(404).json({ error: 'Pista no encontrada' });
    res.json({ message: 'Pista eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};