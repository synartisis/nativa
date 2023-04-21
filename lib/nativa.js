import * as http from 'node:http'
import { nativaMiddleware } from './http-middleware.js'


/** @type {(rootUrl: string) => Promise<http.RequestListener>} */
export async function nativa(rootUrl) {
  if (typeof rootUrl !== 'string') throw new TypeError(`nativa error: rootUrl is required and must be a string`)
  if (!rootUrl.endsWith('/')) rootUrl += '/'
  return nativaMiddleware(rootUrl)
}