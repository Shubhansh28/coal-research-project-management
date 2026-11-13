const {
  createDocument,
  deleteDocument,
  getDocumentById,
  getProjectDocuments
} = require('../services/document.service')

const create = async (req, res) => {
  const { name, fileUrl } = req.body

  if (typeof name !== 'string' || !name.trim() ||
      typeof fileUrl !== 'string' || !fileUrl.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Document name and file URL are required.'
    })
  }

  try {
    const document = await createDocument(req.params.projectId, {
      name: name.trim(),
      fileUrl: fileUrl.trim()
    })

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      })
    }

    return res.status(201).json({
      success: true,
      document
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Document could not be added.'
    })
  }
}

const list = async (req, res) => {
  try {
    const documents = await getProjectDocuments(req.params.projectId, req.user)

    if (documents === null) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied.'
      })
    }

    return res.status(200).json({
      success: true,
      documents
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Documents could not be loaded.'
    })
  }
}

const details = async (req, res) => {
  try {
    const document = await getDocumentById(req.params.id, req.user)

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or access denied.'
      })
    }

    return res.status(200).json({
      success: true,
      document
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Document could not be loaded.'
    })
  }
}

const remove = async (req, res) => {
  try {
    const document = await deleteDocument(req.params.id)

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully.'
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: 'Document could not be deleted.'
    })
  }
}

module.exports = {
  create,
  details,
  list,
  remove
}
