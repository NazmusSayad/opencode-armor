import { Plugin } from '@opencode-ai/plugin'
import { resolveConfig } from './config/config-resolver.js'
import { BLOCKED_MESSAGE } from './config/constants.js'
import { readDotenvFiles } from './lib/dotenv.js'
import { logger } from './lib/logger.js'
import { patternMatcher } from './lib/matcher.js'
import { generateCommandWithComment } from './lib/utils.js'
import { packageJSON } from './package.js'

logger.info(`${packageJSON.name}@${packageJSON.version} init!`)

// eslint-disable-next-line func-style
export const OpenCodeArmor: Plugin = async ({ directory }) => {
  const config = await resolveConfig(directory)
  logger.info(`Config for "${directory}": ${JSON.stringify(config)}`)

  const projectEnvVars = await readDotenvFiles(directory, config.dotenv.files)
  logger.info(`Project Environment vars: ${JSON.stringify(projectEnvVars)}`)
  logger.info(`Fixed Environment vars: ${JSON.stringify(config.dotenv.vars)}`)

  return {
    'shell.env': async (input, output) => {
      logger.log(`Injecting Environment vars for project "${directory}".`)
      logger.log(`Injecting Environment vars for cwd "${input.cwd}".`)

      let resolvedVars = {
        ...config.dotenv.vars,
        ...projectEnvVars,
      }

      if (!config.dotenv.disableCWD && input.cwd !== directory) {
        const cwdEnvVars = await readDotenvFiles(input.cwd, config.dotenv.files)
        logger.info(`CWD Environment vars: ${JSON.stringify(cwdEnvVars)}`)

        resolvedVars = { ...resolvedVars, ...cwdEnvVars }
      }

      logger.info(`Injected Environment vars: ${JSON.stringify(resolvedVars)}`)
      Object.assign(output.env, resolvedVars)
    },

    'tool.execute.before': async (input, output) => {
      if (input.tool === 'bash') {
        logger.info(`Received command for execution: "${output.args.command}"`)

        const command: string = output.args.command ?? ''
        if (command.trim() === '') return

        const blockedPattern = await patternMatcher({
          command,
          priority: config.armor.priority,
          whitelist: config.armor.whitelist,
          blacklist: config.armor.blacklist,
        })

        if (blockedPattern !== null) {
          logger.info(`Command usage restricted: "${command}".`)
          throw new Error(
            (config.armor.message ?? BLOCKED_MESSAGE)
              .replaceAll('{{COMMAND}}', command)
              .replaceAll('{{PATTERN}}', blockedPattern)
          )
        }

        logger.info(
          `Command is allowed: "${command}". Proceeding with execution.`
        )

        if (config.command.injectBefore) {
          const injectedString = generateCommandWithComment(
            config.command.injectBefore + ';',
            config.command.injectBeforeComment
          )

          if (!command.trim().startsWith(injectedString)) {
            output.args.command = `${injectedString}\n${command}`
            logger.info(`Injecting "${injectedString}" before command.`)
          }
        }

        if (config.command.injectAfter) {
          const injectedString = generateCommandWithComment(
            config.command.injectAfter + ';',
            config.command.injectAfterComment
          )

          if (!command.trim().endsWith(injectedString)) {
            output.args.command = `${command}\n${injectedString}`
            logger.info(`Injecting "${injectedString}" after command.`)
          }
        }

        logger.log('Final command to execute:', output.args.command)
      }
    },
  }
}
