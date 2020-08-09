import Button from './Button'
import React, { useCallback, useState, useMemo, useEffect } from 'react'
import {
  MinusSquare as MinusSquareIcon
} from '@zeit-ui/react-icons'
import TxButton from '@/components/TxButton'
import { Modal, useModal, useToasts, Spacer } from '@zeit-ui/react'
import { CONTRACT_ASSETS } from '../../utils/constants'
import { encryptObj } from '@phala/runtime/utils'
import { toApi } from '@phala/runtime/models'
import { observer } from 'mobx-react'
import { useStore } from '@/store'

const DestroyModal = observer(({ id, symbol, bindings, setVisible }) => {
  const { account, walletRuntime } = useStore()
  const { ecdhChannel } = walletRuntime
  const [isBusy, setIsBusy] = useState(false)
  const [, setToast] = useToasts()
  const [command, setCommand] = useState('')
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    setDisabled(true)
    ;(async () => {
      const obj = {
        Destroy: { id }
      }
      const cipher = await encryptObj(ecdhChannel, obj)
      const apiCipher = toApi(cipher)
      setCommand(JSON.stringify({ Cipher: apiCipher }))
      setDisabled(false)
    })()
  }, [id])

  const onStart = useCallback(() => {
    setIsBusy(true)
  }, [setIsBusy])

  const onFailed = useCallback(e => {
    setIsBusy(false)
    e && console.warn(e)
    setToast({
      text: 'Failed to submit.',
      type: 'error'
    })
  }, [setIsBusy])

  const onSuccess = useCallback(() => {
    setToast({
      text: 'Successfully destroyed, the assets will disappear soon.'
    })
    onClose()
  }, [onClose])

  const onClose = useCallback(() => {
    if (isBusy) { return }

    setVisible(false)
  }, [isBusy])

  const doSend = useCallback(() => {
    if (isBusy) { return }
  }, [isBusy])

  return <Modal {...bindings} disableBackdropClick>
    <Modal.Title>Confirm</Modal.Title>
    <Modal.Subtitle>do you want to destroy the secret token({symbol})?</Modal.Subtitle>
    <Spacer y={1} />
    <TxButton
      accountId={account.address || ''}
      onClick={doSend}
      params={[CONTRACT_ASSETS, command]}
      tx='phalaModule.pushCommand'
      withSpinner
      onStart={onStart}
      onFailed={onFailed}
      onSuccess={onSuccess}
      disabled={disabled}
    >
      Submit
    </TxButton>
    <Modal.Action onClick={onClose}>Cancel</Modal.Action>
  </Modal>
})

const DestroyButton = ({ id, symbol }) => {
  const modal = useModal()

  return <>
    <DestroyModal id={id} symbol={symbol} {...modal} />
    <Button
      type="remove"
      icon={MinusSquareIcon}
      name="Destroy Token"
      onClick={() => modal.setVisible(true)}
    />
  </>
}

export default DestroyButton
