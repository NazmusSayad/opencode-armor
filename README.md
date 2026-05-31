# opencode-armor

OpenCode plugin that blocks bash commands for long-running dev servers, watchers, and persistent processes.

## Install

```bash
npm install opencode-armor
```

## Usage

Add to your OpenCode config (`opencode.json`):

```json
{
  "plugin": ["opencode-armor"]
}
```

## What gets blocked

By default, commands that start dev servers or persistent watchers are blocked:

- `npm run dev`, `yarn start`, `pnpm serve`, `bun dev`
- `npx vite`, `npx next`, `npx nodemon`, `npx tsx watch`
- `node --watch`, `pm2 start`

## Configuration

Create `.opencode-armor.json` in your project root (or `~/.opencode-armor.json` globally, or `.opencode/armor.json`).

```json
{
  "$schema": "https://github.com/NazmusSayad/opencode-armor/raw/refs/heads/schema/schema.json",
  "blacklist": ["custom-pattern"],
  "whitelist": ["vitest"]
}
```

- `priority`: `"whitelist"` (default) or `"blacklist"` — which mode to operate in.
  - **whitelist**: block blacklisted unless matched by whitelist.
  - **blacklist**: allow whitelisted unless matched by blacklist.
- `blacklist` — patterns to block.
- `whitelist` — patterns to allow.
- `ignoreDefaultBlacklist` — skip builtin block patterns.
- `ignoreDefaultWhitelist` — skip builtin allow patterns.
- `ignoreGlobalBlacklist` — skip global blacklist entries.
- `ignoreGlobalWhitelist` — skip global whitelist entries.

Pattern matching is case-insensitive and normalizes extra whitespace.
