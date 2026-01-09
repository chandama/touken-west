const mongoose = require('mongoose');

const juyoMatchSchema = new mongoose.Schema({
  session: {
    type: Number,
    required: true,
    index: true
  },
  bladeNumber: {
    type: Number,
    required: true
  },
  // Original filename (e.g., "blade_001")
  originalName: {
    type: String,
    required: true
  },
  // Matched Juyo index data
  matchedIndex: {
    type: Number,
    default: null
  },
  matchedItem: String,      // e.g., "Katana", "Tachi"
  itemOverride: String,     // User override for blade type (used in filename if set)
  matchedAttribution: String, // e.g., "Rai Kunitoshi"
  matchedMei: String,
  // Measurements entered by user
  nagasa: {
    type: Number,
    default: null
  },
  sori: {
    type: Number,
    default: null
  },
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'matched', 'skipped', 'renamed', 'not_found'],
    default: 'pending'
  },
  // New filename after rename (generated from match data)
  newFilename: String,
  // Tracking
  matchedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  matchedAt: Date,
  renamedAt: Date
}, {
  timestamps: true
});

// Compound index for unique blade per session
juyoMatchSchema.index({ session: 1, bladeNumber: 1 }, { unique: true });

// Index for finding unmatched blades
juyoMatchSchema.index({ session: 1, status: 1 });

module.exports = mongoose.model('JuyoMatch', juyoMatchSchema);
