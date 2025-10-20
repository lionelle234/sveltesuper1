import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function getUserFromAuthHeader(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // should include id and role
  } catch (err) {
    console.error("Invalid token:", err.message);
    return null;
  }
}

export function authenticate(req, res, next) {
  const decoded = getUserFromAuthHeader(req);
  if (!decoded) return res.status(401).json({ error: "Unauthorized" });
  req.user = decoded;
  next();
}

export function requireAdm(req, res, next) {
  if (req.user.role !== "adm") {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }
  next();
}