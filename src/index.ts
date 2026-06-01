import { Plugin } from '@opencode-ai/plugin'
import { resolveConfig } from './config.js'
import { BLOCKED_MESSAGE } from './constants.js'
import { console } from './logger.js'
import { patternMatcher } from './matcher.js'
import { packageJSON } from './package.js'
import { generateCommandWithComment } from './utils.js'

console.info(`${packageJSON.name}@${packageJSON.version} init!`)

// eslint-disable-next-line func-style
export const OpenCodeArmor: Plugin = async (pluginInput) => {
  const config = await resolveConfig(pluginInput.directory)
  console.info(
    `Config for "${pluginInput.directory}": ${JSON.stringify(config)}`
  )

  return {
    'tool.execute.before': async (input, output) => {
      if (input.tool === 'bash') {
        console.info(`Received command for execution: "${output.args.command}"`)

        const command: string = output.args.command ?? ''
        if (command.trim() === '') return

        const blockedPattern = await patternMatcher(command, config)
        if (blockedPattern !== null) {
          console.info(`Command usage restricted: "${command}".`)
          throw new Error(
            (config.blockedMessage ?? BLOCKED_MESSAGE)
              .replaceAll('{{COMMAND}}', command)
              .replaceAll('{{PATTERN}}', blockedPattern)
          )
        }

        console.info(
          `Command is allowed: "${command}". Proceeding with execution.`
        )

        if (config.injectCommandBefore) {
          const injectedString = generateCommandWithComment(
            config.injectCommandBefore + ';',
            config.injectCommandBeforeComment
          )

          if (!command.trim().startsWith(injectedString)) {
            output.args.command = `${injectedString}\n${command}`
            console.info(`Injecting "${injectedString}" before command.`)
          }
        }

        if (config.injectCommandAfter) {
          const injectedString = generateCommandWithComment(
            config.injectCommandAfter + ';',
            config.injectCommandAfterComment
          )

          if (!command.trim().endsWith(injectedString)) {
            output.args.command = `${command}\n${injectedString}`
            console.info(`Injecting "${injectedString}" after command.`)
          }
        }

        console.log('Final command to execute:', output.args.command)
      }
    },
  }
}
