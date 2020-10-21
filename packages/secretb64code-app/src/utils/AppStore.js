import { types, flow } from 'mobx-state-tree'

export const CONTRACT_SECRETB64CODE = 6;

export const createSecretB64CodeAppStore = (defaultValue = {}, options = {}) => {
  const SecretB64CodeAppStore = types
    .model('SecretB64CodeAppStore', {
      secb46code: types.maybeNull(types.string)
    })
    .actions(self => ({
      setB64Code (b64code) {
        self.secb46code = b64code
        console.log('setB64Code::b64code', b64code);
      },
      async decodeB64Code (runtime) {
        return await runtime.query(CONTRACT_SECRETB64CODE, 'DecodeB64Code')
      }
    }))

  return SecretB64CodeAppStore.create(defaultValue)
}
