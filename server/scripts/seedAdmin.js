import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

async function seedAdmin() {
  const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!MONGODB_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error(
      "Missing required env vars. Set MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in server/.env"
    );
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const email = ADMIN_EMAIL.toLowerCase();

  const admin = await User.findOneAndUpdate(
    { email },
    { name: ADMIN_NAME, email, passwordHash, role: "author" },
    { upsert: true, new: true }
  );

  console.log(`Author account ready: ${admin.email}`);
  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
