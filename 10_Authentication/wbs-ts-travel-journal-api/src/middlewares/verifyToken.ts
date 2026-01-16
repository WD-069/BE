import type { RequestHandler } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import { ACCESS_JWT_SECRET } from '#config';

const verifyToken: RequestHandler = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    throw new Error('Unauthorized', { cause: { status: 401 } });
  }

  const payload = jwt.verify(token, ACCESS_JWT_SECRET) as JwtPayload;

  req.userID = payload.userID;
  req.userRoles = payload.userRoles;

  next();
};

export default verifyToken;
