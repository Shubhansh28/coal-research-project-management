const {
  AUTH_COOKIE_NAME,
  generateToken,
  getAuthCookieOptions
} = require('../auth/token')
const { authenticateUser, registerUser } = require('../services/auth.service')
const { findUserById } = require('../services/user.service')

const publicUser = ({ id, name, email, role }) => ({
  id,
  name,
  email,
  role
})

const signup = async (req, res, next) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required.'
    })
  }

  try {
    const user = await registerUser({
      name,
      email,
      password
    })

    return res.status(201).json({
      success: true,
      user: publicUser(user)
    })
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      })
    }

    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Signup failed.'
    })
  }
}

const login = async (req, res, next) => {
  const { email, password } = req.body || {}

  if (typeof email !== 'string' || typeof password !== 'string' ||
      !email.trim() || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.'
    })
  }

  try {
    const user = await authenticateUser(email.trim().toLowerCase(), password)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      })
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    })

    res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions())
    return res.status(200).json({
      success: true,
      user: publicUser(user)
    })
  } catch (error) {
    return next(error)
  }
}

const me = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.'
      })
    }

    return res.status(200).json({
      success: true,
      user: publicUser(user)
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  login,
  me,
  signup
}
