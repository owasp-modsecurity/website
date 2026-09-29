/**
 * @file One-at-a-time accordion for the FAQ, and the bridge from a search result
 * to the answer it promised.
 *
 * The markup ships with every panel collapsed, so a visitor without JavaScript
 * still reads the questions and can follow each answer's own link. Opening is an
 * enhancement on top of that, not a prerequisite for the content.
 */

/**
 * A question and the answer it controls, paired once at startup.
 *
 * @typedef {object} FaqItem
 * @property {HTMLElement} trigger  The `.faq__trigger` button carrying aria-expanded.
 * @property {HTMLElement} panel  The answer it names through aria-controls.
 */

const accordions = document.querySelectorAll('[data-faq-accordion]')

accordions.forEach((accordion) => {
  /** @type {FaqItem[]} */
  const items = Array.from(accordion.querySelectorAll('.faq__trigger'))
    .map((element) => {
      const trigger = /** @type {HTMLElement} */ (element)
      const panel = document.getElementById(
        trigger.getAttribute('aria-controls')
      )

      // A trigger whose aria-controls names nothing is broken markup, not a
      // state to handle: drop it rather than wire a button to no panel.
      return panel ? { panel, trigger } : null
    })
    .filter(Boolean)

  if (!items.length) {
    return
  }

  /**
   * Put one question into a state, on both the button and its panel.
   *
   * @param {FaqItem} item
   * @param {boolean} isExpanded
   * @returns {void}
   */
  const setExpanded = (item, isExpanded) => {
    item.trigger.setAttribute('aria-expanded', String(isExpanded))
    item.panel.hidden = !isExpanded
  }

  /**
   * Open one question and close every other, which is what makes this an
   * accordion rather than a list of independent disclosures.
   *
   * @param {FaqItem} item
   * @returns {void}
   */
  const openOnly = (item) => {
    items.forEach((otherItem) => setExpanded(otherItem, otherItem === item))
  }

  items.forEach((item) => {
    item.trigger.addEventListener('click', () => {
      const isExpanded = item.trigger.getAttribute('aria-expanded') === 'true'

      items.forEach((otherItem) => setExpanded(otherItem, false))

      if (!isExpanded) {
        setExpanded(item, true)
      }
    })
  })

  /* Pagefind emits one sub-result per FAQ question, each linking to
     /faq/#<slug>. Without this the visitor lands on a page whose every answer
     is still collapsed, having just been told their answer is here — so the
     search result looks broken. Resolve the fragment to an item and open it.

     The fragment may name the heading, the trigger or the panel; accept all
     three so hand-written links keep working. */
  /**
   * @param {string} hash  A location fragment, with or without its leading `#`.
   * @returns {FaqItem|null} The question it names, or null if it names none.
   */
  const itemForHash = (hash) => {
    const id = decodeURIComponent(hash.replace(/^#/, ''))

    if (!id) {
      return null
    }

    const base = id.replace(/-(?:trigger|panel)$/, '')

    return (
      items.find(
        (item) =>
          item.trigger.id === `${base}-trigger` || item.panel.id === `${base}-panel`
      ) || null
    )
  }

  /**
   * Open whichever question the current fragment names, and re-anchor on it.
   *
   * @param {object} options
   * @param {boolean} options.focus  Move the caret to the question. True when the
   *   visitor navigated here themselves, false on first load, where stealing focus
   *   would move the caret away from the top of a page they have not read yet.
   * @returns {void}
   */
  const revealFromHash = ({ focus }) => {
    const item = itemForHash(window.location.hash)

    if (!item) {
      return
    }

    openOnly(item)

    /* Opening the panel changes the document height, so the browser's own
       fragment scroll — which ran against the collapsed layout — is now off.
       Re-anchor on the heading, which is what the fragment names. */
    const heading = item.trigger.closest('.faq__heading') || item.trigger
    heading.scrollIntoView({ block: 'start' })

    if (focus) {
      /* Keyboard and screen reader users need the caret where the answer is,
         not left at the top of the document. */
      item.trigger.focus({ preventScroll: true })
    }
  }

  revealFromHash({ focus: false })
  window.addEventListener('hashchange', () => revealFromHash({ focus: true }))
})
