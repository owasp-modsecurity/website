/**
 * @file Loads Matomo, configured so the site stores nothing on the visitor's device.
 *
 * Rendered through resources.ExecuteAsTemplate with
 * site.Params.Services.MatomoAnalytics as its context, so `{{ .URL }}` and
 * `{{ .ID }}` below are Hugo template actions inside string literals — which is
 * why this file is still parsable JavaScript and can be linted and type-checked
 * as it stands.
 *
 * A compiled asset rather than an inline <script>, which is what allows the
 * CSP's script-src to be 'self' with no 'unsafe-inline'. A 'sha256-...' source
 * is not an alternative: Hugo minifies the rendered page afterwards, so the
 * browser receives different bytes from the ones a template is able to hash.
 */
/* Matomo's command queue, created here only if Matomo's own script has not
   already made one.

   Deliberately NOT aliased to a local binding. A top-level `const _paq` in a
   classic script lands in the global lexical environment, where it shadows
   window._paq for every unqualified reference — matomo.js's own `_paq = ...`
   included. That assignment then throws "TypeError: Assignment to constant
   variable." inside addTracker, before the main queue is replayed, so
   trackPageView never runs and the tracker sends nothing at all. The commands
   addTracker hoists into applyMethodsInOrder — disableCookies among them — do
   still run: they are applied while the right-hand side of that assignment is
   being evaluated.

   Measured on production, which had exactly that bug: matomo.js loaded,
   window.Matomo existed, and not one request reached matomo.php. The failure is
   independent of Do Not Track: setDoNotTrack sits in the unreplayed part of the
   queue, so it never took effect either.

   So every push below goes through window._paq. standard's prefer-const cannot
   ask for a binding where there is no declaration; do not add one back. */
window._paq = window._paq || []

/* These two lines are why the site stores nothing on a visitor's device and asks
   for no cookie consent. disableCookies drops Matomo's own _pk_id (visitor id, 13
   months) and _pk_ses (session, 30 minutes) first-party cookies, which were the
   only storage this site had; setDoNotTrack makes the tracker send nothing at all
   when the browser asks not to be tracked.

   Both must be pushed BEFORE trackPageView: the queue is replayed in order once
   matomo.js loads, and a page view queued ahead of them is sent under the old
   settings.

   Consent under ePrivacy Art. 5(3) is triggered by storing or reading data on the
   visitor's device rather than by analytics as such, and with these cookies gone the
   site stores nothing at all.

   Measured 2026-11-24, against a tracker that actually ran: the page view left
   the page with an empty _id, and afterwards there was no _pk_* cookie and both
   localStorage and sessionStorage were empty. The date matters. Until the `const`
   above was removed, the tracker threw before trackPageView ran, so a storage
   check on that build measured a tracker that never sent a hit and proved
   nothing — re-measure here only on a build where the hit really leaves the page.

   That is what /privacy-policy/ tells visitors, so changing either line above means
   changing that page too. */
window._paq.push(['disableCookies'])
window._paq.push(['setDoNotTrack', true])

window._paq.push(['trackPageView'])
window._paq.push(['enableLinkTracking']);
(function () {
  const u = '//{{ .URL }}/'
  window._paq.push(['setTrackerUrl', u + 'matomo.php'])
  window._paq.push(['setSiteId', '{{ .ID }}'])
  const d = document
  const g = d.createElement('script')
  const s = d.getElementsByTagName('script')[0]
  g.type = 'text/javascript'
  g.async = true
  g.src = u + 'matomo.js'
  s.parentNode.insertBefore(g, s)
})()
