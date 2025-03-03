const express = require('express')
const rateLimit = require('express-rate-limit')
const contractsRoutes = require('./contracts')
const jobsRoutes = require('./jobs')
const balancesRoutes = require('./balances')
const adminRoutes = require('./admin')

const router = express.Router()

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
})
router.use(limiter)

router.use('/contracts', contractsRoutes)
router.use('/jobs', jobsRoutes)
router.use('/balances', balancesRoutes)
router.use('/admin', adminRoutes)

module.exports = router
