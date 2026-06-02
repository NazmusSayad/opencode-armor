# opencode-armor

OpenCode plugin that blocks bash commands for long-running dev servers, injects
project `.env` variables into the shell, and prepends/appends arbitrary commands
to every bash invocation.

## Usage

Add to your OpenCode config (`opencode.json`):

```json
{
  "plugin": ["opencode-armor"]
}
```

## Configuration

Create a config file in any of these locations. Layers are merged in this order
(later wins and merged instead of replacing):

1. `~/.opencode-armor.json` — global
2. `./.opencode-armor.json` — project root
3. `./.opencode/armor.json` — project root

```json
{
  "$schema": "https://github.com/NazmusSayad/opencode-armor/raw/refs/heads/schema/schema.json",
  "armor": {
    "priority": "whitelist",
    "message": "Blocked: `{{COMMAND}}` (matched `{{PATTERN}}`)",
    "blacklist": {
      "commands": ["custom-pattern"],
      "disableDefaults": false,
      "disableGlobal": false
    },
    "whitelist": {
      "commands": ["vitest"],
      "disableDefaults": false,
      "disableGlobal": false
    }
  },
  "dotenv": {
    "define": { "MY_VAR": "value" },
    "files": [".env"],
    "disableDefaults": false,
    "disableGlobal": false,
    "disableCwd": false
  },
  "command": {
    "before": { "command": "set -e", "comment": "Fail fast" },
    "after": { "command": "echo done", "comment": "Notify" }
  }
}
```

### `armor`

Controls which bash commands are blocked. Patterns are case-insensitive and
whitespace-normalized.

- `priority` — `"whitelist"` (default) or `"blacklist"`.
- `blacklist` / `whitelist` — `commands` are substring patterns. `disableDefaults` skips the built-in list; `disableGlobal` skips the global config's list.
- `message` — custom block error. Placeholders: `{{COMMAND}}`, `{{PATTERN}}`.

By default, dev servers and watchers are blocked — e.g. `npm run dev`,
`yarn start`, `npx vite`, `npx next`, `npx nodemon`, `npx tsx watch`,
`node --watch`, `pm2 start`. `npx next lint` is allowed by default.

### `dotenv`

Injects environment variables into every shell via the `shell.env` hook.

- `define` — inline `KEY: "value"` map merged over file-based vars.
- `files` — additional `.env`-style files to load (resolved relative to project root, or `~/` for home).
- `disableDefaults` — skip the built-in `.env` file list.
- `disableGlobal` — skip the global config's `define` and `files`.
- `disableCwd` — by default, `.env` files from the current working directory are also loaded. Set to `true` to load only from the project root.

### `command`

Inject a command at the start or end of every bash invocation. Skipped when the
command already starts/ends with the injected string.

- `before` / `after` — `{ command, comment }`. `comment` is appended after `#`.

## Debugging

Set `OPENCODE_ARMOR_ENABLE_LOG=true` to write logs to
`os.tmpdir()/.opencode-armor-logs/`.
