const express = require('express');
const app = express();
const port = 3000;

// Import routers
const articleRouter = require('./routers/articleRouter');
const videoRouter = require('./routers/videoRouter');

// Middleware to parse JSON body
app.use(express.json());

// Use routers
app.use('/articles', articleRouter);
app.use('/videos', videoRouter);

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    
    // Send a generic error message
    res.status(500).json({ error: "An error occurred, please try again later." });
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
