import * as rawdb from 'rawdb'
import { nativaMiddleware } from './server/http-middleware.js'
import { redirect } from './server/utils.js'
import { setState } from './server/state.js'

/** @typedef {import('./types.js').Config} Config */

/** @type {Config} */
const configuration = {
  rootDir: '',
  adminUrl: '/admin/',
  languages: [],
}
let initialized = false

/**
 * nativa configuration and loading
 * must run before start using nativa
 * @param {Config} config configuration settings
 * @example nativa.config({ rootDir: 'my_content/', adminUrl: '/admin/', languages: ['en', 'fr'] })
 */
export async function config({ rootDir, adminUrl = '/admin/', languages = [] }) {
  if (typeof rootDir !== 'string') throw new TypeError(`nativa configuration error: "rootDir" is required`)
  configuration.rootDir = rootDir
  if (typeof adminUrl === 'string') configuration.adminUrl = adminUrl
  if (Array.isArray(languages)) configuration.languages = languages
  await rawdb.config({ rootDir })
  initialized = true
}


/**
 * nativa http middleware
 * 
 * - attaches rawdb data on http.ServerResponse.locals for use in UI databinding
 * - enables nativa admin section
 * @returns {(req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse & { locals: string }) => void}
 * @example server.use(nativa.middleware())
 * */
export function middleware() {
  if (!initialized) throw new Error(`nativa error: nativa is not initialized`)
  setState({ langs: configuration.languages })
  return (req, res) => {
    if (!req.url || !configuration.adminUrl) return
    rawdb.middleware()(req, res)
    if (req.url === configuration.adminUrl && !configuration.adminUrl.endsWith('/')) return redirect(res, req.url + '/')
    if (req.url.startsWith(configuration.adminUrl)) {
      req.url = req.url.replace(configuration.adminUrl, '')
      return nativaMiddleware(req, res)
    }
  }
}
