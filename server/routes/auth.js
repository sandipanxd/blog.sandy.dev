import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function issueToken(user) {
  return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
}

function userView(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next({ status: 400, message: "name, email, and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return next({ status: 409, message: "An account with that email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role: "reader" });

    res.status(201).json({ token: issueToken(user), user: userView(user) });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });

    if (!user || !user.passwordHash) {
      return next({ status: 401, message: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return next({ status: 401, message: "Invalid email or password" });
    }

    res.json({ token: issueToken(user), user: userView(user) });
  } catch (err) {
    next(err);
  }
});

router.post("/google", async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return next({ status: 400, message: "credential is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      user = await User.findOne({ email: payload.email.toLowerCase() });

      if (user) {
        user.googleId = payload.sub;
        await user.save();
      } else {
        user = await User.create({
          name: payload.name,
          email: payload.email,
          googleId: payload.sub,
          role: "reader",
        });
      }
    }

    res.json({ token: issueToken(user), user: userView(user) });
  } catch (err) {
    next({ status: 401, message: "Google sign-in failed" });
  }
});

export default router;
