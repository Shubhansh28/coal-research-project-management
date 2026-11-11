const { AUTH_COOKIE_NAME, verifyToken } = require('../auth/token')
const { findUserById } = require('../services/user.service')

const authenticate = async (req, res, next) => {
    const token = req.cookies?.[AUTH_COOKIE_NAME]

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied.'
        })
    }

    let payload

    try {
        payload = verifyToken(token)

        if (!payload || typeof payload.id !== 'string' || !payload.id) {
            return res.status(403).json({
                success: false,
                message: 'Invalid token.'
            })
        }
    } catch (error) {
        const message = error.name === 'TokenExpiredError'
            ? 'Token expired.'
            : 'Invalid token.'

        return res.status(403).json({
            success: false,
            message
        })
    }

    try {
        const user = await findUserById(payload.id)

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists.'
            })
        }

        req.user = {
            id: user.id,
            email: user.email,
            role: user.role
        }
        return next()
    } catch (error) {
        return next(error)
    }
}


module.exports = {
    authenticate,
}
