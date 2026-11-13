const express = require('express')
const { admin } = require('../controllers/dashboard.controller')
const { authenticate } = require('../middleware/authenticate')
const { authorizeAdmin } = require('../middleware/authorize')

const router = express.Router()

router.get('/', authenticate, authorizeAdmin, admin)

module.exports = router
