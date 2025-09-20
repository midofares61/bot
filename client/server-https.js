const { createServer } = require('https')
const { readFileSync, existsSync } = require('fs')
const path = require('path')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const PORT = parseInt(process.env.PORT || '3000', 10)

function getCert(fileEnv, fallback) {
  const p = process.env[fileEnv] || path.join(process.cwd(), 'certs', fallback)
  if (!existsSync(p)) {
    throw new Error(`SSL file not found: ${p}. Set ${fileEnv} or place it under client/certs/`)
  }
  return readFileSync(p)
}

app.prepare().then(() => {
  let options = {}

  // Prefer PFX if provided (common on Windows)
  if (process.env.SSL_PFX_PATH) {
    const pfxPath = process.env.SSL_PFX_PATH
    if (!existsSync(pfxPath)) {
      throw new Error(`SSL_PFX_PATH not found: ${pfxPath}`)
    }
    options.pfx = readFileSync(pfxPath)
    if (process.env.SSL_PFX_PASSPHRASE) {
      options.passphrase = process.env.SSL_PFX_PASSPHRASE
    }
  } else {
    // Use PEM key/cert pair
    options.key = getCert('SSL_KEY_PATH', 'privkey.pem')
    options.cert = getCert('SSL_CERT_PATH', 'fullchain.pem')
  }

  createServer(options, (req, res) => handle(req, res)).listen(PORT, (err) => {
    if (err) throw err
    console.log(`🔐 Next.js HTTPS dev server ready on https://localhost:${PORT}`)
  })
}).catch((err) => {
  console.error('Failed to start HTTPS dev server:', err)
  console.error('Hint: For Windows .pfx, set SSL_PFX_PATH and SSL_PFX_PASSPHRASE env vars.')
  process.exit(1)
})


