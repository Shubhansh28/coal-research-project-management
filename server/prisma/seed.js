const path = require('path')
const { config } = require('dotenv')
const bcrypt = require('bcrypt')

config({
    path: path.join(__dirname, '..', '.env')
})

const { prisma } = require('../src/config/config')

const saltRounds = 10
const adminEmail = 'admin@coalportal.com'

const adminCheck = async () => {
    const admin = await prisma.user.findUnique({
        where: {
            email: adminEmail
        }
    })

    return admin !== null
}

const createAdmin = async () => {
    const password = process.env.ADMIN_PASSWORD

    if (typeof password !== 'string' || password.trim() === '') {
        throw new Error('ADMIN_PASSWORD is missing or empty')
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds)

    await prisma.user.create({
        data: {
            name: 'Admin',
            email: adminEmail,
            role: 'ADMIN',
            password: hashedPassword
        }
    })
}

const main = async () => {
    try {
        if (await adminCheck()) {
            console.log('Admin user already exists')
            return
        }

        await createAdmin()
        console.log('Admin user created')
    } catch (error) {
        console.error('Database seed failed:', error)
        process.exitCode = 1
    } finally {
        await prisma.$disconnect()
    }
}

main()