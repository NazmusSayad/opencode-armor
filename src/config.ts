import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import z from 'zod'
import { ALLOWED_PATTERNS, BLOCKED_PATTERNS } from './patterns.js'

export const configSchema = z.object({
  priority: z.enum(['blacklist', 'whitelist']).optional(),
  blacklist: z.array(z.string()).optional(),
  whitelist: z.array(z.string()).optional(),

  ignoreDefaultBlacklist: z.boolean().optional(),
  ignoreDefaultWhitelist: z.boolean().optional(),

  ignoreGlobalBlacklist: z.boolean().optional(),
  ignoreGlobalWhitelist: z.boolean().optional(),

  injectCommandBefore: z.string().optional(),
  injectCommandAfter: z.string().optional(),
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

      ...((opencodeConfig.ignoreGlobalBlacklist ??
      projectConfig.ignoreGlobalBlacklist ??
      globalConfig.ignoreGlobalBlacklist)
        ? []
        : (globalConfig.blacklist ?? [])),

      ...((opencodeConfig.ignoreDefaultBlacklist ??
      projectConfig.ignoreDefaultBlacklist ??
      globalConfig.ignoreDefaultBlacklist)
        ? []
        : BLOCKED_PATTERNS),
    ],

    whitelist: [
      ...(opencodeConfig.whitelist ?? []),
      ...(projectConfig.whitelist ?? []),

      ...((opencodeConfig.ignoreGlobalWhitelist ??
      projectConfig.ignoreGlobalWhitelist ??
      globalConfig.ignoreGlobalWhitelist)
        ? []
        : (globalConfig.whitelist ?? [])),

      ...((opencodeConfig.ignoreDefaultWhitelist ??
      projectConfig.ignoreDefaultWhitelist ??
      globalConfig.ignoreDefaultWhitelist)
        ? []
        : ALLOWED_PATTERNS),
    ],

    injectCommandBefore:
      opencodeConfig.injectCommandBefore ??
      projectConfig.injectCommandBefore ??
      globalConfig.injectCommandBefore,

    injectCommandAfter:
      opencodeConfig.injectCommandAfter ??
      projectConfig.injectCommandAfter ??
      globalConfig.injectCommandAfter,
  }
}
