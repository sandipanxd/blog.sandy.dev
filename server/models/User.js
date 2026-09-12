import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, default: null },
    googleId: { type: String, default: null },
    role: { type: String, enum: ["author", "reader"], default: "reader" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
