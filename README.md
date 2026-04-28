# OpenCode Armor

Blocks AI agents from accidentally starting long-running dev servers, watchers, or persistent processes.

## Usage

Add to your OpenCode config:

```json
{
  "plugin": ["opencode-armor"]
}
```

## What gets blocked

Dev servers and watchers like:

- `npm run dev`, `yarn start`, `pnpm serve`, `bun dev`
- `npx vite`, `npx next`, `npx nodemon`, `npx tsx watch`
- `node --watch`, `pm2 start`

And similar commands across all package managers (npm, yarn, pnpm, bun).

## License

MIT
