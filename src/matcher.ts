import { PatternConfig } from './config.js'
import { logger } from './logger.js'
import { isCmdEqual } from './utils.js'

const SPLIT_REGEX = /;|&|&&|(\|)|(\|\|)/gm

export async function patternMatcher(
  input: string,
  config: PatternConfig
): Promise<null | string> {
  const commands = input
    .toLowerCase()
    .replaceAll(/\s+/gm, ' ')
    .split(SPLIT_REGEX)
    .map((cmd) => cmd?.trim?.())
    .filter(Boolean)

  if (config.priority === 'whitelist') {
    for (let i = 0; i < config.blacklist.length; i++) {
      const ptn = config.blacklist[i]

      for (let j = 0; j < commands.length; j++) {
        const cmd = commands[j]
        const blocked = isCmdEqual(cmd, ptn)
        logger.debug(`"${cmd}" is blocked by pattern "${ptn}": ${blocked}`)

        if (blocked) {
          const allowed = config.whitelist.some((p) => isCmdEqual(cmd, p))
          if (!allowed) {
            logger.debug(
              `"${cmd}" is blocked by pattern "${ptn}" and not allowed by whitelist.`
            )

            return ptn
          }
        }
      }
    }

    return null
  }

  if (config.priority === 'blacklist') {
    for (let i = 0; i < config.whitelist.length; i++) {
      const ptn = config.whitelist[i]

      for (let j = 0; j < commands.length; j++) {
        const cmd = commands[j]
        const allowed = isCmdEqual(cmd, ptn)
        logger.debug(`"${cmd}" is allowed by pattern "${ptn}": ${allowed}`)

        if (allowed) {
          const blocked = config.blacklist.find((p) => isCmdEqual(cmd, p))
          if (blocked) {
            logger.debug(
              `"${cmd}" is allowed by pattern "${ptn}" but blocked by pattern "${blocked}".`
            )

            return blocked
          }
        }
      }
    }

    return null
  }

  throw new Error(
    `Unknown priority: "${config.priority}". Expected "blacklist" or "whitelist".`
  )
}
