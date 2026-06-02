import { Plugin } from '@opencode-ai/plugin'
import { resolveConfig } from './config.js'
import { BLOCKED_MESSAGE } from './constants.js'
import { readDotenvFiles } from './dotenv.js'
import { console } from './logger.js'
import { patternMatcher } from './matcher.js'
import { packageJSON } from './package.js'
import { generateCommandWithComment } from './utils.js'

console.info(`${packageJSON.name}@${packageJSON.version} init!`)

// eslint-disable-next-line func-style
export const OpenCodeArmor: Plugin = async ({ directory }) => {
  const config = await resolveConfig(directory)
  console.info(`Config for "${directory}": ${JSON.stringify(config)}`)

  const projectEnvVars = await readDotenvFiles(directory, config.dotenvFiles)
  console.info(`Project Environment vars: ${JSON.stringify(projectEnvVars)}`)

  return {
    'shell.env': async (input, output) => {
      let resolvedVars = { ...projectEnvVars }

      if (!config.ignoreCwdDotenvFiles && input.cwd !== directory) {
        const cwdEnvVars = await readDotenvFiles(input.cwd, config.dotenvFiles)
        console.info(`CWD Environment vars: ${JSON.stringify(cwdEnvVars)}`)

        resolvedVars = { ...resolvedVars, ...cwdEnvVars }
      }

      console.info(`Injected Environment vars: ${JSON.stringify(resolvedVars)}`)
      Object.assign(output.env, resolvedVars)
    },

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
