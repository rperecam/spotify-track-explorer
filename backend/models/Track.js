const mongoose = require('mongoose');

/**
 * Esquema de Mongoose para la colección 'tracks'.
 * Este esquema define la estructura, validaciones y restricciones
 * que deben cumplir los documentos que representan canciones.
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

    // Nombre o nombres del artista (puede ser string o array de strings)
    artist_name: {
      type: mongoose.Schema.Types.Mixed, // Permite tanto String como Array
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

    // Indica si la canción contiene contenido explícito
    explicit: {
      type: Boolean,
      default: false
    },

    // Duración en milisegundos
    duration_ms: {
      type: Number,
      required: [true, 'La duración es requerida'],
      min: [0, 'La duración debe ser mayor a 0']
    },

    // Nivel de popularidad (0-100)
    popularity: {
      type: Number,
      required: [true, 'La popularidad es requerida'],
      min: [0, 'La popularidad debe estar entre 0 y 100'],
      max: [100, 'La popularidad debe estar entre 0 y 100']
    },

    // Medida de la bailabilidad (0-1)
    danceability: {
      type: Number,
      required: [true, 'La bailabilidad es requerida'],
      min: [0, 'La bailabilidad debe estar entre 0 y 1'],
      max: [1, 'La bailabilidad debe estar entre 0 y 1']
    },

    // Medida de la energía (0-1)
    energy: {
      type: Number,
      required: [true, 'La energía es requerida'],
      min: [0, 'La energía debe estar entre 0 y 1'],
      max: [1, 'La energía debe estar entre 0 y 1']
    },

    // Medida de la positividad o "felicidad" del tema (0-1)
    valence: {
      type: Number,
      required: [true, 'La valencia es requerida'],
      min: [0, 'La valencia debe estar entre 0 y 1'],
      max: [1, 'La valencia debe estar entre 0 y 1']
    },

    // Tempo o velocidad del ritmo (BPM)
    tempo: {
      type: Number,
      required: [true, 'El tempo es requerido'],
      min: [0, 'El tempo debe ser mayor a 0']
    },

    // Número de artistas participantes
    num_artists: {
      type: Number,
      required: [true, 'El número de artistas es requerido'],
      min: [1, 'Debe haber al menos un artista']
    }
  },
  {
    timestamps: true, // Agrega automáticamente createdAt y updatedAt
    collection: 'tracks' // Nombre de la colección en MongoDB
  }
);

/**
 * Índices para mejorar el rendimiento en las consultas más comunes
 */
trackSchema.index({ popularity: -1 }); // Consultas ordenadas por popularidad
trackSchema.index({ genre: 1, popularity: -1 }); // Filtrar por género y popularidad
trackSchema.index({ artist_name: 1, popularity: -1 }); // Búsqueda por artista
trackSchema.index({ explicit: 1, genre: 1 }); // Consultas combinadas por explicit y género

// Exporta el modelo de Mongoose
module.exports = mongoose.model('Track', trackSchema);