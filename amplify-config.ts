import outputs from '@/amplify_outputs.json'
import { Amplify } from 'aws-amplify'

// Centralized configuration call (can be used by client/server)
export const configureAmplify = () => {
  // Amplify configuration is generally idempotent
  // Calling it multiple times (e.g., in client and server) with the same config should be safe.
  Amplify.configure(outputs, { ssr: true })
  // console.log('Amplify configured/re-confirmed via amplify-config.ts');
}

// Initial configuration call for server-side contexts that might import this
configureAmplify()

// Export the outputs directly if needed elsewhere
export default outputs
