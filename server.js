const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDatabase = require('./src/config/database');
const bookmarkRoutes = require('./src/routes/bookmarks');
const moodRoutes = require('./src/routes/moods');
const ideaRoutes = require('./src/routes/ideas');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (_request, response) => {
  const connected = mongoose.connection.readyState === 1;
  response.json({
    status: 'ok',
    database: connected ? 'connected' : 'disconnected'
  });
});

app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/ideas', ideaRoutes);

app.use('/api', (_request, response) => {
  response.status(404).json({ message: 'API route not found.' });
});

app.use((error, _request, response, _next) => {
  console.error(error);

  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors)
      .map((item) => item.message)
      .join(' ');
    return response.status(400).json({ message });
  }

  if (error.code === 11000) {
    return response.status(409).json({
      message: 'An entry already exists for that unique value.'
    });
  }

  return response.status(500).json({
    message: 'Something went wrong on the server.'
  });
});

app.listen(port, () => {
  console.log(`Task 4 suite running at http://localhost:${port}`);
  connectDatabase();
});
