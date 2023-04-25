import { qs } from './utils.js'


/** @type {(target: HTMLElement, collectionName: string, _id: string, viewMode: 'read' | 'edit') => Promise<void>} */
export async function renderItem(target, collectionName, _id, viewMode = 'read') {
  // console.log(new URL(location.href))
  const item = await fetch(`collection/${collectionName}/${_id}`).then(o => o.json())
  target.innerHTML = renderItemHeader(viewMode, 'el') + `<div id="item-view-container"></div`
  const itemViewContainer =  qs('#item-view-container', 'div')
  if (viewMode === 'read') {
    renderItemViewMode(itemViewContainer, item, 'el')
  }
  if (viewMode === 'edit') {
    renderItemEditMode(itemViewContainer, item, 'el')
  }
  target.querySelectorAll('[data-view-mode]').forEach(a => {
    a.addEventListener('click', () => {
      const viewModeAttr = a.getAttribute('data-view-mode')
      if (!viewModeAttr || (viewModeAttr !== 'read' && viewModeAttr !== 'edit')) throw new Error(`element missing [data-view-mode] atribute`)
      renderItem(target, collectionName, _id, viewModeAttr)
    })
  })
  target.querySelector('[data-lang-selector]')?.addEventListener('change', evt => {
    if (!(evt.target instanceof HTMLSelectElement)) return
    const lang = evt.target.value
    if (viewMode === 'read') {
      renderItemViewMode(itemViewContainer, item, lang)
    }
    if (viewMode === 'edit') {
      renderItemEditMode(itemViewContainer, item, lang)
    }
  })
}



/** @type {(viewMode: 'read' | 'edit', lang: string) => string} */
function renderItemHeader(viewMode, lang) {
  return /*html*/`
    <div class="item-view-header">
      <select name="lang" value="${lang}" data-lang-selector>
        <option>el</option>
        <option>en</option>
      </select>
      ${
        viewMode === 'read'
        ? /*html*/`<a data-view-mode="edit">edit</a>`
        : /*html*/`<a data-view-mode="read">read</a>`
      }
    </div>
  `
}


/** @type {(target: HTMLElement, item: any, lang: string) => void} */
function renderItemViewMode(target, item, lang) {
  const html = /*html*/`
    <div class="item-view" data-id="${item._id}">
      ${Object.entries(item).map(([key, value]) => /*html*/`
        <div class="property-viewer">
          <label>${key}</label>
          <div class="property-value">
          ${propertyViewer(key, value, lang)}
          </div>
        </div>
      `).join('\n')}
    </div>
  `
  target.innerHTML = html
}


/** @type {(target: HTMLElement, item: any, lang: string) => void} */
function renderItemEditMode(target, item, lang) {
  const html = /*html*/`
  <div class="item-view" data-id="${item._id}">
    <form>
      ${Object.entries(item).map(([key, value]) => /*html*/`
        <div class="property-editor">
          ${propertyEditor(key, value, lang)}
        </div>
      `).join('\n')}
    </form>
  </div>
  `
  target.innerHTML = html
}


/** @type {(key: string, value: any, lang: string) => string} */
function propertyViewer(key, value, lang) {
  if (value == null) return ''
  if (typeof value === 'object' && !Array.isArray(value)) {
    if (lang in value) {
      return value[lang]
    } else {
      return JSON.stringify(value)
    }
  }
  return value
}


/** @type {(key: string, value: any, lang: string) => any} */
function propertyEditor(key, value, lang) {
  // console.debug(key, typeof value)
  let html = ''
  if (key.startsWith('_')) html = `${value}`
  if (value == null) {
    html = /*html*/`<input type="text" name="${key}" value="">`
  }
  if (!html && typeof value === 'string') {
    const newLines = [...value].filter(o => o === '\n').length
    if (newLines > 0) {
      html = /*html*/`<textarea name="${key}">${value}</textarea>`
    } else {
      html = /*html*/`<input type="text" name="${key}" value="${value}">`
    }
  }
  if (!html && typeof value === 'object' && !Array.isArray(value)) {
    if (lang in value) {
      html = /*html*/`<input type="text" name="${key}" value="${value[lang]}">`
    } else {
      html = JSON.stringify(value)
    }
  }
  if (!html && typeof value === 'number') {
    html = /*html*/`<input type="number" name="${key}" value="${value}">`
  }
  if (html === '') html = `${value}`
  return /*html*/`<label>${key}</label> ` + html
}