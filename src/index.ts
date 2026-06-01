import { Plugin } from '@opencode-ai/plugin'
import { resolveConfig } from './config.js'
import { logger } from './logger.js'
import { patternMatcher } from './matcher.js'
import { packageJSON } from './package.js'
import { generateCommandWithComment } from './utils.js'

logger.info(`${packageJSON.name}@${packageJSON.version} initializing...`)

// eslint-disable-next-line func-style
export const OpenCodeArmor: Plugin = async (pluginInput) => {
  const workdir = pluginInput.worktree ?? pluginInput.project.worktree
  const config = await resolveConfig(workdir)

  logger.info(
    `${packageJSON.name} initialized with config: ${JSON.stringify(config)}`
  )

  return {
    'tool.execute.before': async (input, output) => {
      if (input.tool === 'bash') {
        const command: string = output.args.command ?? ''
        if (command.trim() === '') return

        logger.info(`Checking command: "${command}" in workdir: "${workdir}"`)
        const blockedPattern = await patternMatcher(command, config)

        if (blockedPattern !== null) {
          logger.info(`Command usage restricted: "${command}".`)

          throw new Error(
            [
              `Command usage restricted: "${command}".`,
              `DO NOT TRY or CHEAT TO BYPASS THIS RESTRICTION!`,
              `Instead guide the user to run the command after finishing other tasks.`,
              `If other tasks are blocked because of this commands then stop and ask the user to run the command.`,
            ].join('\n')
          )
        }

        logger.info(
          `Command is allowed: "${command}". Proceeding with execution.`
        )

        if (config.injectCommandBefore) {
          const injectedString = generateCommandWithComment(
            config.injectCommandBefore + ';',
            config.injectCommandBeforeComment
          )

          if (!command.trim().startsWith(injectedString)) {
            output.args.command = `${injectedString}\n${command}`
            logger.info(`Injecting "${injectedString}" before command.`)
          }
        }

        if (config.injectCommandAfter) {
          const injectedString = generateCommandWithComment(
            config.injectCommandAfter + ';',
            config.injectCommandAfterComment
          )

          if (!command.trim().endsWith(injectedString)) {
            output.args.command = `${command}\n${injectedString}`
            logger.info(`Injecting "${injectedString}" after command.`)
          }
        }
      }
    },
  }
}
