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
        res.status(200).json(data.articles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.get('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = readData();
        const article = data.articles.find(a => a.id === id);

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.status(200).json(article);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.post('/', (req, res) => {
    try {
        const data = readData();
        const newId = data.articles.length > 0 ? Math.max(...data.articles.map(a => a.id)) + 1 : 1;
        
        const newArticle = {
            id: newId,
            title: req.body.title,
            content: req.body.content,
            author: req.body.author,
            date: req.body.date
        };
        
        data.articles.push(newArticle);
        writeData(data);
        
        res.status(201).json(newArticle);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = readData();
        const index = data.articles.findIndex(a => a.id === id);

        if (index === -1) {
            return res.status(404).json({ message: 'Article not found' });
        }

        data.articles[index] = {
            ...data.articles[index],
            ...req.body,
            id: id 
        };

        writeData(data);
        res.status(200).json(data.articles[index]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.delete('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = readData();
        const index = data.articles.findIndex(a => a.id === id);

        if (index === -1) {
            return res.status(404).json({ message: 'Article not found' });
        }

        const deletedArticle = data.articles.splice(index, 1);
        
        
        data.comments = data.comments.filter(c => c.articleId !== id);

        writeData(data);
        res.status(200).json({ message: 'Article deleted', article: deletedArticle[0] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
