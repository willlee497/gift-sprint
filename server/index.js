require('dotenv').config(); // Loads environment variables from a .env file into process.env
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 5000; // Use environment port or default to 5000

app.use(cors());
app.use(bodyParser.json());
app.use(express.json()); // Middleware to parse JSON request bodies

app.get('/', (req, res) => {
    res.send('Server is running...'); // Simple route to check if the server is running
});

const giftRoutes = require('./routes/gift');

app.use('/api', giftRoutes); // Route for gift-related endpoints

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`); // Start the server
});
