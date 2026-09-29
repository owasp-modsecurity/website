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
/**
 * Matomo's command queue. Declared here only if Matomo's own script has not
 * already created it, and assigned onto `window` explicitly so the global
 * survives — a `const` alone would not create one.
 *
 * @type {unknown[][]}
 */
const _paq = (window._paq = window._paq || [])

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
   site stores nothing at all — measured: no cookies, and empty localStorage and
   sessionStorage after a tracked page load. That is what /privacy-policy/ tells
   visitors, so changing either line above means changing that page too. */
_paq.push(['disableCookies'])
_paq.push(['setDoNotTrack', true])

_paq.push(['trackPageView'])
_paq.push(['enableLinkTracking']);
(function () {
  const u = '//{{ .URL }}/'
  _paq.push(['setTrackerUrl', u + 'matomo.php'])
  _paq.push(['setSiteId', '{{ .ID }}'])
  const d = document
  const g = d.createElement('script')
  const s = d.getElementsByTagName('script')[0]
  g.type = 'text/javascript'
  g.async = true
  g.src = u + 'matomo.js'
  s.parentNode.insertBefore(g, s)
})()
