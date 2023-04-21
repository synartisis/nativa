
const dom = {
  main: document.querySelector('main'),
  collections: document.querySelector('#collections'),
}

/** @type {string[]} */
const collectionList = await fetch('collection-list').then(o => o.json())
if (dom.collections) {
  dom.collections.innerHTML = /*html*/`
    <ul>
      ${collectionList.map(collection => /*html*/`<li><a href="#${collection}">${collection}</a></li>`).join('\n')}
    </ul>
  `
  dom.collections.addEventListener('click', async evt => {
    if (!(evt.target instanceof HTMLAnchorElement)) return
    const pageName = evt.target.getAttribute('href')
    if (!pageName) return
    await loadPage(pageName)
  })
}
console.log({collectionList})


/** @type {(pageName: string) => Promise<void>} */
async function loadPage(pageName) {
  if (dom.main) {
    dom.main.textContent = pageName.replace('#', '')
  }
}