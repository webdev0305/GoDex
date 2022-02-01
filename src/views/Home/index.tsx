import React from 'react'
import styled from 'styled-components'
import { Flex, Heading, Progress, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import PageSection from 'components/PageSection'
import { PageMeta } from 'components/Layout/Page'
import Balance from 'components/Balance'
import CountUp from 'react-countup'
import useFarmsWithBalance from 'views/Home/hooks/useFarmsWithBalance'
import { usePriceCakeBusd, useTotalValue } from 'state/farms/hooks'
import { formatNumber, getFullDisplayBalance, formatBigNumber} from 'utils/formatBalance'
import useTokenBalance, { FetchStatus } from 'hooks/useTokenBalance'
import tokens from 'config/constants/tokens'
import Hero from './components/Hero'
import BlogsSection from './components/BlogsSection'
import FarmsPoolsRow from './components/FarmsPoolsRow'
import CakeDataRow from './components/CakeDataRow'
import { OuterWedgeWrapper } from './components/WedgeSvgs'

const StyledHeroSection = styled(PageSection)`
  padding-top: 16px;
  border-radius: 0 0 100px 100px;
  &.mobile-view {
    border-radius: 0;
    padding-bottom: 16px;
  }
  h2 {
    font-family: "Poppins";
    white-space: nowrap;
    span {
      font-family: inherit;
    }
  }
  button.button-buy-go {
    background-color: #36425A;
    border: none;
    color: white;
    span {
      color: #1EBF8D;
      padding-left: 0.4em;
    }
  }
`

const StyledTable = styled.table`
  width: 100%;
  font-family: Poppins;
  font-size: 16px;
  color: white;
  line-height: 2.5em;
  th {
    text-align: left;
    color: #8B95A8;
  }
  tbody tr:not(:last-child) {
    border-bottom: 1px solid #4a5568;
  }
  td:last-child > div {
    background: #4a5568;
    div {
      border-radius: 20px;
    }
  }
  ${({ theme }) => theme.mediaQueries.md} {
    font-size: 25px;
  }
`
const Card = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 20px;
  padding: 20px;
  background: #273043;
  border-radius: 10px;
  color: #8B95A8;
  font-family: Poppins;
  font-size: 20px;
  div {
    display: flex;
    flex-direction: column;
  }
  div p {
    color: white;
    padding: 10px 0;
  }
  div span {
    color: #8B95A8;
    padding: 10px 0;
    font-weight: 600;
  }
  img {
    width: 80px;
  }
  ${({ theme }) => theme.mediaQueries.md} {
    width: 30%;
  }
  
`
const GOTVL = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  justify-content: space-evenly;

  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: row;
  }
  
`
const TVL = styled.div`
  width: 100%;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  ${({ theme }) => theme.mediaQueries.md} {
    width: 40%;
  }
`


const Home: React.FC = () => {
  // const { theme } = useTheme()

  // const HomeSectionContainerStyles = { margin: '0', width: '100%', maxWidth: '968px' }
  const { isMobile } = useMatchBreakpoints()
  const {earningsSum} =  useFarmsWithBalance()
  const cakePriceUsd = usePriceCakeBusd()
  
  const earningsSumUsd = earningsSum*cakePriceUsd.toNumber()
  const { balance: cakeBalance, fetchStatus: cakeFetchStatus } = useTokenBalance(tokens.cake.address)
  const GoBalance = cakeFetchStatus === FetchStatus.SUCCESS && cakeBalance
  
  const GoTotalPriceUsd = GoBalance?GoBalance.toNumber()/1e18*cakePriceUsd.toNumber():0
  const tvl = useTotalValue()

  return (
    <>
      <PageMeta />
      <StyledHeroSection
        innerProps={{ style: { margin: '0', width: '100%' } }}
        background="#1F2533"
        index={1}
        hasCurvedDivider={false}
        className={isMobile ? "mobile-view" : ""}
      >
        <Hero />
      </StyledHeroSection>
      <PageSection
        innerProps={{ style: { margin: '0', width: '100%' } }}
        index={2}
        hasCurvedDivider={false}
      >
        <FarmsPoolsRow />
      </PageSection>
      <PageSection
        innerProps={{ style: { margin: '0', width: '100%', backgroundColor: '#1F2533', borderRadius: '20px', padding: '0' } }}
        index={2}
        hasCurvedDivider={false}
      >
        <Flex flexDirection="column" alignItems="center" >
          <GOTVL>
            <TVL>
              <Heading color="#8B95A8" mb="24px">
                Total Value Locked (TVL)
              </Heading>
              <Heading scale="xl" color="#53F3C3" mb="24px" style={{ fontWeight: 'normal'}}>
                <CountUp
                  start={0}
                  end={tvl.toNumber()}
                  prefix='$'
                  decimals={2}
                  duration={1}
                  separator=","
                />
              </Heading>
            </TVL>
            <Card>
              <div>
                <span>My <span style={{color:'#53F3C3'}}>Go</span> Details</span>
                <p>{GoBalance?getFullDisplayBalance(GoBalance,18,2):''} GO</p>
                <span style={{color:'#53F3C3'}}>${GoTotalPriceUsd?formatNumber(GoTotalPriceUsd ,2):''}</span>
              </div>
              <div style={{display:'flex', flexDirection: 'row', alignItems: 'flex-end'}}>
                <img src="/images/home/go.svg" alt="Go Token"/>
              </div>
            </Card>
            <Card>
              <div>
                <span>Harvestable <span style={{color:'#53F3C3'}}>Go</span> Amount</span>
                <p>{earningsSum?formatNumber(earningsSum,2):''} GO</p>
                <span style={{color:'#53F3C3'}}>${earningsSumUsd?formatNumber(earningsSumUsd ,2):''}</span>
              </div>
              <div style={{display:'flex', flexDirection: 'row', alignItems: 'flex-end'}}>
                <img src="/images/home/gift.svg" alt="gift icon"/>
              </div>
            </Card>
          </GOTVL>
          <CakeDataRow />
        </Flex>
      </PageSection>
      <PageSection
        innerProps={{ style: { margin: '0', width: '100%' } }}
        index={3}
        hasCurvedDivider={false}
      >
        <OuterWedgeWrapper>
          <img src="/images/bg-pattern1.png" alt="pattern" style={{ position: 'absolute', right: '50%', marginRight: '180px', top: 0 }} />
          <img src="/images/bg-pattern1.png" alt="pattern" style={{ position: 'absolute', left: '50%', marginLeft: '180px', top: 0, transform: 'scaleX(-1)' }} />
        </OuterWedgeWrapper>
        <BlogsSection />
      </PageSection>
      <PageSection
        innerProps={{ style: { margin: '0', width: '100%' } }}
        background="#1F2533"
        style={{ boxShadow: "black 0px 0px 5px" }}
        index={4}
        hasCurvedDivider={false}
      >
        <Flex alignItems="center" flexDirection="column">
          <Heading scale={isMobile?"lg":"xxl"} mb={30}>Together We Are <span style={{ color: "#1EBF8D" }}>Stronger</span></Heading>
          <Text fontSize={isMobile?"20px":"32px"} fontFamily="Poppins" color="#8B95A8">All generated fees from different features will be invested back in GO and in our Community. GO DEX Exchange’s team will not receive any of the fees! We invest our hard work in the potential value of the token.</Text>
        </Flex>
      </PageSection>
      <PageSection
        innerProps={{ style: { marginBottom: '200px', width: '100%', background: '#273043', borderRadius: '20px',}}}
        index={5}
        background="none"
        hasCurvedDivider={false}
      >
        <OuterWedgeWrapper>
          <img src="/images/bg-pattern1.png" alt="pattern" style={{ position: 'absolute', right: '50%', marginRight: '180px', bottom: 0, transform: 'scaleY(-1)' }} />
          <img src="/images/bg-pattern1.png" alt="pattern" style={{ position: 'absolute', left: '50%', marginLeft: '180px', bottom: 0, transform: 'scale(-1)' }} />
        </OuterWedgeWrapper>
        <Flex alignItems="center" flexDirection="column" padding={isMobile?"0px":"0px 50px"}>
          <Heading scale={isMobile?"lg":"xl"} mb={30}><span style={{ color: "#1EBF8D" }}>GO</span> Token Details</Heading>
          <StyledTable>
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>%</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Farms &amp; Pools</td>
                <td>80,000,000</td>
                <td>80%</td>
                <td>
                  <Progress variant="round" primaryStep={80} />
                </td>
              </tr>
              <tr>
                <td>Airdrop</td>
                <td>1,000,000</td>
                <td>1%</td>
                <td>
                  <Progress variant="round" primaryStep={1} />
                </td>
              </tr>
              <tr>
                <td>Team &amp; Advisors</td>
                <td>10,000,000</td>
                <td>10%</td>
                <td>
                  <Progress variant="round" primaryStep={10} />
                </td>
              </tr>
              <tr>
                <td>IDO Distribution</td>
                <td>5,000,000</td>
                <td>5%</td>
                <td>
                  <Progress variant="round" primaryStep={5} />
                </td>
              </tr>
              <tr>
                <td>Liquidity</td>
                <td>4,000,000</td>
                <td>4%</td>
                <td>
                  <Progress variant="round" primaryStep={4} />
                </td>
              </tr>
            </tbody>
          </StyledTable>
        </Flex>
      </PageSection>
    </>
  )
}

export default Home
