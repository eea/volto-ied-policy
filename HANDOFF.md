# IndustryMap migration — handoff

Status snapshot for the next session. Branch: `develop` (ied-policy addon).

## Context

`volto-ied-policy` is an upgrade of the original `~/Work/volto-industry-theme`
(known-good reference). The upgrade introduced messy code around a redux
`query` filter slice and partial URL writes (e.g. `setParamsQuery` in
`FiltersMap/Modal.jsx`, scattered `history.push`) that **did not exist** in the
original — they caused URL/redux drift that broke shareable/reloadable filter
state on the IndustryMap and tables. This work realigns on the clean original
flow while making the URL the source of truth for user filters.

Prefer porting / re-authoring from the original `volto-industry-theme` rather
than patching the dirty current code — the original is the known-good baseline.

## Architectural decisions baked in

- **URL = source of truth** for the 16 user filters (`inputsKeys` in
  `FiltersMap/dictionary.js`). Encoded with the existing convention:
  `Site_reporting_year[in]`, `eprtr_sectors[in]`,
  `bat_conclusions[like]=%..%`, `count_instype_IED[gte]`, …
- **Redux slice** `state.industryMapFilters.search` holds only
  cross-component coordination state:
  - `filter_change` (counter + type) — drives refetch effects
  - `map_extent` — written every map pan (kept out of URL to avoid history spam)
  - `index_pollutant_id`
  - `filter_search` / `filter_search_value`
- Filter writes do **two** things: `history.push` the new URL **and** bump
  `filter_change` in the slice. Refetch / view-fit effects key on
  `filter_change.counter` — unchanged from original.
- IndustryMap View merge:
  ```js
  query: {
    ...qs.parse(state.router.location.search.replace('?', '')),   // raw URL
    ...searchParamsToFilters(state.router.location.search),       // decoded filters
    ...state.industryMapFilters.search,                           // coordination
  }
  ```

## Single canonical filter↔URL mapping

`src/components/manage/Blocks/IndustryMap/urlFilters.js` exports:
- `filtersToSearchParams(filters, location)` — preserves `activeTab`,
  builds `nuts_regions[like]` via `getLatestRegions`.
- `searchParamsToFilters(searchParams)` — always returns all 16 keys
  defaulted to `[]`.
- `getLatestRegions` lives here (also re-exported by `IndustryMap/index.js`)
  to avoid the index.js ↔ View.jsx circular dependency.

Replaces the deleted duplicates: `setParamsQuery` (Modal) and the inline
URL-parse loop in `FiltersMap/View.jsx`.

## What's done in this branch

- Redux slice rename: `reducers/query.js` → `reducers/industryMapFilters.js`,
  registered as `industryMapFilters` in `reducers/index.js`.
- All 7 readers repointed to `state.industryMapFilters.search`.
- `IndustryMap/Sidebar.jsx`: class with `withRouter`, reads filters from URL,
  writes via `history.push` + counter bump.
- `IndustryMap/View.jsx`: merge (URL filters + coordination); `onMoveend`
  still writes `map_extent` to the slice; memoized base + sites sources and
  view object (kills the per-render tile regeneration).
- `FiltersMap/Modal.jsx`: deleted `setParamsQuery` + local `getLatestRegions`;
  apply/clear push URL + bump counter.
- `FiltersMap/View.jsx`: deleted ~100-line inline URL parse; init seeds the
  default reporting year into the URL once + bumps counter.
- `FiltersMap/Search.js`: stops writing empty filter values to redux;
  `filter_search` stays redux.
- Tables (`PolluantsTable`, `SiteTableau`, `IndustryDataTableVariation`):
  read filters from URL via merged-query.
- **SiteLocationMap block restored** (`Blocks/SiteLocationMap/{View.jsx,
  Edit.jsx, index.js, schema.js, styles.less}`). Block id `site_location`.
  - Uses `withOpenLayers` (the old `openlayers` singleton no longer exists).
  - URL-derived `siteInspireId` / `siteReportingYear`.
  - Memoized base XYZ source, vector `siteStyle`, and `view`.
  - `extent` is passed **inside** `view` — current Map only fits
    `view.extent`, NOT a top-level `extent` prop.
  - Pulsing green marker via layer `postrender` (expanding/fading ring).
  - Year change: keep the current feature visible — fetch first, then
    `vs.clear()` + `vs.addFeatures()` in the `.then`.
- `&lat=&lng=` removed from both "Site details" links (PopupDetailed,
  IndustryDataTableVariation) → no explore-map flash on navigation.
- Dormant lat/lng centering removed from IndustryMap/View: `centerToQueryLocation`,
  `mercatorToLatLon`, render-side `hdms` block, orphaned lock/fixed-popup
  wiring (`Popup` now just `<Popup overlay={overlayPopup} />`), the
  `if (siteName) return` hover guard. Dead `IndustryMap/Navigation.jsx`
  removed.
- **v2 blocks scaffolded** for the upcoming **facility-page redesign**
  (intended to replace the site-details page):
  - `Blocks/v2/SiteExplorer` (block id `site_explorer`) — drills into a
    site's structure; reads `history.location.state` + URL params.
  - `Blocks/v2/InstallationPartsList` (block id `installation_parts_list`)
    — lists installation parts with URL-driven selection (`partInspireID`
    in `location.search`, written via `history.push`).
  - Both are URL-state-driven (`URLSearchParams`, `history.push`),
    matching the new filter architecture. Registered via
    `Blocks/v2/index.js`, included in `Blocks/index.js`.

