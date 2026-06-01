import { defineConfig } from 'tsdown'
import packageJSON from './package.json' with { type: 'json' }

const isDev = process.env.OPENCODE_ARMOR_DEV_MODE === 'true'

export default defineConfig({
  entry: {
    index: './src/index.ts',
  },

  clean: true,
  minify: true,
  outDir: isDev ? './.opencode/plugins/' : './dist',

  target: 'ES6',
  tsconfig: './tsconfig.json',

  external: [/node:/gim, ...getExternal((packageJSON as any).dependencies)],
})

function getExternal(dependencies: unknown) {
  return Object.keys((dependencies ?? {}) as Record<string, string>).map(
    (dep) => new RegExp(`(^${dep}$)|(^${dep}/)`)
  )
}
