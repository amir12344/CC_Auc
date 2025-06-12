import { Amplify } from 'aws-amplify'
import outputs from './amplify_outputs.json'

let isServerConfigured = false

function configureAmplifySingleton() {
  if (!isServerConfigured) {
    try {
      Amplify.configure(outputs, { ssr: true })
      isServerConfigured = true
      // console.log('Amplify configured for a server-side or shared context')
    } catch (error) {
      // Log the error but don't necessarily throw,
      // as client-side might also pick this up if imported directly.
      // Client-side configuration should primarily be handled by ConfigureAmplifyClientSide.tsx
      console.error('Error configuring Amplify via amplify-config.ts:', error)
    }
  }
}

// Automatically configure for any server-side module that imports this.
// Also safe if a client-side module accidentally imports it, due to the guard.
configureAmplifySingleton()

// Export the raw outputs if any part of your application needs direct access to it.
export { outputs }

// Optionally export the configure function if you want to explicitly call it,
// though the automatic call on import usually suffices.
export { configureAmplifySingleton }
