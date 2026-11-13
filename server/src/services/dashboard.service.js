const { prisma } = require('../config/config')

const projectStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED']

const getAdminDashboard = async () => {
  const [projects, pendingReportReviews] = await Promise.all([
    prisma.project.findMany({
      select: {
        id: true,
        title: true,
        projectCode: true,
        status: true,
        budget: true,
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            quarter: true,
            year: true,
            progress: true,
            status: true,
            createdAt: true
          }
        },
        fundReports: {
          select: {
            amountReceived: true,
            amountSpent: true
          }
        }
      },
      orderBy: { title: 'asc' }
    }),
    prisma.report.count({
      where: { status: 'PENDING' }
    })
  ])

  const projectsByStatus = projectStatuses.reduce((counts, status) => {
    counts[status] = 0
    return counts
  }, {})

  const financialSummary = {
    totalBudget: 0,
    totalAmountReceived: 0,
    totalAmountSpent: 0
  }

  const projectSummaries = projects.map(project => {
    projectsByStatus[project.status] += 1
    financialSummary.totalBudget += project.budget

    project.fundReports.forEach(fundReport => {
      financialSummary.totalAmountReceived += fundReport.amountReceived
      financialSummary.totalAmountSpent += fundReport.amountSpent
    })

    const latestReport = project.reports[0]

    return {
      id: project.id,
      title: project.title,
      projectCode: project.projectCode,
      status: project.status,
      budget: project.budget,
      latestReport: latestReport
        ? {
            quarter: latestReport.quarter,
            year: latestReport.year,
            progress: latestReport.progress,
            status: latestReport.status,
            submittedAt: latestReport.createdAt
          }
        : null
    }
  })

  return {
    totalProjects: projects.length,
    projectsByStatus,
    pendingReportReviews,
    financialSummary,
    projects: projectSummaries
  }
}

module.exports = {
  getAdminDashboard
}
