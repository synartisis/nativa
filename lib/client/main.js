import * as dom from './dom-utils.js'
import { renderItem } from './item-view.js'
import { jsonFetch } from './data-service.js'

/** @typedef {import('rawdb/store').CollectionItem} CollectionItem */

const doc = {
  main: dom.ensureTag('main', document.querySelector('main')),
}


document.addEventListener('collection-selected', async evt => {
  if (!(evt instanceof CustomEvent)) throw new Error('dom error')
  const { collectionName, langs } = evt.detail
  await renderCollection(collectionName, langs)
})


/** @type {(state: any, section: string, itemName: string, itemId: string) => Promise<void>} */
export async function renderMain(state, section, itemName, itemId) {
  if (section === 'collections') {
    if (itemId) {
      await loadAndRenderItem(itemName, itemId, state.langs)
    } else {
      await renderCollection(itemName, state.langs)
    }
  }
  if (section === 'users') {
    if (itemName === 'register') {
      renderUserRegister()
    }
    if (itemName === 'password-reset') {
      renderUserResetPassword()
    }
  }
}



/** @type {(collectionName: string, langs: string[]) => Promise<void>} */
async function renderCollection(collectionName, langs) {
  if (!doc.main) return
  /** @type {CollectionItem[]} */
  const items = await jsonFetch(`api/collections/${collectionName}`)
  const html = /*html*/`
    <div class="item-list">
      ${items.map(item => /*html*/`
        <a class="item" data-id="${item.meta.id}" href="#/collections/${collectionName}/${item.meta.id}">${item.meta.id}</a>
      `).join('\n')}
    </div>
  `
  doc.main.innerHTML = html
  dom.ensureTag('div', doc.main.querySelector('.item-list')).addEventListener('click', async evt => {
    if (!dom.isTag('a', evt.target) || !evt.target.classList.contains('item')) return
    const itemElement = evt.target.closest('.item')
    if (!(itemElement instanceof HTMLElement)) return
    const id = itemElement.dataset.id
    if (!id) return
    await loadAndRenderItem(collectionName, id, langs)
  })
}




/** @type {(collectionName: string, id: string, langs: string[]) => Promise<void>} */
async function loadAndRenderItem(collectionName, id, langs) {
  /** @type {CollectionItem} */
  const item = await jsonFetch(`api/collections/${collectionName}/${id}`)
  if (id) renderItem(doc.main, collectionName, item, langs)
}


function renderUserRegister() {
  doc.main.innerHTML = ''
  const form = dom.createFromHTML('form', /*html*/`
    <form method="post" action="api/user/register" class="user-register-form">
      <div>
        <label>username</label>
        <input type="text" name="username" />
      </div>
      <div>
        <button>register</button>
      </div>
    </form>
  `)
  doc.main.append(form)
  form.addEventListener('submit', async function(evt) {
    evt.preventDefault()
    try {
      const { username, password } = await jsonFetch(this.getAttribute('action') ?? '', {
        method: this.getAttribute('method') ?? 'get',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(this))),
      })
      doc.main.innerHTML = /*html*/`
        <div>
          created user "${username}" with temporary password "${password}"
        </div>
      `
    } catch (error) {
      // @ts-ignore
      alert(error.toString())
    }
  })
}

function renderUserResetPassword() {
  doc.main.innerHTML = ''
  const form = dom.createFromHTML('form', /*html*/`
    <form method="post" action="api/user/password-reset" class="user-password-reset-form">
      <div>
        <label>username</label>
        <input type="text" name="username" />
      </div>
      <div>
        <button>reset password</button>
      </div>
    </form>
  `)
  doc.main.append(form)
  form.addEventListener('submit', async function(evt) {
    evt.preventDefault()
    try {
      const { username, password } = await jsonFetch(this.getAttribute('action') ?? '', {
        method: this.getAttribute('method') ?? 'get',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(this))),
      })
      doc.main.innerHTML = /*html*/`
        <div>
          user "${username}" has now the temporary password "${password}"
        </div>
        <div>
          temporary password must be changed upon first login
        </div>
      `
    } catch (error) {
      // @ts-ignore
      alert(error.toString())
    }
  })}

