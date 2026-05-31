import { PatternConfig } from './config.js'
import { isCmdEqual } from './utils.js'

const SPLIT_REGEX = new RegExp(
  [';', '&&', '||', '&', '|'].map((k) => `\\${k}`).join('|'),
  'gm'
)

export async function patternMatcher(
  input: string,
  config: PatternConfig
): Promise<null | string> {
  const commands = input
    .toLowerCase()
    .replaceAll(/\s+/gm, ' ')
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
  expectedPatterns: string[],
  ignoredPatterns: string[],
  commands: string[]
) {
  for (let i = 0; i < expectedPatterns.length; i++) {
    const ptn = expectedPatterns[i]

    for (let j = 0; j < commands.length; j++) {
      const cmd = commands[j]

      const matched = isCmdEqual(cmd, ptn)
      if (matched) {
        const ignored = ignoredPatterns.some((igPtn) => isCmdEqual(cmd, igPtn))
        if (!ignored) return ptn
      }
    }
  }

  return null
}
