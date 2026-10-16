require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = "admin@waterguard.com";

    const existing = await User.findOne({ email });

    if (existing) {
        console.log("Admin user already exists:", email);
    } else {
        await User.create({
            name: "Admin",
            email,
            password: "admin123",
            role: "admin"
        });

        console.log("Admin user created:", email, "/ admin123");
    }

    await mongoose.disconnect();
}

seed().catch((err) => {
    console.error("Seed failed:", err.message);
    process.exit(1);
});
