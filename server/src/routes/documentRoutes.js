const express = require('express')
const {
  create,
  details,
  list,
  remove
} = require('../controllers/document.controller')
const { authenticate } = require('../middleware/authenticate')
const {
  authorizeAdmin,
  authorizeResearcher
} = require('../middleware/authorize')

const router = express.Router()

router.post('/projects/:projectId/documents', authenticate, authorizeAdmin, create)
router.get('/projects/:projectId/documents', authenticate, authorizeResearcher, list)
router.get('/documents/:id', authenticate, authorizeResearcher, details)
router.delete('/documents/:id', authenticate, authorizeAdmin, remove)

module.exports = router
