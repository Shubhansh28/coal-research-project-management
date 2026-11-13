const express = require('express')
const {
  admin,
  researcher
} = require('../controllers/dashboard.controller')
const { authenticate } = require('../middleware/authenticate')
const {
  authorizeAdmin,
  authorizeResearcher
} = require('../middleware/authorize')

const router = express.Router()

router.get('/', authenticate, authorizeAdmin, admin)
router.get('/researcher', authenticate, authorizeResearcher, researcher)

module.exports = router
