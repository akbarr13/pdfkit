import { Client } from 'basic-ftp'
import { readFileSync } from 'fs'
import path from 'path'

// Load .env.ftp
const envPath = new URL('../.env.ftp', import.meta.url).pathname.replace(/^\//, '')
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => {
      const [k, ...v] = l.split('=')
      return [k.trim(), v.join('=').trim().replace(/^"|"$/g, '')]
    })
)

const LOCAL_DIR = new URL('../.next/standalone', import.meta.url).pathname.replace(/^\//, '')
const REMOTE_PATH = env.FTP_REMOTE_PATH

const client = new Client()
client.ftp.verbose = false

console.log('Connecting to FTP...')
await client.access({
  host: env.FTP_HOST,
  user: env.FTP_USER,
  password: env.FTP_PASS,
  secure: false,
})

console.log(`Uploading to ${REMOTE_PATH} ...`)
await client.ensureDir(REMOTE_PATH)
await client.clearWorkingDir()
await client.uploadFromDir(LOCAL_DIR)

console.log('Done!')
client.close()
