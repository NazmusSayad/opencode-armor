import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import z from 'zod'
import { ALLOWED_PATTERNS, BLOCKED_PATTERNS } from './patterns.js'

const configSchema = z.object({
  priority: z.enum(['blacklist', 'whitelist']).optional(),
  blacklist: z.array(z.string()).optional(),
  whitelist: z.array(z.string()).optional(),

  ignoreDefaultBlacklist: z.boolean().optional(),
  ignoreDefaultWhitelist: z.boolean().optional(),
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

const GLOBAL_CONFIG_PATH = path.join(os.homedir(), '.opencode-armor.json')
const globalConfigPromise = readConfigFile(GLOBAL_CONFIG_PATH)

export type PatternConfig =
  ReturnType<typeof resolveConfig> extends Promise<infer R> ? R : never

export async function resolveConfig(workdir: string) {
  const CWD_CONFIG_PATH = path.join(workdir, '.opencode-armor.json')

  const [globalConfig, projectConfig] = await Promise.all([
    globalConfigPromise,
    readConfigFile(CWD_CONFIG_PATH),
  ])

  const ignoreDefaultBlacklist =
    projectConfig.ignoreDefaultBlacklist ??
    globalConfig.ignoreDefaultBlacklist ??
    false

  const ignoreDefaultWhitelist =
    projectConfig.ignoreDefaultWhitelist ??
    globalConfig.ignoreDefaultWhitelist ??
    false

  return {
    priority: projectConfig.priority ?? globalConfig.priority ?? 'whitelist',
    blacklist: [
      ...(ignoreDefaultBlacklist ? [] : BLOCKED_PATTERNS),
      ...(globalConfig.blacklist ?? []),
      ...(projectConfig.blacklist ?? []),
    ],
    whitelist: [
      ...(ignoreDefaultWhitelist ? [] : ALLOWED_PATTERNS),
      ...(globalConfig.whitelist ?? []),
      ...(projectConfig.whitelist ?? []),
    ],
  }
}
