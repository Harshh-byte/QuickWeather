require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.get('/weather', async (req, res) => {
    const { type, city, date, days } = req.query;

    let endpoint = '';
    const base = 'http://api.weatherapi.com/v1';

    switch (type) {
        case 'current':
            endpoint = `${base}/current.json?key=${process.env.API_KEY}&q=${city}`;
            break;
        case 'history':
            endpoint = `${base}/history.json?key=${process.env.API_KEY}&q=${city}&dt=${date}`;
            break;
        case 'forecast':
            endpoint = `${base}/forecast.json?key=${process.env.API_KEY}&q=${city}&days=${days}`;
            break;
        default:
            return res.status(400).json({ error: 'Invalid type' });
    }

    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
