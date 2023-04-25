import * as http from 'node:http'
import * as rawdb from 'rawdb'
import { readRequestBody, setSessionCookie, redirect, hashText, env } from './utils.js'
import { getState } from './state.js'


/** @type {http.RequestListener} */
export async function router(req, res) {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
  // console.debug('router', req.url, url)
  if (url.pathname === '/state') {
    const state = getState()
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify(state))
    return
  }
  if (url.pathname === '/auth/login' && req.method === 'POST') {
    const body = await readRequestBody(req)
    const { username, password } = JSON.parse(body.toString())
    if (await checkUsernamePassword(username, password)) {
      setSessionCookie(res, 'testing login; path=/')
      // console.debug('logged in')
      return redirect(res, '../')
    } else {
      res.statusCode = 401
      res.end(JSON.stringify({ message: 'wrong username or password' }))
      return
    }
  }
  if (url.pathname === '/auth/logout' && req.method === 'GET') {
    setSessionCookie(res, '; max-age=0; path=/')
    // console.debug('logged out')
    return redirect(res, '.')
  }
  if (env === 'development') {
    if (url.pathname === '/auth/register' && req.method === 'GET') {
      rawdb.setSecret('dev', hashText('dev'))
      res.end('done')
      return
    }
  }
  if (url.pathname === '/collection-list' && req.method === 'GET') {
    const collectionList = rawdb.getCollectionList()
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify(collectionList))
    return
  }
  if (url.pathname.startsWith('/collection/') && req.method === 'GET') {
    const [ , base, collectionName, _id ] = url.pathname.split('/')
    // console.debug({base, collectionName, _id})
    if (!collectionName) { res.statusCode = 404; res.end(); return }
    res.setHeader('content-type', 'application/json')
    if (!_id) {
      const collection = rawdb.getCollection(collectionName)
      if (!collection) { res.statusCode = 404; res.end(); return }
      res.end(JSON.stringify(collection.items))
    } else {
      const item = await rawdb.getItem(collectionName, _id)
      res.end(JSON.stringify(item))
    }
    return
  }
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
