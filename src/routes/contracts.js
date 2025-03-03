const express = require('express')
const { getProfile } = require('../middleware/getProfile')
const { Contract } = require('../model')
const { CONTRACT_STATUS } = require('../utils/constants')

const router = express.Router()

/**
 * @route GET /contracts/:id
 * @desc Get a contract by ID (only if it belongs to the authenticated user)
 */
router.get('/:id', getProfile, async (req, res) => {
  const { id } = req.params
  const contract = await Contract.findOne({
    where: { id, [req.profile.type]: req.profile.id }
  })
  if (!contract) return res.status(404).json({ message: 'Contract not found' })
  return res.json(contract)
})

/**
 * @route GET /contracts
 * @desc Get all non-terminated contracts of the authenticated user
 */
router.get('/', getProfile, async (req, res) => {
  const contracts = await Contract.findAll({
    where: {
      status: [CONTRACT_STATUS.NEW, CONTRACT_STATUS.IN_PROGRESS],
      [req.profile.type]: req.profile.id
    }
  })
  return res.json(contracts)
})

module.exports = router
