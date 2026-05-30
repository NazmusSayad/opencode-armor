import os from 'os'
import path from 'path'

export function resolveConfig() {
  const GLOBAL_CONFIG_PATH = path.join(os.homedir(), '.opencode-armor.json')
  const CWD_CONFIG_PATH = path.join(process.cwd(), '.opencode-armor.json')
}
