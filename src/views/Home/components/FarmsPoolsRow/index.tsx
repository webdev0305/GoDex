import React, { useState, useEffect, useRef, useCallback } from 'react'
// import Slider from "react-slick"
import styled from 'styled-components'
import { Flex, Box, SwapVertIcon, IconButton, Heading, Button, Link, Skeleton, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { DeserializedPool } from 'state/types'
import useIntersectionObserver from 'hooks/useIntersectionObserver'
import useGetTopFarmsByApr from 'views/Home/hooks/useGetTopFarmsByApr'
import useGetTopPoolsByApr from 'views/Home/hooks/useGetTopPoolsByApr'
import Balance from 'components/Balance'
import TopFarmPool from './TopFarmPool'
import RowHeading from './RowHeading'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, auto);

  ${({ theme }) => theme.mediaQueries.sm} {
    grid-gap: 16px;
    grid-template-columns: repeat(5, auto);
  }

  ${({ theme }) => theme.mediaQueries.md} {
    grid-gap: 32px;
  }
`

const FarmCard = styled.div`
  background-color: #273043;
  padding: 20px;
  border-radius: 20px;
  margin-top: 10px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  h2{
    display: flex;
    width: 50%;
    flex-direction: row;
    justify-content: space-between;
    align-items: end;
  }
  h3 {
    font-size: larger;
    position: relative;
    padding-left: 70px;
    img {
      height: 32px;
    }
    span.token1 {
      position: absolute;
      z-index: 8;
      left: 0px;
      transform: translateY(-50%);
      top: 50%;
    }
    span.token2 {
      position: absolute;
      left: 25px;
      transform: translateY(-50%);
      top: 50%;
    }
  }

  @media screen and (max-width: 576px) {
    margin: 10px;
    min-width: 300px;
    height: 170px;
    flex-direction: column;
    justify-content: space-around;
    h2 {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }
    h3 {
      width: 100%;
    }
  }
`
const PoolCard = styled.div`
  background-color: #273043;
  padding: 20px;
  border-radius: 20px;
  margin-top: 10px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  > span {
    position: relative;
    padding-left: 70px;
    img {
      height: 100%;
    }
    span.token1 {
      position: absolute;
      height: 40px;
      left: 0px;
      transform: translateY(-50%);
      top: 50%;
    }
    span.token2 {
      position: absolute;
      height: 30px;
      left: 20px;
      top: 20px;      
    }
  }

  h2{
    display: flex;
    width: 50%;
    flex-direction: row;
    justify-content: space-between;
    align-items: end;
  }
  @media screen and (max-width: 576px) {
    margin: 10px;
    min-width: 300px;
    height: 170px;
    flex-direction: column;
    justify-content: space-around;
    h2 {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }
    span {
      width: 100%;
    }
  }
