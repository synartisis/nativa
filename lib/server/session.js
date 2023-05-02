import * as http from 'node:http'
import { randomUUID } from 'crypto'
import * as rawdb from 'rawdb/store'
import { getSessionCookie, setSessionCookie } from './utils.js'

/** @typedef {import('../types.js').nativa.Session} nativa.Session */
/** @typedef {import('../types.js').nativa.Request} nativa.Request */


/** @type {nativa.Session[]} */
const sessions = []


/** @type {(req: nativa.Request, res: http.ServerResponse, username: string) => Promise<nativa.Session | undefined>} */
export async function createSession(req, res, username) {
  const storedUser = await getUser(username)
  if (!storedUser) return
  const session = { sessionId: randomUUID(), username, role: storedUser.role }
  sessions.push(session)
  req.session = session
  setSessionCookie(res, `${session.sessionId}; path=/`)
  return session
}


/** @type {(req: nativa.Request) => void} */
export function attachSession(req) {
  const sessionId = getSessionCookie(req)
  if (!sessionId) return
  const session = getSession(sessionId)
  if (!session) return
  req.session = session
}


/** @type {(req: nativa.Request, res: http.ServerResponse) => void} */
export function removeSession(req, res) {
  const sessionIndex = sessions.indexOf(req.session)
  if (sessionIndex > -1) sessions.splice(sessionIndex, 1)
  setSessionCookie(res, '; max-age=0; path=/')
}



/** @type {(sessionId: string) => nativa.Session | undefined} */
function getSession(sessionId) {
  return sessions.find(o => o.sessionId === sessionId)
}


/** @type {(username: string) => Promise<any>} */
async function getUser(username) {
  const storedUserContent = await rawdb.getSecret(username)
  if (!storedUserContent) return
  return JSON.parse(storedUserContent)
}