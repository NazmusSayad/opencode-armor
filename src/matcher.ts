import { PatternConfig } from './config.js'
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

        if (blocked) {
          const allowed = config.whitelist.some((p) => isCmdEqual(cmd, p))
          if (!allowed) return ptn
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

        if (allowed) {
          const blocked = config.blacklist.some((p) => isCmdEqual(cmd, p))
          if (blocked) return ptn
        }
      }
    }

    return null
  }

  throw new Error(
    `Unknown priority: "${config.priority}". Expected "blacklist" or "whitelist".`
  )
}
