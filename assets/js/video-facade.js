/**
 * @file Click-to-load video facade.
 *
 * The visitor sees a locally hosted poster frame and a play button. Nothing is
 * requested from YouTube — or from any other origin — until they click. That is
 * the whole point of this file: the theme's lite-youtube component fetches its
 * poster from i.ytimg.com on load and, on the first pointerover, injects
 * preconnect hints for six Google hosts including googleads.g.doubleclick.net
 * and static.doubleclick.net. Resource hints are not governed by CSP, so
 * `connect-src 'self'` does not stop them: hovering the player opened
 * connections to Google's ad infrastructure before the visitor had chosen to
 * watch anything.
 *
 * Without JavaScript the <noscript> link in the markup takes the visitor to the
 * video on youtube-nocookie.com, which is their decision to make.
 */
document.querySelectorAll('[data-video-facade]').forEach((element) => {
  /**
   * The facade's own element. layouts/partials/video-facade.html renders it with
   * data-video-id and data-video-title; a facade missing either is skipped rather
   * than turned into an embed that points nowhere.
   *
   * @type {HTMLElement}
   */
  const facade = /** @type {HTMLElement} */ (element)
  const button = facade.querySelector('.video-facade__button')
  const videoId = facade.dataset.videoId

  if (!button || !videoId) {
    return
  }

  // `once`: the handler replaces the facade with the player, so there is nothing
  // left for a second click to act on.
  button.addEventListener(
    'click',
    /** @returns {void} */
    () => {
      const iframe = document.createElement('iframe')

      /* nocookie, and autoplay because the click WAS the play action. */
      iframe.src =
        'https://www.youtube-nocookie.com/embed/' +
        encodeURIComponent(videoId) +
        '?autoplay=1'
      iframe.title = facade.dataset.videoTitle || 'Video'
      iframe.allow =
        'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share'
      iframe.allowFullscreen = true
      iframe.className = 'video-facade__player'

      facade.replaceChildren(iframe)
      iframe.focus()
    },
    { once: true }
  )
})
