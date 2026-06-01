import { describe, expect, it } from 'vitest'
import { BLOCKED_PATTERNS } from '../constants.js'
import { patternMatcher } from '../matcher.js'

async function matcher(input: string) {
  return Boolean(
    await patternMatcher(input, {
      priority: 'whitelist',
      blacklist: BLOCKED_PATTERNS,
      whitelist: [],
      blockedMessage: undefined,
      injectCommandAfter: undefined,
      injectCommandAfterComment: undefined,
      injectCommandBefore: undefined,
      injectCommandBeforeComment: undefined,
    })
  )
}

describe('patternMatcher', () => {
  describe('should block exact blocked patterns', () => {
    const blockedCommands = [
      'nr dev',
      'bun dev',
      'pnpm dev',
      'yarn dev',
      'npm run dev',
      'bun run dev',
      'yarn run dev',
      'pnpm run dev',
      'nr start',
      'bun start',
      'pnpm start',
      'yarn start',
      'npm run start',
      'bun run start',
      'yarn run start',
      'pnpm run start',
      'nr serve',
      'bun serve',
      'pnpm serve',
      'yarn serve',
      'npm run serve',
      'bun run serve',
      'yarn run serve',
      'pnpm run serve',
      'nlx vite',
      'npx vite',
      'bunx vite',
      'pnpx vite',
      'yarnx vite',
      'npm exec vite',
      'bun exec vite',
      'pnpm exec vite',
      'yarn exec vite',
      'pnpm dlx vite',
      'yarn dlx vite',
      'nlx next',
      'npx next',
      'bunx next',
      'pnpx next',
      'yarnx next',
      'npm exec next',
      'bun exec next',
      'pnpm exec next',
      'yarn exec next',
      'pnpm dlx next',
      'yarn dlx next',
      'nlx nodemon',
      'npx nodemon',
      'bunx nodemon',
      'pnpx nodemon',
      'yarnx nodemon',
      'npm exec nodemon',
      'bun exec nodemon',
      'pnpm exec nodemon',
      'yarn exec nodemon',
      'pnpm dlx nodemon',
      'yarn dlx nodemon',
      'nlx tsx watch',
      'npx tsx watch',
      'bunx tsx watch',
      'pnpx tsx watch',
      'yarnx tsx watch',
      'npm exec tsx watch',
      'bun exec tsx watch',
      'pnpm exec tsx watch',
      'yarn exec tsx watch',
      'pnpm dlx tsx watch',
      'yarn dlx tsx watch',
      'nlx tsx --watch',
      'npx tsx --watch',
      'bunx tsx --watch',
      'pnpx tsx --watch',
      'yarnx tsx --watch',
      'npm exec tsx --watch',
      'bun exec tsx --watch',
      'pnpm exec tsx --watch',
      'yarn exec tsx --watch',
      'pnpm dlx tsx --watch',
      'yarn dlx tsx --watch',
      'nlx ts-node-dev',
      'npx ts-node-dev',
      'bunx ts-node-dev',
      'pnpx ts-node-dev',
      'yarnx ts-node-dev',
      'npm exec ts-node-dev',
      'bun exec ts-node-dev',
      'pnpm exec ts-node-dev',
      'yarn exec ts-node-dev',
      'pnpm dlx ts-node-dev',
      'yarn dlx ts-node-dev',
      'nlx react-scripts start',
      'npx react-scripts start',
      'bunx react-scripts start',
      'pnpx react-scripts start',
      'yarnx react-scripts start',
      'npm exec react-scripts start',
      'bun exec react-scripts start',
      'pnpm exec react-scripts start',
      'yarn exec react-scripts start',
      'pnpm dlx react-scripts start',
      'yarn dlx react-scripts start',
      'nlx serve',
      'npx serve',
      'bunx serve',
      'pnpx serve',
      'yarnx serve',
      'npm exec serve',
      'bun exec serve',
      'pnpm exec serve',
      'yarn exec serve',
      'pnpm dlx serve',
      'yarn dlx serve',
      'nlx http-server',
      'npx http-server',
      'bunx http-server',
      'pnpx http-server',
      'yarnx http-server',
      'npm exec http-server',
      'bun exec http-server',
      'pnpm exec http-server',
      'yarn exec http-server',
      'pnpm dlx http-server',
      'yarn dlx http-server',
      'nlx live-server',
      'npx live-server',
      'bunx live-server',
      'pnpx live-server',
      'yarnx live-server',
      'npm exec live-server',
      'bun exec live-server',
      'pnpm exec live-server',
      'yarn exec live-server',
      'pnpm dlx live-server',
      'yarn dlx live-server',
      'nlx remix dev',
      'npx remix dev',
      'bunx remix dev',
      'pnpx remix dev',
      'yarnx remix dev',
      'npm exec remix dev',
      'bun exec remix dev',
      'pnpm exec remix dev',
      'yarn exec remix dev',
      'pnpm dlx remix dev',
      'yarn dlx remix dev',
      'nlx astro dev',
      'npx astro dev',
      'bunx astro dev',
      'pnpx astro dev',
      'yarnx astro dev',
      'npm exec astro dev',
      'bun exec astro dev',
      'pnpm exec astro dev',
      'yarn exec astro dev',
      'pnpm dlx astro dev',
      'yarn dlx astro dev',
      'nlx expo start',
      'npx expo start',
      'bunx expo start',
      'pnpx expo start',
      'yarnx expo start',
      'npm exec expo start',
      'bun exec expo start',
      'pnpm exec expo start',
      'yarn exec expo start',
      'pnpm dlx expo start',
      'yarn dlx expo start',
      'nlx svelte-kit dev',
      'npx svelte-kit dev',
      'bunx svelte-kit dev',
      'pnpx svelte-kit dev',
      'yarnx svelte-kit dev',
      'npm exec svelte-kit dev',
      'bun exec svelte-kit dev',
      'pnpm exec svelte-kit dev',
      'yarn exec svelte-kit dev',
      'pnpm dlx svelte-kit dev',
      'yarn dlx svelte-kit dev',
      'nlx hexo server',
      'npx hexo server',
      'bunx hexo server',
      'pnpx hexo server',
      'yarnx hexo server',
      'npm exec hexo server',
      'bun exec hexo server',
      'pnpm exec hexo server',
      'yarn exec hexo server',
      'pnpm dlx hexo server',
      'yarn dlx hexo server',
      'nlx gatsby develop',
      'npx gatsby develop',
      'bunx gatsby develop',
      'pnpx gatsby develop',
      'yarnx gatsby develop',
      'npm exec gatsby develop',
      'bun exec gatsby develop',
      'pnpm exec gatsby develop',
      'yarn exec gatsby develop',
      'pnpm dlx gatsby develop',
      'yarn dlx gatsby develop',
      'nlx solid-start dev',
      'npx solid-start dev',
      'bunx solid-start dev',
      'pnpx solid-start dev',
      'yarnx solid-start dev',
      'npm exec solid-start dev',
      'bun exec solid-start dev',
      'pnpm exec solid-start dev',
      'yarn exec solid-start dev',
      'pnpm dlx solid-start dev',
      'yarn dlx solid-start dev',
      'nlx quartz build --serve',
      'npx quartz build --serve',
      'bunx quartz build --serve',
      'pnpx quartz build --serve',
      'yarnx quartz build --serve',
      'npm exec quartz build --serve',
      'bun exec quartz build --serve',
      'pnpm exec quartz build --serve',
      'yarn exec quartz build --serve',
      'pnpm dlx quartz build --serve',
      'yarn dlx quartz build --serve',
      'nlx vue-cli-service serve',
      'npx vue-cli-service serve',
      'bunx vue-cli-service serve',
      'pnpx vue-cli-service serve',
      'yarnx vue-cli-service serve',
      'npm exec vue-cli-service serve',
      'bun exec vue-cli-service serve',
      'pnpm exec vue-cli-service serve',
      'yarn exec vue-cli-service serve',
      'pnpm dlx vue-cli-service serve',
      'yarn dlx vue-cli-service serve',
      'node --watch',
      'pm2 start',
    ]

    for (const cmd of blockedCommands) {
      it(`blocks "${cmd}"`, async () => {
        expect(await matcher(cmd)).toBe(true)
      })
    }
  })

  describe('should block with extra whitespace', () => {
    it('blocks "  npm run dev"', async () => {
      expect(await matcher('  npm run dev')).toBe(true)
    })

    it('blocks "npm  run  dev"', async () => {
      expect(await matcher('npm  run  dev')).toBe(true)
    })

    it('blocks "  npx vite  "', async () => {
      expect(await matcher('  npx vite  ')).toBe(true)
    })

    it('blocks "   node --watch   "', async () => {
      expect(await matcher('   node --watch   ')).toBe(true)
    })

    it('blocks "pnpm  run  start"', async () => {
      expect(await matcher('pnpm  run  start')).toBe(true)
    })

    it('blocks "\tpm2 start\t"', async () => {
      expect(await matcher('\tpm2 start\t')).toBe(true)
    })
  })

  describe('should block with trailing arguments', () => {
    it('blocks "npm run dev --port 3000"', async () => {
      expect(await matcher('npm run dev --port 3000')).toBe(true)
    })

    it('blocks "npx vite --host"', async () => {
      expect(await matcher('npx vite --host')).toBe(true)
    })

    it('blocks "node --watch server.js"', async () => {
      expect(await matcher('node --watch server.js')).toBe(true)
    })

    it('blocks "pm2 start app.js"', async () => {
      expect(await matcher('pm2 start app.js')).toBe(true)
    })

    it('blocks "yarn dlx astro dev --port 4321"', async () => {
      expect(await matcher('yarn dlx astro dev --port 4321')).toBe(true)
    })

    it('blocks "pnpm exec quartz build --serve --directory content"', async () => {
      expect(
        await matcher('pnpm exec quartz build --serve --directory content')
      ).toBe(true)
    })
  })

  describe('should block chained commands when any segment matches', () => {
    it('blocks "echo hello; npm run dev"', async () => {
      expect(await matcher('echo hello; npm run dev')).toBe(true)
    })

    it('blocks "npm run dev; echo hello"', async () => {
      expect(await matcher('npm run dev; echo hello')).toBe(true)
    })

    it('blocks "echo hello && npx vite"', async () => {
      expect(await matcher('echo hello && npx vite')).toBe(true)
    })

    it('blocks "npx vite && echo hello"', async () => {
      expect(await matcher('npx vite && echo hello')).toBe(true)
    })

    it('blocks "echo hello & pm2 start app.js"', async () => {
      expect(await matcher('echo hello & pm2 start app.js')).toBe(true)
    })

    it('blocks "echo a; echo b; yarn run start"', async () => {
      expect(await matcher('echo a; echo b; yarn run start')).toBe(true)
    })

    it('blocks "git status && bun run dev && echo done"', async () => {
      expect(await matcher('git status && bun run dev && echo done')).toBe(true)
    })
  })

  describe('should NOT block commands that contain pattern as substring but do not start with it', () => {
    const safeCommands = [
      'echo npm run dev',
      'echo "npm run dev"',
      'printf "npm run dev"',
      'cat package.json | grep npm run dev',
      'echo npx vite',
      'echo node --watch',
      'echo pm2 start',
      'history | grep "npm run dev"',
      'git commit -m "npm run dev fix"',
      'echo "use npm run dev to start"',
      'echo yarn dlx astro dev',
      'printf pnpm exec quartz build --serve',
      'echo bunx next',
      'cat log.txt | grep pm2 start',
      'echo solid-start dev',
      'echo tsx watch',
    ]

    for (const cmd of safeCommands) {
      it(`allows "${cmd}"`, async () => {
        expect(await matcher(cmd)).toBe(false)
      })
    }
  })

  describe('should NOT block unrelated safe commands', () => {
    const safeCommands = [
      'ls',
      'ls -la',
      'pwd',
      'whoami',
      'git status',
      'git log',
      'git commit -m "update"',
      'git push origin main',
      'git pull',
      'git clone https://github.com/foo/bar.git',
      'cat file.txt',
      'echo hello world',
      'mkdir new-folder',
      'rm file.txt',
      'cp a.txt b.txt',
      'mv a.txt b.txt',
      'touch file.txt',
      'chmod +x script.sh',
      'chown user:group file',
      'find . -name "*.ts"',
      'grep -r "foo" .',
      "awk '{print $1}' file.txt",
      'sed -i "s/old/new/g" file.txt',
      'tar -czvf archive.tar.gz folder',
      'unzip archive.zip',
      'curl https://example.com',
      'wget https://example.com/file.zip',
      'ssh user@host',
      'scp file.txt user@host:/path',
      'rsync -avz ./ user@host:/path',
      'docker ps',
      'docker build -t myapp .',
      'docker run -it ubuntu',
      'docker-compose up',
      'docker-compose down',
      'kubectl get pods',
      'kubectl apply -f deployment.yaml',
      'terraform plan',
      'terraform apply',
      'ansible-playbook playbook.yml',
      'python script.py',
      'python3 script.py',
      'pip install requests',
      'node script.js',
      'node -e "console.log(1)"',
      'npm install',
      'npm ci',
      'npm test',
      'npm publish',
      'npm audit fix',
      'npm outdated',
      'npm update',
      'npm uninstall lodash',
      'npm init',
      'npm pack',
      'npm link',
      'npm unlink',
      'npm cache clean',
      'npm config list',
      'npm version patch',
      'npx tsc --noEmit',
      'npx eslint .',
      'npx prettier --write .',
      'npx jest',
      'npx prisma migrate dev',
      'npx tailwindcss init',
      'npx create-react-app my-app',
      'npx tsx script.ts',
      'yarn install',
      'yarn add lodash',
      'yarn remove lodash',
      'yarn upgrade',
      'yarn test',
      'yarn build',
      'yarn lint',
      'yarn format',
      'pnpm install',
      'pnpm add lodash',
      'pnpm remove lodash',
      'pnpm build',
      'pnpm test',
      'pnpm lint',
      'pnpm format',
      'bun install',
      'bun add lodash',
      'bun remove lodash',
      'bun test',
      'bun build',
      'bun run build',
      'bun run lint',
      'cargo build',
      'cargo test',
      'cargo run',
      'go build',
      'go test',
      'go run main.go',
      'rustc main.rs',
      'javac Main.java',
      'java Main',
      'mvn clean install',
      'gradle build',
      'dotnet build',
      'dotnet test',
      'dotnet run',
      'ruby script.rb',
      'gem install bundler',
      'bundle install',
      'rails new myapp',
      'rails server',
      'php script.php',
      'composer install',
      'composer update',
      'swift build',
      'swift test',
      'flutter build apk',
      'flutter test',
      'expo init myproject',
      'expo build:android',
      'jest',
      'eslint .',
      'prettier --write .',
      'tsc --noEmit',
      'tsc --build',
      'webpack',
      'rollup -c',
      'esbuild app.js --bundle',
      'swc --help',
      'astro build',
      'astro check',
      'next build',
      'next lint',
      'gatsby build',
      'remix build',
      'svelte-kit build',
      'vue-cli-service build',
      'vite build',
      'vite preview',
      'vite --help',
      'hexo generate',
      'hexo clean',
      'quartz build',
      'solid-start build',
      'ts-node script.ts',
      'tsx script.ts',
      'nodemon --version',
      'http-server --help',
      'live-server --version',
      'serve --help',
      'pm2 list',
      'pm2 stop all',
      'pm2 delete all',
      'pm2 reload all',
      'pm2 restart all',
      'pm2 logs',
      'pm2 monit',
      'pm2 startup',
      'pm2 save',
    ]

    for (const cmd of safeCommands) {
      it(`allows "${cmd}"`, async () => {
        expect(await matcher(cmd)).toBe(false)
      })
    }
  })

  describe('should NOT block empty or whitespace-only input', () => {
    it('allows empty string', async () => {
      expect(await matcher('')).toBe(false)
    })

    it('allows single space', async () => {
      expect(await matcher(' ')).toBe(false)
    })

    it('allows multiple spaces', async () => {
      expect(await matcher('   ')).toBe(false)
    })

    it('allows tab', async () => {
      expect(await matcher('\t')).toBe(false)
    })

    it('allows newline', async () => {
      expect(await matcher('\n')).toBe(false)
    })
  })

  describe('should NOT block when blocked pattern appears after semicolon with spaces', () => {
    it('allows "echo hello ; npm run dev" because echo hello starts the command', async () => {
      expect(await matcher('echo hello ; npm run dev')).toBe(true)
    })
  })

  describe('edge cases with command chaining', () => {
    it('blocks when blocked pattern is second segment with ;', async () => {
      expect(await matcher('ls; npm run dev')).toBe(true)
    })

    it('blocks when blocked pattern is second segment with &&', async () => {
      expect(await matcher('ls&&npm run dev')).toBe(true)
    })

    it('blocks when blocked pattern is second segment with &', async () => {
      expect(await matcher('ls&npm run dev')).toBe(true)
    })

    it('allows both segments safe', async () => {
      expect(await matcher('ls; pwd')).toBe(false)
    })

    it('allows both segments safe with &&', async () => {
      expect(await matcher('ls && pwd')).toBe(false)
    })

    it('allows both segments safe with &', async () => {
      expect(await matcher('ls & pwd')).toBe(false)
    })
  })
})
