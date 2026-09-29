/**
 * @file The header menu: dropdowns on desktop, a drawer on mobile.
 *
 * Everything here is an enhancement over markup that already works. Without
 * JavaScript the navigation renders as a plain list of links — which is also why
 * the open state is decided in this file rather than server-rendered: see the
 * note on `currentSubmenu` below.
 *
 * The two layouts are genuinely different interactions, not one design at two
 * sizes. On desktop a dropdown overlays the page, opens on hover, and is
 * dismissed by clicking away. On mobile the drawer covers the viewport, opens on
 * activation only, and keeps the current section open so reopening it shows
 * where you are. `desktopMediaQuery` is the switch between them.
 */

/**
 * One dropdown: the control that opens it, the list item it lives in, and the
 * panel it reveals.
 *
 * @typedef {object} Submenu
 * @property {HTMLElement} control  The `.submenu-toggle` carrying aria-expanded.
 * @property {HTMLElement} item  The `.menu-item-has-children` wrapper, which owns
 *   the hover and focus behaviour and the `is-open` class.
 * @property {HTMLElement} panel  The submenu it names through aria-controls.
 */

const navigation = /** @type {HTMLElement|null} */ (
  document.querySelector('#primary-navigation')
)
const hamburger = /** @type {HTMLElement|null} */ (
  document.querySelector('.hamburger')
)

