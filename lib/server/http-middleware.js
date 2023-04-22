import * as http from 'node:http'
import * as path from 'node:path'
import { serveStatic } from './static.js'
import { router } from './router.js'
import { getSessionCookie, redirect } from './utils.js'

const __dirname = new URL('.', import.meta.url).pathname


/** @type {http.RequestListener} */
export async function nativaMiddleware(req, res) {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
  let filepath = path.join(__dirname, '../client', url.pathname)
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
