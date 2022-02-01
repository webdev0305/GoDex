import React from 'react'
import { ChainId, Currency, Token } from '@pancakeswap/sdk'
import styled from 'styled-components'
import {
  Button,
  Text,
  // ErrorIcon,
  // ArrowUpIcon,
  MetamaskIcon,
  Flex,
  Box,
  Link,
  // Spinner,
  // Modal,
  InjectedModalProps,
} from '@pancakeswap/uikit'
import { registerToken } from 'utils/wallet'
import { useTranslation } from 'contexts/Localization'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { wrappedCurrency } from 'utils/wrappedCurrency'
import { RowFixed } from '../Layout/Row'
import { AutoColumn,/* ColumnCenter */ } from '../Layout/Column'
import { getBscScanLink } from '../../utils'

const Wrapper = styled.div`
  width: 100%;
`
const Section = styled(AutoColumn)`
  padding: 24px;
`

// const ConfirmedIcon = styled(ColumnCenter)`
//   padding: 24px 0;
// `

function ConfirmationPendingContent({ pendingText }: { pendingText: string }) {
  const { t } = useTranslation()
  return (
    <Wrapper>
      <AutoColumn justify="center">
        <img src="/images/hourglass.png" height="236px" alt="Spinner" style={{ margin: '30px auto' }} />
      </AutoColumn>
      <AutoColumn gap="12px" justify="center">
        <Text fontSize="20px">{t('Waiting Confirmation !')}</Text>
        <AutoColumn gap="12px" justify="center">
          <Text bold textAlign="center" color="#8B95A8">
            {pendingText}
          </Text>
        </AutoColumn>
        <Text small textAlign="center" color="#8B95A8">
          {t('Transaction submitted waiting for confirmation...')}
        </Text>
      </AutoColumn>
    </Wrapper>
  )
}

function TransactionSubmittedContent({
  chainId,
  hash,
  currencyToAdd,
}: {
  hash: string | undefined
  chainId: ChainId
  currencyToAdd?: Currency | undefined
}) {
  const { library } = useActiveWeb3React()

  const { t } = useTranslation()

  const token: Token | undefined = wrappedCurrency(currencyToAdd, chainId)

  return (
    <Wrapper>
      <Section>
        <AutoColumn justify="center">
          <img src="/images/success.png" height="236px" alt="Spinner" style={{ margin: '30px auto' }} />
        </AutoColumn>
        <AutoColumn gap="12px" justify="center">
          <Text fontSize="20px" color="primary">{t('Transaction Submitted !')}</Text>
          {chainId && hash && (
            <Button width="100%" variant="tertiary" as={Link} href={getBscScanLink(hash, 'transaction', chainId)} style={{color:'white'}} target="_blank">
              {t('View on Explorer')}
            </Button>
          )}
          {false && currencyToAdd && library?.provider?.isMetaMask && (
            <Button
              variant="tertiary"
              mt="12px"
              width="fit-content"
              onClick={() => registerToken(token.address, token.symbol, token.decimals)}
            >
              <RowFixed>
                {t('Add %asset% to Metamask', { asset: currencyToAdd.symbol })}
                <MetamaskIcon width="16px" ml="6px" />
              </RowFixed>
            </Button>
          )}
        </AutoColumn>
      </Section>
    </Wrapper>
  )
}

export function ConfirmationModalContent({
  bottomContent,
  topContent,
}: {
  topContent: () => React.ReactNode
  bottomContent: () => React.ReactNode
}) {
  return (
    <Wrapper>
      <Box>{topContent()}</Box>
      <Box>{bottomContent()}</Box>
    </Wrapper>
  )
}

export function TransactionErrorContent({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const { t } = useTranslation()
  return (
    <Wrapper>
      <AutoColumn justify="center">
        <img src="/images/failed.png" height="236px" alt="Spinner" style={{ margin: '30px auto' }} />
        <Text fontSize="20px" color="failure">{t('Transaction Failed !')}</Text>
        <Text color="#8B95A8" style={{ textAlign: 'center', width: '85%' }}>
          {message}
        </Text>
      </AutoColumn>      
      <Flex justifyContent="center" pt="24px">
        <Button onClick={onDismiss}>{t('Dismiss')}</Button>
      </Flex>
    </Wrapper>
  )
}

interface ConfirmationModalProps {
  hash: string | undefined
  content: () => React.ReactNode
  attemptingTxn: boolean
  pendingText: string
  currencyToAdd?: Currency | undefined
}

const TransactionConfirmationModal: React.FC<InjectedModalProps & ConfirmationModalProps> = ({
  attemptingTxn,
  hash,
  pendingText,
  content,
  currencyToAdd,
}) => {
  const { chainId } = useActiveWeb3React()

  if (!chainId) return null

  return (
    <>
      {attemptingTxn ? (
        <ConfirmationPendingContent pendingText={pendingText} />
      ) : hash ? (
        <TransactionSubmittedContent
          chainId={chainId}
          hash={hash}
          currencyToAdd={currencyToAdd}
        />
      ) : (
        content()
      )}
    </>
  )
}

export default TransactionConfirmationModal
