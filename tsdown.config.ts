import { defineConfig } from 'tsdown'
import packageJSON from './package.json' with { type: 'json' }

export default defineConfig({
  name: packageJSON.name,
  entry: {
    index: './src/index.ts',
  },

  clean: true,
  minify: true,
  outDir: './dist',

  target: 'ES6',
  tsconfig: './tsconfig.json',

  deps: {
    neverBundle: [
      /node:/gim,
      ...getExternal((packageJSON as any).dependencies),
    ],
  },
})

function getExternal(dependencies: unknown) {
  return Object.keys((dependencies ?? {}) as Record<string, string>).map(
    (dep) => new RegExp(`(^${dep}$)|(^${dep}/)`)
  )
}
