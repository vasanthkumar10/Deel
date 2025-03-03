const express = require('express')
const { Profile, Job, Contract } = require('../model')
const { PROFILE_TYPE } = require('../utils/constants')

const router = express.Router()

/**
 * @route POST /balances/deposit/:userId
 * @desc Deposit money into a client's balance (max 25% of total unpaid jobs)
 */
router.post('/deposit/:userId', async (req, res) => {
  const { userId } = req.params
  const { amount } = req.body

  const client = await Profile.findByPk(userId)
  if (!client || client.type !== PROFILE_TYPE.CLIENT) {
    return res.status(400).json({ message: 'Invalid client' })
  }

  const unpaidJobs = await Job.findAll({
    where: { paid: false },
    include: [
      //   { model: Contract, where: { ClientId: userId, status: 'in_progress' } }
      { model: Contract, where: { ClientId: userId } } // assuming terminated and new contracts can be considered.
    ]
  })

  const totalUnpaid = unpaidJobs.reduce((sum, job) => sum + job.price, 0)
  const maxDeposit = totalUnpaid * 0.25

  if (amount > maxDeposit) {
    return res
      .status(400)
      .json({ message: `Deposit exceeds allowed limit of ${maxDeposit}` })
  }

  await client.update({ balance: client.balance + amount })

  return res.json({ message: 'Deposit successful', newBalance: client.balance })
})

module.exports = router
