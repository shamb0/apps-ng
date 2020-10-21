import React, { useEffect, useState, useMemo } from 'react'
import styled from "styled-components"
import { observer } from 'mobx-react'
import { Button, Input, Spacer, useInput, useToasts } from '@zeit-ui/react'
import { Plus as PlusIcon } from '@zeit-ui/react-icons'

import { useStore } from "@/store"
import Container from '@/components/Container'
import UnlockRequired from '@/components/accounts/UnlockRequired'
import PushCommandButton from '@/components/PushCommandButton'

import { CONTRACT_SECRETB64CODE, createSecretB64CodeAppStore } from './utils/AppStore'
import { reaction } from 'mobx'

const ButtonWrapper = styled.div`
  margin-top: 5px;
  width: 200px;
`;

/**
 * Header of the HelloWorld app page
 */
const AppHeader = () => (
  <Container>
    <h1>Secret B64Code!!</h1>
  </Container>
)

/**
 * Body of the HelloWorld app page
 */
const AppBody = observer(() => {
  const { appRuntime, secretb64codeApp } = useStore();
  const [, setToast] = useToasts()
  const { state: statesecb64code, bindings } = useInput('UFdOIC0gS2VlcCBpdCBTZWNyZXQhISEK')

  /**
   * Updates the counter by querying the helloworld contract
   * The type definitions of `GetCount` request and response can be found at contract/helloworld.rs
   */
  async function decodeB64Code () {
    if (!secretb64codeApp) return
    try {
      const response = await secretb64codeApp.decodeB64Code(appRuntime)
      // Print the response in the original to the console
      console.log('Response::decodeB64Code', response);

      secretb64codeApp.setB64Code(response.DecodeB64Code.decnote)
    } catch (err) {
      setToast(err.message, 'error')
    }
  }

  /**
   * The `increment` transaction payload object
   * It follows the command type definition of the contract (at contract/helloworld.rs)
   */
  const SetB64CodeCommandPayload = useMemo(() => {
    return {
      SetB64Code: {
        b64code: statesecb64code
      }
    }
  }, [statesecb64code])

  return (
    <Container>
      <section>
        <div>PRuntime: {appRuntime ? 'yes' : 'no'}</div>
        <div>PRuntime ping: {appRuntime.latency || '+∞'}</div>
        <div>PRuntime connected: {appRuntime?.channelReady ? 'yes' : 'no'}</div>
      </section>
      <Spacer y={1}/>

      <h3>Decoded</h3>
      <section>
        <div>Note: {secretb64codeApp.secb46code === null ? 'unknown' : secretb64codeApp.secb46code}</div>
        <div><Button onClick={decodeB64Code}>Decode</Button></div>
      </section>
      <Spacer y={1}/>

      <h3>Update B64 Code</h3>
      <section>
        <div>
          <Input label="By" {...bindings} />
        </div>
        <ButtonWrapper>
          {/**
            * PushCommandButton is the easy way to send confidential contract txs.
            * Below it's configurated to send HelloWorld::Increment()
            */}
          <PushCommandButton
              // tx arguments
              contractId={CONTRACT_SECRETB64CODE}
              payload={SetB64CodeCommandPayload}
              // display messages
              modalTitle='SecretB64Code.SetB64Code()'
              modalSubtitle={`SetB64Code by ${statesecb64code}`}
              onSuccessMsg='Tx succeeded'
              // button appearance
              buttonType='secondaryLight'
              icon={PlusIcon}
              name='Send'
            />
        </ButtonWrapper>
      </section>

    </Container>
  )
})

/**
 * Injects the mobx store to the global state once initialized
 */
const StoreInjector = observer(({ children }) => {
  const appStore = useStore()
  const [shouldRenderContent, setShouldRenderContent] = useState(false)

  useEffect(() => {
    if (!appStore || !appStore.appRuntime) return
    if (typeof appStore.secretb64codeApp !== 'undefined') return
    appStore.secretb64codeApp = createSecretB64CodeAppStore({})
  }, [appStore])

  useEffect(() => reaction(
    () => appStore.secretb64codeApp,
    () => {
      if (appStore.secretb64codeApp && !shouldRenderContent) {
        setShouldRenderContent(true)
      }
    },
    { fireImmediately: true })
  )

  return shouldRenderContent && children;
})

export default () => (
  <UnlockRequired>
    <StoreInjector>
      <AppHeader />
      <AppBody />
    </StoreInjector>
  </UnlockRequired>
)
