import { Client } from 'basic-ftp'
import { readFileSync, cpSync, rmSync, existsSync } from 'fs'
import { execSync } from 'child_process'

import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// Load .env.ftp
const env = Object.fromEntries(
  readFileSync(path.join(ROOT, '.env.ftp'), 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => {
      const [k, ...v] = l.split('=')
      return [k.trim(), v.join('=').trim().replace(/^"|"$/g, '')]
    })
)

const DEPLOY_DIR = path.join(ROOT, 'deploy')
const ZIP_PATH = path.join(ROOT, 'deploy.zip')

// 1. Assemble deploy folder
console.log('[1/3] Assembling deploy folder...')
if (existsSync(DEPLOY_DIR)) rmSync(DEPLOY_DIR, { recursive: true, force: true })

// standalone output → deploy/
cpSync(path.join(ROOT, '.next', 'standalone'), DEPLOY_DIR, { recursive: true })
// public/ → deploy/public/
cpSync(path.join(ROOT, 'public'), path.join(DEPLOY_DIR, 'public'), { recursive: true })
// .next/static/ → deploy/.next/static/
cpSync(path.join(ROOT, '.next', 'static'), path.join(DEPLOY_DIR, '.next', 'static'), { recursive: true })

// 2. Zip
console.log('[2/3] Zipping...')
if (existsSync(ZIP_PATH)) rmSync(ZIP_PATH)
const deployWin = DEPLOY_DIR.replace(/\//g, '\\')
const zipWin = ZIP_PATH.replace(/\//g, '\\')
execSync(
  `powershell.exe -NoProfile -Command "Compress-Archive -Path '${deployWin}\\*' -DestinationPath '${zipWin}'"`,
  { stdio: 'inherit' }
)

// 3. Upload deploy.zip to FTP root
console.log('[3/3] Uploading deploy.zip to FTP root...')
const client = new Client()
client.ftp.verbose = false

await client.access({
  host: env.FTP_HOST,
  user: env.FTP_USER,
  password: env.FTP_PASS,
  secure: false,
})

await client.uploadFrom(ZIP_PATH, 'deploy.zip')
console.log('Done! deploy.zip uploaded to FTP root.')
client.close()

// Cleanup local deploy folder and zip
rmSync(DEPLOY_DIR, { recursive: true, force: true })
rmSync(ZIP_PATH)
console.log('Local cleanup done.')
