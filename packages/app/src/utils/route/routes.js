import PhalaWalletPage from '@phala/wallet'
import AppSettingsPage from '@/components/SettingsPage'
import HelloWorldAppPage from '@phala/helloworld-app'
import SecretB64CodeAppPage from '@phala/secretb64code-app'

export const COMPONENT_ROUTES = {
  wallet: PhalaWalletPage,
  settings: AppSettingsPage,
  helloworldapp: HelloWorldAppPage,
  secretb64codeapp: SecretB64CodeAppPage
}

export const MENU_ROUTES = {
  WALLET: '/wallet',
  SETTINGS: '/settings',
  HELLOWORLDAPP: '/helloworldapp',
  SECRETB64CODEAPP: '/secretb64codeapp'
}
