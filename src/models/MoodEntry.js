const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: [true, 'Date is required.'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format.']
    },
    mood: {
      type: Number,
      required: [true, 'Mood is required.'],
      min: [1, 'Mood must be between 1 and 5.'],
      max: [5, 'Mood must be between 1 and 5.']
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters.'],
      default: ''
    }
  },
  { timestamps: true }
);

moodEntrySchema.index({ date: 1 }, { unique: true });

module.exports = mongoose.model('MoodEntry', moodEntrySchema);
