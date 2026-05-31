import consola from 'consola'
import fs from 'fs'
import path from 'path'

const logDir = path.resolve(process.cwd(), '.log')
const logFile = path.join(logDir, Date.now().toString() + '.log')

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

const stream = fs.createWriteStream(logFile, { flags: 'a' })

export const log = consola.create({
  stdout: stream as unknown as NodeJS.WriteStream,
})
