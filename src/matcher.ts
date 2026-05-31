import { PatternConfig } from './config.js'
import { BLOCKED_PATTERNS } from './patterns.js'
import { isCmdEqual } from './utils.js'

export async function patternMatcher(
  input: string,
  config: PatternConfig
): Promise<null | string> {
  const commands = input
    .split(/\s+/gim)
    .join(' ')
    .split(/;|&|&&/gim)

  for (let i = 0; i < BLOCKED_PATTERNS.length; i++) {
    const pattern = BLOCKED_PATTERNS[i]

    for (let j = 0; j < commands.length; j++) {
      const cmd = commands[j].trim()

      if (isCmdEqual(cmd, pattern)) {
        return pattern
      }
    }
  }

  return null
}
