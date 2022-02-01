import React from 'react'
import { ButtonMenuItem } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import { useERC20 } from 'hooks/useContract'
import { DeserializedPool } from 'state/types'
import { useApprovePool } from '../../../hooks/useApprove'

interface ApprovalActionProps {
  pool: DeserializedPool
  // isLoading?: boolean
}

const ApprovalAction: React.FC<ApprovalActionProps> = ({ pool }) => {
  const { sousId, stakingToken, earningToken } = pool
  const { t } = useTranslation()
  const stakingTokenContract = useERC20(stakingToken.address || '')
  const { handleApprove, requestedApproval } = useApprovePool(stakingTokenContract, sousId, earningToken.symbol)

  return (
    <ButtonMenuItem
      style={{background:"#1EBF8D"}}
      // isLoading={requestedApproval}
      // endIcon={requestedApproval ? <AutoRenewIcon spin color="currentColor" /> : null}
      // disabled={requestedApproval}
      onClick={handleApprove}
      width="100%"
    >
      {requestedApproval?t('Approving'):t('Approve')}
    </ButtonMenuItem>
  )
}

export default ApprovalAction
