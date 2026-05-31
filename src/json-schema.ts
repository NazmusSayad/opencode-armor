import fs from 'fs'
import path from 'path'
import z from 'zod'
import { optionalConfigSchema } from './config.js'

const schema = optionalConfigSchema
  .extend({ $schema: z.string().optional() })
  .toJSONSchema()

const outputPath = path.resolve('./schema.json')

if (fs.existsSync(outputPath)) {
  fs.rmSync(outputPath)
}

fs.writeFileSync(outputPath, JSON.stringify(schema))
