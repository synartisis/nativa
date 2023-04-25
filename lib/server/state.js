/** @type {any} */
const state = {}


/** @type {(moreState: any) => void} */
export function setState(moreState) {
  Object.assign(state, moreState)
}


export function getState() {
  return state
}