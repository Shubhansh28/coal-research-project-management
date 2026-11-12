const { prisma } = require('../config/config')

const createProject = (data) => prisma.project.create({
  data
})

const findProjectByCode = (projectCode) => prisma.project.findUnique({
  where: { projectCode },
  select: { id: true }
})

const findProjectForUpdate = (id) => prisma.project.findUnique({
  where: { id },
  select: {
    id: true,
    startDate: true,
    endDate: true
  }
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

const updateProject = (id, data) => prisma.project.update({
  where: { id },
  data
})

const statusTransitions = {
  PENDING: ['PENDING', 'APPROVED', 'REJECTED'],
  APPROVED: ['APPROVED', 'COMPLETED'],
  REJECTED: ['REJECTED', 'PENDING'],
  COMPLETED: ['COMPLETED']
}

const updateProjectStatus = async (id, status) => {
  const project = await prisma.project.findUnique({
    where: { id },
    select: { status: true }
  })

  if (!project) {
    return null
  }

  if (!statusTransitions[project.status].includes(status)) {
    return false
  }

  return prisma.project.update({
    where: { id },
    data: { status },
    include: projectDetails
  })
}

module.exports = {
  createProject,
  findProjectByCode,
  findProjectForUpdate,
  getProjectById,
  getProjects,
  updateProject,
  updateProjectStatus
}
