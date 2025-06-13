import { defineStorage } from '@aws-amplify/backend'

export const storage = defineStorage({
  name: 'commerceCentralStorage',
//   access: (allow) => ({
//     'ReSellCertificates/private/{entity_id}/*': [
//       // Temporarily allow guest access - VERY PERMISSIVE!
//       allow.guest.to(['read', 'write', 'delete']),
//     ],
//     'ReSellCertificates/public/*': [
//       // Temporarily allow guest access
//       allow.guest.to(['read']),
//     ],
//   }),
})
