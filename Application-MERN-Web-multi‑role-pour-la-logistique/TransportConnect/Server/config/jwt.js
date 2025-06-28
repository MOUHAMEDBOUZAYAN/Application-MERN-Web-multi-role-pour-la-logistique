// backend/config/jwt.js
const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
    issuer: 'TransportConnect',
    audience: 'TransportConnect-Users'
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'TransportConnect',
      audience: 'TransportConnect-Users'
    });
  } catch (error) {
    throw new Error('Token invalide');
  }
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '30d',
    issuer: 'TransportConnect',
    audience: 'TransportConnect-Refresh'
  });
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'TransportConnect',
      audience: 'TransportConnect-Refresh'
    });
  } catch (error) {
    throw new Error('Refresh token invalide');
  }
};

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken,
  verifyRefreshToken
};