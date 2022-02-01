import React, { useState } from 'react'
import {
  Modal,
  Text,
  Button,
  Heading,
  Flex,
  AutoRenewIcon,
  ButtonMenu,
  ButtonMenuItem,
  HelpIcon,
  useTooltip,
} from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import styled from 'styled-components'
import useTheme from 'hooks/useTheme'
import useToast from 'hooks/useToast'
import { Token } from '@pancakeswap/sdk'
import { formatNumber } from 'utils/formatBalance'
import { useHarvestPool, useHarvestTime } from '../../../hooks/useHarvestPool'
import useStakePool from '../../../hooks/useStakePool'

interface CollectModalProps {
  formattedBalance: string
  fullBalance: string
  earningToken: Token
  earningsDollarValue: number
  sousId: number
  isBnbPool: boolean
  isCompoundPool?: boolean
  onDismiss?: () => void
}
const StyledModal = styled(Modal)`
  padding: 10px;
  text-align: center;
  > :first-child {
    display: none;
  }
`
const StyledModalTitle = styled('div')`
  color: white;
  font-size: 20px;
  padding: 10px;
`
const StyledModalTimee = styled('div')`
  color: #53F3C3;
  font-size: 24px;
  margin-top: 10px;
  padding: 10px;
`
const StyledModalDescription = styled('div')`
  color: #8B95A8;
  font-size: 12px;
  margin-top: 10px;
  padding: 10px;
`

const CollectModal: React.FC<CollectModalProps> = ({
  formattedBalance,
  fullBalance,
  earningToken,
  earningsDollarValue,
  sousId,
  isBnbPool,
  isCompoundPool = false,
  onDismiss,
}) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { toastSuccess, toastError } = useToast()
  const { onReward } = useHarvestPool(sousId, isBnbPool)
  const { onStake } = useStakePool(sousId, isBnbPool)
  const [pendingTx, setPendingTx] = useState(false)
  const [shouldCompound, setShouldCompound] = useState(isCompoundPool)
  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    <>
      <Text mb="12px" style={{color:"white"}}>{t('Compound: collect and restake GO into pool.')}</Text>
      <Text style={{color:"white"}}>{t('Harvest: collect GO and send to wallet')}</Text>
    </>,
    { placement: 'bottom-end', tooltipOffset: [20, 10] },
  )



  const handleHarvestConfirm = async () => {
    setPendingTx(true)
    // compounding
    if (shouldCompound) {
      try {
        await onStake(fullBalance, earningToken.decimals)
        toastSuccess(
          `${t('Compounded')}!`,
          t('Your %symbol% earnings have been re-invested into the pool!', { symbol: earningToken.symbol }),
        )
        setPendingTx(false)
        onDismiss()
      } catch (e) {
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
        console.error(e)
        setPendingTx(false)
      }
    } else {
      // harvesting
      try {
        await onReward()
        toastSuccess(
          `${t('Harvested')}!`,
          t('Your %symbol% earnings have been sent to your wallet!', { symbol: earningToken.symbol }),
        )
        setPendingTx(false)
        onDismiss()
      } catch (e) {
        toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
        console.error(e)
        setPendingTx(false)
      }
    }
  }

  const secondsToHms = (d)=>{
    if(d<=0) return '00:00:00'
    const h = Math.floor(d / 3600);
    const m = Math.floor(d % 3600 / 60);
    const s = Math.floor(d % 3600 % 60);
  
    const hDisplay = (h<10?h.toString().padStart(2,"0"):h.toString()).concat(":");
    const mDisplay = (m<10?m.toString().padStart(2,"0"):m.toString()).concat(":");
    const sDisplay = (s<10?s.toString().padStart(2,"0"):s.toString());
    return hDisplay + mDisplay + sDisplay;
  }
  
  const harvestTime = useHarvestTime(sousId)
  const [timeString, setLeftTime] = useState<string>()
  const timeNow = new Date().getTime()/1000
  setInterval(() => {
    const now = new Date().getTime()/1000
    setLeftTime(secondsToHms(harvestTime-now))
  }, 300)
  
  
  return (
    !harvestTime || harvestTime-timeNow>0?(
      <StyledModal title={t('Harvest Not Available')}>
    <StyledModalTitle>Harvest Not Available</StyledModalTitle>
    <StyledModalTimee>{timeString}</StyledModalTimee>
    <StyledModalDescription>Please try again after timelock ended.</StyledModalDescription>
  </StyledModal>
    ) :(
    <Modal
      title={`${earningToken.symbol} ${isCompoundPool ? t('Collect') : t('Harvest')}`}
      onDismiss={onDismiss}
      headerBackground={theme.colors.gradients.cardHeader}
    >
      {isCompoundPool && (
        <Flex justifyContent="center" alignItems="center" mb="24px">
          <ButtonMenu
            activeIndex={shouldCompound ? 0 : 1}
            scale="sm"
            variant="subtle"
            onItemClick={(index) => setShouldCompound(!index)}
          >
            <ButtonMenuItem as="button">{t('Compound')}</ButtonMenuItem>
            <ButtonMenuItem as="button">{t('Harvest')}</ButtonMenuItem>
          </ButtonMenu>
          <Flex ml="10px" ref={targetRef}>
            <HelpIcon color="textSubtle" />
          </Flex>
          {tooltipVisible && tooltip}
        </Flex>
      )}

      <Flex justifyContent="space-between" alignItems="center" mb="24px">
        <Text>{shouldCompound ? t('Compounding') : t('Harvesting')}:</Text>
        <Flex flexDirection="column">
          <Heading>
            {formattedBalance} {earningToken.symbol}
          </Heading>
          {earningsDollarValue > 0 && (
            <Text fontSize="12px" color="textSubtle">{`~${formatNumber(earningsDollarValue)} USD`}</Text>
          )}
        </Flex>
      </Flex>

      <Button
        mt="8px"
        onClick={handleHarvestConfirm}
        isLoading={pendingTx}
        endIcon={pendingTx ? <AutoRenewIcon spin color="currentColor" /> : null}
      >
        {pendingTx ? t('Confirming') : t('Confirm')}
      </Button>
      <Button variant="text" onClick={onDismiss} pb="0px">
        {t('Close Window')}
      </Button>
    </Modal>
    )
  )
}

export default CollectModal
