import { packageJSON } from '../package.js'

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
  const result: T[] = []

  array.forEach((item) => {
    if (!result.includes(item)) {
      result.push(item)
    }
  })

  return result
}
