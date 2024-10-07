const express = require('express');
const { OpenAI } = require('openai'); // Updated import
const router = express.Router();
const { Client } = require('@googlemaps/google-maps-services-js');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const client = new Client({});
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Fetch nearby stores
const fetchNearbyStores = async (latitude, longitude) => {
    try {
        const response = await client.placesNearby({
            params: {
                location: `${latitude},${longitude}`,
                radius: 5000, // 5 km radius
                type: 'store',
                key: GOOGLE_MAPS_API_KEY,
            },
        });
        return response.data.results;
    } catch (error) {
        console.error('Error fetching stores:', error);
        throw error;
    }
};

// Generate gift idea based on nearby stores
router.post('/gift', async (req, res) => {
    const { age, person, budget, ideas, location } = req.body;

    try {
        let storeNames = [];
        if (location && location.latitude && location.longitude) {
            const stores = await fetchNearbyStores(location.latitude, location.longitude);
            storeNames = stores.map(store => store.name).join(', ');
        }

        const userMessage = ideas
            ? `Generate a fun, last-minute gift for a ${person} who is ${age} years old with a budget of $${budget}. Make it 1 idea in 1 sentence. The nearby stores include: ${storeNames || 'no nearby stores'}. Here are some ideas: ${ideas}.`
            : `Generate a fun, last-minute gift for a ${person} who is ${age} years old with a budget of $${budget}. Make it 1 idea in 1 sentence. The nearby stores include: ${storeNames || 'no nearby stores'}.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: userMessage }
            ],
            max_tokens: 150
        });

        // Log the entire response to understand its structure
        console.log('Full API Response:', response);

        // Check if response contains choices
        if (response.choices && response.choices.length > 0) {
            const giftIdea = response.choices[0].message.content.trim();
            res.json({ giftIdea });
        } else {
            throw new Error('No choices found in the response.');
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;