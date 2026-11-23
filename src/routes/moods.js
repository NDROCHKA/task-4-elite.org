const express = require('express');
const MoodEntry = require('../models/MoodEntry');
const requireDatabase = require('../middleware/requireDatabase');

const router = express.Router();
router.use(requireDatabase);

router.get('/', async (_request, response, next) => {
  try {
    const entries = await MoodEntry.find().sort({ date: -1, createdAt: -1 });
    response.json(entries);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  try {
    const entry = await MoodEntry.create(request.body);
    response.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (request, response, next) => {
  try {
    const entry = await MoodEntry.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true
    });
    if (!entry) return response.status(404).json({ message: 'Mood entry not found.' });
    return response.json(entry);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (request, response, next) => {
  try {
    const entry = await MoodEntry.findByIdAndDelete(request.params.id);
    if (!entry) return response.status(404).json({ message: 'Mood entry not found.' });
    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
