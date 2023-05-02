import * as dom from './dom-utils.js'

/** @typedef {import('rawdb/store').CollectionItem} CollectionItem */

const doc = {
  nav: dom.ensureTag('nav', document.querySelector('nav')),
  collections: dom.ensureTag('div', document.querySelector('#collections')),
}


/** @type {(state: any, section: string, itemName: string) => Promise<void>} */
export async function renderNav(state, section, itemName) {
  const selectedCollectionName = section === 'collections' ? itemName : ''
  await renderCollectionList(selectedCollectionName, state.langs)
  if (state.role) {
    document.querySelectorAll('[data-roles]').forEach(el => {
      if (!el.getAttribute('data-roles')?.includes(state.role)) {
        el.setAttribute('hidden', '')
      }
    })
  }
}


/** @type {(selectedCollectionName: string, langs: string[]) => Promise<void>} */
async function renderCollectionList(selectedCollectionName, langs) {
  /** @type {string[]} */
  const collectionNames = await fetch('api/collections').then(o => o.json())
  doc.collections.innerHTML = /*html*/`
    <ul>
      ${collectionNames.map(collectionName => /*html*/`
        <li ${selectedCollectionName === collectionName ? `class="selected"` : ''}>
          <a href="#/collections/${collectionName}" data-type="collection" data-collection="${collectionName}">${collectionName}</a>
        </li>
      `).join('\n')}
    </ul>
  `
  doc.collections.addEventListener('click', async evt => {
    if (!(evt.target instanceof HTMLAnchorElement)) return
    const type = evt.target.getAttribute('data-type')
    if (type === 'collection') {
      const collectionName = evt.target.getAttribute('data-collection')
      if (!collectionName) return
      doc.collections.dispatchEvent(new CustomEvent('collection-selected', { bubbles: true, detail: { collectionName, langs } }))
    }
  })
}

