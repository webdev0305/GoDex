import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
// import { ethers } from 'ethers'
// import { formatUnits } from 'ethers/lib/utils'
import BigNumber from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'
import { Flex, Text, Toggle, useMatchBreakpoints } from '@pancakeswap/uikit'
// import orderBy from 'lodash/orderBy'
import partition from 'lodash/partition'
import { useTranslation } from 'contexts/Localization'
import useIntersectionObserver from 'hooks/useIntersectionObserver'
import {
  useFetchPublicPoolsData,
  usePools,
  useFetchUserPools,
  useFetchCakeVault,
  useCakeVault,
} from 'state/pools/hooks'
import { usePollFarmsPublicData } from 'state/farms/hooks'
// import { latinise } from 'utils/latinise'
import FlexLayout from 'components/Layout/Flex'
import Page from 'components/Layout/Page'
import PageHeader from 'components/PageHeader'
// import SearchInput from 'components/SearchInput'
// import Select, { OptionProps } from 'components/Select/Select'
import { DeserializedPool } from 'state/types'
import { useUserPoolStakedOnly } from 'state/user/hooks'
// import { ViewMode } from 'state/user/actions'
import Loading from 'components/Loading'
import PoolCard from './components/PoolCard'
// import CakeVaultCard from './components/CakeVaultCard'
import PoolTabButtons from './components/PoolTabButtons'
// import BountyCard from './components/BountyCard'
// import HelpButton from './components/HelpButton'
// import PoolsTable from './components/PoolsTable/PoolsTable'
// import { getAprData, getCakeVaultEarnings } from './helpers'
import Hero from './components/Hero'

const CardLayout = styled(FlexLayout)`
  justify-content: center;
`

const PoolControls = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  position: relative;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 32px;

  ${({ theme }) => theme.mediaQueries.sm} {
    flex-direction: row;
    flex-wrap: wrap;
    padding: 16px 32px;
    margin-bottom: 0;
  }
`

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 0px;

  ${({ theme }) => theme.mediaQueries.sm} {
    width: auto;
    padding: 0;
  }
`

// const LabelWrapper = styled.div`
//   > ${Text} {
//     font-size: 12px;
//   }
// `

// const ControlStretch = styled(Flex)`
//   > div {
//     flex: 1;
//   }
// `

const NUMBER_OF_POOLS_VISIBLE = 12

