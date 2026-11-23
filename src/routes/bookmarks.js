const express = require('express');
const Bookmark = require('../models/Bookmark');
const requireDatabase = require('../middleware/requireDatabase');

const router = express.Router();
router.use(requireDatabase);

router.get('/', async (_request, response, next) => {
  try {
    const bookmarks = await Bookmark.find().sort({ createdAt: -1 });
    response.json(bookmarks);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  try {
    const bookmark = await Bookmark.create(request.body);
    response.status(201).json(bookmark);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (request, response, next) => {
  try {
    const bookmark = await Bookmark.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true
    });

    if (!bookmark) return response.status(404).json({ message: 'Bookmark not found.' });
    return response.json(bookmark);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (request, response, next) => {
  try {
    const bookmark = await Bookmark.findByIdAndDelete(request.params.id);
    if (!bookmark) return response.status(404).json({ message: 'Bookmark not found.' });
    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
