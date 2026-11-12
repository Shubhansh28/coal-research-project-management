const {
  createFundReport,
  getFundReportById,
  getFundReports
} = require('../services/fundReport.service')

const create = async (req, res) => {
  const {
    projectId,
    amountSpent,
    amountReceived,
    quarter,
    year
  } = req.body

  if (!projectId || amountSpent === undefined || amountReceived === undefined ||
      quarter === undefined || year === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Project, amounts, quarter, and year are required.'
    })
  }

  if (typeof amountSpent !== 'number' || amountSpent < 0 ||
      typeof amountReceived !== 'number' || amountReceived < 0 ||
      !Number.isInteger(quarter) || quarter < 1 || quarter > 4 ||
      !Number.isInteger(year) || year < 1) {
    return res.status(400).json({
      success: false,
      message: 'Fund report data is invalid.'
    })
  }

  try {
    const fundReport = await createFundReport(req.user.id, {
      projectId,
      amountSpent,
      amountReceived,
      quarter,
      year
    })

    if (fundReport === null) {
      return res.status(404).json({
        success: false,
        message: 'Assigned project not found.'
      })
    }

    if (fundReport === false) {
      return res.status(409).json({
        success: false,
        message: 'A fund report already exists for this project, quarter, and year.'
      })
    }

    return res.status(201).json({
      success: true,
      fundReport
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Fund report submission failed.'
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
    const fundReports = await getFundReports(req.user, filters)

    return res.status(200).json({
      success: true,
      fundReports
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Fund reports could not be loaded.'
    })
  }
}

const details = async (req, res) => {
  try {
    const fundReport = await getFundReportById(req.params.id, req.user)

    if (!fundReport) {
      return res.status(404).json({
        success: false,
        message: 'Fund report not found.'
      })
    }

    return res.status(200).json({
      success: true,
      fundReport
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Fund report could not be loaded.'
    })
  }
}

module.exports = {
  create,
  details,
  list
}
