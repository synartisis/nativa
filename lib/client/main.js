export {}

const dom = {
  main: document.querySelector('main'),
  collections: document.querySelector('#collections'),
}

/** @type {string[]} */
const collectionList = await fetch('collection-list').then(o => o.json())
if (dom.collections) {
  dom.collections.innerHTML = /*html*/`
    <ul>
      ${collectionList.map(collectionName => /*html*/`
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
}


/** @type {(collectionName: string) => Promise<void>} */
async function renderCollection(collectionName) {
  if (!dom.main) return
  /** @type {any[]} */
  const items = await fetch(`collection/${collectionName}`).then(o => o.json())
  const html = /*html*/`
    <div class="item-list">
      ${items.map(item => /*html*/`
        <a class="item" data-id="${item._id}" href="#/${collectionName}/${item._id}">${item._id}</a>
      `).join('\n')}
    </div>
  `
  dom.main.innerHTML = html
  dom.main.querySelector('.item-list')?.addEventListener('click', evt => {
    if (!(evt.target instanceof HTMLElement)) return
    const itemElement = evt.target.closest('.item')
    if (!(itemElement instanceof HTMLElement)) return
    const _id = itemElement.getAttribute('data-id')
    if (_id) renderItem(collectionName, _id)
  })
}


/** @type {(collectionName: string, _id: string) => Promise<void>} */
async function renderItem(collectionName, _id) {
  if (!dom.main) return
  const item = await fetch(`collection/${collectionName}/${_id}`).then(o => o.json())
  const html = /*html*/`
    <div class="item-view" data-id="${item._id}">
      ${Object.entries(item).map(([key, value]) => /*html*/`
        <div>
          ${key}: ${value}
        </div>
      `).join('\n')}
    </div>
  `
  dom.main.innerHTML = html
}