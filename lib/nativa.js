import * as http from 'node:http'
import { nativaMiddleware, redirect } from './http-middleware.js'


/** @type {(rootUrl: string) => http.RequestListener} */
export function nativa(rootUrl) {
  if (typeof rootUrl !== 'string') throw new TypeError(`nativa error: rootUrl is required and must be a string`)
  return (req, res) => {
    if (!req.url) return
    if (req.url === rootUrl && !rootUrl.endsWith('/')) return redirect(res, req.url + '/')
    if (req.url.startsWith(rootUrl)) {
      req.url = req.url.replace(rootUrl, '')
      return nativaMiddleware(req, res)
    }
  }
}