import { ensureTag, isTag } from './dom-utils.js'
import { renderItem } from './item-view.js'

/** @typedef {import('rawdb/store').CollectionItem} CollectionItem */

const dom = {
  main: ensureTag('main', document.querySelector('main')),
  collections: ensureTag('div', document.querySelector('#collections')),
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
  ensureTag('div', dom.main.querySelector('.item-list')).addEventListener('click', async evt => {
    if (!isTag('a', evt.target) || !evt.target.classList.contains('item')) return
    const itemElement = evt.target.closest('.item')
    if (!(itemElement instanceof HTMLElement)) return
    const id = itemElement.dataset.id
    if (!id) return
    /** @type {CollectionItem} */
    const item = await fetch(`collection/${collectionName}/${id}`).then(o => o.json())
    if (id) renderItem(dom.main, collectionName, item, state.langs)
  })
}

