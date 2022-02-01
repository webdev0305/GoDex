import React from 'react'
import styled from 'styled-components'
import { Flex, Heading, CardsLayout, useMatchBreakpoints } from '@pancakeswap/uikit'
// import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'contexts/Localization'
// import CompositeImage, { CompositeImageProps } from '../CompositeImage'
// import ColoredWordHeading from '../ColoredWordHeading'

export interface BlogsSectionProps {
  headingText?: string
}

const Card = styled.div`
  padding: 33px;
  background: #273043;
  border-radius: 10px;
  color: #8B95A8;
  font-family: Poppins;
  font-size: 18px;
  h3 {
    font-family: Poppins;
    color: white;
    font-size: 25px;
    padding: 20px 0;
  }
  img {
    height: 65px;
  }
  p {
    font-family: Poppins;
    line-height: 1.2em;
  }
`

const BlogsSection: React.FC<BlogsSectionProps> = () => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()

  return (
    <Flex flexDirection="column" alignItems="center">
      <Heading scale={isMobile?"lg":"xxl"}>{t('WHY GODEX EXCHANGE ?')}</Heading>
      <span style={{ width:'200px', height:'8px', background:'#1EBF8D', borderRadius:'5px', margin:'10px', marginBottom: '40px' }}/>
      <CardsLayout>
        <Card>
          <img src="/images/home/icon-fees.png" alt="Low Fees"/>
          <h3>Low Fees</h3>
          <p>Experience very low fees on transactions.</p>
        </Card>
        <Card>
          <img src="/images/home/icon-secure.png" alt="Secure"/>
          <h3>Secure</h3>
          <p>Security above everything. The platform is safe and private.</p>
        </Card>
        <Card>
          <img src="/images/home/icon-speed.png" alt="Lightning Quick"/>
          <h3>Lightning Quick</h3>
          <p>High performance and high speed transactions. </p>
        </Card>
        <Card>
          <img src="/images/home/icon-user.png" alt="User Friendly"/>
          <h3>User Friendly</h3>
          <p>The platform is user-friendly offering guidance and tutorial for first time users.</p>
        </Card>
        <Card>
          <img src="/images/home/icon-support.png" alt="Support"/>
          <h3>Support</h3>
          <p>Our team is always available to provide support when needed. Get in touch with us should you have any concern.</p>
        </Card>
        <Card>
          <img src="/images/home/icon-trans.png" alt="Transparency"/>
          <h3>Transparency</h3>
          <p>Community owned. Everyone can freely inspect and participate in GoDex Exchange&apos;s governance.</p>
        </Card>
      </CardsLayout>
    </Flex>
  )
}

export default BlogsSection
