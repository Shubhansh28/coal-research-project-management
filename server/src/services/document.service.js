const { prisma } = require('../config/config')

const documentDetails = {
  project: {
    select: {
      id: true,
      title: true,
      projectCode: true
    }
  }
}

const createDocument = async (projectId, data) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true }
  })

  if (!project) {
    return null
  }

  return prisma.document.create({
    data: {
      ...data,
      projectId
    },
    include: documentDetails
  })
}

const getProjectDocuments = async (projectId, user) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...(user.role === 'RESEARCHER'
        ? { researchers: { some: { id: user.id } } }
        : {})
    },
    select: { id: true }
  })

  if (!project) {
    return null
  }

  return prisma.document.findMany({
    where: { projectId },
    include: documentDetails,
    orderBy: { createdAt: 'desc' }
  })
}

const getDocumentById = (id, user) => prisma.document.findFirst({
  where: {
    id,
    ...(user.role === 'RESEARCHER'
      ? {
          project: { researchers: { some: { id: user.id } } }
        }
      : {})
  },
  include: documentDetails
})

const deleteDocument = async (id) => {
  const document = await prisma.document.findUnique({
    where: { id },
    select: { id: true }
  })

  if (!document) {
    return null
  }

  return prisma.document.delete({
    where: { id }
  })
}

module.exports = {
  createDocument,
  deleteDocument,
  getDocumentById,
  getProjectDocuments
}
