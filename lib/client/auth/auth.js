const form = document.querySelector('form')
const message = document.querySelector('.message')
if (form && message) {
  form.addEventListener('submit', async evt => {
    const action = form.getAttribute('action')
    if (!action) return
    evt.preventDefault()
    const response = await fetch(action, {
      method: form.getAttribute('method') ?? 'get',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    })
    if (response.redirected) {
      location.href = response.url
    }
    const json = await response.json()
    if (!response.ok) {
      if (json.message) {
        message.textContent = json.message
      }
    } else {
      if (json.message === 'temp_pwd') {
        form.classList.add('password-reset')
      }
    }
  })
}