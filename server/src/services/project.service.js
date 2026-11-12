const { prisma } = require('../config/config')

const createProject = (data) => prisma.project.create({
  data
})

module.exports = {
  createProject
}
