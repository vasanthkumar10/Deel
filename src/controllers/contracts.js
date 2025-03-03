const contractService = require('../services/contracts')

const getContractById = async (req, res, next) => {
  try {
    const { id } = req.params
    const contract = await contractService.fetchContractById(
      id,
      req.profile.type,
      req.profile.id
    )
    res.status(200).json(contract)
  } catch (error) {
    next(error)
  }
}

const getAllContracts = async (req, res, next) => {
  try {
    const contracts = await contractService.fetchAllNonTerminatedContracts(
      req.profile.type,
      req.profile.id
    )
    res.status(200).json(contracts)
  } catch (error) {
    next(error)
  }
}

module.exports = { getContractById, getAllContracts }
