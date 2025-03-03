const express = require('express')
const { Profile, Job, Contract } = require('../model')
const { Op, fn, col } = require('sequelize')

const router = express.Router()

/**
 * @route GET /admin/best-profession
 * @desc Get the profession that earned the most in a given time range
 */
router.get('/best-profession', async (req, res) => {
  const { start: startDate, end: endDate } = req.query

  const bestProfession = await Job.findOne({
    attributes: [
      [fn('SUM', col('price')), 'totalEarnings'],
      [col('Contract.Contractor.profession'), 'profession']
    ],
    include: [
      {
        model: Contract,
        required: true,
        include: [
          {
            model: Profile,
            as: 'Contractor',
            required: true,
            attributes: []
          }
        ]
      }
    ],
    where: {
      paid: true,
      paymentDate: { [Op.between]: [new Date(startDate), new Date(endDate)] }
    },
    group: ['Contract.Contractor.profession'],
    order: [[fn('SUM', col('price')), 'DESC']],
    raw: true
  })

  if (!bestProfession)
    return res.status(404).json({ message: 'No profession found' })

  return res.json({ profession: bestProfession.profession })
})

/**
 * @route GET /admin/best-clients
 * @desc Get top clients who paid the most in a given time range
 */
router.get('/best-clients', async (req, res) => {
  const { start: startDate, end: endDate, limit = 1 } = req.query

  const bestClients = await Job.findAll({
    attributes: [
      [fn('SUM', col('price')), 'totalEarnings'],
      [col('Contract.Contractor.id'), 'contractorId'],
      [col('Contract.Contractor.profession'), 'profession'],
      [col('Contract.Contractor.firstName'), 'firstName'],
      [col('Contract.Contractor.lastName'), 'lastName']
    ],
    include: [
      {
        model: Contract,
        required: true,
        include: [
          {
            model: Profile,
            as: 'Contractor',
            required: true
          }
        ]
      }
    ],
    where: {
      paid: true,
      paymentDate: { [Op.between]: [new Date(startDate), new Date(endDate)] }
    },
    group: ['Contract.Contractor.id'],
    order: [[fn('SUM', col('price')), 'DESC']],
    limit: Number(limit),
    raw: true
  })

  return res.json(
    bestClients.map(client => ({
      id: client.contractorId,
      fullName: `${client.firstName} ${client.lastName}`,
      paid: client.totalEarnings
    }))
  )
})

module.exports = router
