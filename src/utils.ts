import { packageJSON } from './package.js'

export function isCmdEqual(cmd: string, pattern: string): boolean {
  return (
    cmd === pattern ||
    cmd.startsWith(pattern + ' ') ||
    cmd.startsWith(pattern + ';') ||
    cmd.startsWith(pattern + ' ;') ||
    cmd.startsWith(pattern + '|') ||
    cmd.startsWith(pattern + ' |') ||
    cmd.startsWith(pattern + '&') ||
    cmd.startsWith(pattern + ' &') ||
    cmd.startsWith(pattern + '||') ||
    cmd.startsWith(pattern + ' ||') ||
    cmd.startsWith(pattern + '&&') ||
    cmd.startsWith(pattern + ' &&') ||
    cmd.includes(';' + pattern) ||
    cmd.includes('; ' + pattern) ||
    cmd.includes('|' + pattern) ||
    cmd.includes('| ' + pattern) ||
    cmd.includes('&' + pattern) ||
    cmd.includes('& ' + pattern) ||
    cmd.includes('||' + pattern) ||
    cmd.includes('|| ' + pattern) ||
    cmd.includes('&&' + pattern) ||
    cmd.includes('&& ' + pattern)
  )
}

export function pickFirst<T>(...arrays: T[]): T | undefined {
  for (let i = 0; i < arrays.length; i++) {
    if (arrays[i] !== undefined) {
      return arrays[i]
    }
  }
  return undefined
}

export function generateCommandWithComment(
  command: string,
  comment: string | undefined
): string {
  const commentString =
    comment == null
      ? `# [IGNORE] Injected by ${packageJSON.name}`
      : comment && `# ${comment}`

  return `${command} ${commentString}`.trim()
}

export function uniqueArrayOfStrings<T>(array: T[]): T[] {
  return [...new Set(array)]
}
