import { objectOmitNullish } from 'daily-code'
import fs from 'fs'
import os from 'os'
import path from 'path'
import util from 'util'
import { console } from './logger.js'

export async function readDotenvFiles(cwd: string, files: string[]) {
  let envVars: Record<string, string> = {}

  for (const file of files) {
    try {
      const resolvedPath = resolveFilePath(cwd, file)
      const content = fs.readFileSync(resolvedPath, 'utf-8')
      const env = objectOmitNullish(util.parseEnv(content))

      console.info(
        `Loaded environment variables from "${resolvedPath}": ${JSON.stringify(env)}`
      )

      envVars = {
        ...envVars,
        ...env,
      }
    } catch {
      console.warn(`No .env file found at "${file}". Skipping.`)
    }
  }

  return envVars
}

function resolveFilePath(cwd: string, file: string) {
  let resolvedPath: string = file

  if (resolvedPath.startsWith('~/')) {
    resolvedPath = path.join(os.homedir(), resolvedPath.slice(2))
  }

  return path.resolve(cwd, resolvedPath)
}
