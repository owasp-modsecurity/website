/**
 * @file Rotates the partner logos through a fixed number of slots.
 *
 * There are more partners than there is room for, so each slot cycles through
 * its own share of them. The markup renders every logo; this file decides which
 * one each slot shows and when it changes. With JavaScript off, or with reduced
 * motion asked for, the first logo in each slot simply stays put.
 */

/**
 * One slot's rotation state.
 *
 * @typedef {object} RotatorEntry
 * @property {number} slot  Position in the row, which also staggers its first change.
 * @property {HTMLElement[]} group  The logos this slot cycles through.
 * @property {number} index  Which of them is showing.
 * @property {number|undefined} timer  Handle for the pending change, so it can be cancelled.
 */

(() => {
  const root = document.querySelector('[data-partner-rotator]')
  if (!root) return

  const items = /** @type {HTMLElement[]} */ (
    Array.from(root.querySelectorAll('[data-partner-item]'))
  )
  const slots = 6
  const minimumStartSeparation = 950
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  // Seed the LCG from the current time so the rotation order and timings vary
  // per page load, rather than being identical for every visitor.
  let randomState = Date.now() % 4294967296
  /**
   * A linear congruential generator, not Math.random, so the sequence is
   * reproducible from its seed if a timing problem ever has to be reproduced.
   *
   * @returns {number} A value in [0, 1).
   */
  const random = () => {
    randomState = (randomState * 1664525 + 1013904223) >>> 0
    return randomState / 4294967296
  }
  const groups = Array.from({ length: slots }, () => [])
  items.forEach((item, index) => {
    const slot = index % slots
    item.dataset.partnerSlot = String(slot)
    groups[slot].push(item)
  })

  // With fewer partners than slots the trailing groups are empty; activate()
  // would dereference group[0] on them and throw, killing the whole rotator.
  /** @type {RotatorEntry[]} */
  const state = groups
    .map((group, slot) => ({ slot, group, index: 0, timer: undefined }))
    .filter((entry) => entry.group.length > 0)
  let nextAllowedAt = 0
  /** @returns {void} */
  const clearTimers = () => state.forEach((entry) => window.clearTimeout(entry.timer))
  /**
   * Show the next logo in one slot.
   *
   * @param {RotatorEntry} entry
   * @param {boolean} animate  False on the first paint, where there is nothing to
   *   cross-fade from and the logo should simply be there.
   * @returns {void}
   */
  const activate = (entry, animate) => {
    const current = entry.group[entry.index]
    const nextIndex = (entry.index + 1) % entry.group.length
    const next = entry.group[nextIndex]
    if (!animate) {
      current.classList.add('is-active')
      return
    }

    const duration = 500 + Math.round(random() * 400)
    next.style.setProperty('--partner-fade-ms', `${duration}ms`)
    current.style.setProperty('--partner-fade-ms', `${duration}ms`)
    // Read a layout property to force the style change above to be committed
    // before the class swap below starts the transition. Without it the browser
    // may batch both into one recalculation and the fade never runs. The read is
    // the whole point, so the value is discarded — and `void` is kept rather
    // than rewritten because it is what survives minification here: verified in
    // a production build, where the emitted bundle still carries
    // `void i.offsetWidth` between the two style writes.
    // eslint-disable-next-line no-void
    void next.offsetWidth
    current.classList.remove('is-active')
    next.classList.add('is-active')
    entry.index = nextIndex
    nextAllowedAt = Date.now() + minimumStartSeparation
  }
  /**
   * Queue one slot's next change, and re-queue itself after it.
   *
   * @param {RotatorEntry} entry
   * @param {number} [resumeDelay]  Added to the interval, which staggers the
   *   slots so they do not all change at the same moment.
   * @returns {void}
   */
  const schedule = (entry, resumeDelay = 0) => {
    if (document.hidden || reducedMotion.matches) return
    const interval = 4300 + Math.round(random() * 2900)
    const run = () => {
      if (document.hidden || reducedMotion.matches) return
      const separationWait = nextAllowedAt - Date.now()
      if (separationWait > 0) {
        entry.timer = window.setTimeout(run, separationWait)
        return
      }
      const reservationUntil = Date.now() + minimumStartSeparation + 34
      nextAllowedAt = reservationUntil
      window.requestAnimationFrame(() => {
        if (document.hidden || reducedMotion.matches || !root.isConnected) {
          if (nextAllowedAt === reservationUntil) nextAllowedAt = 0
          return
        }
        activate(entry, true)
      })
      schedule(entry)
    }
    entry.timer = window.setTimeout(run, interval + resumeDelay)
  }
  /**
   * Start, or restart, every slot. Safe to call repeatedly: it clears whatever
   * was pending first, so a burst of visibility changes cannot stack timers.
   *
   * @returns {void}
   */
  const start = () => {
    clearTimers()
    if (document.hidden || reducedMotion.matches) return
    state.forEach((entry) => schedule(entry, entry.slot * minimumStartSeparation))
  }

  root.classList.add('is-enhanced')
  state.forEach((entry) => activate(entry, false))
  start()
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimers(); else start()
  })
  reducedMotion.addEventListener('change', () => {
    clearTimers()
    if (!reducedMotion.matches) start()
  })
})()
