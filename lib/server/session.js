import * as http from 'node:http'
import { randomUUID } from 'crypto'
import * as rawdb from 'rawdb/store'
import { getSessionCookie } from './utils.js'

/** @typedef {{ sessionId: string, username: string, role: string }} Session */

/** @type {Session[]} */
const sessions = []


/** @type {(username: string) => Promise<Session | undefined>} */
export async function createSession(username) {
  const storedUser = await getUser(username)
  if (!storedUser) return
  const session = { sessionId: randomUUID(), username, role: storedUser.role }
  sessions.push(session)
  return session
}


/** @type {(sessionId: string) => Session | undefined} */
export function getSession(sessionId) {
  return sessions.find(o => o.sessionId === sessionId)
}


/** @type {(req: http.IncomingMessage) => void} */
export function attachSession(req) {
  const sessionId = getSessionCookie(req)
  if (!sessionId) return
  const session = getSession(sessionId)
  // console.log({sessionId,session})
  if (!session) return
  Object.assign(req, session)
}


/** @type {(username: string) => Promise<any>} */
async function getUser(username) {
  const storedUserContent = await rawdb.getSecret(username)
  if (!storedUserContent) return
  return JSON.parse(storedUserContent)
}