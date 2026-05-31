import { PatternConfig } from './config.js'
import { isCmdEqual } from './utils.js'

const SPLIT_KEYWORDS = [';', '&', '&&', '|', '||']
const SPLIT_REGEX = new RegExp(
  SPLIT_KEYWORDS.map((k) => `\\${k}`).join('|'),
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
      config.blacklist.map((p) => p.trim().toLocaleLowerCase()),
      config.whitelist.map((p) => p.trim().toLocaleLowerCase()),
      commands
    )
  }

  if (config.priority === 'whitelist-first') {
    return patternLoopRunner(
      config.whitelist.map((p) => p.trim().toLocaleLowerCase()),
      config.blacklist.map((p) => p.trim().toLocaleLowerCase()),
      commands
    )
  }

  throw new Error(
    `Unknown priority: "${config.priority}". Expected "blacklist" or "whitelist".`
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
        for (let i = 0; i < patterns2.length; i++) {
          const igPtn = patterns2[i]

          const ignored = isCmdEqual(cmd, igPtn)
          if (ignored) continue
        }

        return ptn
      }
    }
  }

  return null
}
