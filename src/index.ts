import { Plugin } from '@opencode-ai/plugin'
import { resolveConfig } from './config/config-resolver.js'
import { BLOCKED_MESSAGE } from './config/constants.js'
import { readDotenvFiles } from './lib/dotenv.js'
import { console } from './lib/logger.js'
import { patternMatcher } from './lib/matcher.js'
import { generateCommandWithComment } from './lib/utils.js'
import { packageJSON } from './package.js'

console.info(`${packageJSON.name}@${packageJSON.version} init!`)

// eslint-disable-next-line func-style
export const OpenCodeArmor: Plugin = async ({ directory }) => {
  const config = await resolveConfig(directory)
  console.info(`Config for "${directory}": ${JSON.stringify(config)}`)

  const projectEnvVars = await readDotenvFiles(directory, config.dotenv.files)
  console.info(`Project Environment vars: ${JSON.stringify(projectEnvVars)}`)
  console.info(`Fixed Environment vars: ${JSON.stringify(config.dotenv.vars)}`)

  return {
    'shell.env': async (input, output) => {
      console.log(`Injecting Environment vars for project "${directory}".`)
      console.log(`Injecting Environment vars for cwd "${input.cwd}".`)

      let resolvedVars = {
        ...config.dotenv.vars,
        ...projectEnvVars,
      }

      if (!config.dotenv.ignoreCwd && input.cwd !== directory) {
        const cwdEnvVars = await readDotenvFiles(input.cwd, config.dotenv.files)
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

        const blockedPattern = await patternMatcher({
          command,
          priority: config.armor.priority,
          whitelist: config.armor.whitelist,
          blacklist: config.armor.blacklist,
        })

        if (blockedPattern !== null) {
          console.info(`Command usage restricted: "${command}".`)
          throw new Error(
            (config.armor.message ?? BLOCKED_MESSAGE)
              .replaceAll('{{COMMAND}}', command)
              .replaceAll('{{PATTERN}}', blockedPattern)
          )
        }

        console.info(
          `Command is allowed: "${command}". Proceeding with execution.`
        )

        if (config.command.injectBefore) {
          const injectedString = generateCommandWithComment(
            config.command.injectBefore + ';',
            config.command.injectBeforeComment
          )

          if (!command.trim().startsWith(injectedString)) {
            output.args.command = `${injectedString}\n${command}`
            console.info(`Injecting "${injectedString}" before command.`)
          }
        }

        if (config.command.injectAfter) {
          const injectedString = generateCommandWithComment(
            config.command.injectAfter + ';',
            config.command.injectAfterComment
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
