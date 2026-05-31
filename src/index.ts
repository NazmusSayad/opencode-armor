import { Plugin } from '@opencode-ai/plugin'
import { resolveConfig } from './config.js'
import { logger } from './logger.js'
import { patternMatcher } from './matcher.js'

logger.info('OpenCode Armor plugin loading...')

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

        logger.info(`Checking command: "${command}" in workdir: "${workdir}"`)

        const config = await resolveConfig(workdir)
        const blockedPattern = await patternMatcher(command, config)

        if (blockedPattern !== null) {
          logger.info(`Command usage restricted: "${command}".`)

          throw new Error(
            [
              `Command usage restricted: "${command}".`,
              `You should NOT run this command. DO NOT TRY TO BYPASS THIS RESTRICTION!`,
              `Instead ask the user to run "${command}" or continue your other tasks.`,
            ].join('\n')
          )
        }

        logger.info(
          `Command is allowed: "${command}". Proceeding with execution.`
        )
      }
    },
  }
}
