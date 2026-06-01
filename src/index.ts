import { Plugin } from '@opencode-ai/plugin'
import { resolveConfig } from './config.js'
import { logger } from './logger.js'
import { patternMatcher } from './matcher.js'

logger.info('OpenCode Armor plugin loading...')

// eslint-disable-next-line func-style
export const OpenCodeArmor: Plugin = async (pluginInput) => {
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

        if (config.injectCommandBefore) {
          if (!command.trim().startsWith(config.injectCommandBefore)) {
            output.args.command = `${config.injectCommandBefore};\n${command}`
            logger.info(
              `Injecting command before: "${config.injectCommandBefore}". New command: "${output.args.command}".`
            )
          }
        }

        if (config.injectCommandAfter) {
          if (!command.trim().endsWith(config.injectCommandAfter)) {
            output.args.command = `${output.args.command};\n${config.injectCommandAfter}`
            logger.info(
              `Injecting command after: "${config.injectCommandAfter}". New command: "${output.args.command}".`
            )
          }
        }
      }
    },
  }
}

// export const ShellInjectPlugin: Plugin = async (ctx) => {
//   return {
//     'tool.execute.before': async (input, output) => {
//       const isShell =
//         input.tool === 'bash' && typeof output?.args?.command === 'string'

//       if (isShell) {
//         output.args.command = [
//           'source ~/.bashrc; # Ignore: Injected via Plugin',
//           output.args.command,
//         ].join('\n\n')
//       }
//     },
//   }
// }
