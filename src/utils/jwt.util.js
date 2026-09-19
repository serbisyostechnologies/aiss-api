import jwt from 'jsonwebtoken';
import env from '../config/environment.js'

export const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};