const express = require('express')
const {
  create,
  details,
  list,
  review
} = require('../controllers/report.controller')
const { authenticate } = require('../middleware/authenticate')
const {
  authorizeAdmin,
  authorizeResearcher,
  authorizeResearcherOnly
} = require('../middleware/authorize')

const router = express.Router()

router.post('/', authenticate, authorizeResearcherOnly, create)
router.get('/', authenticate, authorizeResearcher, list)
router.patch('/:id/review', authenticate, authorizeAdmin, review)
router.get('/:id', authenticate, authorizeResearcher, details)

module.exports = router
