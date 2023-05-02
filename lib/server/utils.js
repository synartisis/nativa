import * as http from 'node:http'
import * as crypto from 'node:crypto'

export const env = process.env.NODE_ENV === 'production' ? 'production' : 'development'
const SESSION_COOKIE_NAME = 'nativa_session'
const NATIVA_SECRET_KEY = env === 'development' ? 'DEV_KEY' : process.env.NATIVA_SECRET_KEY


/** @type {(req: http.IncomingMessage) => Promise<Buffer>} */
export async function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    /** @type {any} */
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', err => reject(err))
  })
}



/** @type {(req: http.IncomingMessage) => string | undefined} */
export function getSessionCookie(req) {
  if (!req.headers['cookie']) return 
  const cookies = req.headers['cookie'].split(';').map(o => o.trim().split('='))
  for (const [cookieName, cookieValue] of cookies) {
    if (cookieName === SESSION_COOKIE_NAME) {
      return cookieValue
    }
  }
}


/** @type {(res: http.ServerResponse, value: string) => void} */
export function setSessionCookie(res, value) {
  res.setHeader('set-cookie', `${SESSION_COOKIE_NAME}=${value}`)
}


/** @type {(res: http.ServerResponse, url: string) => void} */
export function redirect(res, url) {
  res.statusCode = 302
  res.setHeader('location', url)
  res.end()
}



/** @type {(text: string) => string} */
export function hashText(text) {
  if (!NATIVA_SECRET_KEY) throw new Error('Cannot hashText: NATIVA_SECRET_KEY is not defined')
  const hash = crypto.createHmac('sha256', NATIVA_SECRET_KEY).update(text).digest('hex')
  return hash
}


/** @type {(url: string) => string} */
export function ensureSlashEnding(url) {
  if (typeof url !== 'string') return '/'
  if (url.endsWith('/')) return url
  return url + '/'
}