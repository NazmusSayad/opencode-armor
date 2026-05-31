import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import z from 'zod'
import { BLOCKED_PATTERNS } from './patterns.js'

const configSchema = z.object({
  priority: z.enum(['blacklist-first', 'whitelist-first']),
  blacklist: z.array(z.string()),
  whitelist: z.array(z.string()),
})

export const optionalConfigSchema = configSchema.partial()
async function readConfigFile(
  input: string
): Promise<z.infer<typeof optionalConfigSchema>> {
  try {
    const data = await fs.readFile(input, 'utf-8')
    return optionalConfigSchema.parseAsync(JSON.parse(data))
  } catch {
    return optionalConfigSchema.parseAsync({})
  }
}

const GLOBAL_CONFIG_PATH = path.join(os.homedir(), '.opencode-armor.json')
const globalConfigPromise = readConfigFile(GLOBAL_CONFIG_PATH)

export type PatternConfig = z.infer<typeof configSchema>
export async function resolveConfig(workdir: string): Promise<PatternConfig> {
  const CWD_CONFIG_PATH = path.join(workdir, '.opencode-armor.json')

  const [globalConfig, cwdConfig] = await Promise.all([
    globalConfigPromise,
    readConfigFile(CWD_CONFIG_PATH),
  ])

  return {
    priority: cwdConfig.priority ?? globalConfig.priority ?? 'blacklist-first',
    blacklist: [
      ...BLOCKED_PATTERNS,
      ...(globalConfig.blacklist ?? []),
      ...(cwdConfig.blacklist ?? []),
    ],
    whitelist: [
      ...(globalConfig.whitelist ?? []),
      ...(cwdConfig.whitelist ?? []),
    ],
  }
}
