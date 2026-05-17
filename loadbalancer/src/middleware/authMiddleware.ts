import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export enum UserRole {
  ADMIN = 'ADMIN',
}

export interface JwtPayload {
  id: string;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const getTokenFromHeader = (authorization?: string): string | null => {
  if (!authorization) {
    return null;
  }
  const [type, token] = authorization.split(' ');
  return type === 'Bearer' && token ? token : null;
};

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const token = getTokenFromHeader(req.headers.authorization?.toString());
  if (!token) {
    res.status(401).json({ success: false, message: 'Missing token' });
    return;
  }

  const secret = process.env.JWT_SECRET ?? '';
  const decoded = (() => {
    try {
      return jwt.verify(token, secret) as JwtPayload;
    } catch {
      return null;
    }
  })();

  if (!decoded || !decoded.role) {
    res.status(401).json({ success: false, message: 'Invalid token' });
    return;
  }

  req.user = {
    id: decoded.id,
    username: decoded.username,
    role: decoded.role as UserRole,
  };
  next();
};

export const authorize = (...roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }
    next();
  };
