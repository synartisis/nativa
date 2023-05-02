import * as path from 'node:path'
import { serveStatic } from './static.js'
import { router } from './router.js'
import { redirect } from './utils.js'
import * as sessions from './session.js'

/** @typedef {import('../types.js').nativa.RequestListener} nativa.RequestListener */

const __dirname = new URL('.', import.meta.url).pathname


/** @type {nativa.RequestListener} */
export async function nativaMiddleware(req, res) {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
  let filepath = path.join(__dirname, '../client', url.pathname)
  if (filepath.includes('/api/auth/')) return redirect(res, '../../auth/')
  if (filepath?.endsWith('/')) filepath += 'index.html'
  sessions.attachSession(req)
  // console.debug('-', req.method, req.url, {filepath, session})
  if (!req.session && !filepath.includes('/auth/')) return redirect(res, 'auth/')
  if (filepath) {
    try {
      await serveStatic(res, filepath)
    } catch (error) {}
  }
  if (!res.closed && req.url) {
    await router(req, res)
  }
}
