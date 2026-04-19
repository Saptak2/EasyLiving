import axios from "axios";

export const getRecommendation  = async (req, res) => {
    try {
        const { sleep, screen, exercise, expense, activity_count } = req.body;

        const response = await axios.post("http://127.0.0.1:8000/recommend", {
            sleep,
            screen,
            exercise,
            expense,
            activity_count
        });

        return res.status(200).json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error("Recommendation error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to get recommendation"
        });
    }
};