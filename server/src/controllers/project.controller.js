const {
  createProject,
  getProjectById,
  getProjects
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
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A project with this project code already exists.'
      })
    }

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

module.exports = {
  create,
  details,
  list
}
