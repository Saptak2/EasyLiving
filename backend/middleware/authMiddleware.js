import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    let token;

    try {
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(404).json({ message: "User not found" });
            }

            next();
        } else {
            return res.status(401).json({ message: "No token, authorization denied" });
        }
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        console.log("🧩 Token received:", token);
        console.log("🔑 JWT_SECRET used:", process.env.JWT_SECRET);

        return res.status(401).json({
            message: "Token is invalid or expired",
            error: error.message,
        });
    }
};
