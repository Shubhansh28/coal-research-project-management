const express = require('express')
const {
  assign,
  create,
  details,
  list,
  update,
  updateStatus
} = require('../controllers/project.controller')
const { authenticate } = require('../middleware/authenticate')
const {
  authorizeAdmin,
  authorizeResearcher
} = require('../middleware/authorize')

const router = express.Router()

router.post('/', authenticate, authorizeAdmin, create)
router.get('/', authenticate, authorizeResearcher, list)
router.patch('/:id/researchers', authenticate, authorizeAdmin, assign)
router.patch('/:id', authenticate, authorizeAdmin, update)
router.patch('/:id/status', authenticate, authorizeAdmin, updateStatus)
router.get('/:id', authenticate, authorizeResearcher, details)

module.exports = router
