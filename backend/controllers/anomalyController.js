const axios = require('axios');

const ML_API_URL = 'http://localhost:8000';

const detectAnomaly = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const response = await axios.post(`${ML_API_URL}/detect/anomaly`, {
            user_id: userId,
            date: date
        });

        res.status(200).json(response.data);

    } catch (error) {
        res.status(500).json({ 
            message: 'Anomaly detection failed', 
            error: error.message 
        });
    }
};

module.exports = { detectAnomaly };