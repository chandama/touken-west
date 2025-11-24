const mongoose = require('mongoose');

const swordSchema = new mongoose.Schema({
  Index: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  School: String,
  Smith: String,
  Mei: String,
  Type: String,
  Nagasa: String,
  Sori: String,
  Moto: String,
  Saki: String,
  Nakago: String,
  Ana: String,
  Length: String,
  Hori: String,
  Authentication: String,
  Province: String,
  Period: String,
  References: String,
  Description: String,
  Attachments: String,
  Tags: String,
  MediaAttachments: {
    type: String,
    default: 'NA'
  }
}, {
  timestamps: true,
  collection: 'swords'
});

// Indexes for common queries
swordSchema.index({ School: 1 });
swordSchema.index({ Type: 1 });
swordSchema.index({ Smith: 1 });
swordSchema.index({ Period: 1 });
swordSchema.index({ Authentication: 1 });

// Text index for search functionality
swordSchema.index({
  Smith: 'text',
  Mei: 'text',
  School: 'text',
  Type: 'text',
  Description: 'text',
  Authentication: 'text'
});

module.exports = mongoose.model('Sword', swordSchema);
