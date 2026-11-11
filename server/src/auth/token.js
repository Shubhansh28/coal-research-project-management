const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = '15m'
const AUTH_COOKIE_NAME = 'auth_token'

const generateToken = (payload) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.')
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

const verifyToken = (token) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.')
  }

  return jwt.verify(token, JWT_SECRET)
}

const getAuthCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV,
  sameSite: process.env.COOKIE_SAME_SITE,
  maxAge: 15 * 60 * 1000,
  path: '/'
})

module.exports = {
  AUTH_COOKIE_NAME,
  generateToken,
  verifyToken,
  getAuthCookieOptions
}
