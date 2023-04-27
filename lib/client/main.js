import { qs } from './utils.js'
import { renderItem } from './item-view.js'

/** @typedef {import('rawdb/store').CollectionItem} CollectionItem */

const dom = {
  main: qs('main'),
  collections: qs('#collections', 'div'),
}
const state = await fetch('state').then(o => o.json())


/** @type {string[]} */
const collectionNames = await fetch('collection-list').then(o => o.json())
dom.collections.innerHTML = /*html*/`
  <ul>
    ${collectionNames.map(collectionName => /*html*/`
      <li><a href="#/${collectionName}" data-type="collection" data-collection="${collectionName}">${collectionName}</a></li>
    `).join('\n')}
  </ul>
`
dom.collections.addEventListener('click', async evt => {
  if (!(evt.target instanceof HTMLAnchorElement)) return
  const type = evt.target.getAttribute('data-type')
  if (type === 'collection') {
    const collectionName = evt.target.getAttribute('data-collection')
    if (!collectionName) return
    await renderCollection(collectionName)
  }
})


/** @type {(collectionName: string) => Promise<void>} */
async function renderCollection(collectionName) {
  if (!dom.main) return
  /** @type {CollectionItem[]} */
  const items = await fetch(`collection/${collectionName}`).then(o => o.json())
  const html = /*html*/`
    <div class="item-list">
      ${items.map(item => /*html*/`
        <a class="item" data-id="${item.meta.id}" href="#/${collectionName}/${item.meta.id}">${item.meta.id}</a>
      `).join('\n')}
    </div>
  `
  dom.main.innerHTML = html
  qs('.item-list', 'div', dom.main).addEventListener('click', async evt => {
    if (!(evt.target instanceof HTMLElement)) return
    const itemElement = evt.target.closest('.item')
    if (!(itemElement instanceof HTMLElement)) return
    const _id = itemElement.getAttribute('data-id')
    if (!_id) return
    /** @type {CollectionItem} */
    const item = await fetch(`collection/${collectionName}/${_id}`).then(o => o.json())
    if (_id) renderItem(dom.main, collectionName, item, state.langs)
  })
}

