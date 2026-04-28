import { BLOCKED_PATTERNS } from './patterns.js'

export async function shellMatcher(command: string): Promise<boolean> {
  const cmds = command
    .split(/\s+/gim)
    .join(' ')
    .split(/;|&|&&/gim)

  for (let i = 0; i < BLOCKED_PATTERNS.length; i++) {
    const p = BLOCKED_PATTERNS[i]
    if (cmds.some((c) => c.trim().startsWith(p))) {
      return true
    }
  }

  return false

  BLOCKED_PATTERNS.forEach((p) => {
    if (cmds.some((c) => c.trim().startsWith(p))) {
    }
  })
}
