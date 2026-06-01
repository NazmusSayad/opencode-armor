import { describe, expect, it } from 'vitest'
import { patternMatcher } from '../matcher.js'

async function matcher(
  input: string,
  config: { blacklist: string[]; whitelist: string[] }
) {
  return Boolean(
    await patternMatcher(input, {
      priority: 'whitelist',
      blacklist: config.blacklist,
      whitelist: config.whitelist,
      blockedMessage: undefined,
      injectCommandAfter: undefined,
      injectCommandAfterComment: undefined,
      injectCommandBefore: undefined,
      injectCommandBeforeComment: undefined,
    })
  )
}

describe('priority: whitelist', () => {
  describe('basic blocking', () => {
    const config = {
      blacklist: ['npm run dev', 'npx vite', 'node --watch'],
      whitelist: [],
    }

    it('blocks exact match from blacklist', async () => {
      expect(await matcher('npm run dev', config)).toBe(true)
    })

    it('blocks with extra arguments', async () => {
      expect(await matcher('npm run dev --port 3000', config)).toBe(true)
    })

    it('blocks npx vite', async () => {
      expect(await matcher('npx vite', config)).toBe(true)
    })

    it('allows safe command', async () => {
      expect(await matcher('npm install', config)).toBe(false)
    })
  })

  describe('whitelist overrides blacklist', () => {
    const config = {
      blacklist: ['npm run dev', 'npx vite', 'node --watch'],
      whitelist: ['npm run dev'],
    }

    it('allows command that is in both whitelist and blacklist', async () => {
      expect(await matcher('npm run dev', config)).toBe(false)
    })

    it('still blocks non-whitelisted blacklisted command', async () => {
      expect(await matcher('npx vite', config)).toBe(true)
    })

    it('allows other safe command', async () => {
      expect(await matcher('git status', config)).toBe(false)
    })
  })

  describe('multiple commands', () => {
    const config = {
      blacklist: ['npm run dev'],
      whitelist: [],
    }

    it('blocks when any command matches blacklist', async () => {
      expect(await matcher('git status && npm run dev', config)).toBe(true)
    })

    it('allows when none match', async () => {
      expect(await matcher('git status && echo hello', config)).toBe(false)
    })
  })

  describe('multiple whitelist patterns', () => {
    const config = {
      blacklist: ['npm run dev', 'npx vite', 'yarn build'],
      whitelist: ['npm run dev', 'npx vite'],
    }

    it('allows npm run dev (both lists)', async () => {
      expect(await matcher('npm run dev', config)).toBe(false)
    })

    it('allows npx vite (both lists)', async () => {
      expect(await matcher('npx vite', config)).toBe(false)
    })

    it('blocks yarn build (blacklist only)', async () => {
      expect(await matcher('yarn build', config)).toBe(true)
    })

    it('allows unrelated command', async () => {
      expect(await matcher('git clone repo', config)).toBe(false)
    })
  })

  describe('chaining with whitelist override', () => {
    const config = {
      blacklist: ['npm run dev', 'npx vite'],
      whitelist: ['npm run dev'],
    }

    it('allows when whitelisted command is chained with safe', async () => {
      expect(await matcher('npm run dev && git status', config)).toBe(false)
    })

    it('blocks when blocked command mixed in', async () => {
      expect(await matcher('npm run dev && npx vite', config)).toBe(true)
    })

    it('blocks blocked command first in chain', async () => {
      expect(await matcher('npx vite && npm run dev', config)).toBe(true)
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
      blacklist: ['npm run dev'],
      whitelist: ['npm run dev'],
    }

    it('allows command containing pattern as substring but not at start', async () => {
      expect(await matcher('echo npm run dev', config)).toBe(false)
    })

    it('allows command wrapped in quotes', async () => {
      expect(await matcher('echo "npm run dev"', config)).toBe(false)
    })
  })
})
