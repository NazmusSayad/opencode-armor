import { PatternConfig } from './config.js'
import { isCmdEqual } from './utils.js'

export async function patternMatcher(
  input: string,
  config: PatternConfig
): Promise<null | string> {
  const commands = input
    .split(/\s+/gim)
    .join(' ')
    .split(/;|&|&&/gim)

  if (config.priority === 'blacklist') {
    for (let i = 0; i < config.blacklist.length; i++) {
      const pattern = config.blacklist[i]

      for (let j = 0; j < commands.length; j++) {
        const cmd = commands[j].trim()

        if (isCmdEqual(cmd, pattern)) {
          return pattern
        }
      }
    }

    return null
  }

  if (config.priority === 'whitelist') {
    for (let j = 0; j < commands.length; j++) {
      const cmd = commands[j].trim()
      let allowed = false

      for (let i = 0; i < config.whitelist.length; i++) {
        const pattern = config.whitelist[i]

        if (isCmdEqual(cmd, pattern)) {
          allowed = true
          break
        }
      }

      if (!allowed) {
        return cmd
      }
    }

    return null
  }

  throw new Error(
    `Unknown priority: "${config.priority}". Expected "blacklist" or "whitelist".`
  )
}
