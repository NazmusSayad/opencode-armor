import { Plugin } from '@opencode-ai/plugin'
import { patternMatcher } from './matcher.js'

console.log('OpenCode Armor plugin loading...')

// eslint-disable-next-line func-style
export const OpenCodeCMD: Plugin = async () => {
  return {
    'tool.execute.before': async (input, output) => {
      if (input.tool === 'bash') {
        const command: string = output.args.command ?? ''

        console.log(input)

        const blockedPattern = await patternMatcher(command)
        if (blockedPattern !== null) {
          throw new Error(
            [
              `Command usage restricted: "${command}".`,
              `You should NOT run this command. DO NOT TRY TO BYPASS THIS RESTRICTION!`,
              `Instead ask the user to run "${command}" or continue your other tasks.`,
            ].join('\n')
          )
        }
      }
    },
  }
}
