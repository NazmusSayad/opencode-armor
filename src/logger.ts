import consola from 'consola'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { packageJSON } from './package.js'

function createStream() {
  const logDir = path.resolve(
    os.tmpdir(),
    `./${packageJSON.name}@${packageJSON.version}`
  )

  const logFile = path.join(logDir, Date.now().toString() + '.log')

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }

  const stream = fs.createWriteStream(logFile, { flags: 'a' })
  return stream as unknown as NodeJS.WriteStream
}

export const logger = consola.create(
  process.env.OPENCODE_ARMOR_ENABLE_LOG === 'true'
    ? { stdout: createStream() }
    : { level: -1 }
)
