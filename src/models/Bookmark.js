const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required.'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters.']
    },
    url: {
      type: String,
      required: [true, 'URL is required.'],
      trim: true,
      validate: {
        validator(value) {
          try {
            const parsed = new URL(value);
            return ['http:', 'https:'].includes(parsed.protocol);
          } catch {
            return false;
          }
        },
        message: 'Enter a valid http:// or https:// URL.'
      }
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator(tags) {
          return tags.length <= 8 && tags.every((tag) => tag.length <= 24);
        },
        message: 'Use no more than 8 tags with 24 characters each.'
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bookmark', bookmarkSchema);
