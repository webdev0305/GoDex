import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Currency, CurrencyAmount, JSBI, Token, Trade } from '@pancakeswap/sdk'
import { Button, Text, ArrowDownIcon, Box, useModal, Flex, useMatchBreakpoints } from '@pancakeswap/uikit'
import TradingViewWidget, { Themes } from 'react-tradingview-widget'
import { useIsTransactionUnsupported } from 'hooks/Trades'
import UnsupportedCurrencyFooter from 'components/UnsupportedCurrencyFooter'
import TransactionSettings from 'components/Menu/GlobalSettings/TransactionSettings'
import CurrencySearch from 'components/SearchModal/CurrencySearch'
import { RouteComponentProps } from 'react-router-dom'
import { CurrencyLogo } from 'components/Logo'
import { useTranslation } from 'contexts/Localization'
import SwapWarningTokens from 'config/constants/swapWarningTokens'
import AddressInputPanel from './components/AddressInputPanel'
import { GreyCard } from '../../components/Card'
import Column, { AutoColumn } from '../../components/Layout/Column'
import ConfirmSwapModal from './components/ConfirmSwapModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { AutoRow, RowBetween } from '../../components/Layout/Row'
import AdvancedSwapDetailsDropdown from './components/AdvancedSwapDetailsDropdown'
import confirmPriceImpactWithoutFee from './components/confirmPriceImpactWithoutFee'
import { ArrowWrapper, SwapCallbackError, Wrapper } from './components/styleds'
import TradePrice from './components/TradePrice'
import ImportTokenWarningModal from './components/ImportTokenWarningModal'
import ProgressSteps from './components/ProgressSteps'
import { AppHeader, AppBody } from '../../components/App'
import ConnectWalletButton from '../../components/ConnectWalletButton'

// import { INITIAL_ALLOWED_SLIPPAGE } from '../../config/constants'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { useCurrency, useAllTokens } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallbackFromTrade } from '../../hooks/useApproveCallback'
import { useSwapCallback } from '../../hooks/useSwapCallback'
import useWrapCallback, { WrapType } from '../../hooks/useWrapCallback'
import { Field } from '../../state/swap/actions'
import {
  useDefaultsFromURLSearch,
  useDerivedSwapInfo,
  useSwapActionHandlers,
  useSwapState,
} from '../../state/swap/hooks'
import { useExpertModeManager, useUserSlippageTolerance, useUserSingleHopOnly } from '../../state/user/hooks'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { computeTradePriceBreakdown, warningSeverity } from '../../utils/prices'
import CircleLoader from '../../components/Loader/CircleLoader'
import Page from '../Page'
import SwapWarningModal from './components/SwapWarningModal'

// const Label = styled(Text)`
//   font-size: 12px;
//   font-weight: bold;
//   color: ${({ theme }) => theme.colors.secondary};
// `