const Pools: React.FC = () => {
  const location = useLocation()
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const { pools: poolsWithoutAutoVault, userDataLoaded } = usePools()
  const [stakedOnly, setStakedOnly] = useUserPoolStakedOnly()
  // const [viewMode, setViewMode] = useUserPoolsViewMode()
  const [numberOfPoolsVisible, setNumberOfPoolsVisible] = useState(NUMBER_OF_POOLS_VISIBLE)
  const { observerRef, isIntersecting } = useIntersectionObserver()
  // const [searchQuery, setSearchQuery] = useState('')
  // const [sortOption, setSortOption] = useState('hot')
  const chosenPoolsLength = useRef(0)
  const {
    userData: { /* cakeAtLastUserAction, */ userShares },
    // fees: { performanceFee },
    // pricePerFullShare,
    // totalCakeInVault,
  } = useCakeVault()
  const accountHasVaultShares = userShares && userShares.gt(0)
  // const performanceFeeAsDecimal = performanceFee && performanceFee / 100

  const pools = useMemo(() => {
    const cakePool = poolsWithoutAutoVault.find((pool) => pool.sousId === 0)
    const cakeAutoVault = { ...cakePool, isAutoVault: true }
    return [cakeAutoVault, ...poolsWithoutAutoVault]
  }, [poolsWithoutAutoVault])

  // TODO aren't arrays in dep array checked just by reference, i.e. it will rerender every time reference changes?
  const [finishedPools, openPools] = useMemo(() => partition(pools, (pool) => pool.isFinished), [pools])
  const stakedOnlyFinishedPools = useMemo(
    () =>
      finishedPools.filter((pool) => {
        if (pool.isAutoVault) {
          return accountHasVaultShares
        }
        return pool.userData && new BigNumber(pool.userData.stakedBalance).isGreaterThan(0)
      }),
    [finishedPools, accountHasVaultShares],
  )
  const stakedOnlyOpenPools = useMemo(
    () =>
      openPools.filter((pool) => {
        if (pool.isAutoVault) {
          return accountHasVaultShares
        }
        return pool.userData && new BigNumber(pool.userData.stakedBalance).isGreaterThan(0)
      }),
    [openPools, accountHasVaultShares],
  )
  const hasStakeInFinishedPools = stakedOnlyFinishedPools.length > 0

  usePollFarmsPublicData()
  useFetchCakeVault()
  useFetchPublicPoolsData()
  useFetchUserPools(account)
  useEffect(() => {
    if (isIntersecting) {
      setNumberOfPoolsVisible((poolsCurrentlyVisible) => {
        if (poolsCurrentlyVisible <= chosenPoolsLength.current) {
          return poolsCurrentlyVisible + NUMBER_OF_POOLS_VISIBLE
        }
        return poolsCurrentlyVisible
      })
    }
  }, [isIntersecting])

  const showFinishedPools = location.pathname.includes('history')

  // const handleChangeSearchQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setSearchQuery(event.target.value)
  // }

  // const handleSortOptionChange = (option: OptionProps): void => {
  //   setSortOption(option.value)
  // }

  const sortPools = (poolsToSort: DeserializedPool[]) => {
    return poolsToSort
  }

  let chosenPools
  if (showFinishedPools) {
    chosenPools = stakedOnly ? stakedOnlyFinishedPools : finishedPools
  } else {
    chosenPools = stakedOnly ? stakedOnlyOpenPools : openPools
  }

  // if (searchQuery) {
  //   const lowercaseQuery = latinise(searchQuery.toLowerCase())
  //   chosenPools = chosenPools.filter((pool) =>
  //     latinise(pool.earningToken.symbol.toLowerCase()).includes(lowercaseQuery),
  //   )
  // }

  chosenPools = sortPools(chosenPools).slice(0, numberOfPoolsVisible)
  chosenPoolsLength.current = chosenPools.length

  const ToggleWrapper = styled.div`
    display: flex;
    align-items: center;
    margin-left: 10px;

    ${Text} {
      margin-left: 8px;
    }
  `

  // const tableLayout = <PoolsTable pools={chosenPools} account={account} userDataLoaded={userDataLoaded} />
  const { isMobile } = useMatchBreakpoints()
  return (
    <>
      <PageHeader background="#1F2533" borderRadius={isMobile?"0":"0 0 100px 100px"}>
        <Hero />
      </PageHeader>
      <Page style={{paddingInline:isMobile?"0px":"10px"}}>
        <PoolControls>
          <PoolTabButtons hasStakeInFinishedPools={hasStakeInFinishedPools} />
          <FilterContainer>
            <ToggleWrapper>
              <Toggle checked={stakedOnly} onChange={() => setStakedOnly(!stakedOnly)} scale="sm" />
              <Text style={{fontSize:isMobile?"smaller":"medium"}}> {t('Only My Liquidity')}</Text>
            </ToggleWrapper>
          </FilterContainer>
        </PoolControls>
        {showFinishedPools && (
          <Text fontSize="20px" color="failure" pb="32px">
            {t('These pools are no longer distributing rewards. Please unstake your tokens.')}
          </Text>
        )}
        {account && !userDataLoaded && stakedOnly && (
          <Flex justifyContent="center" mb="4px">
            <Loading />
          </Flex>
        )}
        <CardLayout>
          {chosenPools.map((pool) =>
            !pool.isAutoVault && (
              <PoolCard key={pool.sousId} pool={pool} account={account} />
            ),
          )}
        </CardLayout>
        <div ref={observerRef} />
      </Page>
    </>
  )
}

export default Pools
