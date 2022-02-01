import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, currencyEquals, ETHER, Pair, TokenAmount, WETH } from '@pancakeswap/sdk'
import { Button, Text, Flex, AddIcon, CardBody, Message, Heading, WarningIcon, useMatchBreakpoints } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { Link, Redirect, RouteComponentProps } from 'react-router-dom'
import { useIsTransactionUnsupported } from 'hooks/Trades'
import { useTranslation } from 'contexts/Localization'
import UnsupportedCurrencyFooter from 'components/UnsupportedCurrencyFooter'
import CurrencySearch from 'components/SearchModal/CurrencySearch'
import TransactionSettings from 'components/Menu/GlobalSettings/TransactionSettings'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
// import useDebouncedChangeHandler from 'hooks/useDebouncedChangeHandler'
// import { useBurnActionHandlers } from 'state/burn/hooks'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../state'
// import { LightCard } from '../../components/Card'
import { AutoColumn, ColumnCenter } from '../../components/Layout/Column'
import TransactionConfirmationModal, { ConfirmationModalContent } from '../../components/TransactionConfirmationModal'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { DoubleCurrencyLogo } from '../../components/Logo'
import { AppHeader, AppBody } from '../../components/App'
import { LiquidityDeposit, MinimalPositionCard, PoolInfoCard } from '../../components/PositionCard'
import { RowBetween } from '../../components/Layout/Row'
import ConnectWalletButton from '../../components/ConnectWalletButton'

import { ROUTER_ADDRESS } from '../../config/constants'
import { PairState, usePairs } from '../../hooks/usePairs'
import { useCurrency } from '../../hooks/Tokens'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { Field, resetMintState } from '../../state/mint/actions'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from '../../state/mint/hooks'

import { useTransactionAdder } from '../../state/transactions/hooks'
import { toV2LiquidityToken, useGasPrice, useIsExpertMode, useTrackedTokenPairs, useUserSlippageTolerance } from '../../state/user/hooks'
import { calculateGasMargin, calculateSlippageAmount, getRouterContract } from '../../utils'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { unwrappedToken, wrappedCurrency } from '../../utils/wrappedCurrency'
import Dots from '../../components/Loader/Dots'
import ConfirmAddModalBottom from './ConfirmAddModalBottom'
import { currencyId } from '../../utils/currencyId'
import PoolPriceBar from './PoolPriceBar'
import Page from '../Page'
import { useTokenBalancesWithLoadingIndicator } from '../../state/wallet/hooks'
import RemoveLiquidityContent from './RemoveLiquidity'
import PoolsRender from './PoolsRender'

