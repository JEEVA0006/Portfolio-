const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    longDescription: {
      type: String,
    },
    image: {
      type: String,
      default: '',
    },
    imagePublicId: {
      type: String,
      default: '',
    },
    technologies: {
      type: [String],
      required: [true, 'Technologies are required'],
    },
    github: {
      type: String,
      default: '',
    },
    liveDemo: {
      type: String,
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ['frontend', 'backend', 'fullstack', 'mobile', 'other'],
      default: 'fullstack',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for search
projectSchema.index({ title: 'text', description: 'text', technologies: 'text' });

module.exports = mongoose.model('Project', projectSchema);
