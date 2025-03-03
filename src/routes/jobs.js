const express = require('express')
const { getProfile } = require('../middleware/getProfile')
const { Job, Contract, Profile, sequelize } = require('../model')
const { CONTRACT_STATUS } = require('../utils/constants')

const router = express.Router()

/**
 * @route GET /jobs/unpaid
 * @desc Get all unpaid jobs for the authenticated user with active contracts
 */
router.get('/unpaid', getProfile, async (req, res) => {
  const jobs = await Job.findAll({
    where: { paid: false },
    include: [
      {
        model: Contract,
        where: {
          status: CONTRACT_STATUS.IN_PROGRESS,
          [req.profile.type]: req.profile.id
        }
      }
    ]
  })
  return res.json(jobs)
})

/**
 * @route POST /jobs/:job_id/pay
 * @desc Pay for a job (Only if the client has enough balance)
 */
router.post('/:job_id/pay', getProfile, async (req, res) => {
  const { job_id } = req.params
  const transaction = await sequelize.transaction()

  try {
    const job = await Job.findOne({
      where: { id: job_id, paid: false },
      include: [
        {
          model: Contract,
          // where: { ClientId: req.profile.id, status: 'in_progress' }
          where: { ClientId: req.profile.id } // assuming terminated contracts can be paid
        }
      ],
      transaction
    })

    if (!job) {
      await transaction.rollback()
      return res.status(404).json({ message: 'Job not found or already paid' })
    }

    const client = await Profile.findByPk(req.profile.id, { transaction })
    const contractor = await Profile.findByPk(job.Contract.ContractorId, {
      transaction
    })

    if (client.balance < job.price) {
      await transaction.rollback()
      return res.status(400).json({ message: 'Insufficient balance' })
    }

    await client.update(
      { balance: client.balance - job.price },
      { transaction }
    )
    await contractor.update(
      { balance: contractor.balance + job.price },
      { transaction }
    )
    await job.update({ paid: true, paymentDate: new Date() }, { transaction })

    // commit the transaction
    await transaction.commit()
    return res.json({ message: 'Payment successful' })
  } catch (error) {
    await transaction.rollback()
    return res
      .status(500)
      .json({ message: 'Payment failed', error: error.message })
  }
})

module.exports = router
