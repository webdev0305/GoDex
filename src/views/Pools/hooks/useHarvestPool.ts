import { useCallback } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useAppDispatch } from 'state'
import { updateUserBalance, updateUserPendingReward } from 'state/actions'
import {useSingleCallResult}  from 'state/multicall/hooks'
import { harvestFarm } from 'utils/calls'
import { BIG_ZERO } from 'utils/bigNumber'
import getGasPrice from 'utils/getGasPrice'
import { useMasterchef, useSousChef } from 'hooks/useContract'
import { DEFAULT_GAS_LIMIT } from 'config'
import BigNumber from 'bignumber.js'

const options = {
  gasLimit: DEFAULT_GAS_LIMIT,
}

const harvestPool = async (sousChefContract) => {
  const gasPrice = getGasPrice()
  const tx = await sousChefContract.deposit('0', { ...options, gasPrice })
  const receipt = await tx.wait()
  return receipt.status
}

const harvestPoolBnb = async (sousChefContract) => {
  const gasPrice = getGasPrice()
  const tx = await sousChefContract.deposit({ ...options, value: BIG_ZERO, gasPrice })
  const receipt = await tx.wait()
  return receipt.status
}

export const useHarvestPool = (sousId, isUsingBnb = false) => {
  const dispatch = useAppDispatch()
  const { account } = useWeb3React()
  const sousChefContract = useSousChef(sousId)
  const masterChefContract = useMasterchef()

  const handleHarvest = useCallback(async () => {
    if (sousId === 0) {
      await harvestFarm(masterChefContract, 0)
    } else if (isUsingBnb) {
      await harvestPoolBnb(sousChefContract)
    } else {
      await harvestPool(sousChefContract)
    }
    dispatch(updateUserPendingReward(sousId, account))
    dispatch(updateUserBalance(sousId, account))
  }, [account, dispatch, isUsingBnb, masterChefContract, sousChefContract, sousId])

  return { onReward: handleHarvest }
}


export const useHarvestTime = (sousId) => {
  const { account } = useWeb3React()
  const masterChefContract = useMasterchef()
  const userInfo = useSingleCallResult(masterChefContract, 'userInfo', [sousId, account])
  return new BigNumber (userInfo?.result?.nextHarvestUntil?._hex).toNumber()
}

// export default useHarvestPool