`

const FarmsPoolsRow = () => {
  const [showFarms, setShowFarms] = useState(false)
  const { t } = useTranslation()
  const { observerRef, isIntersecting } = useIntersectionObserver()
  
  const { topFarms } = useGetTopFarmsByApr(isIntersecting)
  const { topPools } = useGetTopPoolsByApr(isIntersecting)
  const timer = useRef<ReturnType<typeof setTimeout>>(null)
  const isLoaded = topFarms[0] && topPools[0]

  const { isMobile } = useMatchBreakpoints()

  const startTimer = useCallback(() => {
    timer.current = setInterval(() => {
      setShowFarms((prev) => !prev)
    }, 6000)
  }, [timer])

  useEffect(() => {
    if (isLoaded) {
      startTimer()
    }

    return () => {
      clearInterval(timer.current)
    }
  }, [timer, isLoaded, startTimer])

  const getPoolText = (pool: DeserializedPool) => {
    if (pool.isAutoVault) {
      return t('Auto CAKE')
    }

    if (pool.sousId === 0) {
      return t('Manual CAKE')
    }

    return t('Stake %stakingSymbol% - Earn %earningSymbol%', {
      earningSymbol: pool.earningToken.symbol,
      stakingSymbol: pool.stakingToken.symbol,
    })
  }

  const IconCalc = () => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="16" viewBox="0 0 13 16" style={{ marginLeft: "10px" }}>
        <path d="M11.607,0H1.393A1.486,1.486,0,0,0,0,1.5v13A1.486,1.486,0,0,0,1.393,16H11.607A1.486,1.486,0,0,0,13,14.5V1.5A1.486,1.486,0,0,0,11.607,0ZM3.714,13.6a.416.416,0,0,1-.371.4H2.229a.416.416,0,0,1-.371-.4V12.4a.416.416,0,0,1,.371-.4H3.343a.416.416,0,0,1,.371.4Zm0-4a.416.416,0,0,1-.371.4H2.229a.416.416,0,0,1-.371-.4V8.4A.416.416,0,0,1,2.229,8H3.343a.416.416,0,0,1,.371.4Zm3.714,4a.416.416,0,0,1-.371.4H5.943a.416.416,0,0,1-.371-.4V12.4a.416.416,0,0,1,.371-.4H7.057a.416.416,0,0,1,.371.4Zm0-4a.416.416,0,0,1-.371.4H5.943a.416.416,0,0,1-.371-.4V8.4A.416.416,0,0,1,5.943,8H7.057a.416.416,0,0,1,.371.4Zm3.714,4a.416.416,0,0,1-.371.4H9.657a.416.416,0,0,1-.371-.4V8.4A.416.416,0,0,1,9.657,8h1.114a.416.416,0,0,1,.371.4v5.2Zm0-8a.416.416,0,0,1-.371.4H2.229a.416.416,0,0,1-.371-.4V2.4A.416.416,0,0,1,2.229,2h8.543a.416.416,0,0,1,.371.4Z" fill="#8b95a8" />
      </svg>
    )
  }

  const IconHelp = () => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="19.174" height="19.174" viewBox="0 0 19.174 19.174" style={{ marginLeft: "10px" }}>
        <g transform="translate(-665 -1924)">
          <g transform="translate(665 1924)" fill="none">
            <path d="M9.587,0A9.587,9.587,0,1,1,0,9.587,9.587,9.587,0,0,1,9.587,0Z" stroke="none" />
            <path d="M 9.5867919921875 1.500001907348633 C 5.127721786499023 1.500001907348633 1.500001907348633 5.127721786499023 1.500001907348633 9.5867919921875 C 1.500001907348633 14.04586219787598 5.127721786499023 17.67358207702637 9.5867919921875 17.67358207702637 C 14.04586219787598 17.67358207702637 17.67358207702637 14.04586219787598 17.67358207702637 9.5867919921875 C 17.67358207702637 5.127721786499023 14.04586219787598 1.500001907348633 9.5867919921875 1.500001907348633 M 9.5867919921875 1.9073486328125e-06 C 14.88143157958984 1.9073486328125e-06 19.17358207702637 4.292152404785156 19.17358207702637 9.5867919921875 C 19.17358207702637 14.88143157958984 14.88143157958984 19.17358207702637 9.5867919921875 19.17358207702637 C 4.292152404785156 19.17358207702637 1.9073486328125e-06 14.88143157958984 1.9073486328125e-06 9.5867919921875 C 1.9073486328125e-06 4.292152404785156 4.292152404785156 1.9073486328125e-06 9.5867919921875 1.9073486328125e-06 Z" stroke="none" fill="#8b95a8" />
          </g>
          <path d="M3-2.292Q2.99-2.52,2.99-2.634A3.2,3.2,0,0,1,3.18-3.8a2.645,2.645,0,0,1,.451-.743,8.547,8.547,0,0,1,.822-.8,3.882,3.882,0,0,0,.771-.835A1.345,1.345,0,0,0,5.4-6.849,1.584,1.584,0,0,0,4.881-8.02a1.763,1.763,0,0,0-1.276-.5,1.716,1.716,0,0,0-1.219.457A2.408,2.408,0,0,0,1.746-6.64L.571-6.779a3.035,3.035,0,0,1,.943-1.993,3.017,3.017,0,0,1,2.073-.692,3.1,3.1,0,0,1,2.177.743,2.346,2.346,0,0,1,.813,1.8A2.275,2.275,0,0,1,6.291-5.8a5.325,5.325,0,0,1-1.117,1.25,5.657,5.657,0,0,0-.73.73,1.627,1.627,0,0,0-.254.54,4.521,4.521,0,0,0-.1.99ZM2.926,0V-1.3h1.3V0Z" transform="translate(671 1938)" fill="#8b95a8" />
        </g>
      </svg>
    )
  }

  // const IconGo = () => {
  //   return (
  //     <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
  //       <g id="Group_282" data-name="Group 282" transform="translate(-0.792 -0.75)">
  //         <circle id="Ellipse_1" data-name="Ellipse 1" cx="15" cy="15" r="15" transform="translate(0.792 0.75)" fill="#fff"/>
  //         <g id="Group_90" data-name="Group 90" transform="translate(5.877 9.68)">
  //           <g id="Group_17" data-name="Group 17" transform="translate(0 0)">
  //             <g id="Group_226" data-name="Group 226" transform="translate(0 0)">
  //               <path id="Path_13" data-name="Path 13" d="M6954.972-1954.41a3.8,3.8,0,0,0-1.776-.377,4.648,4.648,0,0,0-1.947.377,3.442,3.442,0,0,0-1.342,1.069,4.65,4.65,0,0,0-.769,1.638,6.181,6.181,0,0,0-.156.61,5.3,5.3,0,0,0-.1.623,2.905,2.905,0,0,0,.15,1.631,2.165,2.165,0,0,0,1.021,1.076,3.831,3.831,0,0,0,1.789.377,4.746,4.746,0,0,0,1.986-.377,3.313,3.313,0,0,0,1.331-1.076,4.856,4.856,0,0,0,.754-1.631c.045-.183.094-.391.144-.623s.089-.436.117-.61a2.706,2.706,0,0,0-.157-1.638A2.28,2.28,0,0,0,6954.972-1954.41Zm-.939,2.775c-.018.137-.053.32-.1.549s-.094.411-.129.548a2.454,2.454,0,0,1-.659,1.227,1.61,1.61,0,0,1-1.138.418.924.924,0,0,1-.9-.418,1.924,1.924,0,0,1-.089-1.227c.018-.137.05-.32.1-.548s.094-.411.129-.549a2.5,2.5,0,0,1,.658-1.219,1.583,1.583,0,0,1,1.126-.425.937.937,0,0,1,.9.425A1.909,1.909,0,0,1,6954.032-1951.635Z" transform="translate(-6938.785 1959.494)" fill="#1ebf8d"/>
  //               <path id="Path_14" data-name="Path 14" d="M6792.214-2034.929l-2.71-2.709-.8.806.9.9h-12.091a5.888,5.888,0,0,0-2.015.445,4.707,4.707,0,0,0-1.786,1.309,4.948,4.948,0,0,0-1,2.068q-.16.637-.311,1.345t-.267,1.33a3.943,3.943,0,0,0,.122,2.119,2.485,2.485,0,0,0,1.208,1.331,4.77,4.77,0,0,0,2.227.456,6.213,6.213,0,0,0,2.453-.47,4.82,4.82,0,0,0,1.843-1.353,4.65,4.65,0,0,0,.984-2.126l.348-1.577a.322.322,0,0,0-.052-.26.285.285,0,0,0-.239-.1h-3.543a.433.433,0,0,0-.282.1.429.429,0,0,0-.151.26l-.2.926a.31.31,0,0,0,.051.253.261.261,0,0,0,.224.109h1.578l-.072.361a2.614,2.614,0,0,1-.514,1.143,2.213,2.213,0,0,1-.883.658,2.934,2.934,0,0,1-1.12.21,1.705,1.705,0,0,1-1.338-.492,1.9,1.9,0,0,1-.252-1.62q.114-.637.252-1.273t.3-1.259a2.638,2.638,0,0,1,.9-1.562,2.481,2.481,0,0,1,1.533-.477h.018l12.247,0-1.054,1.055.8.806,2.71-2.709,0,0Z" transform="translate(-6772.038 2037.638)" fill="#1ebf8d"/>
  //             </g>
  //           </g>
  //         </g>
  //       </g>
  //     </svg>
  //   )
  // }

  return (
    <div ref={observerRef}>
      <Flex mt="24px" 
      flexDirection={isMobile ? "column" : "row"} 
      // justifyContent="space-between"
      >
        <Flex flexDirection="column" flex="1" mb={["16px", null]} mr={isMobile ? null : "16px"}>
          <Flex justifyContent="space-between" alignItems="center">
            <Heading scale="lg">
              Earn <span style={{ color: "#1EBF8D" }}>GO</span> + Fees in Farms
            </Heading>
            <Link href="/farms">
              <Button variant="tertiary" >
                <svg xmlns="http://www.w3.org/2000/svg" width="20.764" height="20.238" viewBox="0 0 20.764 20.238">
                  <path d="M8.828,4,9.857,2.974a1.108,1.108,0,0,1,1.571,0l9.009,9a1.108,1.108,0,0,1,0,1.571l-9.009,9.009a1.108,1.108,0,0,1-1.571,0L8.828,21.53a1.113,1.113,0,0,1,.019-1.59l5.584-5.32H1.112A1.11,1.11,0,0,1,0,13.508V12.025a1.11,1.11,0,0,1,1.112-1.112H14.431L8.847,5.592A1.105,1.105,0,0,1,8.828,4Z" transform="translate(0 -2.647)" fill="#fff" />
                </svg>
              </Button>
            </Link>
          </Flex>
          <Flex 
          flexDirection={isMobile ? "row" : "column"}
          style={{overflowX: 'auto'}}
          >
            {topFarms.map((topFarm) => (
              <FarmCard key={topFarm?.token.address} >
                <h3>
                  <span className="token1">
                    {
                      topFarm?.token ?
                        <img src={`/images/tokens/${topFarm?.token.address}.png`} alt={topFarm?.token.name} /> :
                        <Skeleton variant="circle" width={32} height={32} />
                    }
                  </span>
                  <span className="token2">
                    {
                      topFarm?.quoteToken ?
                        <img src={`/images/tokens/${topFarm?.quoteToken.address}.png`} alt={topFarm?.quoteToken.name} /> :
                        <Skeleton variant="circle" width={32} height={32} />
                    }
                  </span>
                  {topFarm?.lpSymbol}
                </h3>
                <h2>
                  <Flex flexDirection="column">
                    <span style={{ marginBottom: "10px", fontSize: "larger" }}>
                      {t('APR')}
                      <IconCalc />
                    </span>
                    <Flex alignItems="center">
                      {topFarm?.apr + topFarm?.lpRewardsApr ? (
                        <Balance lineHeight="1" decimals={1} fontSize="25px" bold unit="%" value={topFarm?.apr + topFarm?.lpRewardsApr} />
                      ) : (
                        <Skeleton width={60} height={16} />
                      )}
                      <IconHelp />
                    </Flex>
                    
                  </Flex>
                  <Link href="/farms">
                    <Button variant="primary">Start Farm</Button>
                  </Link>
                </h2>
                
              </FarmCard>
            ))}
          </Flex>
        </Flex>
        <Flex flexDirection="column" flex="1">
          <Flex justifyContent="space-between" alignItems="center">
            <Heading scale="lg">
              Popular Pools
            </Heading>
            <Link href="/pools">
              <Button variant="tertiary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20.764" height="20.238" viewBox="0 0 20.764 20.238">
                  <path d="M8.828,4,9.857,2.974a1.108,1.108,0,0,1,1.571,0l9.009,9a1.108,1.108,0,0,1,0,1.571l-9.009,9.009a1.108,1.108,0,0,1-1.571,0L8.828,21.53a1.113,1.113,0,0,1,.019-1.59l5.584-5.32H1.112A1.11,1.11,0,0,1,0,13.508V12.025a1.11,1.11,0,0,1,1.112-1.112H14.431L8.847,5.592A1.105,1.105,0,0,1,8.828,4Z" transform="translate(0 -2.647)" fill="#fff" />
                </svg>
              </Button>
            </Link>
          </Flex>
          <Flex 
          flexDirection={isMobile ? "row" : "column"}
          style={{overflowX: 'auto'}}
          >
            {topPools.map((topPool) => (
              <PoolCard key={topPool?.stakingToken.address}>
                <span>
                  <span className="token1">
                    {
                      topPool?.stakingToken ?
                        <img src={`/images/tokens/${topPool?.stakingToken.address}.png`} alt={topPool?.stakingToken.name} /> :
                        <Skeleton variant="circle" width={55} height={55} />
                    }
                  </span>
                  <span className="token2">
                    {
                      topPool?.earningToken ?
                        <img src={`/images/tokens/${topPool?.earningToken.address}.png`} alt={topPool?.earningToken.name} /> :
                        <Skeleton variant="circle" width={30} height={30} />
                    }
                  </span>
                  <Flex flexDirection="column">
                    <Heading scale="md">Earn <span style={{ color: "#1EBF8D" }}>{topPool?.earningToken.symbol}</span></Heading>
                    <span>Stake <span style={{ color: "#1EBF8D" }}>{topPool?.stakingToken.symbol}</span></span>
                  </Flex>
                </span>
                <h2>
                <Flex flexDirection="column">
                  <span style={{ marginBottom: "10px" }}>
                    {t('APR')}
                    <IconCalc />
                  </span>
                  <Flex alignItems="center">
                    {topPool?.apr ? (
                      <Balance lineHeight="1" decimals={0} fontSize="25px" bold unit="%" value={topPool?.apr} />
                    ) : (
                      <Skeleton width={60} height={16} />
                    )}
                    <IconHelp />
                  </Flex>
                </Flex>
                <Link href="/pools">
                  <Button variant="primary">Start Stake</Button>
                </Link>
                </h2>
              </PoolCard>
            ))}
          </Flex>
        </Flex>
        {false &&
          <>
            <Flex mb="24px">
              <RowHeading text={showFarms ? t('Top Farms') : t('Top Syrup Pools')} />
              <IconButton
                variant="text"
                height="100%"
                width="auto"
                onClick={() => {
                  setShowFarms((prev) => !prev)
                  clearInterval(timer.current)
                  startTimer()
                }}
              >
                <SwapVertIcon height="24px" width="24px" color="textSubtle" />
              </IconButton>
            </Flex>
            <Box height={['240px', null, '80px']}>
              <Grid>
                {topFarms.map((topFarm, index) => (
                  <TopFarmPool
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    title={topFarm?.lpSymbol}
                    percentage={topFarm?.apr + topFarm?.lpRewardsApr}
                    index={index}
                    visible={showFarms}
                  />
                ))}
              </Grid>
              <Grid>
                {topPools.map((topPool, index) => (
                  <TopFarmPool
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    title={topPool && getPoolText(topPool)}
                    percentage={topPool?.apr}
                    index={index}
                    visible={!showFarms}
                  />
                ))}
              </Grid>
            </Box>
          </>
        }
      </Flex>
    </div>
  )
}

export default FarmsPoolsRow
