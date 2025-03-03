const contractDao = require('../dao/contracts')
const { CONTRACT_STATUS } = require('../utils/constants')

const fetchContractById = async (contractId, profileType, profileId) => {
  const contract = await contractDao.getContractById(
    contractId,
    profileType,
    profileId
  )
  if (!contract) {
    throw new Error('Contract not found')
  }
  return contract
}

const fetchAllNonTerminatedContracts = async (profileType, profileId) => {
  const activeStatuses = [CONTRACT_STATUS.NEW, CONTRACT_STATUS.IN_PROGRESS]
  return await contractDao.getAllNonTerminatedContracts(
    profileType,
    profileId,
    activeStatuses
  )
}

module.exports = { fetchContractById, fetchAllNonTerminatedContracts }
