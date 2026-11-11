const express = require('express')
const {
  adminAccess,
  login,
  me,
  researcherAccess,
  signup
} = require('../controllers/auth.controller')
const { authenticate } = require('../middleware/authenticate')
const {
  authorizeAdmin,
  authorizeResearcher
} = require('../middleware/authorize')

const router = express.Router()

router.post('/login', login)
router.post('/signup', signup)
router.get('/me', authenticate, me)
router.get('/admin', authenticate, authorizeAdmin, adminAccess)
router.get('/researcher', authenticate, authorizeResearcher, researcherAccess)

module.exports = router
