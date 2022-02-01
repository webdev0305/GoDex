import React, { useMemo, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Pair } from '@pancakeswap/sdk'
import { Text, Flex, CardBody, CardFooter, Button, AddIcon, WarningIcon, useMatchBreakpoints, Heading } from '@pancakeswap/uikit'
import { Link } from 'react-router-dom'
import { useTranslation } from 'contexts/Localization'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import { usePairs } from '../../hooks/usePairs'
import { unwrappedToken, wrappedCurrency } from '../../utils/wrappedCurrency'
import { toV2LiquidityToken, useTrackedTokenPairs } from '../../state/user/hooks'
import Dots from '../../components/Loader/Dots'
import { DoubleCurrencyLogo } from '../../components/Logo'
import { LiquidityDeposit, MinimalPositionCard, PoolInfoCard } from '../../components/PositionCard'


const Body = styled(CardBody)`
  background-color: ${({ theme }) => theme.colors.dropdownDeep};
`

export default function PoolsRender() {
  const { account } = useActiveWeb3React()
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()
  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()
  
//   const [reloadView, setReloadView] = useState(0)
  const [trackedTokenPairs1, setLiquidityTokens] = useState(trackedTokenPairs)
 
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs1.map((tokens) => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs1],
  )
  const liquidityTokens = useMemo(
    () => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken),
    [tokenPairsWithLiquidityTokens],
  )
 
    const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
        account ?? undefined,
        liquidityTokens,
    )
  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0'),
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances],
  )

//   const [viewStatus, setViewStatus] = React.useState(location.pathname.startsWith('/remove')?5:0)
  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const v2IsLoading = fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some((V2Pair) => !V2Pair)
  
  const allV2PairsWithLiquidity = v2Pairs.map(([, _pair]) => _pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  const PoolsTable = styled.table`
    width: 100%;
    thead {
      background: #273043;
      color: white;
      
      th {
        padding: 30px 5px;
        ${({ theme }) => theme.mediaQueries.sm} {
          padding: 30px 10px;
          margin-left: 30px;
        }
        text-align: left;
        &:first-child {
          border-radius: 20px 0 0 20px;
        }
        &:last-child {
          border-radius: 0 20px 20px 0;
        }
      }      
    }
    td {
      padding: 30px 5px;
      vertical-align: middle;
      &:last-child button {
        width: 100%;
        color: white;
      }
    }
  `

  const Warning = styled.div`
    width: auto;
    margin: 50px auto;
    padding: 20px;
    background: #273043;
    border-radius: 20px;
    color: orange;
    font-size: 1.2em;
    display: flex;
    align-items: center;
  `
  const renderBody = () => {
    if (!account) {
      return (
        <tr>
          <td colSpan={3}>
            <Warning>
              <WarningIcon color="orange" width="48px" mr="20px" />
              {t('Connect to a wallet to view your liquidity.')}
            </Warning>    
          </td>
        </tr>
      )
    }
    if (v2IsLoading) {
      return (
        <tr>
          <td colSpan={3}>
            <Text color="textSubtle" textAlign="center" p="50px">
              <Dots>{t('Loading')}</Dots>
            </Text>
          </td>
        </tr>
      )
    }
    if (allV2PairsWithLiquidity?.length > 0) {
      const addressEllipsis = (address:string) => {
        return address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : null;
      }
      return allV2PairsWithLiquidity.map((v2Pair) => (        
        <tr key={`${v2Pair.token0.symbol}${v2Pair.token1.symbol}`} style={{padding:"10px"}}>
          <td style={{padding:"10px 5px"}}>
            <Flex alignItems="center">
              <DoubleCurrencyLogo currency0={unwrappedToken(v2Pair.token0)} currency1={unwrappedToken(v2Pair.token1)} size={30} margin />
              <Text fontSize={isMobile?"12px":"20px"} ml={isMobile?"5px":"20px"}>{addressEllipsis(v2Pair.liquidityToken.address)}</Text>
              <a href={`https://bscscan.com/address/${v2Pair.liquidityToken.address}`} rel="noreferrer" target="_blank">
              <Button variant="text" ml="-15px" mr="-15px">
                <svg xmlns="http://www.w3.org/2000/svg" width={isMobile?"16":"24"} height={isMobile?"16":"24"} viewBox="0 0 24 24">
                  <path id="Icon_awesome-share-square" data-name="Icon awesome-share-square" d="M26.612,8.318l-6.741,6.374a1.124,1.124,0,0,1-1.895-.818V10.5c-6.768.045-9.623,1.646-7.713,8.032a.75.75,0,0,1-1.171.812,9.027,9.027,0,0,1-3.474-6.72c0-6.747,5.505-8.086,12.358-8.124V1.126A1.124,1.124,0,0,1,19.871.308l6.741,6.374A1.126,1.126,0,0,1,26.612,8.318Zm-8.636,9.454V21H3V6H5.379a.561.561,0,0,0,.4-.173A9.127,9.127,0,0,1,8.172,4.061.562.562,0,0,0,7.913,3H2.247A2.248,2.248,0,0,0,0,5.25v16.5A2.248,2.248,0,0,0,2.247,24H18.725a2.248,2.248,0,0,0,2.247-2.25V17.587a.562.562,0,0,0-.75-.53,3.358,3.358,0,0,1-1.6.158A.563.563,0,0,0,17.976,17.772Z" transform="translate(0 0)" fill="#fff"/>
                </svg>
              </Button>
              </a>
            </Flex>
          </td>
          <td style={{padding:"10px 5px"}}>
            <LiquidityDeposit pair={v2Pair} />
          </td>
          <td style={{padding:"10px 5px"}}>
            <Button variant="primary" p="10px" as={Link} to={`/liquidity/${v2Pair.token0.address}/${v2Pair.token1.address}`}>{isMobile?"Manage":"Manage Your Liquidity"}</Button>
          </td>
        </tr>
      ))
    }
    return (
      <tr>
        <td colSpan={3} align="center">
          <img src="/images/pool-nodata.png" alt="No data" style={{margin:"40px 0"}} />
          <Text color="#70747B">
            Dont see a pool you joined? <Link style={{color:"#1EBF8D"}} to="/find">Import it</Link>
          </Text>
          <Text color="#70747B">
            Or, if you stake your tokens in a farm, unstake them to see
          </Text>
        </td>
      </tr>
    )
  }


  return (
    <>
        <Heading color="white" mb="30px">My Liquidity</Heading>
        <PoolsTable>
            <thead>
                <tr>
                    <th>Pool</th>
                    <th>My Liquididy</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {renderBody()}
            </tbody>
        </PoolsTable>        
    </>
  )
}
