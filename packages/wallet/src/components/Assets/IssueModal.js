import { Modal, useInput, Input, Spacer, useToasts, Popover, Button } from '@zeit-ui/react'
import React, { useCallback, useState, useMemo, useEffect } from 'react'
import TxButton from '@/components/TxButton'
import { observer } from 'mobx-react'
import { useStore } from '@/store'
import getUnitAmount from '@/utils/getUnitAmount'
import { CONTRACT_ASSETS } from '../../utils/constants'
import { encryptObj } from '@phala/runtime/utils'
import { toApi } from '@phala/runtime/models'

const IssueModal = ({ bindings, setVisible }) => {
  const { account, walletRuntime } = useStore()
  const { assetSymbols, ecdhChannel } = walletRuntime

  const symbolInput = useInput('')
  const valueInput = useInput('')
  const [isBusy, setIsBusy] = useState(false)
  const [command, setCommand] = useState('')
  const [, setToast] = useToasts()

  const symbolError = useMemo(() => {
    const val = symbolInput.state

    if (!symbolInput.state.length) {
      return null
    }

    if (!val.toLowerCase().match(/^[a-z]+$/)) {
      return 'bad symbol'
    }
    if (val.length <= 2) {
      return 'too short'
    }
    if (val.length > 9) {
      return 'too long'
    }
    if (assetSymbols.find(t => t.toLowerCase() === val.toLowerCase())) {
      return 'conflict'
    }

    return null
  }, [assetSymbols, symbolInput.state])

  const symbol = useMemo(() => symbolInput.state.trim().toUpperCase(), [symbolInput.state])

  const unit = useMemo(() => {
    if (!!symbolError) {
      return 'Unit'
    }
    if (!symbol.length) {
      return 'Unit'
    }
    return symbol
  }, [symbol, symbolError])

  const amount = useMemo(() => {
    const [, _value] = getUnitAmount(valueInput.state)
    return _value.toString()
  }, [valueInput.state])

  const [innerDisabled, setInnerDisabled] = useState(false)

  const disabled = useMemo(() => !(
    !innerDisabled && symbolInput.state.trim().length && !symbolError && (parseInt(amount) > 0)
  ), [amount, symbolError, symbolInput.state, innerDisabled])

  useEffect(() => {
    setInnerDisabled(true)
    ;(async () => {
      const obj = {
        Issue: {
          symbol,
          total: amount
        }
      }
      const cipher = await encryptObj(ecdhChannel, obj)
      const apiCipher = toApi(cipher)
      setCommand(JSON.stringify({ Cipher: apiCipher }))
      setInnerDisabled(false)
    })()
  }, [ecdhChannel, symbol, amount])

  const reset = useCallback(() => {
    setIsBusy(false)
    symbolInput.reset()
    valueInput.reset()
  }, [setIsBusy, symbolInput, valueInput])

  const onStart = useCallback(() => {
    setIsBusy(true)
  }, [setIsBusy])

  const onFailed = useCallback(e => {
    setIsBusy(false)
    setToast({
      text: 'Failed to issue.',
      type: 'error'
    })
  }, [setIsBusy])

  const onSuccess = useCallback(() => {
    setToast({
      text: 'Successfully issued, the asset will appear soon.'
    })
    onClose()
  }, [setIsBusy])

  const onClose = useCallback(() => {
    if (isBusy) { return }

    setVisible(false)
    reset()
  }, [isBusy, setVisible, reset])

  const doSend = useCallback(() => {
    if (isBusy) { return }
  }, [isBusy])

  return <Modal {...bindings}>
    <Modal.Title>issue secret token</Modal.Title>
    <Modal.Content>
      <Input
        {...symbolInput.bindings}
        placeholder="Symbol"
        width="100%"
        status={!!symbolError ? 'error' : undefined}
        labelRight={symbolError}
      />
      <Spacer y={.5} />
      <Input
        {...valueInput.bindings}
        placeholder="Amount"
        labelRight={unit}
        width="100%"
      />
    </Modal.Content>
    <Modal.Action disabled={isBusy} passive onClick={onClose}>Cancel</Modal.Action>
    {disabled
      ? <Button disabled>Submit</Button>
      : <TxButton
        accountId={account.address || ''}
        onClick={doSend}
        params={[CONTRACT_ASSETS, command]}
        tx='phalaModule.pushCommand'
        withSpinner
        onStart={onStart}
        onFailed={onFailed}
        onSuccess={onSuccess}
      >
        Submit
      </TxButton>}
  </Modal>
}

export default observer(IssueModal)
