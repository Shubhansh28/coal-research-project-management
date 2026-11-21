const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const path = require('node:path');
const { config } = require('dotenv');

config({
  path: path.join(__dirname, '..', '.env'),
});

const authRoutes = require('./routes/authRoutes')
const dashboardRoutes = require('./routes/dashboardRoutes')
const documentRoutes = require('./routes/documentRoutes')
const fundReportRoutes = require('./routes/fundReportRoutes')
const projectRoutes = require('./routes/projectRoutes')
const reportRoutes = require('./routes/reportRoutes')
const originAuth = require('./middleware/origin')

const app = express()
const port = Number(process.env.PORT);

app.set('trust proxy', 1);

const clientOrigin = process.env.CLIENT_ORIGIN;
const allowedOrigins = clientOrigin
  ? clientOrigin.split(',').map((o) => o.trim()).filter(Boolean)
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    try {
      const hostname = new URL(origin).hostname;
      if (hostname.endsWith('.vercel.app') && (allowedOrigins.some((o) => o.includes('vercel.app')) || process.env.NODE_ENV === 'production')) {
        return callback(null, true);
      }
    } catch {
      // Invalid URL format
    }

    return callback(null, false);
  },
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())
// app.use(originAuth)
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api', documentRoutes)
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