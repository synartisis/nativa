const env = process.env.NODE_ENV === 'production' ? 'production' : 'development'

/** @type {any} */
const state = { env }


/** @type {(moreState: any) => void} */
export function setState(moreState) {
  Object.assign(state, moreState)
}


export function getState() {
  return state
}