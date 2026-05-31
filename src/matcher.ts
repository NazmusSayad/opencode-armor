import { PatternConfig } from './config.js'
import { isCmdEqual } from './utils.js'

const SPLIT_REGEX = new RegExp(
  [';', '&&', '||', '&', '|'].map((k) => `\\${k}`).join('|'),
  'gim'
)

export async function patternMatcher(
  input: string,
  config: PatternConfig
): Promise<null | string> {
  const commands = input
    .toLowerCase()
    .replaceAll(/\s+/gim, ' ')
    .split(SPLIT_REGEX)
    .map((cmd) => cmd.trim())

  if (config.priority === 'blacklist-first') {
    return patternLoopRunner(
      config.blacklist.map((p) => p.trim().toLowerCase()),
      config.whitelist.map((p) => p.trim().toLowerCase()),
      commands
    )
  }

  if (config.priority === 'whitelist-first') {
    return patternLoopRunner(
      config.whitelist.map((p) => p.trim().toLowerCase()),
      config.blacklist.map((p) => p.trim().toLowerCase()),
      commands
    )
  }

  throw new Error(
    `Unknown priority: "${config.priority}". Expected "blacklist-first" or "whitelist-first".`
  )
}

function patternLoopRunner(
  patterns1: string[],
  patterns2: string[],
  commands: string[]
) {
  for (let i = 0; i < patterns1.length; i++) {
    const ptn = patterns1[i]

    for (let j = 0; j < commands.length; j++) {
      const cmd = commands[j]

      const matched = isCmdEqual(cmd, ptn)
      if (matched) {
        for (let k = 0; k < patterns2.length; k++) {
          const igPtn = patterns2[k]

          const ignored = isCmdEqual(cmd, igPtn)
          if (ignored) continue
        }

        return ptn
      }
    }
  }

  return null
}
