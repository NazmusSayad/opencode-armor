import { console } from './logger.js'
import { isCmdEqual } from './utils.js'

const SPLIT_REGEX = /;|&|&&|(\|)|(\|\|)/gm

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
        console.debug(`"${cmd}" is blocked by pattern "${ptn}": ${blocked}`)

        if (blocked) {
          const allowed = whitelist.some((p) => isCmdEqual(cmd, p))
          if (!allowed) {
            console.debug(
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
        console.debug(`"${cmd}" is allowed by pattern "${ptn}": ${allowed}`)

        if (allowed) {
          const blocked = blacklist.find((p) => isCmdEqual(cmd, p))
          if (blocked) {
            console.debug(
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
