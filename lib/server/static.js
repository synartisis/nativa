import * as http from 'node:http'
import * as fs from 'node:fs'


/** @type {(res: http.OutgoingMessage, filename: string) => Promise<void>} */
export async function serveStatic(res, filename) {
  const ext = filename?.split('.').pop() ?? ''
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filename)
    res.setHeader('content-type', getContentType(ext))
    stream.pipe(res)
    stream.on('end', resolve)
    stream.on('error', reject)
  })
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
