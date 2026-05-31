import { describe, expect, it } from 'vitest'
import { patternMatcher } from '../matcher.js'

async function matcher(
  input: string,
  config: { blacklist: string[]; whitelist: string[] }
) {
  return Boolean(
    await patternMatcher(input, {
      priority: 'blacklist',
      blacklist: config.blacklist,
      whitelist: config.whitelist,
    })
  )
}

describe('priority: blacklist', () => {
  describe('basic blocking', () => {
    const config = {
      whitelist: ['npm run dev', 'npx vite', 'node --watch'],
      blacklist: ['npm run dev', 'npx vite', 'node --watch'],
    }

    it('blocks exact match when in both lists', async () => {
      expect(await matcher('npm run dev', config)).toBe(true)
    })

    it('blocks with extra arguments when in both lists', async () => {
      expect(await matcher('npm run dev --port 3000', config)).toBe(true)
    })

    it('blocks npx vite when in both lists', async () => {
      expect(await matcher('npx vite', config)).toBe(true)
    })

    it('allows safe command not in whitelist', async () => {
      expect(await matcher('npm install', config)).toBe(false)
    })
  })

  describe('blacklist does not block without whitelist match', () => {
    const config = {
      whitelist: ['npm run dev'],
      blacklist: ['npm run dev', 'npx vite', 'node --watch'],
    }

    it('allows npx vite (blacklisted but not whitelisted)', async () => {
      expect(await matcher('npx vite', config)).toBe(false)
    })

    it('allows node --watch (blacklisted but not whitelisted)', async () => {
      expect(await matcher('node --watch', config)).toBe(false)
    })

    it('blocks npm run dev (blacklisted AND whitelisted)', async () => {
      expect(await matcher('npm run dev', config)).toBe(true)
    })

    it('allows unrelated command', async () => {
      expect(await matcher('git status', config)).toBe(false)
    })
  })

  describe('no blocking when whitelist is empty', () => {
    const config = {
      whitelist: [],
      blacklist: ['npm run dev', 'npx vite'],
    }

    it('allows blacklisted command when whitelist is empty', async () => {
      expect(await matcher('npm run dev', config)).toBe(false)
    })

    it('allows other blacklisted command', async () => {
      expect(await matcher('npx vite', config)).toBe(false)
    })

    it('allows unrelated command', async () => {
      expect(await matcher('git status', config)).toBe(false)
    })
  })

  describe('multiple commands with mixed allow/block', () => {
    const config = {
      whitelist: ['npm run dev', 'npx vite'],
      blacklist: ['npm run dev'],
    }

    it('allows chain with npx vite (whitelisted but not blacklisted)', async () => {
      expect(await matcher('npx vite && git status', config)).toBe(false)
    })

    it('allows chain with npm run dev (both lists) but it should be blocked', async () => {
      expect(await matcher('npm run dev && git status', config)).toBe(true)
    })

    it('allows safe commands only', async () => {
      expect(await matcher('git status && echo hello', config)).toBe(false)
    })
  })

  describe('complex mixed whitelist/blacklist', () => {
    const config = {
      whitelist: ['npm run dev', 'npx vite', 'yarn build'],
      blacklist: ['npm run dev', 'npx vite'],
    }

    it('allows npm install (not in whitelist)', async () => {
      expect(await matcher('npm install', config)).toBe(false)
    })

    it('allows yarn build (in whitelist, not in blacklist)', async () => {
      expect(await matcher('yarn build', config)).toBe(false)
    })

    it('blocks npm run dev (both lists)', async () => {
      expect(await matcher('npm run dev', config)).toBe(true)
    })

    it('blocks npx vite (both lists)', async () => {
      expect(await matcher('npx vite', config)).toBe(true)
    })
  })

  describe('chaining behavior', () => {
    const config = {
      whitelist: ['npm run dev', 'npx vite'],
      blacklist: ['npm run dev'],
    }

    it('blocks when blocked command appears in chain', async () => {
      expect(await matcher('git status && npm run dev', config)).toBe(true)
    })

    it('allows chain with npx vite (whitelisted only)', async () => {
      expect(await matcher('git status && npx vite', config)).toBe(false)
    })

    it('allows chain with all safe commands', async () => {
      expect(await matcher('ls -la && git status', config)).toBe(false)
    })
  })

  describe('empty and boundary cases', () => {
    it('allows empty string with empty lists', async () => {
      expect(await matcher('', { blacklist: [], whitelist: [] })).toBe(false)
    })

    it('allows empty string with populated lists', async () => {
      expect(
        await matcher('', {
          blacklist: ['npm run dev'],
          whitelist: ['npm run dev'],
        })
      ).toBe(false)
    })

    it('allows whitespace-only string', async () => {
      expect(
        await matcher('   ', { blacklist: ['npm run dev'], whitelist: [] })
      ).toBe(false)
    })
  })

  describe('substring edge cases', () => {
    const config = {
      whitelist: ['npm run dev'],
      blacklist: ['npm run dev'],
    }

    it('allows command containing pattern as substring but not at start', async () => {
      expect(await matcher('echo npm run dev', config)).toBe(false)
    })

    it('allows command wrapped in quotes', async () => {
      expect(await matcher('echo "npm run dev"', config)).toBe(false)
    })
  })

  describe('both lists same content', () => {
    const config = {
      whitelist: ['npm run dev', 'npx vite', 'node --watch'],
      blacklist: ['npm run dev', 'npx vite', 'node --watch'],
    }

    it('behaves like basic blacklist priority', async () => {
      expect(await matcher('npm run dev', config)).toBe(true)
      expect(await matcher('npx vite', config)).toBe(true)
      expect(await matcher('node --watch', config)).toBe(true)
      expect(await matcher('git status', config)).toBe(false)
    })
  })
})
