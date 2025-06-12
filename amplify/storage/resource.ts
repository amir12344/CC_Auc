import { defineStorage } from '@aws-amplify/backend'

export const storage = defineStorage({
  name: 'commerceCentralStorage',
  access: (allow) => ({
    'ReSellCertificates/private/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    'ReSellCertificates/public/*': [allow.authenticated.to(['read'])],
  }),
})
