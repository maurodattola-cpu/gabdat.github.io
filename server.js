const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const REVIEWS_FILE = path.join(__dirname, 'reviews.json');

app.use(bodyParser.json());
app.use(express.static('public'));

// GET endpoint to fetch reviews
app.get('/reviews.json', (req, res) => {
    fs.readFile(REVIEWS_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading reviews file' });
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
});

// POST endpoint to save a new review
app.post('/api/save-review', (req, res) => {
    const newReview = req.body;

    // Basic validation
    if (!newReview.name || !newReview.review) {
        return res.status(400).json({ error: 'Name and review are required' });
    }

    fs.readFile(REVIEWS_FILE, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading reviews file' });
        }

        let reviews = [];
        if (data) {
            reviews = JSON.parse(data);
        }

        reviews.push(newReview);

        fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error saving review' });
            }
            res.status(201).json({ message: 'Review saved successfully' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
