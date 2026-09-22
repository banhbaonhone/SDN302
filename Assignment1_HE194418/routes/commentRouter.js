const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data.json');

const readData = () => {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
};

const writeData = (data) => {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
};

router.get('/', (req, res) => {
    try {
        const data = readData();
        const articleId = req.query.articleId;
        
        if (articleId) {
            const filteredComments = data.comments.filter(c => c.articleId === parseInt(articleId));
            return res.status(200).json(filteredComments);
        }
        
        res.status(200).json(data.comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.get('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = readData();
        const comment = data.comments.find(c => c.id === id);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json(comment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.post('/', (req, res) => {
    try {
        const data = readData();
        const newId = data.comments.length > 0 ? Math.max(...data.comments.map(c => c.id)) + 1 : 1;
        
        const newComment = {
            id: newId,
            articleId: parseInt(req.body.articleId),
            author: req.body.author,
            content: req.body.content,
            date: req.body.date || new Date().toISOString().split('T')[0]
        };
        
        
        const articleExists = data.articles.some(a => a.id === newComment.articleId);
        if (!articleExists) {
            return res.status(404).json({ message: 'Article not found' });
        }
        
        data.comments.push(newComment);
        writeData(data);
        
        res.status(201).json(newComment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.put('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = readData();
        const index = data.comments.findIndex(c => c.id === id);

        if (index === -1) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        data.comments[index] = {
            ...data.comments[index],
            ...req.body,
            id: id, 
            articleId: data.comments[index].articleId 
        };

        writeData(data);
        res.status(200).json(data.comments[index]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = readData();
        const index = data.comments.findIndex(c => c.id === id);

        if (index === -1) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const deletedComment = data.comments.splice(index, 1);
        writeData(data);
        
        res.status(200).json({ message: 'Comment deleted', comment: deletedComment[0] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