if (navigation && hamburger) {
  /** @type {Submenu[]} */
  const submenuControls = Array.from(
    navigation.querySelectorAll('.submenu-toggle')
  ).map((element) => {
    const control = /** @type {HTMLElement} */ (element)
    const panel = document.getElementById(control.getAttribute('aria-controls'))
    const item = /** @type {HTMLElement|null} */ (
      control.closest('.menu-item-has-children')
    )

    // A control that names no panel, or sits outside a parent item, is broken
    // markup rather than a state to support.
    return panel && item ? { control, item, panel } : null
  }).filter(Boolean)

  // 1000px must stay in sync with $min-desktop in assets/scss/_variables.scss.
  const desktopMediaQuery = window.matchMedia('(min-width: 1000px)')
  let pinnedSubmenu = null

  /**
   * Put one dropdown into a state, on both the item's class and the control's
   * aria-expanded, and give up the pin if this was the pinned one.
   *
   * @param {Submenu} submenu
   * @param {boolean} isExpanded
   * @returns {void}
   */
  const setSubmenuExpanded = (submenu, isExpanded) => {
    submenu.item.classList.toggle('is-open', isExpanded)
    submenu.control.setAttribute('aria-expanded', String(isExpanded))

    if (!isExpanded && pinnedSubmenu === submenu) {
      pinnedSubmenu = null
    }
  }

  // The submenu holding the current page. layouts/partials/header.html marks its
  // <li> with `has-current`; that class is the only thing that has to reach the
  // browser, and the open state is set here rather than server-rendered. Do not
  // move it into the HTML: the theme's desktop CSS opens `.is-open` without waiting
  // for `navigation--enhanced`, so the class alone would hang a dropdown open for
  // anyone without JavaScript. They have no mobile menu in that case either — the
  // hamburger needs a listener — so nothing is lost by deciding it here.
  const currentSubmenu = submenuControls.find(
    (submenu) => submenu.item.classList.contains('has-current')
  ) || null

  /**
   * @param {Submenu|null} [except]  Left open; everything else closes.
   * @returns {void}
   */
  const closeSubmenus = (except = null) => {
    submenuControls.forEach((submenu) => {
      if (submenu !== except) {
        setSubmenuExpanded(submenu, false)
      }
    })
  }

  /**
   * Open one dropdown and close the rest.
   *
   * @param {Submenu} submenu
   * @param {object} [options]
   * @param {boolean} [options.pinned]  Pinned means the visitor chose this one,
   *   so pointerleave must not take it away. Hover opens provisionally instead,
   *   and callers that merely re-hover an already pinned menu pass its current
   *   pinned state through rather than clearing it.
   * @returns {void}
   */
  const openSubmenu = (submenu, { pinned = false } = {}) => {
    closeSubmenus(submenu)
    setSubmenuExpanded(submenu, true)
    pinnedSubmenu = pinned ? submenu : null
  }

  // The resting state, not the empty state. On mobile that is the current
  // section left open, so reopening the menu shows where you are instead of
  // making you find it again; on desktop every dropdown is dismissed, because
  // there the panels overlay the page.
  /**
   * Return the menu to rest. Not the same as closing everything — see above.
   *
   * @returns {void}
   */
  const resetSubmenus = () => {
    if (!desktopMediaQuery.matches && currentSubmenu) {
      openSubmenu(currentSubmenu)
      return
    }

    closeSubmenus()
  }

  /**
   * Re-derive every aria-expanded from the classes that actually decide what is
   * visible, so the accessibility tree cannot drift from the rendering.
   *
   * @returns {void}
   */
  const syncNavigationState = () => {
    const isNavigationActive = navigation.classList.contains('is-active')

    hamburger.setAttribute(
      'aria-expanded',
      String(isNavigationActive)
    )
    submenuControls.forEach((submenu) => {
      submenu.control.setAttribute(
        'aria-expanded',
        String(submenu.item.classList.contains('is-open'))
      )
    })
  }

  /**
   * Open or close the mobile drawer, and keep `inert`, the body scroll lock and
   * the submenu resting state in step with it.
   *
   * @param {boolean} isActive
   * @returns {void}
   */
  const setNavigationActive = (isActive) => {
    navigation.classList.toggle('is-active', isActive)
    hamburger.classList.toggle('is-active', isActive)
    document.body.classList.toggle('has-menu-active', isActive)
    // Off screen is not hidden from the keyboard. The theme parks the closed mobile
    // menu at `left: -100%`, which leaves its links and buttons in the tab order, so
    // a keyboard user would pass several invisible focus stops before reaching the
    // hamburger that reveals them. `inert` takes the subtree out of both the tab
    // order and the accessibility tree, and unlike `display: none` it leaves the
    // slide transition alone.
    navigation.inert = !desktopMediaQuery.matches && !isActive

    if (!isActive) {
      resetSubmenus()
    }

    syncNavigationState()
  }

  hamburger.setAttribute('aria-expanded', 'false')
  resetSubmenus()
  navigation.classList.add('navigation--enhanced')
  navigation.inert = !desktopMediaQuery.matches

  submenuControls.forEach((submenu) => {
    submenu.control.addEventListener('click', (event) => {
      event.preventDefault()

      const isExpanded = submenu.control.getAttribute('aria-expanded') === 'true'

      if (!desktopMediaQuery.matches) {
        if (isExpanded) {
          setSubmenuExpanded(submenu, false)
        } else {
          openSubmenu(submenu)
        }
        return
      }

      // Hover opens a desktop menu provisionally. The first activation pins
      // it; the next activation of that pinned control closes it.
      if (isExpanded && pinnedSubmenu === submenu) {
        setSubmenuExpanded(submenu, false)
      } else {
        openSubmenu(submenu, { pinned: true })
      }
    })

    submenu.item.addEventListener('pointerenter', () => {
      if (desktopMediaQuery.matches) {
        // Preserve an existing pin, as the focusin handler below does. The default
        // `pinned: false` would clear pinnedSubmenu, so hovering a menu the user had
        // clicked open would un-pin it and the next pointerleave would close it.
        openSubmenu(submenu, { pinned: pinnedSubmenu === submenu })
      }
    })

    submenu.item.addEventListener('pointerleave', () => {
      if (
        desktopMediaQuery.matches &&
        pinnedSubmenu !== submenu &&
        !submenu.item.matches(':focus-within')
      ) {
        setSubmenuExpanded(submenu, false)
      }
    })

    submenu.item.addEventListener('focusin', (event) => {
      // relatedTarget is where focus came FROM, so this opens only when focus
      // entered the item from outside it, not when it moved between its links.
      const cameFrom = /** @type {Node|null} */ (
        /** @type {FocusEvent} */ (event).relatedTarget
      )

      if (desktopMediaQuery.matches && !submenu.item.contains(cameFrom)) {
        openSubmenu(submenu, { pinned: pinnedSubmenu === submenu })
      }
    })

    submenu.item.addEventListener('focusout', () => {
      window.queueMicrotask(() => {
        if (
          desktopMediaQuery.matches &&
          pinnedSubmenu !== submenu &&
          !submenu.item.matches(':focus-within') &&
          !submenu.item.matches(':hover')
        ) {
          setSubmenuExpanded(submenu, false)
        }
      })
    })
  })

  // Bound to the document, not to `navigation`: the hamburger lives OUTSIDE
  // #primary-navigation, so after it opens the menu the focus sits on an element the
  // navigation never sees events from, and the branch below that closes the mobile
  // menu would never run.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const expandedSubmenu = submenuControls.find(
        (submenu) => submenu.control.getAttribute('aria-expanded') === 'true'
      )

      if (expandedSubmenu) {
        event.preventDefault()
        event.stopPropagation()
        setSubmenuExpanded(expandedSubmenu, false)
        expandedSubmenu.control.focus()
      } else if (!desktopMediaQuery.matches && navigation.classList.contains('is-active')) {
        event.preventDefault()
        setNavigationActive(false)
        hamburger.focus()
      }
    }
  }, true)

  // Desktop only. This dismisses a dropdown that overlays the page, which is a
  // thing only desktop has: on mobile the open menu covers the viewport, so
  // there is no outside to click, and while it is closed the handler would
  // otherwise keep collapsing the current section behind the user's back.
  document.addEventListener('click', (event) => {
    const target = /** @type {Node|null} */ (event.target)

    if (
      desktopMediaQuery.matches &&
      !navigation.contains(target) &&
      !hamburger.contains(target)
    ) {
      closeSubmenus()
    }
  })

  hamburger.addEventListener('click', (event) => {
    if (desktopMediaQuery.matches) {
      return
    }

    event.preventDefault()
    setNavigationActive(!navigation.classList.contains('is-active'))
  })

  desktopMediaQuery.addEventListener('change', () => {
    // setNavigationActive(false) also calls resetSubmenus(), which on desktop closes
    // every submenu and clears pinnedSubmenu. Without this, crossing into desktop
    // with the mobile menu open leaves `has-menu-active` (overflow: hidden) on <body>
    // with no way to clear it: the hamburger is display:none here and its handler
    // early-returns on desktop.
    setNavigationActive(false)
  })
}
