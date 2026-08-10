const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Simple in-memory IP usage tracker
const ipUsageMap = new Map();

app.post('/api/generate', (req, res) => {
    const { prompt, tone } = req.body;
    const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    // Check IP generation count
    const currentUses = ipUsageMap.get(userIp) || 0;

    if (currentUses >= 1) {
        return res.status(402).json({
            error: 'Free limit reached. Please upgrade to Pro for unlimited generations.',
            requiresUpgrade: true
        });
    }

    // Increment usage count for this IP
    ipUsageMap.set(userIp, currentUses + 1);

    res.json({
        result: `[${tone || 'Standard'} Tone]\n\nGenerated copy for: "${prompt}"\n\nNebula Copy expands your reach with high-converting copy.`
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});