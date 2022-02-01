import React from 'react'
import { CardHeader, Heading } from '@pancakeswap/uikit'
import { Token } from '@pancakeswap/sdk'
import styled from 'styled-components'
// import { useTranslation } from 'contexts/Localization'
import { CurrencyLogo } from 'components/Logo'
// import { TokenPairImage } from 'components/TokenImage'
// import CakeVaultTokenPairImage from '../CakeVaultCard/CakeVaultTokenPairImage'

const Wrapper = styled(CardHeader)<{ isFinished?: boolean; background?: string }>`
  display: flex;
  justify-content: space-between;
  padding: 0;
  background: none;
`

const StyledCardHeader: React.FC<{
  earningToken: Token
  stakingToken: Token
  isAutoVault?: boolean
  isFinished?: boolean
  isStaking?: boolean
}> = ({ earningToken, stakingToken, isFinished = false }) => {
  // const { t } = useTranslation()
  // const isCakePool = earningToken.symbol === 'CAKE' && stakingToken.symbol === 'CAKE'
  
  // const getHeadingPrefix = () => {
  //   if (isAutoVault) {
  //     // vault
  //     return t('Auto')
  //   }
  //   if (isCakePool) {
  //     // manual cake
  //     return t('Manual')
  //   }
  //   // all other pools
  //   return t('Earn')
  // }

  // const getSubHeading = () => {
  //   if (isAutoVault) {
  //     return t('Automatic restaking')
  //   }
  //   if (isCakePool) {
  //     return t('Earn CAKE, stake CAKE')
  //   }
  //   return t('Stake %symbol%', { symbol: stakingToken.symbol })
  // }

  return (
    <Wrapper isFinished={isFinished}>
      <CurrencyLogo currency={stakingToken} size="64px" />
      <Heading mt="16px" width="100%" textAlign="center" color="primary">
        <span style={{color:'white'}}>Stake</span> {stakingToken.symbol} <span style={{color:'white'}}>Earn</span> {earningToken.symbol}
      </Heading>
    </Wrapper>
  )
}

export default StyledCardHeader
