const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// API endpoint for content generation
app.post('/api/generate', (req, res) => {
    const { prompt, tone } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    // Placeholder responses based on selected tone
    const sampleCopy = `[${tone} Mode]\n\n` +
        `Transforming your idea: "${prompt}"\n\n` +
        `Here is your generated copy optimized for high engagement and clarity. ` +
        `Nebula Copy empowers your brand to reach beyond conventional limitations.`;

    res.json({ result: sampleCopy });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});