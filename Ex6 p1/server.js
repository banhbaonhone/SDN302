const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const dataFile = path.join(__dirname, 'data.json');

app.get('/data', (req, res) => {
    fs.readFile(dataFile, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading data file');
        }
        res.json(JSON.parse(data));
    });
});

app.post('/update', (req, res) => {
    const newData = req.body;
    
    fs.writeFile(dataFile, JSON.stringify(newData, null, 4), 'utf8', (err) => {
        if (err) {
            return res.status(500).send('Error writing data file');
        }
        res.json({ message: 'The data has been updated' });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
