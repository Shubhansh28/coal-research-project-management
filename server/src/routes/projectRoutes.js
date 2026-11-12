const express = require('express')
const {
  add,
  availableResearchers,
  create,
  details,
  list,
  remove,
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
router.post('/:id/researchers', authenticate, authorizeAdmin, add)
router.delete('/:id/researchers/:userId', authenticate, authorizeAdmin, remove)
router.get('/:id/available-researchers', authenticate, authorizeAdmin, availableResearchers)
router.patch('/:id', authenticate, authorizeAdmin, update)
router.patch('/:id/status', authenticate, authorizeAdmin, updateStatus)
router.get('/:id', authenticate, authorizeResearcher, details)

module.exports = router
