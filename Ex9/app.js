const express = require('express');
const app = express();
const port = 3000;

const { validateArticle, validateDate, validateTextLength } = require('./middleware/articleMiddleware');

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// GET all articles
app.get('/articles', async (req, res) => {
    try {
        res.status(200).end('Will send all the articles to you!');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new article
app.post('/articles', validateArticle, validateDate, validateTextLength, async (req, res) => {
    try {
        res.status(201).end('Will add the article: ' + req.body.title + ' with details: ' + req.body.text + ' and ' + req.body.date);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT a new article
app.put('/articles', async (req, res) => {
    try {
        res.status(403).end('PUT operation not supported on /articles');
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE all articles
app.delete('/articles', async (req, res) => {
    try {
        res.status(200).end('Deleting all articles');
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// GET a specific article
app.get('/articles/:id', async (req, res) => {
    try {
        res.status(200).end('Will send details of the article: ' + req.params.id + ' to you!');
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a specific article
app.post('/articles/:id', async (req, res) => {
    try {
        res.status(403).end('POST operation not supported on /articles/' + req.params.id);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT a new article
app.put('/articles/:id', async (req, res) => {
    try {
        res.write('Updating the article: ' + req.params.id + '\n');
        res.status(201).end('Will update the article: ' + req.body.title + ' with details: ' + req.body.text + ' and ' + req.body.date);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a specific article
app.delete('/articles/:id', async (req, res) => {
    try {
        res.status(200).end('Deleting article: ' + req.params.id);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'db.json');

// Helper to read db
const readDb = () => {
    try {
        return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (err) {
        return { videos: [] };
    }
};

// GET all videos
app.get('/videos', (req, res) => {
    const db = readDb();
    res.status(200).json(db.videos);
});

// POST a new video
app.post('/videos', (req, res) => {
    const db = readDb();
    const newVideo = {
        id: db.videos.length ? db.videos[db.videos.length - 1].id + 1 : 1,
        title: req.body.title,
        duration: req.body.duration
    };
    db.videos.push(newVideo);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    res.status(201).json(newVideo);
});

// GET a specific video
app.get('/videos/:id', (req, res) => {
    const db = readDb();
    const video = db.videos.find(v => v.id === parseInt(req.params.id));
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.status(200).json(video);
});

// PUT a specific video
app.put('/videos/:id', (req, res) => {
    const db = readDb();
    const index = db.videos.findIndex(v => v.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ message: 'Video not found' });
    
    db.videos[index] = { ...db.videos[index], ...req.body };
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    res.status(200).json(db.videos[index]);
});

// DELETE a specific video
app.delete('/videos/:id', (req, res) => {
    const db = readDb();
    const index = db.videos.findIndex(v => v.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ message: 'Video not found' });
    
    const deleted = db.videos.splice(index, 1);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    res.status(204).json(deleted[0]);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