export default function Liquidity({
  match: {
    params: { currencyIdA, currencyIdB },
  },
  location,
  history,
}: RouteComponentProps<{ currencyIdA?: string; currencyIdB?: string }>) {
  const { isMobile } = useMatchBreakpoints()
  const { account, chainId, library } = useActiveWeb3React()
  
  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslation()
  const gasPrice = useGasPrice()
  const showInfo = (location.pathname.startsWith('/liquidity') || location.pathname.startsWith('/remove')) && currencyIdA && currencyIdB

  const currencyA = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)

  useEffect(() => {
    if (!currencyIdA && !currencyIdB) {
      dispatch(resetMintState())
    }
  }, [dispatch, currencyIdA, currencyIdB])

  const oneCurrencyIsWETH = Boolean(
    chainId &&
      ((currencyA && currencyEquals(currencyA, WETH[chainId])) ||
        (currencyB && currencyEquals(currencyB, WETH[chainId]))),
  )

  const expertMode = useIsExpertMode()

  // mint state
  const { independentField, typedValue, otherTypedValue } = useMintState()
  const {
    dependentField,
    currencies,
    pair,
    pairState,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error,
  } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)

  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)

  const isValid = !error

  // modal and loading
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm

  // txn values
  const deadline = useTransactionDeadline() // custom from users settings
  const [allowedSlippage] = useUserSlippageTolerance() // custom from users
  const [txHash, setTxHash] = useState<string>('')

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
    // [Field.LIQUIDITY_PERCENT]: removePercent===0 ? '0' : removePercent
  }

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field]),
      }
    },
    {},
  )

  const atMaxAmounts: { [field in Field]?: TokenAmount } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0'),
      }
    },
    {},
  )

  // check whether the user has approved the router on the tokens
  const [approvalA, approveACallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_A], ROUTER_ADDRESS)
  const [approvalB, approveBCallback] = useApproveCallback(parsedAmounts[Field.CURRENCY_B], ROUTER_ADDRESS)

  const addTransaction = useTransactionAdder()

  const onAdd = async() => {
    if (!chainId || !library || !account) return
    const router = getRouterContract(chainId, library, account)

    const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB || !deadline) {
      return
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noLiquidity ? 0 : allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noLiquidity ? 0 : allowedSlippage)[0],
    }

    let estimate
    let method: (...args: any) => Promise<TransactionResponse>
    let args: Array<string | string[] | number>
    let value: BigNumber | null
    if (currencyA === ETHER || currencyB === ETHER) {
      const tokenBIsETH = currencyB === ETHER
      estimate = router.estimateGas.addLiquidityETH
      method = router.addLiquidityETH
      args = [
        wrappedCurrency(tokenBIsETH ? currencyA : currencyB, chainId)?.address ?? '', // token
        (tokenBIsETH ? parsedAmountA : parsedAmountB).raw.toString(), // token desired
        amountsMin[tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(), // token min
        amountsMin[tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(), // eth min
        account,
        deadline.toHexString(),
      ]
      value = BigNumber.from((tokenBIsETH ? parsedAmountB : parsedAmountA).raw.toString())
    } else {
      estimate = router.estimateGas.addLiquidity
      method = router.addLiquidity
      args = [
        wrappedCurrency(currencyA, chainId)?.address ?? '',
        wrappedCurrency(currencyB, chainId)?.address ?? '',
        parsedAmountA.raw.toString(),
        parsedAmountB.raw.toString(),
        amountsMin[Field.CURRENCY_A].toString(),
        amountsMin[Field.CURRENCY_B].toString(),
        account,
        deadline.toHexString(),
      ]
      value = null
    }

    setAttemptingTxn(true)
    await estimate(...args, value ? { value } : {})
      .then((estimatedGasLimit) =>
        method(...args, {
          ...(value ? { value } : {}),
          gasLimit: calculateGasMargin(estimatedGasLimit),
          gasPrice,
        }).then((response) => {
          
          
          setAttemptingTxn(false)

          addTransaction(response, {
            summary: `Add ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(3)} ${
              currencies[Field.CURRENCY_A]?.symbol
            } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)} ${currencies[Field.CURRENCY_B]?.symbol}`,
          })

          setTxHash(response.hash)
        }),
      )
      .catch((err) => {
        setAttemptingTxn(false)
        // we only care if the error is something _other_ than the user rejected the tx
        if (err?.code !== 4001) {
          console.error(err)
        }
      })
  }

  const modalHeader = () => {
    return noLiquidity ? (
      <AutoColumn justify="center">
        <DoubleCurrencyLogo
          currency0={currencies[Field.CURRENCY_A]}
          currency1={currencies[Field.CURRENCY_B]}
          size={48}
        />
        <Text fontSize="24px" color="primary" mt="24px">
          {`${currencies[Field.CURRENCY_A]?.symbol}/${currencies[Field.CURRENCY_B]?.symbol} Pool Tokens`}
        </Text>
      </AutoColumn>
    ) : (
      <AutoColumn justify="center">
        <Text fontSize="40px" mb="24px">
          {liquidityMinted?.toSignificant(6)}
        </Text>
        <DoubleCurrencyLogo
          currency0={currencies[Field.CURRENCY_A]}
          currency1={currencies[Field.CURRENCY_B]}
          size={48}
        />
        <Text fontSize="24px" color="primary" mt="24px">
          {`${currencies[Field.CURRENCY_A]?.symbol}/${currencies[Field.CURRENCY_B]?.symbol} Pool Tokens`}
        </Text>
        <Text small my="24px" color="#8B95A8" textAlign="center">
          {t('Output is estimated. If the price changes by more than %slippage%% your transaction will revert.', {
            slippage: allowedSlippage / 100,
          })}
        </Text>
      </AutoColumn>
    )
  }

  const modalBottom = () => {
    return (
      <ConfirmAddModalBottom
        price={price}
        currencies={currencies}
        parsedAmounts={parsedAmounts}
        noLiquidity={noLiquidity}
        onAdd={onAdd}
        poolTokenPercentage={poolTokenPercentage}
      />
    )
  }

  const pendingText = t('Supplying %amountA% %symbolA% and %amountB% %symbolB%', {
    amountA: parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) ?? '',
    symbolA: currencies[Field.CURRENCY_A]?.symbol ?? '',
    amountB: parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) ?? '',
    symbolB: currencies[Field.CURRENCY_B]?.symbol ?? '',
  })

  const handleCurrencyASelect = useCallback(
    (currencyA_: Currency) => {
      const newCurrencyIdA = currencyId(currencyA_)
      if (newCurrencyIdA === currencyIdB) {
        history.push(`/add/${currencyIdB}/${currencyIdA}`)
      } else if (currencyIdB) {
        history.push(`/add/${newCurrencyIdA}/${currencyIdB}`)
      } else {
        history.push(`/add/${newCurrencyIdA}`)
      }
    },
    [currencyIdB, history, currencyIdA],
  )
  const handleCurrencyBSelect = useCallback(
    (currencyB_: Currency) => {
      const newCurrencyIdB = currencyId(currencyB_)
      if (currencyIdA === newCurrencyIdB) {
        if (currencyIdB) {
          history.push(`/add/${currencyIdB}/${newCurrencyIdB}`)
        } else {
          history.push(`/add/${newCurrencyIdB}`)
        }
      } else {
        history.push(`/add/${currencyIdA || 'BNB'}/${newCurrencyIdB}`)
      }
    },
    [currencyIdA, history, currencyIdB],
  )
  const handleRemoveCurrencyASelect = useCallback(
    (currency: Currency) => {
      if (currencyIdB && currencyId(currency) === currencyIdB) {
        history.push(`/remove/${currencyId(currency)}/${currencyIdA}`)
      } else {
        history.push(`/remove/${currencyId(currency)}/${currencyIdB}`)
      }
    },
    [currencyIdB, history, currencyIdA],
  )
  const handleRemoveCurrencyBSelect = useCallback(
    (currency: Currency) => {
      if (currencyIdA && currencyId(currency) === currencyIdA) {
        history.push(`/remove/${currencyIdB}/${currencyId(currency)}`)
      } else {
        history.push(`/remove/${currencyIdA}/${currencyId(currency)}`)
      }
    },
    [currencyIdA, history, currencyIdB],
  )

  // const handleDismissConfirmation = useCallback(() => {
  //   // if there was a tx hash, we want to clear the input
  //   if (txHash) {
  //     onFieldAInput('')
  //   }
  //   setTxHash('')
  // }, [onFieldAInput, txHash])

  const addIsUnsupported = useIsTransactionUnsupported(currencies?.CURRENCY_A, currencies?.CURRENCY_B)

  // const [onPresentAddLiquidityModal] = useModal(
  //   <TransactionConfirmationModal
  //     attemptingTxn={attemptingTxn}
  //     hash={txHash}
  //     content={() => <ConfirmationModalContent topContent={modalHeader} bottomContent={modalBottom} />}
  //     pendingText={pendingText}
  //     currencyToAdd={pair?.liquidityToken}
  //   />,
  //   true,
  //   true,
  //   'addLiquidityModal',
  // )

  
  const [viewStatus, setViewStatus] = React.useState(location.pathname.startsWith('/remove')?5:0)
 
  const Wrapper = styled.div`
    position: relative;
    padding: 24px;
    border-top: 1px solid #273043;
  `
  // const [reloadTick,setReloadTick] = useState(0)
  const [showRemoveConfirm,setShowRemoveConfirm] = useState<boolean>(false)
  return (
    <Page>
      <Flex justifyContent="space-between" flexDirection={isMobile?"column":"row"}>
        <div style={{padding:(isMobile?'30px 5px':'30px'),background:'#1A202C',flex:1,display:'flex',flexDirection:'column'}}>
          
          <PoolsRender/>
          {/* {account && !v2IsLoading && (
            <Flex flexDirection="column" alignItems="center" mt="24px">
              <Text color="textSubtle" mb="8px">
                {t("Don't see a pool you joined?")}
              </Text>
              <Button id="import-pool-link" variant="secondary" scale="sm" as={Link} to="/find">
                {t('Find other LP tokens')}
              </Button>
            </Flex>
          )} */}
          {/* <Button onClick={()=>{
            setReloadTick(reloadTick+1)
          }}>Reload</Button> */}
        </div>
        <div style={{display:(viewStatus===0?'flex':'none'),flexDirection: 'column',padding: '15px',background: '#1F2533',width:(isMobile?'100%':'500px')}}>
          {showInfo?(
            <AppBody>
              <AppHeader
                title={t('Liquidity Details')}
                backTo="/liquidity"
                noConfig
              />
              <CardBody>
                {pair?<PoolInfoCard pair={pair} />:null}
                <Flex mt="2rem" justifyContent="space-between">
                  <Button variant="primary" as={Link} to={`/add/${currencyIdA}/${currencyIdB}`} style={{flex:1}}>Add</Button>
                  <Button variant="tertiary" onClick={()=>{setViewStatus(5)}} style={{flex:1,color:'white'}}>Remove</Button>
                </Flex>
              </CardBody>
            </AppBody>          
          ):(
            <AppBody>
              <AppHeader
                title={t('Liquidity')}
                subtitle={t('Stake Liquidity Pool (LP) tokens to earn')}
                cogHandler={()=>{setViewStatus(1)}}
              />
              <CardBody>
                <AutoColumn gap="20px">
                  {noLiquidity && (
                    <ColumnCenter>
                      <Message variant="warning">
                        <div>
                          <Text bold mb="8px">
                            {t('You are the first liquidity provider.')}
                          </Text>
                          <Text mb="8px">{t('The ratio of tokens you add will set the price of this pool.')}</Text>
                          <Text>{t('Once you are happy with the rate click supply to review.')}</Text>
                        </div>
                      </Message>
                    </ColumnCenter>
                  )}
                  <CurrencyInputPanel
                    value={formattedAmounts[Field.CURRENCY_A]}
                    onUserInput={onFieldAInput}
                    onMax={() => {
                      onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
                    }}
                    // onCurrencySelect={handleCurrencyASelect}
                    showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                    currency={currencies[Field.CURRENCY_A]}
                    id="add-liquidity-input-tokena"
                    // showCommonBases
                    showCurrencySelect={()=>{setViewStatus(2)}}
                  />
                  <ColumnCenter>
                    <AddIcon width="32px" />
                  </ColumnCenter>
                  <CurrencyInputPanel
                    value={formattedAmounts[Field.CURRENCY_B]}
                    onUserInput={onFieldBInput}
                    // onCurrencySelect={handleCurrencyBSelect}
                    onMax={() => {
                      onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
                    }}
                    showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
                    currency={currencies[Field.CURRENCY_B]}
                    id="add-liquidity-input-tokenb"
                    // showCommonBases
                    showCurrencySelect={()=>{setViewStatus(3)}}
                  />
                  {currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B] && pairState !== PairState.INVALID && (
                    <>
                      <RowBetween mt="1rem">
                        <Text fontSize="16px" color="#8B95A8">
                          {noLiquidity ? t('Initial prices and pool share') : t('Prices and pool share')}
                        </Text>
                      </RowBetween>{' '}
                      <PoolPriceBar
                        currencies={currencies}
                        poolTokenPercentage={poolTokenPercentage}
                        noLiquidity={noLiquidity}
                        price={price}
                      />
                    </>
                  )}

                  {addIsUnsupported ? (
                    <Button disabled mb="4px">
                      {t('Unsupported Asset')}
                    </Button>
                  ) : !account ? (
                    <ConnectWalletButton />
                  ) : (
                    <AutoColumn gap="md">
                      {(approvalA === ApprovalState.NOT_APPROVED ||
                        approvalA === ApprovalState.PENDING ||
                        approvalB === ApprovalState.NOT_APPROVED ||
                        approvalB === ApprovalState.PENDING) &&
                        isValid && (
                          <RowBetween>
                            {approvalA !== ApprovalState.APPROVED && (
                              <Button
                                onClick={approveACallback}
                                disabled={approvalA === ApprovalState.PENDING}
                                width={approvalB !== ApprovalState.APPROVED ? '48%' : '100%'}
                              >
                                {approvalA === ApprovalState.PENDING ? (
                                  <Dots>{t('Enabling %asset%', { asset: currencies[Field.CURRENCY_A]?.symbol })}</Dots>
                                ) : (
                                  t('Enable %asset%', { asset: currencies[Field.CURRENCY_A]?.symbol })
                                )}
                              </Button>
                            )}
                            {approvalB !== ApprovalState.APPROVED && (
                              <Button
                                onClick={approveBCallback}
                                disabled={approvalB === ApprovalState.PENDING}
                                width={approvalA !== ApprovalState.APPROVED ? '48%' : '100%'}
                              >
                                {approvalB === ApprovalState.PENDING ? (
                                  <Dots>{t('Enabling %asset%', { asset: currencies[Field.CURRENCY_B]?.symbol })}</Dots>
                                ) : (
                                  t('Enable %asset%', { asset: currencies[Field.CURRENCY_B]?.symbol })
                                )}
                              </Button>
                            )}
                          </RowBetween>
                        )}
                      <Button
                        variant={
                          !isValid && !!parsedAmounts[Field.CURRENCY_A] && !!parsedAmounts[Field.CURRENCY_B]
                            ? 'danger'
                            : 'primary'
                        }
                        onClick={() => {
                          if (expertMode) {
                            onAdd()
                          } else {
                            setViewStatus(4)
                          }
                        }}
                        disabled={!isValid || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED}
                      >
                        {error ?? t('Supply')}
                      </Button>
                    </AutoColumn>
                  )}
                </AutoColumn>
              </CardBody>
            </AppBody>          
          )}
          {!showInfo && (!addIsUnsupported ? (
            pair && !noLiquidity && pairState !== PairState.INVALID ? (
              <AutoColumn style={{ minWidth: '15rem', maxWidth: '400px', margin: '0 2rem' }}>
                <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
              </AutoColumn>
            ) : null
          ) : (
            <UnsupportedCurrencyFooter currencies={[currencies.CURRENCY_A, currencies.CURRENCY_B]} />
          ))}
        </div>
        <div style={{display:(viewStatus===1?'flex':'none'),flexDirection: 'column',padding: '15px',background: '#1F2533',width:(isMobile?'100%':'500px')}}>
          {viewStatus===1?
          <AppBody>
            <AppHeader title={t('Liquidity Settings')} backHandler={()=>{setViewStatus(0)}} noConfig/>
            <Wrapper>
              <TransactionSettings />
            </Wrapper>
          </AppBody>
          :null}
        </div>
        {viewStatus===2 || viewStatus===3 || viewStatus===6 || viewStatus===7?
          <div style={{display:'flex',flexDirection: 'column',padding: '15px',background: '#1F2533',width:(isMobile?'100%':'500px')}}>
            <AppBody>
              <AppHeader title={t('Select a token')} backHandler={()=>{setViewStatus(0)}} noConfig/>
              <Wrapper>
                <CurrencySearch
                  onCurrencySelect={(cur:Currency)=>{
                    if(viewStatus===2)
                      handleCurrencyASelect(cur)
                    else if(viewStatus===3)
                      handleCurrencyBSelect(cur)
                    else if(viewStatus===6)
                      handleRemoveCurrencyASelect(cur)
                    else if(viewStatus===7)
                      handleRemoveCurrencyBSelect(cur)
                    if(viewStatus===2 || viewStatus===3)
                      setViewStatus(0)
                    if(viewStatus===6 || viewStatus===7)
                      setViewStatus(5)
                  }}
                  selectedCurrency={currencies[viewStatus===2?Field.CURRENCY_A:Field.CURRENCY_B]}
                  otherSelectedCurrency={currencies[viewStatus===3?Field.CURRENCY_A:Field.CURRENCY_B]}
                  // showCommonBases={showCommonBases}
                  showImportView={null}
                  setImportToken={null}
                />
              </Wrapper>
            </AppBody>
          </div>
        :null}
        <div style={{display:(viewStatus===4?'flex':'none'),flexDirection: 'column',padding: '15px',background: '#1F2533',width:(isMobile?'100%':'500px')}}>
          {viewStatus===4?
          <AppBody>
            <AppHeader title={noLiquidity?t('Add New Liquidity'):t('You Will Receive')} noConfig backHandler={()=>{
              setViewStatus(0)
              if (txHash) {
                onFieldAInput('')
              }
              setTxHash('')
            }}/>
            <Wrapper>
              <TransactionConfirmationModal
                attemptingTxn={attemptingTxn}
                hash={txHash}
                content={() => <ConfirmationModalContent topContent={modalHeader} bottomContent={modalBottom} />}
                pendingText={pendingText}
                currencyToAdd={pair?.liquidityToken}
              />
            </Wrapper>
          </AppBody>
          :null}
        </div>
        <div style={{display:(viewStatus===5?'flex':'none'),flexDirection: 'column',padding: '15px',background: '#1F2533',width:(isMobile?'100%':'500px')}}>
          {viewStatus===5?
          <AppBody>
            <AppHeader title={t(showRemoveConfirm?'You Will Receive':'Remove Liquidity')} noConfig backHandler={()=>{
              if(showRemoveConfirm)
                setShowRemoveConfirm(false)
              else
                setViewStatus(0)
            }}/>
            <div style={{position: 'relative', padding: '24px', borderTop: '1px solid #273043'}}>
              <RemoveLiquidityContent currencyIdA={currencyIdA} currencyIdB={currencyIdB} setViewStatus={setViewStatus} showConfirm={showRemoveConfirm} setShowConfirm={setShowRemoveConfirm}/>
            </div>
          </AppBody>
          :null}
        </div>
      </Flex>
    </Page>
  )
}