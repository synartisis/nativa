/** 
 * @template {keyof HTMLElementTagNameMap} TagName 
 * 
 * @overload
 * @param {string} selectors
 * @param {TagName} tagName
 * @param {ParentNode} [parent]
 * @return {HTMLElementTagNameMap[TagName]}
 * 
 * @overload
 * @param {string} selectors
 * @param {undefined} [tagName]
 * @param {ParentNode} [parent]
 * @return {HTMLElement}
 * 
 * @param {string} selectors
 * @param {TagName} [tagName]
 * @param {ParentNode} [parent]
 */
export function qs(selectors, tagName = undefined, parent = document) {
  const el = parent.querySelector(selectors)
  if (
    !(el instanceof HTMLElement) ||
    (!!tagName && el.tagName !== tagName.toUpperCase())
  ) throw new Error(`bad selectors "${selectors}"`)
  return el
}



/** 
 * @template {keyof HTMLElementTagNameMap} TagName 
 * 
 * @overload
 * @param {string} selectors
 * @param {TagName} tagName
 * @param {ParentNode} [parent]
 * @return {NodeListOf<HTMLElementTagNameMap[TagName]>}
 * 
 * @overload
 * @param {string} selectors
 * @param {undefined} [tagName]
 * @param {ParentNode} [parent]
 * @return {NodeListOf<HTMLElement>}
 * 
 * @param {string} selectors
 * @param {TagName} [tagName]
 * @param {ParentNode} [parent]
 */
export function qsa(selectors, tagName = undefined, parent = document) {
  const elements = parent.querySelectorAll(selectors)
  if (!!tagName) {
    for (const el of elements) {
      if (el.tagName !== tagName.toUpperCase()) throw new Error(`bad selectors "${selectors}"`)
    }
  }
  return elements
}
