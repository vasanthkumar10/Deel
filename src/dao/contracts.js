const { Contract } = require('../model')

const getContractById = async (contractId, profileType, profileId) => {
  return await Contract.findOne({
    where: {
      id: contractId,
      [profileType]: profileId
    }
  })
}

const getAllNonTerminatedContracts = async (
  profileType,
  profileId,
  activeStatuses
) => {
  return await Contract.findAll({
    where: {
      status: activeStatuses,
      [profileType]: profileId
    }
  })
}

module.exports = { getContractById, getAllNonTerminatedContracts }
