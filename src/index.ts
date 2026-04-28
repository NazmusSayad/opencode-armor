import { Plugin } from '@opencode-ai/plugin'
import { BLOCKED_PATTERNS } from './patterns.js'

// eslint-disable-next-line func-style
export const OpenCodeCMD: Plugin = async () => {
  return {
    'tool.execute.before': async (input, output) => {
      if (input.tool === 'bash') {
        const command: string = output.args.command ?? ''

        const cmds = command
          .split(/\s+/gim)
          .join(' ')
          .split(/;|&|&&/gim)

        BLOCKED_PATTERNS.forEach((p) => {
          if (cmds.some((c) => c.trim().startsWith(p))) {
            throw new Error(
              [
                `Command usage restricted: "${command}".`,
                `You should NOT run this command. DO NOT TRY TO BYPASS THIS RESTRICTION!`,
                `Instead ask the user to run "${command}" or continue other tasks.`,
              ].join('\n')
            )
          }
        })
      }
    },
  }
}
