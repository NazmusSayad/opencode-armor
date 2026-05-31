import { patternMatcher } from './matcher.js'

const result = await patternMatcher('npm run build', {
  priority: 'whitelist',
  blacklist: ['npm run dev', 'npm run build'],
  whitelist: ['npm run dev'],
})

if (typeof result === 'string') {
  console.log(`❌ Blocked pattern detected: "${result}"`)
} else {
  console.log('✅ No blocked patterns detected.')
}
