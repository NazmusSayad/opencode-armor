import { Plugin } from '@opencode-ai/plugin'
import { patternMatcher } from './matcher.js'

// eslint-disable-next-line func-style
export const OpenCodeCMD: Plugin = async () => {
  return {
    'tool.execute.before': async (input, output) => {
      if (input.tool === 'bash') {
        const command: string = output.args.command ?? ''

        if (await patternMatcher(command)) {
          throw new Error(
            [
              `Command usage restricted: "${command}".`,
              `You should NOT run this command. DO NOT TRY TO BYPASS THIS RESTRICTION!`,
              `Instead ask the user to run "${command}" or continue other tasks.`,
            ].join('\n')
          )
        }
      }
    },
  }
}
