import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import z from 'zod'
import { pickFirst, uniqueArrayOfStrings } from '../lib/utils.js'
import { configSchema } from './config-schema.js'
import {
  ALLOWED_PATTERNS,
  BLOCKED_PATTERNS,
  DEFAULT_DOTENV_FILES,
} from './constants.js'

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
    armor: {
      priority:
        pickFirst(
          opencodeConfig?.armor?.priority,
          projectConfig?.armor?.priority,
          globalConfig?.armor?.priority
        ) ?? 'whitelist',

      blacklist: [
        ...(opencodeConfig.armor?.blacklist?.commands ?? []),
        ...(projectConfig.armor?.blacklist?.commands ?? []),

        ...(pickFirst(
          opencodeConfig.armor?.blacklist?.ignoreGlobal,
          projectConfig.armor?.blacklist?.ignoreGlobal,
          globalConfig.armor?.blacklist?.ignoreGlobal
        )
          ? []
          : (globalConfig.armor?.blacklist?.commands ?? [])),

        ...(pickFirst(
          opencodeConfig.armor?.blacklist?.ignoreDefaults,
          projectConfig.armor?.blacklist?.ignoreDefaults,
          globalConfig.armor?.blacklist?.ignoreDefaults
        )
          ? []
          : BLOCKED_PATTERNS),
      ],

      whitelist: [
        ...(opencodeConfig.armor?.whitelist?.commands ?? []),
        ...(projectConfig.armor?.whitelist?.commands ?? []),

        ...(pickFirst(
          opencodeConfig.armor?.whitelist?.ignoreGlobal,
          projectConfig.armor?.whitelist?.ignoreGlobal,
          globalConfig.armor?.whitelist?.ignoreGlobal
        )
          ? []
          : (globalConfig.armor?.whitelist?.commands ?? [])),

        ...(pickFirst(
          opencodeConfig.armor?.whitelist?.ignoreDefaults,
          projectConfig.armor?.whitelist?.ignoreDefaults,
          globalConfig.armor?.whitelist?.ignoreDefaults
        )
          ? []
          : ALLOWED_PATTERNS),
      ],

      message: pickFirst(
        opencodeConfig.armor?.message,
        projectConfig.armor?.message,
        globalConfig.armor?.message
      )?.trim(),
    },

    dotenv: {
      vars: {
        ...(pickFirst(
          opencodeConfig.dotenv?.ignoreGlobal,
          projectConfig.dotenv?.ignoreGlobal,
          globalConfig.dotenv?.ignoreGlobal
        )
          ? {}
          : globalConfig.dotenv?.define),

        ...projectConfig.dotenv?.define,
        ...opencodeConfig.dotenv?.define,
      },

      files: uniqueArrayOfStrings([
        ...(pickFirst(
          opencodeConfig.dotenv?.ignoreDefaults,
          projectConfig.dotenv?.ignoreDefaults,
          globalConfig.dotenv?.ignoreDefaults
        )
          ? []
          : DEFAULT_DOTENV_FILES),

        ...(pickFirst(
          opencodeConfig.dotenv?.ignoreGlobal,
          projectConfig.dotenv?.ignoreGlobal,
          globalConfig.dotenv?.ignoreGlobal
        )
          ? []
          : (globalConfig.dotenv?.files ?? [])),

        ...(projectConfig.dotenv?.files ?? []),
        ...(opencodeConfig.dotenv?.files ?? []),
      ]),

      ignoreCwd:
        pickFirst(
          opencodeConfig.dotenv?.ignoreCwd,
          projectConfig.dotenv?.ignoreCwd,
          globalConfig.dotenv?.ignoreCwd
        ) ?? false,
    },

    command: {
      injectBefore: pickFirst(
        opencodeConfig.command?.before?.command,
        projectConfig.command?.before?.command,
        globalConfig.command?.before?.command
      )
        ?.trim()
        ?.replaceAll(/\n/g, ';'),

      injectBeforeComment: pickFirst(
        opencodeConfig.command?.before?.comment,
        projectConfig.command?.before?.comment,
        globalConfig.command?.before?.comment
      )
        ?.trim()
        ?.replaceAll(/\n/g, ';'),

      injectAfter: pickFirst(
        opencodeConfig.command?.after?.command,
        projectConfig.command?.after?.command,
        globalConfig.command?.after?.command
      )
        ?.trim()
        ?.replaceAll(/\n/g, ';'),

      injectAfterComment: pickFirst(
        opencodeConfig.command?.after?.comment,
        projectConfig.command?.after?.comment,
        globalConfig.command?.after?.comment
      )
        ?.trim()
        ?.replaceAll(/\n/g, ';'),
    },
  }
}
