const bcrypt = require('bcrypt')
const { createUser, findUserByEmail } = require('./user.service')

const authenticateUser = async (email, password) => {
  const user = await findUserByEmail(email)

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return null
  }

  return user
}

const registerUser = async ({ name, email, password }) => {
  const hashedPassword = await bcrypt.hash(password, 12)

  return createUser({
    name,
    email,
    password: hashedPassword
  })
}

module.exports = {
  authenticateUser,
  registerUser
}
