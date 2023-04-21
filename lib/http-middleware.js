import * as http from 'node:http'
import * as path from 'node:path'
import * as fs from 'node:fs'
import * as crypto from 'node:crypto'
import * as rawdb from 'rawdb'

const SESSION_COOKIE_NAME = 'nativa_session'
const __dirname = new URL('.', import.meta.url).pathname
const env = process.env.NODE_ENV === 'production' ? 'production' : 'development'
const NATIVA_SECRET_KEY = env === 'development' ? 'DEV_KEY' : process.env.NATIVA_SECRET_KEY


/** @type {http.RequestListener} */
export async function nativaMiddleware(req, res) {

  let filepath = path.join(__dirname, 'static', req.url?.split('?')[0].split('#')[0] ?? '')
  if (filepath?.endsWith('/')) filepath += 'index.html'
  const session = getSessionCookie(req)
  // console.debug('-', req.method, req.url, {filepath, session})
  if (!session && !filepath.includes('/auth/')) return redirect(res, 'auth/')
  if (filepath) {
    try {
      await serveStatic(res, filepath)
    } catch (error) {}
  }
  if (!res.closed && req.url) {
    await router(req, res)
  }
}


/** @type {(res: http.OutgoingMessage, filename: string) => Promise<void>} */
async function serveStatic(res, filename) {
  const ext = filename?.split('.').pop() ?? ''
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filename)
    res.setHeader('content-type', getContentType(ext))
    stream.pipe(res)
    stream.on('end', resolve)
    stream.on('error', reject)
  })
}


/** @type {http.RequestListener} */
async function router(req, res) {
  // console.debug('router', req.url)
  if (req.url === '/auth/login' && req.method === 'POST') {
    const body = await readRequestBody(req)
    const { username, password } = JSON.parse(body.toString())
    if (await checkUsernamePassword(username, password)) {
      setSessionCookie(res, 'testing login; path=/')
      console.debug('logged in', req.url)
      return redirect(res, '../')
    } else {
      res.statusCode = 401
      res.end(JSON.stringify({ message: 'wrong username or password' }))
      return
    }
  }
  if (req.url === '/auth/logout' && req.method === 'GET') {
    setSessionCookie(res, '; max-age=0; path=/')
    console.debug('logged out')
    return redirect(res, '.')
  }
  if (env === 'development') {
    if (req.url === '/auth/register' && req.method === 'GET') {
      rawdb.setSecret('dev', hashText('dev'))
      res.end('done')
      return
    }
  }
  if (req.url === '/collection-list' && req.method === 'GET') {
    const collectionList = rawdb.getCollectionList()
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify(collectionList))
    return
  }
}



/** @type {(ext: string) => string} */
function getContentType(ext) {
  switch (ext) {
    case 'css':
      return 'text/css'
    case 'js':
      return 'application/javascript'
    case 'jpg':
    case 'png':
      return `image/${ext}`
    default:
      return 'text/html'
  }
}


/** @type {(req: http.IncomingMessage) => string | undefined} */
function getSessionCookie(req) {
  if (!req.headers['cookie']) return 
  const cookies = req.headers['cookie'].split(';').map(o => o.trim().split('='))
  for (const [cookieName, cookieValue] of cookies) {
    if (cookieName === SESSION_COOKIE_NAME) {
      return cookieValue
    }
  }
}


/** @type {(res: http.ServerResponse, value: string) => void} */
function setSessionCookie(res, value) {
  res.setHeader('set-cookie', `${SESSION_COOKIE_NAME}=${value}`)
}


/** @type {(res: http.ServerResponse, url: string) => void} */
export function redirect(res, url) {
  res.statusCode = 302
  res.setHeader('location', url)
  res.end()
}


/** @type {(req: http.IncomingMessage) => Promise<Buffer>} */
async function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    /** @type {any} */
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', err => reject(err))
  })
}


/** @type {(username: string, password: string) => Promise<boolean> } */
async function checkUsernamePassword(username, password) {
  const storedPassword = await rawdb.getSecret(username)
  const encryptedPassword = hashText(password)
  if (encryptedPassword === storedPassword) {
    return true
  } else {
    return false
  }
}

/** @type {(text: string) => string} */
function hashText(text) {
  if (!NATIVA_SECRET_KEY) throw new Error('Cannot hashText: NATIVA_SECRET_KEY is not defined')
  const hash = crypto.createHmac('sha256', NATIVA_SECRET_KEY).update(text).digest('hex')
  return hash
}