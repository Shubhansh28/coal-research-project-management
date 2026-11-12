const { prisma } = require('../config/config')

const createProject = (data) => prisma.project.create({
  data
})

const projectDetails = {
  researchers: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  },
  reports: true,
  fundReports: true,
  documents: true
}

const getProjects = (user) => prisma.project.findMany({
  where: user.role === 'ADMIN'
    ? undefined
    : { researchers: { some: { id: user.id } } },
  include: projectDetails,
  orderBy: { startDate: 'desc' }
})

const getProjectById = (id, user) => prisma.project.findFirst({
  where: {
    id,
    ...(user.role === 'ADMIN'
      ? {}
      : { researchers: { some: { id: user.id } } })
  },
  include: projectDetails
})

module.exports = {
  createProject,
  getProjectById,
  getProjects
}
