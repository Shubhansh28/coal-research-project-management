const express = require('express')
const {
  create,
  details,
  list
} = require('../controllers/project.controller')
const { authenticate } = require('../middleware/authenticate')
const {
  authorizeAdmin,
  authorizeResearcher
} = require('../middleware/authorize')

const router = express.Router()

router.post('/', authenticate, authorizeAdmin, create)
router.get('/', authenticate, authorizeResearcher, list)
router.get('/:id', authenticate, authorizeResearcher, details)

module.exports = router
