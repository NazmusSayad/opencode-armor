import { Plugin } from '@opencode-ai/plugin'
import { resolveConfig } from './config.js'
import { log } from './logger.js'
import { patternMatcher } from './matcher.js'

log.log('OpenCode Armor plugin loading...')

// eslint-disable-next-line func-style
export const OpenCodeCMD: Plugin = async (pluginInput) => {
  return {
    'tool.execute.before': async (input, output) => {
      if (input.tool === 'bash') {
        const command: string = output.args.command ?? ''
        if (command.trim() === '') return

        const workdir =
          output.args?.workdir ??
          pluginInput.worktree ??
          pluginInput.project.worktree

        const config = await resolveConfig(workdir)
        const blockedPattern = await patternMatcher(command, config)

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
