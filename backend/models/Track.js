const mongoose = require('mongoose');

/**
 * Esquema de Mongoose para la colección 'tracks'.
 * Definición de estructura y validaciones para las canciones.
 */
const trackSchema = new mongoose.Schema(
  {
    // Nombre de la canción
    name: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      maxlength: [255, 'El nombre no puede exceder 255 caracteres']
    },

    // Nombre o nombres del artista
    artist_name: {
      type: mongoose.Schema.Types.Mixed, // Permite String o Array
      required: [true, 'El artista es requerido'],
      validate: {
        validator: function (v) {
          if (typeof v === 'string')
            return v.trim().length > 0 && v.length <= 255;
          if (Array.isArray(v))
            return (
              v.length > 0 &&
              v.every(a => typeof a === 'string' && a.trim().length > 0)
            );
          return false;
        },
        message: 'El artista debe ser un string o un array de strings no vacío'
      }
    },

    // Género musical
    genre: {
      type: String,
      required: [true, 'El género es requerido'],
      trim: true,
      maxlength: [100, 'El género no puede exceder 100 caracteres']
    },

    // Contenido explícito
    explicit: {
      type: Boolean,
      default: false
    },

    // Duración
    duration_ms: {
      type: Number,
      required: [true, 'La duración es requerida'],
      min: [0, 'La duración debe ser mayor a 0']
    },

    // Popularidad (0-100)
    popularity: {
      type: Number,
      required: [true, 'La popularidad es requerida'],
      min: [0, 'La popularidad debe estar entre 0 y 100'],
      max: [100, 'La popularidad debe estar entre 0 y 100']
    },

    // Bailabilidad (0-1)
    danceability: {
      type: Number,
      required: [true, 'La bailabilidad es requerida'],
      min: [0, 'La bailabilidad debe estar entre 0 y 1'],
      max: [1, 'La bailabilidad debe estar entre 0 y 1']
    },

    // Energía (0-1)
    energy: {
      type: Number,
      required: [true, 'La energía es requerida'],
      min: [0, 'La energía debe estar entre 0 y 1'],
      max: [1, 'La energía debe estar entre 0 y 1']
    },

    // Valencia (0-1)
    valence: {
      type: Number,
      required: [true, 'La valencia es requerida'],
      min: [0, 'La valencia debe estar entre 0 y 1'],
      max: [1, 'La valencia debe estar entre 0 y 1']
    },

    // Tempo (BPM)
    tempo: {
      type: Number,
      required: [true, 'El tempo es requerido'],
      min: [0, 'El tempo debe ser mayor a 0']
    },

    // Número de artistas
    num_artists: {
      type: Number,
      required: [true, 'El número de artistas es requerido'],
      min: [1, 'Debe haber al menos un artista']
    }
  },
  {
    timestamps: true,
    collection: 'tracks'
  }
);

/**
 * =========================================================
 * ÍNDICES DE RENDIMIENTO (ESTRATEGIA DESACOPLADA)
 * =========================================================
 */

// 1. Popularidad General (Ordenamiento Global)
// Se usa cuando no hay filtros activos.
trackSchema.index({ popularity: -1 });

// 2. Filtro de Contenido Explícito - Dashboard
trackSchema.index({ explicit: 1 });

module.exports = mongoose.model('Track', trackSchema);