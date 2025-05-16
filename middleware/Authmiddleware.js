import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

/*******  322317ba-5039-42f5-a964-a5c60b37daa2  *******//*************  ✨ Windsurf Command ⭐  *************/
export const authenticateUser = async (req, res, next) => {
    try {
        let token = req.header("Authorization");
        if (!token || !token.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Access denied: Unauthorized." });
        }

        token = token.replace("Bearer ", "").trim();
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        req.user = user; // 👈 attaches full user (with _id) to request
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired. Please login again." });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token. Please login again." });
        }
        console.error("Authentication Error:", error.message);
        res.status(500).json({ message: "Internal server error." });
    }
};

export const authorizeRole = (...roles) => {  
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            console.log("Unauthorized Role:", req.user ? req.user.role : "No User");
            return res.status(403).json({ message: "Access denied: Invalid role." });
        }
        next();
    };
};

export default { authenticateUser, authorizeRole };
