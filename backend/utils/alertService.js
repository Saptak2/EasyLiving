import Alert from "../models/Alert.js";
import { checkSadPattern } from "./checkSadPattern.js";

export const generateAlerts = async (userId) => {
    const sad2 = await checkSadPattern(userId, 2);
    const sad7 = await checkSadPattern(userId, 7);

    // deactivate old alerts
    if (sad7) {
        await Alert.updateMany({ userId }, { isActive: false });

        await Alert.create({
            userId,
            type: "CRITICAL",
            message: "User is sad for 7 continuous days",
        });
    }
    else if (sad2) {
        await Alert.updateMany({ userId }, { isActive: false });

        await Alert.create({
            userId,
            type: "WARNING",
            message: "User is sad for 2 continuous days",
        });
    }

    if (sad7) {
        await Alert.create({
            userId,
            type: "CRITICAL",
            message: "User is sad for 7 continuous days",
        });
    }
    else if (sad2) {
        await Alert.create({
            userId,
            type: "WARNING",
            message: "User is sad for 2 continuous days",
        });
    }
};