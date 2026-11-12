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

const assignResearchers = async (projectId, researcherIds) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true }
  })

  if (!project) {
    return null
  }

  const researchers = await prisma.user.findMany({
    where: {
      id: { in: researcherIds },
      role: 'RESEARCHER'
    },
    select: { id: true }
  })

  if (researchers.length !== researcherIds.length) {
    return false
  }

  return prisma.project.update({
    where: { id: projectId },
    data: {
      researchers: {
        set: researcherIds.map(id => ({ id }))
      }
    },
    include: projectDetails
  })
}

module.exports = {
  assignResearchers,
  createProject,
  findProjectByCode,
  findProjectForUpdate,
  getProjectById,
  getProjects,
  updateProject,
  updateProjectStatus
}
