import { useCallback } from 'react'
import { harvestFarm } from 'utils/calls'
import { useMasterchef } from 'hooks/useContract'
import { useWeb3React } from '@web3-react/core'
import { useSingleCallResult }  from 'state/multicall/hooks'
import BigNumber from 'bignumber.js'

export const useHarvestFarm = (farmPid: number) => {
  const masterChefContract = useMasterchef()

  const handleHarvest = useCallback(async () => {
    await harvestFarm(masterChefContract, farmPid)
  }, [farmPid, masterChefContract])

  return { onReward: handleHarvest }
}

export const useHarvestTime = (sousId) => {
  const { account } = useWeb3React()
  const masterChefContract = useMasterchef()
  const userInfo = useSingleCallResult(masterChefContract, 'userInfo', [sousId, account])
  // console.log(new BigNumber (userInfo?.result?.nextHarvestUntil?._hex).toNumber())
  return new BigNumber (userInfo?.result?.nextHarvestUntil?._hex).toNumber()
}
