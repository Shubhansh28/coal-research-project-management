const express = require('express')
const { create, details, list } = require('../controllers/report.controller')
const { authenticate } = require('../middleware/authenticate')
const {
  authorizeResearcher,
  authorizeResearcherOnly
} = require('../middleware/authorize')

const router = express.Router()

router.post('/', authenticate, authorizeResearcherOnly, create)
router.get('/', authenticate, authorizeResearcher, list)
router.get('/:id', authenticate, authorizeResearcher, details)

module.exports = router
