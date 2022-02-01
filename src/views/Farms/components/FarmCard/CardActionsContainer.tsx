import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { ButtonMenu, ButtonMenuItem, Flex, Text } from '@pancakeswap/uikit'
import { getAddress } from 'utils/addressHelpers'
import { DeserializedFarm } from 'state/types'
import { useTranslation } from 'contexts/Localization'
import useToast from 'hooks/useToast'
import { useERC20 } from 'hooks/useContract'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { RowFixed } from 'components/Layout/Row'
import { getBalanceNumber } from 'utils/formatBalance'
import StakeAction from './StakeAction'
import HarvestAction from './HarvestAction'
import useApproveFarm from '../../hooks/useApproveFarm'

const Action = styled.div`
  padding-top: 0px;
`
export interface FarmWithStakedValue extends DeserializedFarm {
  apr?: number
}

interface FarmCardActionsProps {
  farm: FarmWithStakedValue
  account?: string
  addLiquidityUrl?: string
  cakePrice?: BigNumber
  lpLabel?: string
}

const CardActions: React.FC<FarmCardActionsProps> = ({ farm, account, addLiquidityUrl, cakePrice, lpLabel }) => {
  const { t } = useTranslation()
  const { toastError } = useToast()
  const { pid, lpAddresses } = farm
  const { allowance, tokenBalance, stakedBalance, earnings, canHarvest } = farm.userData || {}
  const lpAddress = getAddress(lpAddresses)
  const isApproved = account && allowance && allowance.isGreaterThan(0)
  const lpContract = useERC20(lpAddress)

  return (
    <Action>
      {account && <Flex justifyContent="space-between" mt="20px">
        <Text>Staked Amount</Text>
        <RowFixed><Text>{getBalanceNumber(stakedBalance)}</Text></RowFixed>
      </Flex>}
      <Flex justifyContent="space-between" mt="20px">
        <Text>Deposit Fee</Text>
        <Text>{2}%</Text>
      </Flex>
      <Flex justifyContent="space-between" my="20px">
        <Text>Harvest Lookup</Text>
        <Text>{12}h</Text>
      </Flex>
      {!account ? <ConnectWalletButton mt="8px" width="100%" />:
        <ButtonMenu fullWidth activeIndex={0} scale="md" variant="subtle">
          <StakeAction
            stakedBalance={stakedBalance}
            tokenBalance={tokenBalance}
            tokenName={farm.lpSymbol}
            pid={pid}
            apr={farm.apr}
            lpLabel={lpLabel}
            cakePrice={cakePrice}
            addLiquidityUrl={addLiquidityUrl}
            farm={farm}
            isApproved={isApproved}
          />
          <HarvestAction earnings={earnings} canHarvest={canHarvest} pid={pid} />
        </ButtonMenu>
      }
    </Action>
  )
}

export default CardActions
