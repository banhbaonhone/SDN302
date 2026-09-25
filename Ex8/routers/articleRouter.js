const express = require('express');
const router = express.Router();

// Simulated article saving operation
router.post('/', async (req, res, next) => {
    try {
        const { title, date, text } = req.body;

        // Simulate article saving logic
        if (!title || !text || !date) {
            throw new Error("Missing required article fields");
        }
        
        // If the operation was successful, send a success response
        res.status(201).json({ message: "Article saved successfully" });
    } catch (err) {
        // Pass the error to the error-handling middleware
        next(err);
    }
});

// Handling a DELETE request as in the screenshot
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        
        if (isNaN(id)) {
             throw new Error("Invalid article ID");
        }
        
        res.status(200).send(`Deleting article: ${id}`);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
