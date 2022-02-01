import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react'
import { Route, useRouteMatch, useLocation } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'
import { Toggle, Text, Flex, useMatchBreakpoints } from '@pancakeswap/uikit'
import { ChainId } from '@pancakeswap/sdk'
import styled from 'styled-components'
import FlexLayout from 'components/Layout/Flex'
import Page from 'components/Layout/Page'
import { useFarms, usePollFarmsWithUserData,usePollFarmsPublicData, usePriceCakeBusd } from 'state/farms/hooks'
import useIntersectionObserver from 'hooks/useIntersectionObserver'
import { DeserializedFarm } from 'state/types'
import { useTranslation } from 'contexts/Localization'
// import { getBalanceNumber } from 'utils/formatBalance'
import { getFarmApr } from 'utils/apr'
// import { orderBy } from 'lodash'
import isArchivedPid from 'utils/farmHelpers'
// import { latinise } from 'utils/latinise'
import { useUserFarmStakedOnly, /* useUserFarmsViewMode */ } from 'state/user/hooks'
// import { ViewMode } from 'state/user/actions'
import PageHeader from 'components/PageHeader'
// import SearchInput from 'components/SearchInput'
// import { OptionProps } from 'components/Select/Select'
import Loading from 'components/Loading'
import FarmCard, { FarmWithStakedValue } from './components/FarmCard/FarmCard'
// import Table from './components/FarmTable/FarmTable'
import FarmTabButtons from './components/FarmTabButtons'
// import { RowProps } from './components/FarmTable/Row'
// import ToggleView from './components/ToggleView/ToggleView'
// import { DesktopColumnSchema } from './components/types'
import Hero from './components/Hero'

const ControlContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  position: relative;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 32px;

  ${({ theme }) => theme.mediaQueries.sm} {
    flex-wrap: wrap;
    padding: 16px;
    margin-bottom: 0;
  }
`

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;

  ${Text} {
    margin-left: 8px;
  }
`

// const LabelWrapper = styled.div`
//   > ${Text} {
//     font-size: 12px;
//   }
// `

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

const ViewControls = styled.div`
  flex-wrap: wrap;
  justify-content: space-between;
  display: flex;
  align-items: center;
  width: 100%;

  > div {
    padding: 8px 0px;
    margin: 0;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    justify-content: flex-start;
    width: auto;

    > div {
      padding: 0;
    }
  }
`

