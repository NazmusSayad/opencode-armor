import { logger } from './logger.js'

const SPLITTERS = [';', '&', '&&', '|', '||', '<', '>', '<<', '>>'] as const
const SPLIT_REGEX = new RegExp(
  SPLITTERS.map((s) => `(\\${s.split('').join('\\')})`).join('|'),
  'gm'
)

type PatternMatcherInput = {
  command: string
  priority: 'blacklist' | 'whitelist'
  whitelist: string[]
  blacklist: string[]
}

export async function patternMatcher({
  command,
  priority,
  whitelist,
  blacklist,
}: PatternMatcherInput): Promise<null | string> {
  const commands = command
    .toLowerCase()
    .replaceAll(/\s+/gm, ' ')
    .split(SPLIT_REGEX)
    .map((cmd) => cmd?.trim?.())
    .filter(Boolean)

  if (priority === 'whitelist') {
    for (let i = 0; i < blacklist.length; i++) {
      const ptn = blacklist[i]

      for (let j = 0; j < commands.length; j++) {
        const cmd = commands[j]
        const blocked = isCmdEqual(cmd, ptn)
        logger.debug(`"${cmd}" is blocked by pattern "${ptn}": ${blocked}`)

        if (blocked) {
          const allowed = whitelist.some((p) => isCmdEqual(cmd, p))
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

  if (priority === 'blacklist') {
    for (let i = 0; i < whitelist.length; i++) {
      const ptn = whitelist[i]

      for (let j = 0; j < commands.length; j++) {
        const cmd = commands[j]
        const allowed = isCmdEqual(cmd, ptn)
        logger.debug(`"${cmd}" is allowed by pattern "${ptn}": ${allowed}`)

        if (allowed) {
          const blocked = blacklist.find((p) => isCmdEqual(cmd, p))
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
    `Unknown priority: "${priority}". Expected "blacklist" or "whitelist".`
  )
}

function isCmdEqual(cmd: string, pattern: string): boolean {
  if (cmd === pattern || cmd.startsWith(`${pattern} `)) return true

  for (let i = 0; i < SPLITTERS.length; i++) {
    const s = SPLITTERS[i]

    if (
      cmd.startsWith(`${pattern}${s}`) ||
      cmd.startsWith(`${pattern} ${s}`) ||
      cmd.includes(`${s}${pattern}`) ||
      cmd.includes(`${s} ${pattern}`)
    ) {
      return true
    }
  }

  return false
}
