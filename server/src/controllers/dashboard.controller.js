const {
  getAdminDashboard,
  getResearcherDashboard
} = require('../services/dashboard.service')

const admin = async (req, res) => {
  try {
    const dashboard = await getAdminDashboard()

    return res.status(200).json({
      success: true,
      dashboard
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Admin dashboard could not be loaded.'
    })
  }
}

const researcher = async (req, res) => {
  try {
    const projects = await getResearcherDashboard(req.user)

    return res.status(200).json({
      success: true,
      dashboard: {
        totalProjects: projects.length,
        projects
      }
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Researcher dashboard could not be loaded.'
    })
  }
}

module.exports = {
  admin,
  researcher
}
