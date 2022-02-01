import React, { useState } from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { Card, Flex, Text, Skeleton } from '@pancakeswap/uikit'
import { DeserializedFarm } from 'state/types'
import { getBscScanLink } from 'utils'
import { useTranslation } from 'contexts/Localization'
import ExpandableSectionButton from 'components/ExpandableSectionButton'
import { BASE_ADD_LIQUIDITY_URL } from 'config'
import { getAddress } from 'utils/addressHelpers'
import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import DetailsSection from './DetailsSection'
import CardHeading from './CardHeading'
import CardActionsContainer from './CardActionsContainer'
import ApyButton from './ApyButton'

export interface FarmWithStakedValue extends DeserializedFarm {
  apr?: number
  lpRewardsApr?: number
  liquidity?: BigNumber
}

const StyledCard = styled(Card)`
  align-self: baseline;
  background: none;
  max-width: 90%;
  ${({ theme }) => theme.mediaQueries.sm} {
    max-width: 31.5%;
  }
`

const FarmCardInnerContainer = styled(Flex)`
  flex-direction: column;
  justify-content: space-around;
  padding: 24px;
  background: #273043;
  position: relative;
  &::before {
    position: absolute;
    width: 250px;
    height: 250px;
    content: ' ';
    background: #363F53;
    border-radius: 50%;
    left: -80px;
    top: -80px;
    z-index: 0;
  }
  > * {
    z-index: 1;
  }
`

const ExpandingWrapper = styled.div`
  padding: 24px;
  border-top: 2px solid ${({ theme }) => theme.colors.cardBorder};
  overflow: hidden;
`

interface FarmCardProps {
  farm: FarmWithStakedValue
  displayApr: string
  removed: boolean
  cakePrice?: BigNumber
  account?: string
}

const FarmCard: React.FC<FarmCardProps> = ({ farm, displayApr, removed, cakePrice, account }) => {
  console.log('displayApr',displayApr)
  const { t } = useTranslation()
  const [showExpandableSection, setShowExpandableSection] = useState(false)

  const totalValueFormatted =
    farm.liquidity && farm.liquidity.gt(0)
      ? `$${farm.liquidity.toNumber().toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      : ''

  const lpLabel = farm.lpSymbol && farm.lpSymbol.toUpperCase().replace('PANCAKE', '')
  // const earnLabel = farm.dual ? farm.dual.earnLabel : t('CAKE + Fees')

  const liquidityUrlPathParts = getLiquidityUrlPathParts({
    quoteTokenAddress: farm.quoteToken.address,
    tokenAddress: farm.token.address,
  })
  const addLiquidityUrl = `${BASE_ADD_LIQUIDITY_URL}/${liquidityUrlPathParts}`
  const lpAddress = getAddress(farm.lpAddresses)
  const isPromotedFarm = farm.token.symbol === 'CAKE'

  return (
    <StyledCard isActive={isPromotedFarm}>
      <FarmCardInnerContainer>
        <CardHeading
          lpLabel={lpLabel}
          multiplier={farm.multiplier}
          isCommunityFarm={farm.isCommunity}
          token={farm.token}
          quoteToken={farm.quoteToken}
        />
        {!removed && (
          <Flex flexDirection="column" alignItems="center">
            {displayApr?<Text fontSize="48px">{displayApr}%</Text>:<Skeleton height={48} width={150} />}
            <Text bold style={{ display: 'flex', alignItems: 'center' }}>
              <ApyButton
                variant="text-and-button"
                pid={farm.pid}
                lpSymbol={farm.lpSymbol}
                multiplier={farm.multiplier}
                lpLabel={lpLabel}
                addLiquidityUrl={addLiquidityUrl}
                cakePrice={cakePrice}
                apr={farm.apr}
                displayApr="APR"
              />
            </Text>
          </Flex>
        )}
        <Flex justifyContent="space-between" alignItems="flex-end" mt="30px">
          <Text>{t('Rewarded Token')}:</Text>
          <CurrencyLogo size="32px" />
        </Flex>
        <CardActionsContainer
          farm={farm}
          lpLabel={lpLabel}
          account={account}
          cakePrice={cakePrice}
          addLiquidityUrl={addLiquidityUrl}
        />
      </FarmCardInnerContainer>

      { false && <ExpandingWrapper>
        <ExpandableSectionButton
          onClick={() => setShowExpandableSection(!showExpandableSection)}
          expanded={showExpandableSection}
        />
        {showExpandableSection && (
          <DetailsSection
            removed={removed}
            bscScanAddress={getBscScanLink(lpAddress, 'address')}
            infoAddress={`/info/pool/${lpAddress}`}
            totalValueFormatted={totalValueFormatted}
            lpLabel={lpLabel}
            addLiquidityUrl={addLiquidityUrl}
          />
        )}
      </ExpandingWrapper>}
    </StyledCard>
  )
}

export default FarmCard
