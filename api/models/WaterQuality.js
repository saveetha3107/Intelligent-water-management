const mongoose = require("mongoose");

const waterQualitySchema = new mongoose.Schema({
    ph: Number,
    turbidity: Number,
    flow_rate: Number,
    pressure: Number,
    temperature: Number,
    recorded_at: { type: Date, default: Date.now }
});

module.exports = mongoose.models.WaterQuality || mongoose.model("WaterQuality", waterQualitySchema, "water_quality");
