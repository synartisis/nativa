
/** @type {(input: RequestInfo | URL, init?: any) => Promise<any>} */
export async function jsonFetch(input, init) {
  if (!init) init = { headers: {} }
  if (!init.headers) init.headers = {}
  if (!Object.keys(init.headers).find(k => k.toLowerCase() === 'content-type')) {
    init.headers['content-type'] = 'application/json'
  }
  const response = await fetch(input, init)
  if (response.redirected) {
    const locationHeader = response.headers.get('location')
    if (locationHeader) location.href = locationHeader
  }
  if (!response.ok) throw new Error(response.statusText)
  const json = await response.json()
  return json
}