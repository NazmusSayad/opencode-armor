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
