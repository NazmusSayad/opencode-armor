import z from 'zod'

const armorListSchema = z.object({
  commands: z.array(z.string()),
  ignoreDefaults: z.boolean(),
  ignoreGlobal: z.boolean(),
})

const armorSchema = z.object({
  priority: z.enum(['blacklist', 'whitelist']),
  blacklist: armorListSchema.partial(),
  whitelist: armorListSchema.partial(),
  message: z.string(),
})

const dotenvSchema = z.object({
  define: z.record(z.string(), z.string()),
  files: z.array(z.string()),
  ignoreDefaults: z.boolean(),
  ignoreGlobal: z.boolean(),
  ignoreCwd: z.boolean(),
})

const commandInjectSchema = z.object({
  command: z.string(),
  comment: z.string(),
})

const commandSchema = z.object({
  before: commandInjectSchema.partial(),
  after: commandInjectSchema.partial(),
})

export const configSchema = z
  .object({
    armor: armorSchema.partial(),
    dotenv: dotenvSchema.partial(),
    command: commandSchema.partial(),
  })
  .partial()
