import Alert from "../models/Alert.js";

export const getAlerts = async (req, res) => {
    const userId = req.user.id;

    const alerts = await Alert.find({ userId, isActive: true });

    res.json(alerts);
};