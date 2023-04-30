import * as http from 'node:http'
import * as rawdb from 'rawdb/store'
import { readRequestBody, setSessionCookie, redirect, hashText, env } from './utils.js'
import { getState } from './state.js'
import * as sessions from './session.js'


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
    const { username, password, newPassword, confirmPassword } = JSON.parse(body.toString())
    if (!!newPassword && newPassword !== confirmPassword) {
      res.statusCode = 400
      res.end(JSON.stringify({ message: '"confirm password" is not the same as "new password"' }))
      return
    }
    const checkPasswordResult = await checkUsernamePassword(username, password, newPassword)
    switch (checkPasswordResult) {
      case 'ok':
        setSessionCookie(res, 'testing login; path=/')
        // console.debug('logged in')
        return redirect(res, '../')
      case 'wrong':
        res.statusCode = 401
        res.end(JSON.stringify({ message: 'wrong username or password' }))
        return
      case 'temp_pwd':
        res.end(JSON.stringify({ message: 'temp_pwd' }))
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
      const DEV_USERNAME = 'dev'
      const DEV_PASSWORD = 'dev'
      rawdb.setSecret(DEV_USERNAME, JSON.stringify({ role: 'user', pwd: hashText(DEV_PASSWORD) }))
      res.end('done')
      return
    }
  }
  if (url.pathname === '/api/user/register' && req.method === 'POST') {
    const body = await readRequestBody(req)
    const { username } = JSON.parse(body.toString())
    if (!username) { res.writeHead(400, 'username is required'); res.end(); return }
    const existing = await rawdb.getSecret(username)
    if (existing) { res.writeHead(400, 'user already exists'); res.end(); return }
    const password = username
    // const password = Math.trunc(Math.random() * 10^6).toString()
    rawdb.setSecret(username, JSON.stringify({ role: 'user', pwd: hashText(password) }))
    res.end(JSON.stringify({ username, password }))
    return
  }
  if (url.pathname === '/api/user/password-reset' && req.method === 'POST') {
    const body = await readRequestBody(req)
    const { username } = JSON.parse(body.toString())
    if (!username) { res.writeHead(400, 'username is required'); res.end(); return }
    const user = await rawdb.getSecret(username)
    if (!user) { res.writeHead(400, 'user not found'); res.end(); return }
    const password = username
    // const password = Math.trunc(Math.random() * 10^6).toString()
    rawdb.setSecret(username, JSON.stringify({ role: 'user', pwd: 'TEMP_' + hashText(password) }))
    res.end(JSON.stringify({ username, password }))
    return
  }
  if (url.pathname === '/api/collections' && req.method === 'GET') {
    const collectionNames = rawdb.getCollectionNames()
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify(collectionNames))
    return
  }
  if (url.pathname.startsWith('/api/collections/') && req.method === 'GET') {
    const [ , base, section, collectionName, id ] = url.pathname.split('/')
    // console.debug({base, collectionName, id})
    if (!collectionName) { res.statusCode = 404; res.end(); return }
    res.setHeader('content-type', 'application/json')
    if (!id) {
      const collection = rawdb.getCollection(collectionName)
      if (!collection) { res.statusCode = 404; res.end(); return }
      res.end(JSON.stringify(collection.items))
    } else {
      const item = await rawdb.getItem(collectionName, id, true)
      res.end(JSON.stringify(item))
    }
    return
  }
  if (url.pathname.startsWith('/api/collections/') && req.method === 'POST') {
    const [ , base, section, collectionName, id ] = url.pathname.split('/')
    if (!id) { res.statusCode = 404; res.end(); return }
    const body = await readRequestBody(req)
    const changes = JSON.parse(body.toString())
    try {
      await rawdb.applyChanges(collectionName, id, changes)
      const modifiedItem = await rawdb.getItem(collectionName, id, true)
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify(modifiedItem))
    } catch (error) {
      console.error(error)
      res.statusCode = 500
      res.end()
    }
    return
  }
}




/** @type {(username: string, password: string, newPassword: string) => Promise<'ok' | 'wrong' | 'temp_pwd'> } */
async function checkUsernamePassword(username, password, newPassword) {
  const storedUserContent = await rawdb.getSecret(username)
  if (!storedUserContent) return 'wrong'
  const encryptedPassword = hashText(password)
  const storedUser = JSON.parse(storedUserContent)
  if (storedUser.pwd.startsWith('TEMP_')) {
    if (encryptedPassword === storedUser.pwd.replace('TEMP_', '')) {
      if (!newPassword) {
        return 'temp_pwd'
      } else {
        rawdb.setSecret(username, JSON.stringify(Object.assign(storedUser, { pwd: hashText(newPassword) })))
        return 'ok'
      }
    } else {
      return 'wrong'
    }
  } else {
    if (encryptedPassword === storedUser.pwd) {
      return 'ok'
    } else {
      return 'wrong'
    }
  }
}
