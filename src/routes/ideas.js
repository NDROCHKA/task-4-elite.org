const express = require('express');
const ContentIdea = require('../models/ContentIdea');
const requireDatabase = require('../middleware/requireDatabase');

const router = express.Router();
router.use(requireDatabase);

router.get('/', async (request, response, next) => {
  try {
    const query = {};
    if (request.query.type) query.type = request.query.type;
    if (request.query.status) query.status = request.query.status;

    const ideas = await ContentIdea.find(query).sort({ updatedAt: -1 });
    response.json(ideas);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  try {
    const idea = await ContentIdea.create(request.body);
    response.status(201).json(idea);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (request, response, next) => {
  try {
    const idea = await ContentIdea.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true
    });
    if (!idea) return response.status(404).json({ message: 'Content idea not found.' });
    return response.json(idea);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (request, response, next) => {
  try {
    const idea = await ContentIdea.findByIdAndDelete(request.params.id);
    if (!idea) return response.status(404).json({ message: 'Content idea not found.' });
    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
