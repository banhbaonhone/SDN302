const express = require('express');
const mongoose = require('mongoose');
const articleRouter = require('./routes/articleRouter');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/conFusion';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected correctly to server');
  })
  .catch((err) => {
    console.error('Could not connect to MongoDB:', err);
  });

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/articles', articleRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
