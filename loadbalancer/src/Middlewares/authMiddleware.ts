import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../Domain/enums/UserRole';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../Domain/types/JwtPayload';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) { res.status(401).json({ success: false, message: "Missing token" }); return; }
  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? "") as JwtPayload;
    req.user = { id: decoded.id, username: decoded.username, role: decoded.role as UserRole };
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

