const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const ApiRouter = require('./routes/api.route');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Root route
app.get('/', async (req, res) => {
    try {
        res.status(200).send({ message: 'Welcome to Practical Exam!' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// API routes
app.use('/', ApiRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
});

const PORT = process.env.PORT || 9999;
app.listen(PORT, 'localhost', () => {
    console.log(`Server running at: http://localhost:${PORT}`);
});
