const { prisma } = require('../config/config')

const reportDetails = {
  researcher: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  },
  project: {
    select: {
      id: true,
      title: true,
      projectCode: true
    }
  }
}

const createReport = async (userId, data) => {
  const project = await prisma.project.findFirst({
    where: {
      id: data.projectId,
      researchers: { some: { id: userId } }
    },
    select: { id: true }
  })

  if (!project) {
    return null
  }

  const existingReport = await prisma.report.findUnique({
    where: {
      projectId_quarter_year: {
        projectId: data.projectId,
        quarter: data.quarter,
        year: data.year
      }
    },
    select: { id: true }
  })

  if (existingReport) {
    return false
  }

  return prisma.report.create({
    data: {
      ...data,
      researcherId: userId
    },
    include: reportDetails
  })
}

const getReports = (user, filters) => {
  const where = {
    ...(filters.projectId ? { projectId: filters.projectId } : {}),
    ...(filters.quarter ? { quarter: filters.quarter } : {}),
    ...(filters.year ? { year: filters.year } : {})
  }

  if (user.role === 'RESEARCHER') {
    where.project = {
      researchers: { some: { id: user.id } }
    }
  }

  return prisma.report.findMany({
    where,
    include: reportDetails,
    orderBy: { createdAt: 'desc' }
  })
}

const getReportById = (id, user) => prisma.report.findFirst({
  where: {
    id,
    ...(user.role === 'RESEARCHER'
      ? {
          project: { researchers: { some: { id: user.id } } }
        }
      : {})
  },
  include: reportDetails
})

module.exports = {
  createReport,
  getReportById,
  getReports
}
