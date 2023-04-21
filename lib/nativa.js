import * as http from 'node:http'


/** @type {(rootUrl: string) => http.RequestListener} */
export function nativa(rootUrl) {
  return (req, res) => {
    if (req.url?.startsWith(rootUrl)) {
      console.log('nativa section', req.url)
    }
  }
}