import React from 'react'
import styled from 'styled-components'
import { useTotalSupply, useBurnedBalance } from 'hooks/useTokenBalance'
import { getBalanceNumber, formatLocalisedCompactNumber } from 'utils/formatBalance'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { Flex, Text, Heading, Skeleton } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import Balance from 'components/Balance'
import tokens from 'config/constants/tokens'

const StyledColumn = styled(Flex)<{ noMobileBorder?: boolean }>`
  flex-direction: column;
  ${({ noMobileBorder, theme }) =>
    noMobileBorder
      ? `${theme.mediaQueries.md} {
           padding: 0 16px;
           border-left: 1px ${theme.colors.inputSecondary} solid;
         }
       `
      : `border-left: 1px ${theme.colors.inputSecondary} solid;
         padding: 0 8px;
         ${theme.mediaQueries.sm} {
           padding: 0 16px;
         }
       `}
`

const Grid = styled.div`
  width: 90%;
  display: grid;
  grid-gap: 16px 8px;
  margin: 24px;
  grid-template-columns: repeat(2, auto);

  ${({ theme }) => theme.mediaQueries.sm} {
    grid-gap: 16px;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    grid-gap: 32px;
    grid-template-columns: repeat(4, auto);
  }
`

const emissionsPerBlock = 25

const CakeDataRow = () => {
  const { t } = useTranslation()
  const totalSupply = useTotalSupply()
  const burnedBalance = getBalanceNumber(useBurnedBalance(tokens.cake.address))
  const cakeSupply = totalSupply ? getBalanceNumber(totalSupply) - burnedBalance : 0
  const cakePriceBusd = usePriceCakeBusd()
  
  const mcap = cakePriceBusd.times(cakeSupply)
  const mcapString = formatLocalisedCompactNumber(mcap.toNumber())

  return (
    <Grid>
      <Flex flexDirection="column">
        <Text color="#8B95A8" mb="24px">Total supply</Text>
        {totalSupply ? (
          <Balance decimals={0} lineHeight="1.1" fontSize="24px"  
          value={getBalanceNumber(totalSupply)} 
          // value={271105}
          />
        ) : (
          <Skeleton height={24} width={126} my="4px" />
        )}
      </Flex>
      <StyledColumn>
        <Text color="#8B95A8" mb="24px">Total Burned</Text>
        {burnedBalance ? (
          <Balance decimals={0} lineHeight="1.1" fontSize="24px"  
          value={burnedBalance} 
          // value={1547107.15}
          />
        ) : (
          <Skeleton height={24} width={126} my="4px" />
        )}
      </StyledColumn>
      <StyledColumn noMobileBorder>
        <Text color="#8B95A8" mb="24px">Circulating Supply</Text>
        {cakeSupply ? (
          <Balance decimals={0} lineHeight="1.1" fontSize="24px"  
          value={cakeSupply} 
          // value={271105}
          />
        ) : (
          <Skeleton height={24} width={126} my="4px" />
        )}
        
      </StyledColumn>
      <StyledColumn>
        <Text color="#8B95A8" mb="24px">MarketCap</Text>

        {mcap?.gt(0) && mcapString ? (
          <Balance decimals={5} lineHeight="1.1" fontSize="24px"  prefix='$'
          value={mcap.toNumber()} 
          />
        ) : (
          <Skeleton height={24} width={126} my="4px" />
        )}
      </StyledColumn>
    </Grid>
  )
}

export default CakeDataRow
