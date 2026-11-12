const {
  addResearchers,
  createProject,
  findProjectByCode,
  findProjectForUpdate,
  getProjectById,
  getProjects,
  removeResearcher,
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

  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    return res.status(400).json({
      success: false,
      message: 'End date cannot be earlier than start date.'
    })
  }

  try {
    const existingProject = await findProjectByCode(projectCode)

    if (existingProject) {
      return res.status(409).json({
        success: false,
        message: 'A project with this project code already exists.'
      })
    }

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
    const existingProject = await findProjectForUpdate(req.params.id)

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      })
    }

    if (projectCode !== undefined) {
      const projectWithCode = await findProjectByCode(projectCode)

      if (projectWithCode && projectWithCode.id !== req.params.id) {
        return res.status(409).json({
          success: false,
          message: 'A project with this project code already exists.'
        })
      }
    }

    const currentStartDate = startDate === undefined
      ? existingProject.startDate
      : (startDate ? new Date(startDate) : null)
    const currentEndDate = endDate === undefined
      ? existingProject.endDate
      : (endDate ? new Date(endDate) : null)

    if (currentStartDate && currentEndDate &&
        currentEndDate < currentStartDate) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date.'
      })
    }

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

const add = async (req, res) => {
  const { researcherIds } = req.body

  if (!Array.isArray(researcherIds) ||
      researcherIds.length === 0 ||
      researcherIds.some(id => typeof id !== 'string') ||
      new Set(researcherIds).size !== researcherIds.length) {
    return res.status(400).json({
      success: false,
      message: 'Researcher IDs must be a non-empty list of unique values.'
    })
  }

  try {
    const project = await addResearchers(req.params.id, researcherIds)

    if (project === null) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      })
    }

    if (project === false) {
      return res.status(400).json({
        success: false,
        message: 'One or more researcher IDs are invalid.'
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
      message: 'Researchers could not be assigned.'
    })
  }
}

const remove = async (req, res) => {
  try {
    const project = await removeResearcher(req.params.id, req.params.userId)

    if (project === null) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      })
    }

    if (project === false) {
      return res.status(400).json({
        success: false,
        message: 'Researcher not found.'
      })
    }

    if (project === 'NOT_ASSIGNED') {
      return res.status(400).json({
        success: false,
        message: 'Researcher is not assigned to this project.'
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
      message: 'Researcher could not be removed.'
    })
  }
}

module.exports = {
  add,
  create,
  details,
  list,
  remove,
  update,
  updateStatus
}
