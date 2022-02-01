import React from 'react'
import styled from 'styled-components'
// import { Link } from 'react-router-dom'
import { Flex, Heading, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useWeb3React } from '@web3-react/core'
import { useTranslation } from 'contexts/Localization'
import { usePriceCakeBusd, useTotalValue } from 'state/farms/hooks'
import CountUp from 'react-countup'
// import ConnectWalletButton from 'components/ConnectWalletButton'

const CoinsWrapper = styled.div`
  width: 100%;
`

const imagePath = '/images/'
const imageSrc = 'pools-logo'

const Hero = () => {
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const { isMobile } = useMatchBreakpoints()
  const tvl = useTotalValue()
  return (
    <>
      <Flex
        position="relative"
        flexDirection={['row', null, null, 'row']}
        alignItems={['center', null, null, 'center']}
        justifyContent="center"
        mt={[0, null, 0]}
        id="homepage-hero"
        mr={isMobile?"0px":"0"}
      >
        <Flex flex="1" flexDirection="column">
          <Heading color="primary" mt="50px" mb="24px" style={{whiteSpace:'nowrap', fontSize:isMobile?"medium":"xxx-large"}} >
            <span style={{ color: 'white' }}>{t('Stake ')}</span>
            {t('GO')}
            <span style={{ color: 'white' }}>{t(' tokens to Earn ')}</span>
            {t('GO')}
          </Heading>
          <Heading scale={isMobile?"md":"xl"} color="primary" mb="24px">
            <CountUp
              start={0}
              end={tvl.toNumber()}
              prefix='$'
              decimals={2}
              duration={1}
              separator=","
            />
          </Heading>
          <Heading color="#8B95A8" mb="24px" style={{fontSize:isMobile?"x-small":"large"}}>
            Total Value Locked (TVL)
          </Heading>
        </Flex>
        <Flex
          height={['192px', null, null, '100%']}
          width={['192px', null, null, '100%']}
          flex={[null, null, null, '1']}
          mb={['0', null, null, '0']}
          position="relative"
          alignItems={['center', null, null, 'center']}
        >
          <CoinsWrapper>
            <img src={`${imagePath}${imageSrc}.png`} alt={t('Coins')} />
          </CoinsWrapper>
        </Flex>
      </Flex>
    </>
  )
}

export default Hero
