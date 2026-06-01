import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import z from 'zod'
import { ALLOWED_PATTERNS, BLOCKED_PATTERNS } from './patterns.js'
import { pickFirst } from './utils.js'

export const configSchema = z.object({
  priority: z
    .enum(['blacklist', 'whitelist'])
    .optional()
    .describe(
      'Determines whether the blacklist or whitelist takes precedence. If set to "blacklist", the blacklist will be checked first, and if a command matches an entry in the blacklist, it will be blocked regardless of the whitelist. If set to "whitelist", the whitelist will be checked first, and only commands that match an entry in the whitelist will be allowed, regardless of the blacklist.'
    ),

  blacklist: z
    .array(z.string())
    .optional()
    .describe(
      'An array of command patterns that are blocked. If a command matches any of the patterns in this list, it will be blocked from execution.'
    ),

  whitelist: z
    .array(z.string())
    .optional()
    .describe(
      'An array of command patterns that are allowed. If a command matches any of the patterns in this list, it will be allowed to execute.'
    ),

  ignoreDefaultBlacklist: z
    .boolean()
    .optional()
    .describe(
      'If set to true, the default blacklist patterns will be ignored. This means that only the patterns specified in the "blacklist" array will be considered for blocking commands.'
    ),
  ignoreDefaultWhitelist: z
    .boolean()
    .optional()
    .describe(
      'If set to true, the default whitelist patterns will be ignored. This means that only the patterns specified in the "whitelist" array will be considered for allowing commands.'
    ),

  ignoreGlobalBlacklist: z
    .boolean()
    .optional()
    .describe(
      'If set to true, the global blacklist patterns will be ignored. This means that only the patterns specified in the "blacklist" array will be considered for blocking commands.'
    ),
  ignoreGlobalWhitelist: z
    .boolean()
    .optional()
    .describe(
      'If set to true, the global whitelist patterns will be ignored. This means that only the patterns specified in the "whitelist" array will be considered for allowing commands.'
    ),

  injectCommandBefore: z
    .string()
    .transform((str) => str.trim().replaceAll(/\n/g, ';'))
    .optional()
    .describe(
      'If specified, this command will be injected before the user command. This can be used to set up the environment or perform any necessary preparations before the main command is executed. NOTE: This should not contain new lines, as it will be injected as a single line before the user command. New lines will be replaced with semicolons to ensure it is injected as a single line.'
    ),
  injectCommandBeforeComment: z
    .string()
    .transform((str) => str.trim().replaceAll(/\n/g, ';'))
    .optional()
    .describe(
      'A comment to be added before the injected command. NOTE: This should not contain new lines, as it will be injected as a single line before the user command. New lines will be replaced with semicolons to ensure it is injected as a single line.'
    ),
  injectCommandAfter: z
    .string()
    .transform((str) => str.trim().replaceAll(/\n/g, ';'))
    .optional()
    .describe(
      'If specified, this command will be injected after the user command. This can be used to perform any necessary cleanup or additional operations after the main command is executed. NOTE: This should not contain new lines, as it will be injected as a single line after the user command. New lines will be replaced with semicolons to ensure it is injected as a single line.'
    ),
  injectCommandAfterComment: z
    .string()
    .transform((str) => str.trim().replaceAll(/\n/g, ';'))
    .optional()
    .describe(
      'A comment to be added after the injected command. NOTE: This should not contain new lines, as it will be injected as a single line after the user command. New lines will be replaced with semicolons to ensure it is injected as a single line.'
    ),
})

async function readConfigFile(
  input: string
): Promise<z.infer<typeof configSchema>> {
  try {
    const data = await fs.readFile(input, 'utf-8')
    return configSchema.parseAsync(JSON.parse(data))
  } catch {
    return configSchema.parseAsync({})
  }
}

const GLOBAL_CONFIG_PATH = path.join(os.homedir(), './.opencode-armor.json')
const globalConfigPromise = readConfigFile(GLOBAL_CONFIG_PATH)

export type PatternConfig =
  ReturnType<typeof resolveConfig> extends Promise<infer R> ? R : never

export async function resolveConfig(workdir: string) {
  const PROJECT_CONFIG_PATH = path.join(workdir, './.opencode-armor.json')
  const OPENCODE_CONFIG_PATH = path.join(workdir, './.opencode/armor.json')

  const [globalConfig, projectConfig, opencodeConfig] = await Promise.all([
    globalConfigPromise,
    readConfigFile(PROJECT_CONFIG_PATH),
    readConfigFile(OPENCODE_CONFIG_PATH),
  ])

  return {
    priority:
      opencodeConfig.priority ??
      projectConfig.priority ??
      globalConfig.priority ??
      'whitelist',

    blacklist: [
      ...(opencodeConfig.blacklist ?? []),
      ...(projectConfig.blacklist ?? []),

      ...(pickFirst(
        opencodeConfig.ignoreGlobalBlacklist,
        projectConfig.ignoreGlobalBlacklist,
        globalConfig.ignoreGlobalBlacklist
      )
        ? []
        : (globalConfig.blacklist ?? [])),

      ...(pickFirst(
        opencodeConfig.ignoreDefaultBlacklist,
        projectConfig.ignoreDefaultBlacklist,
        globalConfig.ignoreDefaultBlacklist
      )
        ? []
        : BLOCKED_PATTERNS),
    ],

    whitelist: [
      ...(opencodeConfig.whitelist ?? []),
      ...(projectConfig.whitelist ?? []),

      ...(pickFirst(
        opencodeConfig.ignoreGlobalWhitelist,
        projectConfig.ignoreGlobalWhitelist,
        globalConfig.ignoreGlobalWhitelist
      )
        ? []
        : (globalConfig.whitelist ?? [])),

      ...(pickFirst(
        opencodeConfig.ignoreDefaultWhitelist,
        projectConfig.ignoreDefaultWhitelist,
        globalConfig.ignoreDefaultWhitelist
      )
        ? []
        : ALLOWED_PATTERNS),
    ],

    injectCommandBefore: pickFirst(
      opencodeConfig.injectCommandBefore,
      projectConfig.injectCommandBefore,
      globalConfig.injectCommandBefore
    ),

    injectCommandBeforeComment: pickFirst(
      opencodeConfig.injectCommandBeforeComment,
      projectConfig.injectCommandBeforeComment,
      globalConfig.injectCommandBeforeComment
    ),

    injectCommandAfter: pickFirst(
      opencodeConfig.injectCommandAfter,
      projectConfig.injectCommandAfter,
      globalConfig.injectCommandAfter
    ),

    injectCommandAfterComment: pickFirst(
      opencodeConfig.injectCommandAfterComment,
      projectConfig.injectCommandAfterComment,
      globalConfig.injectCommandAfterComment
    ),
  }
}
