const { prisma } = require('../config/config')

const findUserByEmail = (email) => prisma.user.findUnique({
  where: { email }
})

const findUserById = (id) => prisma.user.findUnique({
  where: { id }
})

const createUser = (data) => prisma.user.create({
  data
})

module.exports = {
  createUser,
  findUserByEmail,
  findUserById
}
