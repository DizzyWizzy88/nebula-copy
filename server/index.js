const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Set to track active Pro users (by email or customer ID)
const proUsers = new Set();

// Simple in-memory IP usage tracker
const ipUsageMap = new Map();

// 1. Stripe Webhook Endpoint (MUST use express.raw before express.json)
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Webhook Signature Verification Failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 2. Handle successful Checkout Session
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const customerEmail = session.customer_details?.email;

        if (customerEmail) {
            proUsers.add(customerEmail.toLowerCase());
            console.log(`Pro subscription activated for: ${customerEmail}`);
        }
    }

    // 3. Handle Subscription Cancellations
    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        // Remove user access upon cancellation
    }

    res.status(200).json({ received: true });
});

// JSON middleware for standard API routes
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// 4. Update Generation API to check for Pro status or email
app.post('/api/generate', (req, res) => {
    const { prompt, tone, email } = req.body;
    const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    const isPro = email && proUsers.has(email.toLowerCase());

    if (!isPro) {
        const currentUses = ipUsageMap.get(userIp) || 0;
        if (currentUses >= 1) {
            return res.status(402).json({
                error: 'Free limit reached. Upgrade to Pro for unlimited generations.',
                requiresUpgrade: true
            });
        }
        ipUsageMap.set(userIp, currentUses + 1);
    }

    res.json({
        result: `[${tone || 'Standard'} Tone]\n\nGenerated copy for: "${prompt}"\n\nNebula Copy expands your reach with high-converting copy.`
    });
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});