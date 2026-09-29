/*
 * Globals this site's scripts read but never define.
 *
 * Both are set by code that arrives as a separate <script>, so no file under
 * assets/js/ can declare them and the type checker cannot infer them. This file
 * is types only: it emits nothing, ships nothing, and is not part of any build.
 * It exists so `npm run typecheck` knows the shape of what those scripts leave
 * on `window`.
 */

/** The subset of Pagefind's search UI that search.js uses. */
interface PagefindUIInstance {
  /** Run a search as if the visitor had typed it into the UI's own input. */
  triggerSearch (query: string): void
}

interface PagefindUIOptions {
  /** CSS selector for the container the UI renders itself into. */
  element: string
  /**
   * Emit one result per heading with an id, not just one per page. This is what
   * makes a single-page collection like /faq/ searchable question by question.
   */
  showSubResults?: boolean
}

interface Window {
  /**
   * Defined by pagefind/pagefind-ui.js, which layouts/shortcodes/search_form.html
   * loads with `defer`. Absent when the search index has not been built, which is
   * why search.js checks before constructing it.
   */
  PagefindUI?: new (options: PagefindUIOptions) => PagefindUIInstance

  /**
   * Matomo's command queue. assets/js/matomo.js creates it if it is not already
   * there, pushes the site's configuration into it, and Matomo's own matomo.js
   * replays it in order once that script loads.
   */
  _paq?: unknown[][]
}
