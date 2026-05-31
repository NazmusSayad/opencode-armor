import { patternMatcher } from './matcher.js'
import { BLOCKED_PATTERNS } from './patterns.js'

console.log(
  await patternMatcher('ls&npm run dev', {
    priority: 'blacklist-first',
    blacklist: BLOCKED_PATTERNS,
    whitelist: [],
  })
)
