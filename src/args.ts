import { Command } from '@commander-js/extra-typings'
import { updateOpenCodePlugins } from './lib/update-plugin.js'
import { packageJSON } from './package.js'

export const program = new Command()
  .name(packageJSON.name)
  .description('OpenCode Armor - Security plugin for OpenCode')
  .version(packageJSON.version)

program
  .command('update-plugin')
  .description('Update OpenCode plugins in ~/.cache/opencode/packages/')
  .argument('[plugins...]', 'Plugin names to update')
  .action((plugins) => updateOpenCodePlugins(...plugins))
