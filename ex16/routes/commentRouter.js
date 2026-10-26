const express = require('express');
const Comment = require('../models/comment');
const commentRouter = express.Router();
commentRouter.use(express.json());
commentRouter.use(express.urlencoded({ extended: true }));

commentRouter.route('/')
.get(async (req, res) => {
    try {
        const comment = await Comment.find().populate('article');
        res.json(comment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})
// POST a new comment
.post(async (req, res) => {
    try {
        const comment = new Comment(req.body);
        await comment.save();
        res.status(201).json(comment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})
.put(async (req, res) => {
    res.status(403).json('PUT operation not supported on /comments');
})
.delete(async (req, res) => {
    try {
        await Comment.deleteMany({});
        res.status(200).send('All comments deleted successfully.');
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

commentRouter.route('/:id')
.get(async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id).populate('article');
        res.json(comment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})
.post(async (req, res) => {
    res.status(403).end('POST operation not supported on /comments/' + req.params.id);
})
.put(async (req, res) => {
    try {
        const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(comment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
})
.delete(async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = commentRouter;
