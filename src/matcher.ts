import { BLOCKED_PATTERNS } from './patterns.js'

export async function patternMatcher(input: string): Promise<boolean> {
  const commands = input
    .split(/\s+/gim)
    .join(' ')
    .split(/;|&|&&/gim)

  for (let i = 0; i < BLOCKED_PATTERNS.length; i++) {
    const pattern = BLOCKED_PATTERNS[i]

    for (let j = 0; j < commands.length; j++) {
      const cmd = commands[j].trim()

      if (
        cmd === pattern ||
        cmd.startsWith(pattern + ' ') ||
        cmd.startsWith(pattern + ';') ||
        cmd.startsWith(pattern + '|') ||
        cmd.startsWith(pattern + '&') ||
        cmd.startsWith(pattern + '||') ||
        cmd.startsWith(pattern + '&&')
      ) {
        return true
      }
    }
  }

  return false
}