export default function Swap({ history }: RouteComponentProps) {
  const loadedUrlParams = useDefaultsFromURLSearch()

  const { t } = useTranslation()

  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ]
  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c instanceof Token) ?? [],
    [loadedInputCurrency, loadedOutputCurrency],
  )

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens()
  const importTokensNotInDefault =
    urlLoadedTokens &&
    urlLoadedTokens.filter((token: Token) => {
      return !(token.address in defaultTokens)
    })

  const { account } = useActiveWeb3React()

  // for expert mode
  const [isExpertMode] = useExpertModeManager()

  // get custom setting values for user
  const [allowedSlippage] = useUserSlippageTolerance()

  // swap state
  const { independentField, typedValue, recipient } = useSwapState()
  const { v2Trade, currencyBalances, parsedAmount, currencies, inputError: swapInputError } = useDerivedSwapInfo()

  const {
    wrapType,
    execute: onWrap,
    inputError: wrapInputError,
  } = useWrapCallback(currencies[Field.INPUT], currencies[Field.OUTPUT], typedValue)
  const showWrap: boolean = wrapType !== WrapType.NOT_APPLICABLE
  const trade = showWrap ? undefined : v2Trade
  
  const parsedAmounts = showWrap
    ? {
        [Field.INPUT]: parsedAmount,
        [Field.OUTPUT]: parsedAmount,
      }
    : {
        [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
        [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
      }

  const { onSwitchTokens, onCurrencySelection, onUserInput, onChangeRecipient } = useSwapActionHandlers()
  const isValid = !swapInputError
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT

  const handleTypeInput = useCallback(
    (value: string) => {
      onUserInput(Field.INPUT, value)
    },
    [onUserInput],
  )
  const handleTypeOutput = useCallback(
    (value: string) => {
      onUserInput(Field.OUTPUT, value)
    },
    [onUserInput],
  )

  // modal and loading
  const [{ tradeToConfirm, swapErrorMessage, attemptingTxn, txHash }, setSwapState] = useState<{
    tradeToConfirm: Trade | undefined
    attemptingTxn: boolean
    swapErrorMessage: string | undefined
    txHash: string | undefined
  }>({
    tradeToConfirm: undefined,
    attemptingTxn: false,
    swapErrorMessage: undefined,
    txHash: undefined,
  })

  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: showWrap
      ? parsedAmounts[independentField]?.toExact() ?? ''
      : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  const route = trade?.route
  const userHasSpecifiedInputOutput = Boolean(
    currencies[Field.INPUT] && currencies[Field.OUTPUT] && parsedAmounts[independentField]?.greaterThan(JSBI.BigInt(0)),
  )
  const noRoute = !route

  // check whether the user has approved the router on the input token
  const [approval, approveCallback] = useApproveCallbackFromTrade(trade, allowedSlippage)

  // check if user has gone through approval process, used to show two step buttons, reset on token change
  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  // mark when a user has submitted an approval, reset onTokenSelection for input field
  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])

  const maxAmountInput: CurrencyAmount | undefined = maxAmountSpend(currencyBalances[Field.INPUT])
  const atMaxAmountInput = Boolean(maxAmountInput && parsedAmounts[Field.INPUT]?.equalTo(maxAmountInput))

  // the callback to execute the swap
  const { callback: swapCallback, error: swapCallbackError } = useSwapCallback(trade, allowedSlippage, recipient)

  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  const [singleHopOnly] = useUserSingleHopOnly()

  const handleSwap = useCallback(() => {
    
    if (priceImpactWithoutFee && !confirmPriceImpactWithoutFee(priceImpactWithoutFee, t)) {
      return
    }
    if (!swapCallback) {
      return
    }
    setSwapState({ attemptingTxn: true, tradeToConfirm, swapErrorMessage: undefined, txHash: undefined })
    swapCallback()
      .then((hash) => {
        setSwapState({ attemptingTxn: false, tradeToConfirm, swapErrorMessage: undefined, txHash: hash })
      })
      .catch((error) => {
        setSwapState({
          attemptingTxn: false,
          tradeToConfirm,
          swapErrorMessage: error.message,
          txHash: undefined,
        })
      })
  }, [priceImpactWithoutFee, swapCallback, tradeToConfirm, t])

  // errors
  const [showInverted, setShowInverted] = useState<boolean>(false)

  // warnings on slippage
  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  // show approve flow when: no error on inputs, not approved or pending, or approved in current session
  // never show if price impact is above threshold in non expert mode
  const showApproveFlow =
    !swapInputError &&
    (approval === ApprovalState.NOT_APPROVED ||
      approval === ApprovalState.PENDING ||
      (approvalSubmitted && approval === ApprovalState.APPROVED)) &&
    !(priceImpactSeverity > 3 && !isExpertMode)

  const handleConfirmDismiss = useCallback(() => {
    setSwapState({ tradeToConfirm, attemptingTxn, swapErrorMessage, txHash })
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onUserInput(Field.INPUT, '')
    }
    setViewStatus(0)
  }, [attemptingTxn, onUserInput, swapErrorMessage, tradeToConfirm, txHash])

  const handleAcceptChanges = useCallback(() => {
    setSwapState({ tradeToConfirm: trade, swapErrorMessage, txHash, attemptingTxn })
  }, [attemptingTxn, swapErrorMessage, trade, txHash])

  // swap warning state
  const [swapWarningCurrency, setSwapWarningCurrency] = useState(null)
  const [onPresentSwapWarningModal] = useModal(<SwapWarningModal swapCurrency={swapWarningCurrency} />)

  const shouldShowSwapWarning = (swapCurrency) => {
    const isWarningToken = Object.entries(SwapWarningTokens).find((warningTokenConfig) => {
      const warningTokenData = warningTokenConfig[1]
      return swapCurrency.address === warningTokenData.address
    })
    return Boolean(isWarningToken)
  }

  useEffect(() => {
    if (swapWarningCurrency) {
      onPresentSwapWarningModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapWarningCurrency])

  const handleInputSelect = useCallback(
    (inputCurrency) => {
      setApprovalSubmitted(false) // reset 2 step UI for approvals
      onCurrencySelection(Field.INPUT, inputCurrency)
      const showSwapWarning = shouldShowSwapWarning(inputCurrency)
      if (showSwapWarning) {
        setSwapWarningCurrency(inputCurrency)
      } else {
        setSwapWarningCurrency(null)
      }
    },
    [onCurrencySelection],
  )

  const handleMaxInput = useCallback(() => {
    if (maxAmountInput) {
      onUserInput(Field.INPUT, maxAmountInput.toExact())
    }
  }, [maxAmountInput, onUserInput])

  const handleOutputSelect = useCallback(
    (outputCurrency) => {
      onCurrencySelection(Field.OUTPUT, outputCurrency)
      const showSwapWarning = shouldShowSwapWarning(outputCurrency)
      if (showSwapWarning) {
        setSwapWarningCurrency(outputCurrency)
      } else {
        setSwapWarningCurrency(null)
      }
    },

    [onCurrencySelection],
  )

  const swapIsUnsupported = useIsTransactionUnsupported(currencies?.INPUT, currencies?.OUTPUT)

  const [onPresentImportTokenWarningModal] = useModal(
    <ImportTokenWarningModal tokens={importTokensNotInDefault} onCancel={() => history.push('/swap/')} />,
  )

  useEffect(() => {
    if (importTokensNotInDefault.length > 0) {
      onPresentImportTokenWarningModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importTokensNotInDefault.length])

  const PairInfo = styled.h3`
    position: relative;
    padding-left: 70px;
    margin-bottom: 2em;
    color: white;
    span.token1 {
      position: absolute;
      z-index: 8;
      left: 0px;
      transform: translateY(-50%);
      top: 50%;
    }
    span.token2 {
      position: absolute;
      left: 20px;
      transform: translateY(-50%);
      top: 50%;
    }
  `
const Chart = styled.div`
    article div div{
      height: 200px;
    }
`
  // const PairRate = styled.h2`
  //   color: white;
  //   font-size: 3em;
  //   margin-bottom: 20px;
  //   small {
  //     font-size: 0.5em;
  //     color: #53F3C3;
  //     padding-left: 20px;
  //   }
  // `

  const [viewStatus, setViewStatus] = React.useState(0)
  const { isMobile } = useMatchBreakpoints()
  
  return (
    <Page>
      <Flex justifyContent="space-between" flexDirection={isMobile?"column":"row"}>
        <div style={{padding:'30px',background:'#1A202C',display:'flex',flexDirection:'column', width: '100%' }}>
          <PairInfo>
            <span className="token1">
              <CurrencyLogo currency={currencies[Field.INPUT]} size="32px" />
            </span>
            <span className="token2">
              <CurrencyLogo currency={currencies[Field.OUTPUT]} size="32px" />
            </span>
            {currencies[Field.INPUT]?.symbol??'?'} / {currencies[Field.OUTPUT]?.symbol??'?'}
          </PairInfo>
          {/* {(currencies[Field.INPUT]?.symbol && currencies[Field.OUTPUT]?.symbol && Boolean(trade)) && <PairRate>{trade?.executionPrice} {currencies[Field.OUTPUT]?.symbol}<small>+227.02545</small></PairRate>} */}
            <TradingViewWidget
              symbol="BNBBUSD"
              theme={Themes.DARK}
              width="100%"
            />
        </div>
        <div style={{display:(viewStatus===0?'flex':'none'),flexDirection: 'column',padding: '15px',background: '#1F2533', minWidth:(isMobile?'100%':'500px'), minHeight:(isMobile?'500px':'')}} >
          <AppBody>
            <AppHeader title={t('Swap')} subtitle={t('Trade tokens in an instant')} cogHandler={()=>{setViewStatus(1)}}/>
            <Wrapper>
              <AutoColumn gap="md">
                <CurrencyInputPanel
                  label={independentField === Field.OUTPUT && !showWrap && trade ? t('From (estimated)') : t('From')}
                  value={formattedAmounts[Field.INPUT]}
                  showMaxButton={!atMaxAmountInput}
                  currency={currencies[Field.INPUT]}
                  onUserInput={handleTypeInput}
                  onMax={handleMaxInput}
                  // onCurrencySelect={handleInputSelect}
                  // otherCurrency={currencies[Field.OUTPUT]}
                  id="swap-currency-input"
                  showCurrencySelect={()=>{setViewStatus(2)}}
                />
                <AutoColumn justify="space-between">
                  <AutoRow justify={isExpertMode ? 'space-between' : 'center'} style={{ padding: '0 1rem' }}>
                    <ArrowWrapper clickable 
                      onClick={() => {
                        setApprovalSubmitted(false) // reset 2 step UI for approvals
                        onSwitchTokens()
                      }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="29.087" height="29.087" viewBox="0 0 29.087 29.087">
                        <g id="Icon_feather-arrow-down-circle" data-name="Icon feather-arrow-down-circle" transform="translate(-1.75 -1.75)">
                          <path d="M29.587,16.293A13.293,13.293,0,1,1,16.293,3,13.293,13.293,0,0,1,29.587,16.293Z" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"/>
                          <path d="M12,18l5.317,5.317L22.635,18" transform="translate(-1.024 -1.707)" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"/>
                          <path d="M18,12V22.635" transform="translate(-1.707 -1.024)" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"/>
                        </g>
                      </svg>
                    </ArrowWrapper>
                    {recipient === null && !showWrap && isExpertMode ? (
                      <Button variant="text" id="add-recipient-button" onClick={() => onChangeRecipient('')}>
                        {t('+ Add a send (optional)')}
                      </Button>
                    ) : null}
                  </AutoRow>
                </AutoColumn>
                <CurrencyInputPanel
                  value={formattedAmounts[Field.OUTPUT]}
                  onUserInput={handleTypeOutput}
                  label={independentField === Field.INPUT && !showWrap && trade ? t('To (estimated)') : t('To')}
                  showMaxButton={false}
                  currency={currencies[Field.OUTPUT]}
                  // onCurrencySelect={handleOutputSelect}
                  // otherCurrency={currencies[Field.INPUT]}
                  id="swap-currency-output"
                  showCurrencySelect={()=>{setViewStatus(3)}}
                />

                {isExpertMode && recipient !== null && !showWrap ? (
                  <>
                    <AutoRow justify="space-between" style={{ padding: '0 1rem' }}>
                      <ArrowWrapper clickable={false}>
                        <ArrowDownIcon width="16px" />
                      </ArrowWrapper>
                      <Button variant="text" id="remove-recipient-button" onClick={() => onChangeRecipient(null)}>
                        {t('- Remove send')}
                      </Button>
                    </AutoRow>
                    <AddressInputPanel id="recipient" value={recipient} onChange={onChangeRecipient} />
                  </>
                ) : null}

                {showWrap ? null : (
                  <AutoColumn gap="8px" style={{ padding: '0 16px' }}>
                    {Boolean(trade) && (
                        <TradePrice
                          price={trade?.executionPrice}
                          showInverted={showInverted}
                          setShowInverted={setShowInverted}
                        />
                    )}
                  </AutoColumn>
                )}
              </AutoColumn>
              <Box mt="1rem">
                {swapIsUnsupported ? (
                  <Button width="100%" disabled mb="4px">
                    {t('Unsupported Asset')}
                  </Button>
                ) : !account ? (
                  <ConnectWalletButton width="100%" />
                ) : showWrap ? (
                  <Button width="100%" disabled={Boolean(wrapInputError)} onClick={onWrap}>
                    {wrapInputError ??
                      (wrapType === WrapType.WRAP ? t('Wrap') : wrapType === WrapType.UNWRAP ? t('Unwrap') : null)}
                  </Button>
                ) : noRoute && userHasSpecifiedInputOutput ? (
                  <GreyCard style={{ textAlign: 'center' }}>
                    <Text color="textSubtle" mb="4px">
                      {t('Insufficient liquidity for this trade.')}
                    </Text>
                    {singleHopOnly && (
                      <Text color="textSubtle" mb="4px">
                        {t('Try enabling multi-hop trades.')}
                      </Text>
                    )}
                  </GreyCard>
                ) : showApproveFlow ? (
                  <RowBetween>
                    <Button
                      variant={approval === ApprovalState.APPROVED ? 'success' : 'primary'}
                      onClick={approveCallback}
                      disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                      width="48%"
                    >
                      {approval === ApprovalState.PENDING ? (
                        <AutoRow gap="6px" justify="center">
                          {t('Enabling')} <CircleLoader stroke="white" />
                        </AutoRow>
                      ) : approvalSubmitted && approval === ApprovalState.APPROVED ? (
                        t('Enabled')
                      ) : (
                        t('Enable %asset%', { asset: currencies[Field.INPUT]?.symbol ?? '' })
                      )}
                    </Button>
                    <Button
                      variant={isValid && priceImpactSeverity > 2 ? 'danger' : 'primary'}
                      onClick={() => {
                        if (isExpertMode) {
                          handleSwap()
                        } else {
                          setSwapState({
                            tradeToConfirm: trade,
                            attemptingTxn: false,
                            swapErrorMessage: undefined,
                            txHash: undefined,
                          })
                          setViewStatus(5)
                        }
                      }}
                      width="48%"
                      id="swap-button"
                      disabled={
                        !isValid || approval !== ApprovalState.APPROVED || (priceImpactSeverity > 3 && !isExpertMode)
                      }
                    >
                      {priceImpactSeverity > 3 && !isExpertMode
                        ? t('Price Impact High')
                        : priceImpactSeverity > 2
                        ? t('Swap Anyway')
                        : t('Swap')}
                    </Button>
                  </RowBetween>
                ) : (
                  <Button
                    variant={isValid && priceImpactSeverity > 2 && !swapCallbackError ? 'danger' : 'primary'}
                    onClick={() => {
                      if (isExpertMode) {
                        handleSwap()
                      } else {
                        setSwapState({
                          tradeToConfirm: trade,
                          attemptingTxn: false,
                          swapErrorMessage: undefined,
                          txHash: undefined,
                        })
                        setViewStatus(5)
                      }
                    }}
                    id="swap-button"
                    width="100%"
                    disabled={!isValid || (priceImpactSeverity > 3 && !isExpertMode) || !!swapCallbackError}
                  >
                    {swapInputError ||
                      (priceImpactSeverity > 3 && !isExpertMode
                        ? t('Price Impact Too High')
                        : priceImpactSeverity > 2
                        ? t('Swap Anyway')
                        : t('Swap'))}
                  </Button>
                )}
                {showApproveFlow && (
                  <Column style={{ marginTop: '1rem' }}>
                    <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
                  </Column>
                )}
                {isExpertMode && swapErrorMessage ? <SwapCallbackError error={swapErrorMessage} /> : null}
              </Box>              
            </Wrapper>
          </AppBody>
          {!swapIsUnsupported ? (
            <AdvancedSwapDetailsDropdown trade={trade} />
          ) : (
            <UnsupportedCurrencyFooter currencies={[currencies.INPUT, currencies.OUTPUT]} />
          )}
        </div>
        <div style={{display:(viewStatus===1?'flex':'none'),flexDirection: 'column',padding: '15px',background: '#1F2533',minWidth:(isMobile?'100%':'500px')}}>
          <AppBody>
            <AppHeader title={t('Exchange Settings')} backHandler={()=>{setViewStatus(0)}} noConfig/>
            <Wrapper>
              <TransactionSettings />
            </Wrapper>
          </AppBody>
        </div>
        <div style={{display:(viewStatus===2 || viewStatus===3?'flex':'none'),flexDirection: 'column',padding: '15px',background: '#1F2533',minWidth:(isMobile?'100%':'500px')}}>
          <AppBody>
            <AppHeader title={t('Select a token')} backHandler={()=>{setViewStatus(0)}} noConfig/>
            <Wrapper>
              <CurrencySearch
                onCurrencySelect={(cur:Currency)=>{
                  if(viewStatus===2)
                    handleInputSelect(cur)
                  else
                    handleOutputSelect(cur)
                  setViewStatus(0)
                }}
                selectedCurrency={currencies[viewStatus===2?Field.INPUT:Field.OUTPUT]}
                otherSelectedCurrency={currencies[viewStatus===3?Field.INPUT:Field.OUTPUT]}
                // showCommonBases={showCommonBases}
                showImportView={null}
                setImportToken={null}
              />
            </Wrapper>
          </AppBody>
        </div>
        <div style={{display:(viewStatus===5?'flex':'none'),flexDirection: 'column',padding: '15px',background: '#1F2533',minWidth:(isMobile?'100%':'500px')}}>
          <AppBody>
            <AppHeader title={t('Confirm Order')} backHandler={()=>{setViewStatus(0)}} noConfig/>
            <Wrapper>
              <ConfirmSwapModal
                trade={trade}
                originalTrade={tradeToConfirm}
                onAcceptChanges={handleAcceptChanges}
                attemptingTxn={attemptingTxn}
                txHash={txHash}
                recipient={recipient}
                allowedSlippage={allowedSlippage}
                onConfirm={handleSwap}
                swapErrorMessage={swapErrorMessage}
                onDismiss={handleConfirmDismiss}
              />
            </Wrapper>
          </AppBody>
        </div>
      </Flex>
    </Page>
  )
}
