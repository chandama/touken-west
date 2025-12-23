const mongoose = require('mongoose');

const changelogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  actionType: {
    type: String,
    enum: ['edit', 'media_upload', 'media_delete', 'new_sword', 'delete', 'cover_image_change'],
    required: true
  },
  swordIndex: {
    type: String,
    required: true,
    index: true
  },
  swordSmith: String,
  swordType: String,
  changes: [{
    field: String,
    before: String,
    after: String
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: false,
  collection: 'changelog'
});

// Index for pagination
changelogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Changelog', changelogSchema);
