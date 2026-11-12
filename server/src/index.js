const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('node:path');
const { config } = require('dotenv');

config({
  path: path.join(__dirname, '..', '.env'),
});

const authRoutes = require('./routes/authRoutes')
const fundReportRoutes = require('./routes/fundReportRoutes')
const projectRoutes = require('./routes/projectRoutes')
const reportRoutes = require('./routes/reportRoutes')

const app = express()
const port = Number(process.env.PORT);

app.use(express.json())
app.use(cookieParser())
app.use('/api/auth', authRoutes)
app.use('/api/fund-reports', fundReportRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/reports', reportRoutes)

app.get('/', (req, res) => {
  res.send('Coal Research Project Management API')
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

module.exports = app;