import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-diy-webgis";

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export const signToken = (payload: { userId: number; role: string }) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
  } catch {
    return null;
  }
};

/**
 * Shared authenticate helper for API routes.
 * Checks both Authorization header and auth_token cookie.
 */
export async function authenticateRequest(req: Request) {
  // Check Authorization header first
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const result = verifyToken(token);
    if (result) return result;
  }

  // Fallback to cookie
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map(c => c.trim());
    const authCookie = cookies.find(c => c.startsWith("auth_token="));
    if (authCookie) {
      const token = authCookie.split("=")[1];
      return verifyToken(token);
    }
  }

  return null;
}
