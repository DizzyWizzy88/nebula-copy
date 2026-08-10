const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files (index.html, images, CSS) from the root directory
app.use(express.static(path.join(__dirname, '..')));

// API Endpoint
app.post('/api/generate', (req, res) => {
    const { prompt, tone } = req.body;
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    res.json({
        result: `[${tone || 'Standard'} Tone]\n\nGenerated copy for: "${prompt}"\n\nNebula Copy expands your reach with high-converting copy.`
    });
});

// Fallback route to return index.html for any frontend requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});