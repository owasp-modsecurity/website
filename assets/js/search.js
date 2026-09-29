/**
 * @file Wires Pagefind's search UI into the /search/ page.
 *
 * A compiled asset rather than an inline <script> in the search_form.html
 * shortcode, so that no executable inline script ships and script-src can drop
 * 'unsafe-inline'. A hash is not an alternative: Hugo minifies the page after
 * the template renders, so the bytes a template could hash are not the bytes
 * the browser receives.
 */
window.addEventListener('DOMContentLoaded', () => {
  const element = document.querySelector('#search')

  // pagefind-ui.js is loaded with `defer` and assigns window.PagefindUI. It is
  // absent when the search index was never built, so a missing constructor is a
  // state to leave alone rather than an error to report.
  const PagefindUI = window.PagefindUI

  if (!element || typeof PagefindUI !== 'function') {
    return
  }

  /* showSubResults surfaces one hit per heading with an id. It is what makes a
     single-page collection like /faq/ searchable question by question: the
     result links to /faq/#how-do-i-install-modsecurity, and faq-accordion.js
     opens that answer on arrival. */
  const pagefind = new PagefindUI({ element: '#search', showSubResults: true })

  const input = element.querySelector('input')
  const query = new URLSearchParams(window.location.search).get('q')

  if (query) {
    if (input) {
      input.value = query
    }
    /* PagefindUI builds its input asynchronously, and triggerSearch before it is
       ready is a no-op. Poll for it rather than waiting a fixed interval, which is
       both a visible delay on a fast connection and a race on a slow one. */
    let attempts = 0
    /** @returns {void} */
    const attempt = () => {
      if (element.querySelector('input')) {
        pagefind.triggerSearch(query)
        return
      }
      if (attempts++ < 40) {
        setTimeout(attempt, 50)
      }
    }
    attempt()
  }

  element.addEventListener('input', (event) => {
    if (!(event.target instanceof HTMLInputElement)) {
      return
    }

    const url = new URL(window.location.href)
    url.searchParams.set('q', event.target.value)
    window.history.replaceState(null, '', url)
  })
})
