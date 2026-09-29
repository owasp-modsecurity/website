/**
 * @file Copy-to-clipboard for code blocks.
 *
 * Progressive enhancement: the button does not exist in the HTML, so a visitor
 * without JavaScript still gets the code, still selectable by hand. Nothing on the
 * page depends on the button.
 */
(() => {
  const script = document.currentScript
  const labelCopy = (script && script.dataset.copyLabel) || 'Copy'
  const labelCopied = (script && script.dataset.copiedLabel) || 'Copied'

  const blocks = document.querySelectorAll('.content pre')
  if (!blocks.length) return

  // navigator.clipboard is unavailable on insecure origins. Rather than render
  // a button that silently does nothing, render no button at all.
  const canCopy = Boolean(navigator.clipboard && navigator.clipboard.writeText)

  blocks.forEach((element) => {
    /**
     * One `<pre>` from the rendered content. Typed as an element rather than a
     * node because the copy reads `innerText`, which is the rendered text — the
     * same thing a visitor would get by selecting the block by hand.
     *
     * @type {HTMLElement}
     */
    const block = /** @type {HTMLElement} */ (element)

    // Chroma marks its own <pre> keyboard-focusable so the horizontal scroll
    // container can be reached without a mouse. A fence with no language does
    // not go through Chroma, so it arrives without that and needs it too.
    if (!block.hasAttribute('tabindex')) {
      block.setAttribute('tabindex', '0')
    }

    if (!canCopy) return

    // Chroma wraps its output in div.highlight, which is already the positioned
    // shell the button needs. Unwrapped blocks get an equivalent one.
    let shell = block.closest('.highlight')

    if (!shell) {
      shell = document.createElement('div')
      shell.className = 'code-block'
      block.parentNode.insertBefore(shell, block)
      shell.appendChild(block)
    }

    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'code-copy'
    button.textContent = labelCopy

    // The block already reads as "code" to a screen reader; without a name of
    // its own the button would announce as just "Copy" with no object.
    button.setAttribute('aria-label', `${labelCopy} code block`)

    let resetTimer

    /**
     * Show a transient label on the button, then restore the resting one.
     *
     * @param {string} text  What the button should say right now.
     * @param {boolean} copied  True when the copy succeeded; drives the styling
     *   hook `data-copied`, which the stylesheet uses to colour the success state.
     * @returns {void}
     */
    const flash = (text, copied) => {
      button.textContent = text
      if (copied) {
        button.dataset.copied = 'true'
      } else {
        delete button.dataset.copied
      }
      window.clearTimeout(resetTimer)
      resetTimer = window.setTimeout(() => {
        button.textContent = labelCopy
        delete button.dataset.copied
      }, 2000)
    }

    button.addEventListener('click', () => {
      navigator.clipboard.writeText(block.innerText).then(
        () => flash(labelCopied, true),
        // A rejected write is usually a permission prompt the visitor
        // dismissed. Say so instead of pretending it worked.
        () => flash('⌘/Ctrl+C', false)
      )
    })

    shell.appendChild(button)
  })
})()
