const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required.'
    })
  }

  next()
}

const authorizeResearcher = (req, res, next) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'RESEARCHER') {
    return res.status(403).json({
      success: false,
      message: 'Researcher or admin access required.'
    })
  }

  next()
}

module.exports = {
  authorizeAdmin,
  authorizeResearcher
}
