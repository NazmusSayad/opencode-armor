import z from 'zod'

const armorListSchema = z
  .object({
    commands: z
      .array(z.string())
      .describe('List of commands to block or allow'),

    disableDefaults: z
      .boolean()
      .describe('Whether to disable the default list of commands'),

    disableGlobal: z
      .boolean()
      .describe('Whether to disable the global list of commands'),
  })
  .partial()

const armorSchema = z
  .object({
    priority: z
      .enum(['blacklist', 'whitelist'])
      .describe('The priority of the armor configuration'),

    blacklist: armorListSchema.describe(
      'The configuration for blacklisting commands'
    ),

    whitelist: armorListSchema.describe(
      'The configuration for whitelisting commands'
    ),

    message: z
      .string()
      .describe('The message to display when a command is blocked'),
  })
  .partial()

const dotenvSchema = z
  .object({
    define: z
      .record(z.string(), z.string())
      .describe('Environment variables to define'),

    files: z.array(z.string()).describe('List of .env files to load'),

    disableDefaults: z
      .boolean()
      .describe('Whether to disable default environment variables'),

    disableGlobal: z
      .boolean()
      .describe('Whether to disable global environment variables'),

    disableCwd: z
      .boolean()
      .describe(
        'Whether to disable current working directory environment variables'
      ),
  })
  .partial()

const commandInjectSchema = z
  .object({
    command: z
      .string()
      .describe('The command to inject into the command execution pipeline'),

    comment: z
      .string()
      .describe('A comment describing the purpose of the injected command'),
  })
  .partial()

const commandSchema = z
  .object({
    before: commandInjectSchema.describe(
      'Command to inject before the original command'
    ),

    after: commandInjectSchema.describe(
      'Command to inject after the original command'
    ),
  })
  .partial()

export const configSchema = z
  .object({
    armor: armorSchema.describe(
      'Configuration for command blocking and allowing'
    ),

    dotenv: dotenvSchema.describe(
      'Configuration for environment variables injection'
    ),

    command: commandSchema.describe(
      'Configuration for command injection into the execution pipeline'
    ),
  })
  .partial()