// const StyledImage = styled(Image)`
//   margin-left: auto;
//   margin-right: auto;
//   margin-top: 58px;
// `
const NUMBER_OF_FARMS_VISIBLE = 12
const chainId = process.env.REACT_APP_CHAIN_ID
const getDisplayApr = (cakeRewardsApr?: number, lpRewardsApr?: number) => {
  if (cakeRewardsApr && lpRewardsApr) {
    return (cakeRewardsApr + lpRewardsApr).toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  if (cakeRewardsApr) {
    return cakeRewardsApr.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  return null
}

const Farms: React.FC = () => {
  const { path } = useRouteMatch()
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const { data: farmsLP, userDataLoaded } = useFarms()
  const cakePrice = usePriceCakeBusd()
  // const [query, setQuery] = useState('')
  // const [viewMode,/* setViewMode */] = useUserFarmsViewMode()
  const { account } = useWeb3React()
  // const [sortOption, setSortOption] = useState('hot')
  const { observerRef, isIntersecting } = useIntersectionObserver()
  const chosenFarmsLength = useRef(0)

  const isArchived = pathname.includes('archived')
  const isInactive = pathname.includes('history')
  const isActive = !isInactive && !isArchived
  usePollFarmsPublicData(isArchived)
  usePollFarmsWithUserData(isArchived)
  // Users with no wallet connected should see 0 as Earned amount
  // Connected users should see loading indicator until first userData has loaded
  const userDataReady = !account || (!!account && userDataLoaded)

  const [stakedOnly, setStakedOnly] = useUserFarmStakedOnly(isActive)

  const activeFarms = farmsLP.filter((farm) => farm.pid !== 0 && farm.multiplier !== '0X' && !isArchivedPid(farm.pid))
  const inactiveFarms = farmsLP.filter((farm) => farm.pid !== 0 && farm.multiplier === '0X' && !isArchivedPid(farm.pid))
  const archivedFarms = farmsLP.filter((farm) => isArchivedPid(farm.pid))

  const stakedOnlyFarms = activeFarms.filter(
    (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance).isGreaterThan(0),
  )

  const stakedInactiveFarms = inactiveFarms.filter(
    (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance).isGreaterThan(0),
  )

  const stakedArchivedFarms = archivedFarms.filter(
    (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance).isGreaterThan(0),
  )

  const farmsList = useCallback(
    (farmsToDisplay: DeserializedFarm[]): FarmWithStakedValue[] => {
      const farmsToDisplayWithAPR: FarmWithStakedValue[] = farmsToDisplay.map((farm) => {
        if (!farm.lpTotalInQuoteToken || !farm.quoteTokenPriceBusd) {
          return farm
        }
        const totalLiquidity = new BigNumber(farm.lpTotalInQuoteToken).times(farm.quoteTokenPriceBusd)
        const { cakeRewardsApr, lpRewardsApr } = isActive
          ? getFarmApr(new BigNumber(farm.poolWeight), cakePrice, totalLiquidity, farm.lpAddresses[chainId])
          : { cakeRewardsApr: 0, lpRewardsApr: 0 }

        return { ...farm, apr: cakeRewardsApr, lpRewardsApr, liquidity: totalLiquidity }
      })

      // if (query) {
      //   const lowercaseQuery = latinise(query.toLowerCase())
      //   farmsToDisplayWithAPR = farmsToDisplayWithAPR.filter((farm: FarmWithStakedValue) => {
      //     return latinise(farm.lpSymbol.toLowerCase()).includes(lowercaseQuery)
      //   })
      // }
      return farmsToDisplayWithAPR
    },
    [cakePrice, isActive],
  )

  // const handleChangeQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setQuery(event.target.value)
  // }

  const [numberOfFarmsVisible, setNumberOfFarmsVisible] = useState(NUMBER_OF_FARMS_VISIBLE)

  const chosenFarmsMemoized = useMemo(() => {
    let chosenFarms = []

    const sortFarms = (farms: FarmWithStakedValue[]): FarmWithStakedValue[] => {
      return farms
    }

    if (isActive) {
      chosenFarms = stakedOnly ? farmsList(stakedOnlyFarms) : farmsList(activeFarms)
    }
    if (isInactive) {
      chosenFarms = stakedOnly ? farmsList(stakedInactiveFarms) : farmsList(inactiveFarms)
    }
    if (isArchived) {
      chosenFarms = stakedOnly ? farmsList(stakedArchivedFarms) : farmsList(archivedFarms)
    }

    return sortFarms(chosenFarms).slice(0, numberOfFarmsVisible)
    }, [
      // sortOption,
      activeFarms,
      farmsList,
      inactiveFarms,
      archivedFarms,
      isActive,
      isInactive,
      isArchived,
      stakedArchivedFarms,
      stakedInactiveFarms,
      stakedOnly,
      stakedOnlyFarms,
      numberOfFarmsVisible,
    ])

  chosenFarmsLength.current = chosenFarmsMemoized.length

  useEffect(() => {
    if (isIntersecting) {
      setNumberOfFarmsVisible((farmsCurrentlyVisible) => {
        if (farmsCurrentlyVisible <= chosenFarmsLength.current) {
          return farmsCurrentlyVisible + NUMBER_OF_FARMS_VISIBLE
        }
        return farmsCurrentlyVisible
      })
    }
  }, [isIntersecting])

  

  const renderContent = (): JSX.Element => {
    return (
      <FlexLayout>
        <Route exact path={`${path}`}>
          {chosenFarmsMemoized.map((farm) => (
            <FarmCard
              key={farm.pid}
              farm={farm}
              displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
              cakePrice={cakePrice}
              account={account}
              removed={false}
            />
          ))}
        </Route>
        <Route exact path={`${path}/history`}>
          {chosenFarmsMemoized.map((farm) => (
            <FarmCard
              key={farm.pid}
              farm={farm}
              displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
              cakePrice={cakePrice}
              account={account}
              removed
            />
          ))}
        </Route>
        <Route exact path={`${path}/archived`}>
          {chosenFarmsMemoized.map((farm) => (
            <FarmCard
              key={farm.pid}
              farm={farm}
              displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
              cakePrice={cakePrice}
              account={account}
              removed
            />
          ))}
        </Route>
      </FlexLayout>
    )
  }

  // const handleSortOptionChange = (option: OptionProps): void => {
  //   setSortOption(option.value)
  // }
  const { isMobile } = useMatchBreakpoints()
  return (
    <>
      <PageHeader background="#1F2533" borderRadius={isMobile?"0":"0 0 100px 100px"}>
        <Hero />
      </PageHeader>
      <Page style={{paddingInline:isMobile?"0px":"10px"}}>
        <ControlContainer>
          <ViewControls>
            <FarmTabButtons hasStakeInFinishedFarms={stakedInactiveFarms.length > 0} />
          </ViewControls>
          <FilterContainer>
            <ToggleWrapper>
              <Toggle
                id="staked-only-farms"
                checked={stakedOnly}
                defaultColor="input"
                onChange={() => setStakedOnly(!stakedOnly)}
                scale="sm"
              />
              <Text style={{fontSize:isMobile?"smaller":"medium"}}> {t('Only My Liquidity')}</Text>
            </ToggleWrapper>          
          </FilterContainer>
        </ControlContainer>
        {renderContent()}
        {account && !userDataLoaded && stakedOnly && (
          <Flex justifyContent="center">
            <Loading />
          </Flex>
        )}
        <div ref={observerRef} />
        {/* <StyledImage src="/images/decorations/3dpan.png" alt="Pancake illustration" width={120} height={103} /> */}
      </Page>
    </>
  )
}

export default Farms
