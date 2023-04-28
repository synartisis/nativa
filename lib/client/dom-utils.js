/** @type {<TagName extends keyof HTMLElementTagNameMap>(tagName: TagName, html: string) => HTMLElementTagNameMap[tagName]} */
export function createFromHTML(tagName, html) {
  if (typeof tagName !== 'string' || typeof html !== 'string') throw new TypeError('bad arguments')
  const host = document.createElement('div')
  host.innerHTML = html
  return ensureTag(tagName, host.querySelector('*'))
}


/** @type {<TagName extends keyof HTMLElementTagNameMap>(tagName: TagName, node: unknown) => node is HTMLElementTagNameMap[TagName]} */
export function isTag(tagName, node) {
  if (typeof tagName !== 'string') throw new TypeError('bad arguments')
  return node instanceof HTMLElement && node.tagName === tagName.toUpperCase()
}


/** @type {<TagName extends keyof HTMLElementTagNameMap>(tagName: TagName, node: unknown) => HTMLElementTagNameMap[TagName]} */
export function ensureTag(tagName, node) {
  if (!isTag(tagName, node)) throw new Error(`node is not a "${tagName}" tag`)
  return node
}

