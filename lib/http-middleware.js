import * as http from 'node:http'
import * as path from 'node:path'
import * as fs from 'node:fs'

const SESSION_COOKIE_NAME = 'nativa_session'
const __dirname = new URL('.', import.meta.url).pathname


/** @type {http.RequestListener} */
export async function nativaMiddleware(req, res) {

  let filepath = path.join(__dirname, 'static', req.url?.split('?')[0].split('#')[0] ?? '')
  if (filepath?.endsWith('/')) filepath += 'index.html'
  const session = getSessionCookie(req)
  // console.debug('-', req.method, req.url, {filepath, session})
  if (!session && !filepath.includes('/auth/')) return redirect(res, 'auth/')
  // console.log('authorized')
  // res.setHeader('set-cookie', 'nativa_session=test value;')
  if (filepath) {
    try {
      await serveStatic(res, filepath)
    } catch (error) {}
  }
  if (!res.closed && req.url) {
    await router(req, res)
  }
  // res.setHeader('set-cookie', 'test=test value;')
  // console.log('nativa section', req.url)
  // res.end('<a href="/admin/">nativa</a>')
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
    setSessionCookie(res, 'testing login; path=/')
    console.debug('logged in', req.url)
    return redirect(res, '../')
  }
  if (req.url === '/auth/logout' && req.method === 'GET') {
    setSessionCookie(res, '; max-age=0; path=/')
    console.debug('logged out')
    return redirect(res, '.')
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