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

const getAvailableResearchers = async (projectId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true }
  })

  if (!project) {
    return null
  }

  return prisma.user.findMany({
    where: {
      role: 'RESEARCHER',
      assignedProjects: {
        none: { id: projectId }
      }
    },
    select: {
      id: true,
      name: true,
      email: true
    },
    orderBy: { name: 'asc' }
  })
}

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

const addResearchers = async (projectId, researcherIds) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      researchers: {
        select: { id: true }
      }
    }
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

  const assignedIds = new Set(project.researchers.map(researcher => researcher.id))
  const newResearchers = researcherIds
    .filter(id => !assignedIds.has(id))
    .map(id => ({ id }))

  return prisma.project.update({
    where: { id: projectId },
    data: {
      researchers: {
        connect: newResearchers
      }
    },
    include: projectDetails
  })
}

const removeResearcher = async (projectId, userId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      researchers: {
        select: { id: true }
      }
    }
  })

  if (!project) {
    return null
  }

  const researcher = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true }
  })

  if (!researcher || researcher.role !== 'RESEARCHER') {
    return false
  }

  if (!project.researchers.some(assigned => assigned.id === userId)) {
    return 'NOT_ASSIGNED'
  }

  return prisma.project.update({
    where: { id: projectId },
    data: {
      researchers: {
        disconnect: { id: userId }
      }
    },
    include: projectDetails
  })
}

module.exports = {
  addResearchers,
  createProject,
  findProjectByCode,
  findProjectForUpdate,
  getAvailableResearchers,
  getProjectById,
  getProjects,
  removeResearcher,
  updateProject,
  updateProjectStatus
}