## TODO — next session

### 1. Actions/constants renamed to match the slice (DONE)

The slice stays `industryMapFilters`. Actions/constants/files renamed:

| Old | New |
|---|---|
| `actions/query.js` | `actions/industryMapFilters.js` |
| `constants/query.js` | `constants/industryMapFilters.js` |
| `setQuery` | `setIndustryMapFilters` |
| `deleteQuery` | `deleteIndustryMapFilters` |
| `resetQuery` | `resetIndustryMapFilters` |
| `triggerQueryRender` | `triggerIndustryMapFiltersRender` |
| `SET_QUERY` | `SET_INDUSTRY_MAP_FILTERS` |
| `DELETE_QUERY` | `DELETE_INDUSTRY_MAP_FILTERS` |
| `RESET_QUERY` | `RESET_INDUSTRY_MAP_FILTERS` |
| `TRIGGER_QUERY_RENDER` | `TRIGGER_INDUSTRY_MAP_FILTERS_RENDER` |

Barrels `actions/index.js` and `constants/index.js` re-export from
`./industryMapFilters`. Stale addon-root mirrors (`actions/` and `constants/`,
holdover from the old addon layout before src/) were deleted.

Optional internal cleanup: the action creators still take a parameter named
`queryParam` (e.g. `setIndustryMapFilters(queryParam)`) and the reducer reads
`action.queryParam`. Could rename to `payload` for full consistency — kept
as-is here to avoid an unrelated diff (a naive sed would also mangle
`deletedQueryParams` in the reducer state).

Verify clean:
```bash
grep -rn "setQuery\|deleteQuery\|resetQuery\|triggerQueryRender\|SET_QUERY\|DELETE_QUERY\|RESET_QUERY\|TRIGGER_QUERY_RENDER\|reducers/query\|actions/query\|constants/query" \
  src/addons/volto-ied-policy/src
# expect: no matches
```

### 2. CMS content config

The site-details page block must be switched from
**IndustryMap + hideFilters/smallHeight** to the restored **`site_location`**
block. This is a content / Plone config change, not code. Until switched, the
detail page still renders the big map; the empty popup users saw was a
consequence of cleaning the lat/lng centering — fully resolved by switching.

### 3. v2 / facility-page redesign (in progress)

The site-details page is being replaced by a new **facility page**, assembled
from the v2 blocks (`site_explorer`, `installation_parts_list`). Both blocks
are URL-state-driven and live in `Blocks/v2/`. More v2 blocks to come;
follow the same convention (URL params for navigation state, `history.push`,
no addition to the redux slice unless the state is genuinely
cross-component coordination).

### 4. Cleanup (optional, follow-up)

- Drop the `hideFilters` / `smallHeight` fields from `IndustryMap/schema.js`
  once the detail page no longer uses IndustryMap.
- Drop `smallGreenCircle` / `bigGreenCircle` styles in `IndustryMap/index.js`
  (unused — sites are rendered as a raster `TileArcGISRest`).
- The root `actions/` and `constants/` mirrors in the addon root are stale —
  jsconfig points at `src/`. Delete them for consistency.

## Gotchas (for the next session)

- **OL Tile/VectorImage are reactive.** Commit `950accb fix: improved layers
  update` in `volto-openlayers-map` added `componentDidUpdate` that swaps
  `source` whenever `isEqual(newOptions, this.options)` fails. OL instances
  carry a unique `ol_uid`, so passing a fresh `new source.XYZ(...)` each
  render causes refetch. **Memoize sources** on the stable loaded-lib ref
  (`source` destructured from `props.ol`), not on the `openlayers` wrapper
  object (which is rebuilt every render by `withOpenLayers`).
- The current `Map` component fits the view to `view.extent` only — top-level
  `extent` prop is ignored (old Map fit a top-level one). `SiteLocationMap`
  now passes extent through `view`.
- `withOpenLayers` (in `volto-openlayers-map/src/index.js`) is a plain
  function component — it drops `ref`. Nothing currently passes a ref through
  it, but if you ever wrap a component that needs ref forwarding through the
  HOC, switch it to `React.forwardRef`. (The inner `injectLazyLibs(..., true)`
  on Map/Tile/VectorImage already forwards refs.)
- `filter_change.counter` is the refetch trigger. After the rename keep this
  behavior — the View's `useEffect` on it must continue to fire on every
  filter write.

## Verification (do not commit until clean)

```bash
yarn build           # or yarn start, smoke-test
grep -rn "state\.query\.search\|reducers/query" src/addons/volto-ied-policy/src
```

End-to-end checks on the IndustryMap page:
1. Apply a Sidebar filter (reporting year, country, facility type) → URL
   updates (`Site_reporting_year[in]=…` etc), map tiles + table filter.
2. Reload page → filters persist from URL.
3. Copy URL to new tab → same filtered state.
4. Advanced filter (Modal) and quick filter (Sidebar) produce identical
   encoding and stay in sync.
5. Clear filters → URL filter params removed; map/table reset.
6. Pan/zoom → no base + data tile reload, no history spam.

End-to-end on the site-detail page (after CMS switch to `site_location`):
1. Click a dot on the explore map → "Site details" → routes cleanly, no
   pre-navigation flash on the big map.
2. Detail page shows the pulsing green marker centered on the site.
3. Change the reporting year → previous marker stays visible until the new
   feature loads, then swaps.
