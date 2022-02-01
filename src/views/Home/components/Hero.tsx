import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { Flex, Heading, Button, useMatchBreakpoints } from '@pancakeswap/uikit'
// import { useWeb3React } from '@web3-react/core'
import { useTranslation } from 'contexts/Localization'
// import ConnectWalletButton from 'components/ConnectWalletButton'

const CoinsWrapper = styled.div`
  width: 100%;
`

const imagePath = '/images/home/'
const imageSrc = 'coins'

const Hero = () => {
  const { t } = useTranslation()
  // const { account } = useWeb3React()
  const { isMobile } = useMatchBreakpoints()
  return (
    <>
      <Flex
        position="relative"
        flexDirection={['column-reverse', null, null, 'row']}
        alignItems="center"
        justifyContent="center"
        // mt={[account ? '200px' : '50px', null, 0]}
        id="homepage-hero"
      >
        <Flex flex="1" flexDirection="column" alignItems={['center', null, null, 'start']}>
          <Heading scale={isMobile ? "md" : "xl"} color="secondary" mb="24px">
            <span style={{ color: 'white' }}>{t('Get ')}</span>
            {t('passive income')}
            <span style={{ color: 'white' }}>{t(' via pools &')}</span>
          </Heading>
          <Heading scale={isMobile ? "md" : "xl"} color="secondary" mb="24px">
            <span style={{ color: 'white' }}>{t('Farms by ')}</span>
            {t('GoDex')}
            <span style={{ color: 'white' }}>{t(' Stable And ')}</span>
            {t('Secure')}
          </Heading>
          <Heading scale={isMobile ? "md" : "xl"} color="white" mb="24px">
            {t('Decentralized Exchange')}
          </Heading>
          <Flex>
            <Link to="/swap">
              <Button variant="primary" mr="27px" scale={isMobile ? "sm" : "md"}>{t('Launch App')}</Button>
            </Link>
            {/* <Link to="/">
              <Button variant="secondary" className="button-buy-go" scale={isMobile ? "sm" : "md"}>
                {t('Buy')}
                <span>{t('GO Token')}</span>
              </Button>
            </Link> */}
          </Flex>
        </Flex>
        {!isMobile && <Flex
          height={['192px', null, null, '100%']}
          width={['192px', null, null, '100%']}
          flex={[null, null, null, '1']}
          mb={['24px', null, null, '0']}
          position="relative"
        >
          <CoinsWrapper>
            <img src={`${imagePath}${imageSrc}.png`} alt={t('Coins')} />
          </CoinsWrapper>
        </Flex>}
      </Flex>
    </>
  )
}

export default Hero
