const {
  createReport,
  getReportById,
  getReports,
  reviewReport
} = require('../services/report.service')

const create = async (req, res) => {
  const {
    projectId,
    title,
    quarter,
    year,
    progress,
    completedWork
  } = req.body

  if (!projectId || !title || !completedWork ||
      quarter === undefined || year === undefined || progress === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Project, title, quarter, year, progress, and completed work are required.'
    })
  }

  if (!Number.isInteger(quarter) || quarter < 1 || quarter > 4 ||
      !Number.isInteger(year) || year < 1 ||
      !Number.isInteger(progress) || progress < 0 || progress > 100) {
    return res.status(400).json({
      success: false,
      message: 'Quarter, year, or progress is invalid.'
    })
  }

  try {
    const report = await createReport(req.user.id, {
      projectId,
      title,
      quarter,
      year,
      progress,
      completedWork
    })

    if (report === null) {
      return res.status(404).json({
        success: false,
        message: 'Assigned project not found.'
      })
    }

    if (report === false) {
      return res.status(409).json({
        success: false,
        message: 'A report already exists for this project, quarter, and year.'
      })
    }

    return res.status(201).json({
      success: true,
      report
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Report submission failed.'
    })
  }
}

const list = async (req, res) => {
  const filters = {
    projectId: req.query.projectId,
    quarter: req.query.quarter ? Number(req.query.quarter) : undefined,
    year: req.query.year ? Number(req.query.year) : undefined
  }

  if ((filters.quarter !== undefined &&
      (!Number.isInteger(filters.quarter) || filters.quarter < 1 || filters.quarter > 4)) ||
      (filters.year !== undefined &&
      (!Number.isInteger(filters.year) || filters.year < 1))) {
    return res.status(400).json({
      success: false,
      message: 'Quarter or year filter is invalid.'
    })
  }

  try {
    const reports = await getReports(req.user, filters)

    return res.status(200).json({
      success: true,
      reports
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Reports could not be loaded.'
    })
  }
}

const details = async (req, res) => {
  try {
    const report = await getReportById(req.params.id, req.user)

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.'
      })
    }

    return res.status(200).json({
      success: true,
      report
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Report could not be loaded.'
    })
  }
}

const review = async (req, res) => {
  const { status, remarks } = req.body

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Review status must be APPROVED or REJECTED.'
    })
  }

  if (remarks !== undefined && typeof remarks !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Remarks must be text.'
    })
  }

  try {
    const report = await reviewReport(req.params.id, status, remarks)

    if (report === null) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.'
      })
    }

    if (report === false) {
      return res.status(400).json({
        success: false,
        message: 'This report has already been reviewed.'
      })
    }

    return res.status(200).json({
      success: true,
      report
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Report review failed.'
    })
  }
}

module.exports = {
  create,
  details,
  list,
  review
}
