const {
  createProject,
  getProjectById,
  getProjects,
  updateProject,
  updateProjectStatus
} = require('../services/project.service')

const create = async (req, res) => {
  const {
    title,
    projectCode,
    description,
    fundingType,
    budget,
    startDate,
    endDate
  } = req.body

  if (!title || !projectCode || !fundingType || budget === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Title, project code, funding type, and budget are required.'
    })
  }

  if (!['ST', 'RD'].includes(fundingType) || typeof budget !== 'number' ||
      budget < 0 || (startDate && Number.isNaN(new Date(startDate).getTime())) ||
      (endDate && Number.isNaN(new Date(endDate).getTime()))) {
    return res.status(400).json({
      success: false,
      message: 'Funding type or budget is invalid.'
    })
  }

  try {
    const project = await createProject({
      title,
      projectCode,
      description,
      fundingType,
      budget,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null
    })

    return res.status(201).json({
      success: true,
      project
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Project creation failed.'
    })
  }
}

const list = async (req, res) => {
  try {
    const projects = await getProjects(req.user)

    return res.status(200).json({
      success: true,
      projects
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Projects could not be loaded.'
    })
  }
}

const details = async (req, res) => {
  try {
    const project = await getProjectById(req.params.id, req.user)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      })
    }

    return res.status(200).json({
      success: true,
      project
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Project could not be loaded.'
    })
  }
}

const update = async (req, res) => {
  const {
    title,
    projectCode,
    description,
    fundingType,
    budget,
    startDate,
    endDate
  } = req.body

  if (fundingType && !['ST', 'RD'].includes(fundingType)) {
    return res.status(400).json({
      success: false,
      message: 'Funding type is invalid.'
    })
  }

  if (budget !== undefined && (typeof budget !== 'number' || budget < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Budget is invalid.'
    })
  }

  if ((startDate && Number.isNaN(new Date(startDate).getTime())) ||
      (endDate && Number.isNaN(new Date(endDate).getTime()))) {
    return res.status(400).json({
      success: false,
      message: 'Project date is invalid.'
    })
  }

  const data = {}
  if (title !== undefined) data.title = title
  if (projectCode !== undefined) data.projectCode = projectCode
  if (description !== undefined) data.description = description
  if (fundingType !== undefined) data.fundingType = fundingType
  if (budget !== undefined) data.budget = budget
  if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null
  if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null

  if (Object.keys(data).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Provide at least one project field to update.'
    })
  }

  try {
    const project = await updateProject(req.params.id, data)

    return res.status(200).json({
      success: true,
      project
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Project update failed.'
    })
  }
}

const updateStatus = async (req, res) => {
  const { status } = req.body

  if (!['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Project status is invalid.'
    })
  }

  try {
    const project = await updateProjectStatus(req.params.id, status)

    if (project === null) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      })
    }

    if (project === false) {
      return res.status(400).json({
        success: false,
        message: 'Project status transition is not allowed.'
      })
    }

    return res.status(200).json({
      success: true,
      project
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Project status update failed.'
    })
  }
}

module.exports = {
  create,
  details,
  list,
  update,
  updateStatus
}
