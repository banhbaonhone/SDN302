const express = require('express');
const router = express.Router();

router.post('/', async (req, res, next) => {
    try {
        const { title, url } = req.body;

        if (!title || !url) {
            throw new Error("Missing required video fields");
        }
        
        res.status(201).json({ message: "Video saved successfully" });
    } catch (err) {
        next(err);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        
        if (isNaN(id)) {
             throw new Error("Invalid video ID");
        }
        
        res.status(200).send(`Deleting video: ${id}`);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
