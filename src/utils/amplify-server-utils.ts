import { createServerRunner } from '@aws-amplify/adapter-nextjs'
import { outputs } from '../../amplify-config'

export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
})
