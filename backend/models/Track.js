const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [255, 'El nombre no puede exceder 255 caracteres']
  },
  artist_name: {
    type: String,
    required: [true, 'El artista es requerido'],
    trim: true,
    maxlength: [255, 'El artista no puede exceder 255 caracteres']
  },
    artist_name: {
      type: mongoose.Schema.Types.Mixed, // Permite tanto String como Array
      required: [true, 'El artista es requerido'],
      validate: {
        validator: function(v) {
          if (typeof v === 'string') return v.trim().length > 0 && v.length <= 255;
          if (Array.isArray(v)) return v.length > 0 && v.every(a => typeof a === 'string' && a.trim().length > 0);
          return false;
        },
        message: 'El artista debe ser un string o un array de strings no vacío'
      }
    },
  genre: {
    type: String,
    required: [true, 'El género es requerido'],
    trim: true,
    maxlength: [100, 'El género no puede exceder 100 caracteres']
  },
  explicit: {
    type: Boolean,
    default: false
  },
  duration_ms: {
    type: Number,
    required: [true, 'La duración es requerida'],
    min: [0, 'La duración debe ser mayor a 0']
  },
  popularity: {
    type: Number,
    required: [true, 'La popularidad es requerida'],
    min: [0, 'La popularidad debe estar entre 0 y 100'],
    max: [100, 'La popularidad debe estar entre 0 y 100']
  },
  danceability: {
    type: Number,
    required: [true, 'La bailabilidad es requerida'],
    min: [0, 'La bailabilidad debe estar entre 0 y 1'],
    max: [1, 'La bailabilidad debe estar entre 0 y 1']
  },
  energy: {
    type: Number,
    required: [true, 'La energía es requerida'],
    min: [0, 'La energía debe estar entre 0 y 1'],
    max: [1, 'La energía debe estar entre 0 y 1']
  },
  valence: {
    type: Number,
    required: [true, 'La valencia es requerida'],
    min: [0, 'La valencia debe estar entre 0 y 1'],
    max: [1, 'La valencia debe estar entre 0 y 1']
  },
  tempo: {
    type: Number,
    required: [true, 'El tempo es requerido'],
    min: [0, 'El tempo debe ser mayor a 0']
  },
  num_artists: {
    type: Number,
    required: [true, 'El número de artistas es requerido'],
    min: [1, 'Debe haber al menos un artista']
  }
}, {
  timestamps: true,
  collection: 'tracks'
});

trackSchema.index({ popularity: -1 });
trackSchema.index({ genre: 1, popularity: -1 });
trackSchema.index({ artist_name: 1, popularity: -1 });
trackSchema.index({ explicit: 1, genre: 1 });


module.exports = mongoose.model('Track', trackSchema);
