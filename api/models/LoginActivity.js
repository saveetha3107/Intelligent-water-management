const mongoose = require("mongoose");

const loginActivitySchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    login_time: { type: Date, default: Date.now },
    logout_time: Date,
    status: { type: String, default: "Logged In" }
});

module.exports = mongoose.models.LoginActivity || mongoose.model("LoginActivity", loginActivitySchema, "login_activity");
