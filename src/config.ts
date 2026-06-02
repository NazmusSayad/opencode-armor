import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import z from 'zod'
import { ALLOWED_PATTERNS, BLOCKED_PATTERNS } from './constants.js'
import { pickFirst } from './utils.js'

export const configSchema = z.object({
  priority: z
    .enum(['blacklist', 'whitelist'])
    .optional()
    .describe(
      'Which list takes precedence: "blacklist" blocks first; "whitelist" allows only matches.'
    ),

  blacklist: z
    .array(z.string())
    .optional()
    .describe('Blocked command patterns.'),

  whitelist: z
    .array(z.string())
    .optional()
    .describe('Allowed command patterns.'),

  blockedMessage: z
    .string()
    .optional()
    .describe(
      'Message shown when a command is blocked. Use {{COMMAND}} or {{PATTERN}} placeholders.'
    ),

  ignoreDefaultBlacklist: z
    .boolean()
    .optional()
    .describe('Ignore the default blacklist patterns.'),
  ignoreDefaultWhitelist: z
    .boolean()
    .optional()
    .describe('Ignore the default whitelist patterns.'),

  ignoreGlobalBlacklist: z
    .boolean()
    .optional()
    .describe('Ignore the global blacklist patterns.'),
  ignoreGlobalWhitelist: z
    .boolean()
    .optional()
    .describe('Ignore the global whitelist patterns.'),

  injectDotenvFiles: z
    .array(z.string())
    .optional()
    .describe(
      'List of dotenv files to inject. Files are loaded in order, and variables are injected before the command runs.'
    ),

  ignoreCwdDotenvFiles: z
    .boolean()
    .optional()
    .describe('Ignore .env files in the current working directory.'),

  ignoreGlobalDotenvFiles: z
    .boolean()
    .optional()
    .describe('Ignore the global list of .env files to inject.'),

  injectCommandBefore: z
    .string()
    .optional()
    .describe(
      'Command injected before the user command. Newlines are replaced with semicolons.'
    ),
  injectCommandBeforeComment: z
    .string()
    .optional()
    .describe(
      'Comment added before the injected command. Newlines are replaced with semicolons.'
    ),
  injectCommandAfter: z
    .string()
    .optional()
    .describe(
      'Command injected after the user command. Newlines are replaced with semicolons.'
    ),
  injectCommandAfterComment: z
    .string()
    .optional()
    .describe(
      'Comment added after the injected command. Newlines are replaced with semicolons.'
    ),
})

async function readConfigFile(
  input: string
): Promise<z.infer<typeof configSchema>> {
  try {
    const data = await fs.readFile(input, 'utf-8')
    return await configSchema.parseAsync(JSON.parse(data))
  } catch {
    return await configSchema.parseAsync({})
  }
}

const GLOBAL_CONFIG_PATH = path.join(os.homedir(), './.opencode-armor.json')
const globalConfigPromise = readConfigFile(GLOBAL_CONFIG_PATH)

export type PatternConfig = Awaited<ReturnType<typeof resolveConfig>>

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
      pickFirst(
        opencodeConfig.priority,
        projectConfig.priority,
        globalConfig.priority
      ) ?? 'whitelist',

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

    blockedMessage: pickFirst(
      opencodeConfig.blockedMessage,
      projectConfig.blockedMessage,
      globalConfig.blockedMessage
    )?.trim(),

    dotenvFiles: [
      ...(pickFirst(
        opencodeConfig.ignoreGlobalDotenvFiles,
        projectConfig.ignoreGlobalDotenvFiles,
        globalConfig.ignoreGlobalDotenvFiles
      )
        ? []
        : (globalConfig.injectDotenvFiles ?? [])),
      ...(opencodeConfig.injectDotenvFiles ?? []),
      ...(projectConfig.injectDotenvFiles ?? []),
    ],

    ignoreCwdDotenvFiles:
      pickFirst(
        opencodeConfig.ignoreCwdDotenvFiles,
        projectConfig.ignoreCwdDotenvFiles,
        globalConfig.ignoreCwdDotenvFiles
      ) ?? false,

    injectCommandBefore: pickFirst(
      opencodeConfig.injectCommandBefore,
      projectConfig.injectCommandBefore,
      globalConfig.injectCommandBefore
    )
      ?.trim()
      ?.replaceAll(/\n/g, ';'),

    injectCommandBeforeComment: pickFirst(
      opencodeConfig.injectCommandBeforeComment,
      projectConfig.injectCommandBeforeComment,
      globalConfig.injectCommandBeforeComment
    )
      ?.trim()
      ?.replaceAll(/\n/g, ';'),

    injectCommandAfter: pickFirst(
      opencodeConfig.injectCommandAfter,
      projectConfig.injectCommandAfter,
      globalConfig.injectCommandAfter
    )
      ?.trim()
      ?.replaceAll(/\n/g, ';'),

    injectCommandAfterComment: pickFirst(
      opencodeConfig.injectCommandAfterComment,
      projectConfig.injectCommandAfterComment,
      globalConfig.injectCommandAfterComment
    )
      ?.trim()
      ?.replaceAll(/\n/g, ';'),
  }
}
