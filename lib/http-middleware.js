import * as http from 'node:http'
import * as fs from 'node:fs'

const __dirname = new URL('.', import.meta.url).pathname


/** @type {(rootUrl: string) => Promise<http.RequestListener>} */
export async function nativaMiddleware(rootUrl) {
  return async (req, res) => {
    if (!(req.url + '/').startsWith(rootUrl)) return
    let filename = req.url?.split('?')[0].split('#')[0].replace(rootUrl, __dirname + 'static/')
    if (filename?.endsWith('/')) filename += 'index.html'
    // console.log(1, rootUrl, req.url, filename)
    if (filename) {
      try {
        await serveStatic(res, filename)
      } catch (error) {}
    }
    if (!res.closed) {
      await router(res, '/' + req.url?.replace(rootUrl, ''))
    }
    // res.setHeader('set-cookie', 'test=test value;')
    // console.log('nativa section', req.url)
    // res.end('<a href="/admin/">nativa</a>')
  }
}


/** @type {(res: http.OutgoingMessage, filename: string) => Promise<void>} */
async function serveStatic(res, filename) {
  const ext = filename?.split('.').pop() ?? ''
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filename)
    res.setHeader('content-type', getContentType(ext))
    stream.pipe(res)
    stream.on('end', () => resolve())
    stream.on('error', (err) => {
      reject(err)
    })
  })
}


/** @type {(res: http.OutgoingMessage, url: string) => Promise<void>} */
async function router(res, url) {
  console.log('router', url)
  if (url === '/test') {
    res.end('testing router')
  }
}



/** @type {(ext: string) => string} */
function getContentType(ext) {
  switch (ext) {
    case 'css':
      return 'text/css'
    case 'js':
      return 'application/javascript'
    case 'jpg':
    case 'png':
      return `image/${ext}`
    default:
      return 'text/html'
  }
}