import { qs, createFromHTML } from './utils.js'

/** @typedef {import('rawdb/store').CollectionItem} CollectionItem */


/** @type {(target: HTMLElement, collectionName: string, item: CollectionItem, langs?: string[]) => Promise<void>} */
export async function renderItem(target, collectionName, item, langs = ['en']) {
  // console.log(new URL(location.href))
  target.innerHTML = ''
  const langSelector = createFromHTML('select', /*html*/`
    <select name="lang" value="${langs[0]}" data-lang-selector>
      ${langs.map(l => /*html*/`
        <option value="${l}">${l}</option>
      `).join('\n')}
    </select>
  `)
  const modeSelector = createFromHTML('div', /*html*/`
    <div class="view-mode">
      <a data-action="edit">edit</a>
      <a data-action="save">save</a> <a data-action="cancel">cancel</a>
    </div>
  `)
  const itemViewHeader = createFromHTML('div', /*html*/`
    <div class="item-view-header" data-view-mode="read"></div>
  `)
  itemViewHeader.append(langSelector, modeSelector)
  const itemViewContainer = createFromHTML('div', /*html*/`<div id="item-view-container"></div>`)
  const itemView = createFromHTML('div', renderItemViewMode(item, langs[0]))
  itemViewContainer.append(itemViewHeader, itemView)
  target.append(itemViewHeader, itemViewContainer)
  setLanguageStyles(langs[0])

  modeSelector.querySelectorAll('a[data-action]').forEach(a => {
    a.addEventListener('click', async () => {
      const actionAttr = a.getAttribute('data-action')
      if (!actionAttr || (actionAttr !== 'edit' && actionAttr !== 'save' && actionAttr !== 'cancel')) throw new Error(`element missing [data-action] atribute`)
      if (actionAttr === 'save') {
        const { status, message, newItem } = await saveChanges(collectionName, item)
        if (status === 'error') alert(message)
        renderItem(target, collectionName, newItem, langs)
      }
      const viewMode = actionAttr === 'edit' ? 'edit' : 'read'
      langSelector.disabled = viewMode === 'edit'
      if (viewMode === 'edit') {
        itemViewHeader.dataset.viewMode = 'edit'
        itemView.innerHTML = renderItemEditMode(item, langSelector.value)
        // on textareas set values with .textContent because it keeps spaces
        itemView.querySelectorAll('textarea').forEach(textarea => {
          if (textarea.name !== 'bodySource') {
            textarea.textContent = item[textarea.name]
          } else {
            textarea.textContent = item.meta.bodySource
          }
        })
      } else {
        itemViewHeader.dataset.viewMode = 'read'
        itemView.innerHTML = renderItemViewMode(item, langSelector.value)
      }
    })
  })
  langSelector.addEventListener('change', evt => {
    if (!(evt.target instanceof HTMLSelectElement)) return
    const lang = evt.target.value
    if (!lang) return
    itemViewHeader.dataset.viewMode = 'read'
    langSelector.disabled = false
    itemView.innerHTML = renderItemViewMode(item, langSelector.value)
    setLanguageStyles(lang)
  })
}



/** @type {(item: CollectionItem, lang: string) => string} */
function renderItemViewMode(item, lang) {
  const { meta, ...data } = item
  const html = /*html*/`
    <div class="item-view" data-id="${meta.id}">
      ${Object.entries(data).filter(([key, value]) => !meta.properties.find(o => o.name === key)?.isBodyProp).map(([key, value]) => /*html*/`
        <div class="property-viewer">
          ${propertyViewer(key, value, lang)}
        </div>
      `).join('\n')}
    </div>
  `
  return html
}


/** @type {(item: CollectionItem, lang: string) => string} */
function renderItemEditMode(item, lang) {
  const { meta, ...data } = item
  const html = /*html*/`
  <div class="item-view" data-id="${meta.id}">
    <form>
      ${Object.entries(data).filter(([key, value]) => !meta.properties.find(o => o.name === key)?.isBodyProp).map(([key, value]) => /*html*/`
        <div class="property-editor">
          ${propertyEditor(key, value, lang)}
        </div>
      `).join('\n')}
      <div class="property-editor">
        ${propertyEditor('bodySource', meta.bodySource, lang)}
      </div>
    </form>
  </div>
  `
  return html
}


/** @type {(key: string, value: any, lang: string) => string} */
function propertyViewer(key, value, lang) {
  if (value == null) return ''
  let valueString = ''
  if (typeof value === 'object' && !Array.isArray(value)) {
    if (lang in value) {
      valueString = value[lang]
    } else {
      valueString = JSON.stringify(value)
    }
  } else {
    valueString = String(value)
  }
  return /*html*/`
    <label>${key}</label>
    <div class="property-value">
      ${valueString}
    </div>
  `
}


/** @type {(key: string, value: any, lang: string) => string} */
function propertyEditor(key, value, lang) {
  // console.debug(key, typeof value)
  if (key === 'body') return ''
  let html = ''
  if (key.startsWith('_')) html = `${value}`
  if (value == null) {
    html = /*html*/`<input type="text" name="${key}" value="">`
  }
  if (!html && typeof value === 'string') {
    if (!value.startsWith('REF:')) {
      const newLines = [...value].filter(o => o === '\n').length
      if (newLines > 0 || key === 'body') {
        html = /*html*/`<textarea name="${key}"></textarea>`
      } else {
        html = /*html*/`<input type="text" name="${key}" value="${value}">`
      }
    }
  }
  if (!html && typeof value === 'object' && !Array.isArray(value)) {
    if (lang in value) {
      html = /*html*/`<input type="text" name="${key}" value="${value[lang]}" lang="${lang}">`
    } else {
      html = JSON.stringify(value)
    }
  }
  if (!html && typeof value === 'number') {
    html = /*html*/`<input type="number" name="${key}" value="${value}">`
  }
  if (html === '') html = `${value}`
  const label = key !== 'bodySource' ? key : 'body'
  return /*html*/`<label>${label}</label> ` + html
}


/** @type {(collectionName: string, item: CollectionItem) => Promise<{ status: string, message?: string, newItem?: any }>} */
async function saveChanges(collectionName, item) {
  /** @type {{ propertyName: string, newValue: any, oldValue: any, lang?: string }[]} */
  const changes = []
  for (const element of qs('form', 'form').elements) {
    if (!(element instanceof HTMLInputElement) && !(element instanceof HTMLTextAreaElement)) continue
    const lang = element.lang
    const newValue = element.value
    let oldValue = lang ? item[element.name][lang] : item[element.name]
    if (oldValue !== newValue) {
      changes.push({ propertyName: element.name, newValue, oldValue, lang })
    }
  }
  // console.debug({changes})
  const response = await fetch(`collection/${collectionName}/${item._id}`, {
    headers: { 'content-type': 'application/json' },
    method: 'post',
    body: JSON.stringify(changes)
  })
  if (response.ok) {
    const newItem = await response.json()
    return { status: 'ok', newItem }
  }
  return { status: 'error', message: 'an error occured' }
}


/** @type {(lang: string) => void} */
function setLanguageStyles(lang) {
  qs('#language-styles', 'style').textContent = `.property-viewer [lang]:not([lang="${lang}"]) { display: none; }`
}