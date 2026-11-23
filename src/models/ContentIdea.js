const mongoose = require('mongoose');

const contentIdeaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required.'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters.']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [700, 'Description cannot exceed 700 characters.'],
      default: ''
    },
    type: {
      type: String,
      enum: {
        values: ['Video', 'Blog', 'Post'],
        message: 'Type must be Video, Blog, or Post.'
      },
      required: true
    },
    status: {
      type: String,
      enum: {
        values: ['Draft', 'Published', 'Archived'],
        message: 'Status must be Draft, Published, or Archived.'
      },
      default: 'Draft'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContentIdea', contentIdeaSchema);
