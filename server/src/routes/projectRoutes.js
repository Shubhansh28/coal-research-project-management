const express = require('express')
const { create } = require('../controllers/project.controller')
const { authenticate } = require('../middleware/authenticate')
const { authorizeAdmin } = require('../middleware/authorize')

const router = express.Router()

router.post('/', authenticate, authorizeAdmin, create)

module.exports = router
