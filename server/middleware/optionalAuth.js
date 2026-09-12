import jwt from "jsonwebtoken";

export default function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = payload.userId;
      req.userRole = payload.role;
    } catch {
      // Invalid/expired token on an optional route — proceed as anonymous.
    }
  }

  next();
}
