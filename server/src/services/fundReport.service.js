const { prisma } = require('../config/config')

const fundReportDetails = {
  project: {
    select: {
      id: true,
      title: true,
      projectCode: true
    }
  }
}

const createFundReport = async (userId, data) => {
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

  const existingReport = await prisma.fundReport.findFirst({
    where: {
      projectId: data.projectId,
      quarter: data.quarter,
      year: data.year
    },
    select: { id: true }
  })

  if (existingReport) {
    return false
  }

  return prisma.fundReport.create({
    data,
    include: fundReportDetails
  })
}

const getFundReports = (user, filters) => {
  const where = {
    ...(filters.projectId ? { projectId: filters.projectId } : {}),
    ...(filters.quarter !== undefined ? { quarter: filters.quarter } : {}),
    ...(filters.year !== undefined ? { year: filters.year } : {})
  }

  if (user.role === 'RESEARCHER') {
    where.project = {
      researchers: { some: { id: user.id } }
    }
  }

  return prisma.fundReport.findMany({
    where,
    include: fundReportDetails,
    orderBy: [
      { year: 'desc' },
      { quarter: 'desc' }
    ]
  })
}

const getFundReportById = (id, user) => prisma.fundReport.findFirst({
  where: {
    id,
    ...(user.role === 'RESEARCHER'
      ? {
          project: { researchers: { some: { id: user.id } } }
        }
      : {})
  },
  include: fundReportDetails
})

module.exports = {
  createFundReport,
  getFundReportById,
  getFundReports
}
