
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

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
// MYSQL DATABASE CONNECTION
// =====================================

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "saveetha@123",
    database: process.env.DB_NAME || "waterguard",
    port: process.env.DB_PORT || 3306
});

db.connect((err) => {
    if (err) {
        console.error("MySQL connection failed:", err.message);
        return;
    }

    console.log("MySQL connected successfully!");
});


// =====================================
// WATER QUALITY API
// =====================================

app.get("/api/water-quality", (req, res) => {

    const sql = `
        SELECT *
        FROM water_quality
        ORDER BY recorded_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch water quality data",
                error: err.message
            });
        }

        res.json(results);
    });
});


// =====================================
// HISTORY API
// =====================================

app.get("/api/history", (req, res) => {

    const sql = `
        SELECT
            id,
            ph,
            turbidity,
            flow_rate,
            pressure,
            temperature,
            recorded_at
        FROM water_quality
        ORDER BY recorded_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch history",
                error: err.message
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
});


// =====================================
// REPORT SUMMARY API
// =====================================

app.get("/api/report-summary", (req, res) => {

    const sql = `
        SELECT
            ROUND(AVG(ph), 2) AS average_ph,
            ROUND(AVG(turbidity), 2) AS average_turbidity,
            ROUND(AVG(flow_rate), 2) AS average_flow_rate,
            ROUND(AVG(pressure), 2) AS average_pressure,
            ROUND(AVG(temperature), 2) AS average_temperature
        FROM water_quality
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to generate report summary",
                error: err.message
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    });
});


// =====================================
// REPORT DATA API
// =====================================

app.get("/api/report-data", (req, res) => {

    const sql = `
        SELECT
            id,
            ph,
            turbidity,
            flow_rate,
            pressure,
            temperature,
            recorded_at
        FROM water_quality
        ORDER BY recorded_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch report data",
                error: err.message
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
});


// =====================================
// LOGIN API
// =====================================

app.post("/api/login", (req, res) => {

    const { email, password } = req.body;

    const sql = `
        SELECT *
        FROM users
        WHERE email = ?
        AND password = ?
    `;

    db.query(sql, [email, password], (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = results[0];

        const activitySql = `
            INSERT INTO login_activity (user_id)
            VALUES (?)
        `;

        db.query(
            activitySql,
            [user.id],
            (activityErr, activityResult) => {

                if (activityErr) {
                    return res.status(500).json({
                        success: false,
                        message: "Could not record login"
                    });
                }

                res.json({
                    success: true,
                    userId: user.id,
                    activityId: activityResult.insertId,
                    name: user.name,
                    role: user.role
                });
            }
        );
    });
});


// =====================================
// LOGOUT API
// =====================================

app.post("/api/logout", (req, res) => {

    const { activityId } = req.body;

    const sql = `
        UPDATE login_activity
        SET
            logout_time = CURRENT_TIMESTAMP,
            status = 'Logged Out'
        WHERE id = ?
    `;

    db.query(sql, [activityId], (err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Could not record logout"
            });
        }

        res.json({
            success: true,
            message: "Logout recorded"
        });
    });
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
