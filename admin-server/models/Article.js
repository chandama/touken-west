const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String,
    trim: true,
    maxLength: 500
  },
  author: {
    type: String,
    trim: true
  },
  // Content type: 'html' or 'pdf' (mutually exclusive)
  contentType: {
    type: String,
    enum: ['html', 'pdf'],
    required: true
  },
  // HTML content (only used when contentType === 'html')
  htmlContent: {
    type: String,
    default: ''
  },
  // PDF file info (only used when contentType === 'pdf')
  pdfFile: {
    url: String,
    filename: String,
    originalFilename: String,
    fileSize: Number,
    uploadedAt: Date,
    md5: String
  },
  // Embedded images for HTML articles (stored as JSON like MediaAttachments)
  images: {
    type: String,
    default: '[]'
  },
  // Cover/thumbnail image
  coverImage: {
    url: String,
    thumbnailUrl: String,
    filename: String
  },
  // Categorization
  category: {
    type: String,
    enum: ['Research', 'History', 'Kantei', 'Smiths', 'Schools', 'General'],
    default: 'General'
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Publication status
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  publishedAt: {
    type: Date
  },
  // Author tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'articles'
});

// Indexes for common queries
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ category: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ contentType: 1 });

// Text index for search
articleSchema.index({
  title: 'text',
  summary: 'text',
  htmlContent: 'text'
});

module.exports = mongoose.model('Article', articleSchema);
