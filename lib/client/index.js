import { renderMain } from './main.js'
import { renderNav } from './nav.js'

/** @typedef {import('rawdb/store').CollectionItem} CollectionItem */

const state = await fetch('state').then(o => o.json())

async function loadPageState() {
  const [ hash, section, itemName, itemId ] = new URL(location.href).hash.split('/')
  await renderNav(state, section, itemName)
  await renderMain(state, section, itemName, itemId)
}

loadPageState()
window.addEventListener("popstate", loadPageState)
