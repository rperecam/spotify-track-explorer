const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Track name is required'],
    trim: true,
    index: 'text'
  },
  artist_name: {
    type: String,
    required: [true, 'Artist name is required'],
    trim: true,
    index: 'text'
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  genre: {
    type: String,
    required: [true, 'Genre is required'],
    trim: true,
    index: true
  },
  duration_ms: {
    type: Number,
    required: true,
    min: 0
  },
  popularity: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    index: true
  },
  danceability: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  energy: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  key: {
    type: Number,
    required: true,
    min: 0,
    max: 11
  },
  loudness: {
    type: Number,
    required: true
  },
  mode: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  speechiness: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  acousticness: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  instrumentalness: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  liveness: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  valence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  tempo: {
    type: Number,
    required: true,
    min: 0
  },
  time_signature: {
    type: Number,
    required: true,
    min: 0,
    max: 7
  }
}, {
  timestamps: true
});

// Create text index for search
trackSchema.index({ name: 'text', artist_name: 'text' });

// Create compound indexes for common queries
trackSchema.index({ genre: 1, popularity: -1 });
trackSchema.index({ energy: 1, danceability: 1 });

module.exports = mongoose.model('Track', trackSchema);
