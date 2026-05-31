import consola from 'consola'
import fs from 'fs'
import path from 'path'

function createStream() {
  const logDir = path.resolve(process.cwd(), '.log')
  const logFile = path.join(logDir, Date.now().toString() + '.log')

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }

  const stream = fs.createWriteStream(logFile, { flags: 'a' })
  return stream as unknown as NodeJS.WriteStream
}

export const logger = consola.create(
  process.env.OPENCODE_ARMOR_DEV_MODE === 'true'
    ? { stdout: createStream() }
    : { level: -1 }
)
