
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const User = require("./models/User");
const WaterQuality = require("./models/WaterQuality");
const LoginActivity = require("./models/LoginActivity");

const app = express();

app.use(cors());
app.use(express.json());

// =====================================
// SERVE STATIC FILES (CSS, JS, HTML)
// =====================================
app.use(express.static(path.join(__dirname, "..")));

// =====================================
// FRONTEND HOME PAGE
// =====================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "index.html"));
});


// =====================================
// MONGODB ATLAS CONNECTION
// =====================================

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/waterguard";

mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("MongoDB connected successfully!"))
    .catch((err) => console.error("MongoDB connection failed:", err.message));


// =====================================
// WATER QUALITY API
// =====================================

app.get("/api/water-quality", async (req, res) => {

    try {
        const results = await WaterQuality.find().sort({ recorded_at: -1 });
        res.json(results);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch water quality data",
            error: err.message
        });
    }
});


// =====================================
// HISTORY API
// =====================================

app.get("/api/history", async (req, res) => {

    try {
        const results = await WaterQuality.find().sort({ recorded_at: -1 });

        res.json({
            success: true,
            data: results
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch history",
            error: err.message
        });
    }
});


// =====================================
// REPORT SUMMARY API
// =====================================

app.get("/api/report-summary", async (req, res) => {

    try {
        const [summary] = await WaterQuality.aggregate([
            {
                $group: {
                    _id: null,
                    average_ph: { $avg: "$ph" },
                    average_turbidity: { $avg: "$turbidity" },
                    average_flow_rate: { $avg: "$flow_rate" },
                    average_pressure: { $avg: "$pressure" },
                    average_temperature: { $avg: "$temperature" }
                }
            }
        ]);

        const round2 = (n) => (typeof n === "number" ? Math.round(n * 100) / 100 : n);

        res.json({
            success: true,
            data: summary ? {
                average_ph: round2(summary.average_ph),
                average_turbidity: round2(summary.average_turbidity),
                average_flow_rate: round2(summary.average_flow_rate),
                average_pressure: round2(summary.average_pressure),
                average_temperature: round2(summary.average_temperature)
            } : {}
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to generate report summary",
            error: err.message
        });
    }
});


// =====================================
// REPORT DATA API
// =====================================

app.get("/api/report-data", async (req, res) => {

    try {
        const results = await WaterQuality.find().sort({ recorded_at: -1 });

        res.json({
            success: true,
            data: results
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch report data",
            error: err.message
        });
    }
});


// =====================================
// LOGIN API
// =====================================

app.post("/api/login", async (req, res) => {

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email, password });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const activity = await LoginActivity.create({ user_id: user._id });

        res.json({
            success: true,
            userId: user._id,
            activityId: activity._id,
            name: user.name,
            role: user.role
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Database error"
        });
    }
});


// =====================================
// LOGOUT API
// =====================================

app.post("/api/logout", async (req, res) => {

    const { activityId } = req.body;

    try {
        await LoginActivity.findByIdAndUpdate(activityId, {
            logout_time: new Date(),
            status: "Logged Out"
        });

        res.json({
            success: true,
            message: "Logout recorded"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Could not record logout"
        });
    }
});


// =====================================
// LOCAL DEVELOPMENT SERVER
// =====================================

// Vercel imports the app directly.
// Locally, run the server on port 5000.

if (require.main === module) {
    app.listen(process.env.PORT || 5000, () => {
        console.log("=================================");
        console.log("WaterGuard Backend Started");
        console.log(`Server: http://localhost:${process.env.PORT || 5000}`);
        console.log("=================================");
    });
}


// =====================================
// EXPORT EXPRESS APP FOR VERCEL
// =====================================

module.exports = app;
