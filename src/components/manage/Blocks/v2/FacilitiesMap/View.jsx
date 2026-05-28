/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import UniversalLink from '@plone/volto/components/manage/UniversalLink/UniversalLink';
import { withOpenLayers } from '@eeacms/volto-openlayers-map';
import { Dropdown } from 'semantic-ui-react';
import { Map } from '@eeacms/volto-openlayers-map/Map';
import { Controls } from '@eeacms/volto-openlayers-map/Controls';
import { Interactions } from '@eeacms/volto-openlayers-map/Interactions';
import { Overlays } from '@eeacms/volto-openlayers-map/Overlays';
import { Layers, Layer } from '@eeacms/volto-openlayers-map/Layers';
import { FACILITIES_LAYER_URL, COUNTRY_NAMES } from './index';
import './style.less';

const escHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const splitParam = (value) =>
  (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const NO_LABEL = () => null;

const optionLabel = (options, value) =>
  options.find((o) => o.value === value)?.text || COUNTRY_NAMES[value] || value;

const AppliedChips = ({ values = [], options, onRemove }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted && values.length ? (
    <ul className="v2-applied-chips" aria-label="Applied values">
      {values.map((value) => (
        <li className="v2-applied-chip" key={value}>
          <span className="v2-applied-chip-text">
            {optionLabel(options, value)}
          </span>
          <button
            type="button"
            className="v2-applied-chip-remove"
            aria-label={`Remove ${optionLabel(options, value)}`}
            onClick={() => onRemove(value)}
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  ) : null;
};

const readFilters = (search) => {
  const p = new URLSearchParams(search);
  return {
    name: p.get('name') || p.get('facilityName') || '',
    reportingYear: splitParam(p.get('reportingYear')),
    country: splitParam(p.get('country')),
    industrialSector: splitParam(p.get('industrialSector')),
    facilityType: splitParam(p.get('facilityType')),
    installationType: splitParam(p.get('installationType')),
    thematicInformation: splitParam(p.get('thematicInformation')),
    permitType: splitParam(p.get('permitType')),
    permitYear: splitParam(p.get('permitYear')),
  };
};

const writeFilters = (search, filters) => {
  const p = new URLSearchParams(search);
  if (filters.name) p.set('name', filters.name);
  else p.delete('name');
  if (filters.reportingYear && filters.reportingYear.length)
    p.set('reportingYear', filters.reportingYear.join(','));
  else p.delete('reportingYear');
  if (filters.country && filters.country.length)
    p.set('country', filters.country.join(','));
  else p.delete('country');
  if (filters.industrialSector && filters.industrialSector.length)
    p.set('industrialSector', filters.industrialSector.join(','));
  else p.delete('industrialSector');
  const out = p.toString();
  return out ? `?${out}` : '';
};

function FacilityPopup({ mapElementId }) {
  const [popup, setPopup] = React.useState(null);

  React.useEffect(() => {
    const el = document.getElementById(mapElementId);
    if (!el) return undefined;
    const handler = (e) => setPopup(e.detail || null);
    el.addEventListener('facilitiesmap-popup', handler);
    return () => el.removeEventListener('facilitiesmap-popup', handler);
  }, [mapElementId]);

  const data = popup?.properties;

  if (!data) {
    return (
      <div
        id="facilities-map-popup"
        className="map-popup"
        style={{ display: 'none' }}
      />
    );
  }
  const city = data.city || '—';
  const country = COUNTRY_NAMES[data.countryCode] || data.countryCode || '—';
  const status = (data.facilityStatus || '').toLowerCase();
  const facilityInspireID = data.facilityInspireID || data.inspireId || '';
  const facilityHref = facilityInspireID
    ? `/facility/${encodeURIComponent(facilityInspireID)}`
    : '';
  return (
    <div
      id="facilities-map-popup"
      className={`map-popup ${popup?.pinned ? 'is-pinned' : ''}`}
      onClick={(e) => {
        if (popup?.pinned) e.stopPropagation();
      }}
      onDoubleClick={(e) => {
        if (popup?.pinned) e.stopPropagation();
      }}
      onMouseDown={(e) => {
        if (popup?.pinned) e.stopPropagation();
      }}
      onPointerDown={(e) => {
        if (popup?.pinned) e.stopPropagation();
      }}
      onTouchStart={(e) => {
        if (popup?.pinned) e.stopPropagation();
      }}
      onWheel={(e) => {
        if (popup?.pinned) e.stopPropagation();
      }}
    >
      <div className="popup-tip" />
      <div className="popup-header">
        <span>
          {escHtml(city)}, {escHtml(country)}
        </span>
        {popup?.pinned ? (
          <button
            type="button"
            className="popup-close"
            aria-label="Close facility popup"
            onClick={() => {
              const el = document.getElementById(mapElementId);
              if (el) {
                el.dispatchEvent(new CustomEvent('facilitiesmap-popup-close'));
              }
            }}
          >
            ×
          </button>
        ) : null}
      </div>
      <div className="popup-body">
        <div className="popup-row">
          <span className="popup-label">Year</span>
          <span className="popup-value">{data.reportingYear ?? '—'}</span>
        </div>
        <div className="popup-row">
          <span className="popup-label">Facility ID</span>
          <span className="popup-value">
            {escHtml(data.facilityLocalId) || '—'}
          </span>
        </div>
        <div className="popup-row">
          <span className="popup-label">Activity</span>
          <span className="popup-value">
            {escHtml(data.EPRTRAnnexIMainActivity) || '—'}
          </span>
        </div>
        <div className="popup-row">
          <span className="popup-label">Status</span>
          <span className="popup-value">
            <span className={`badge badge-${status || 'unknown'}`}>
              {status || '—'}
            </span>
          </span>
        </div>
        <div className="popup-row">
          <span className="popup-label">RBD</span>
          <span className="popup-value">{escHtml(data.RBD) || '—'}</span>
        </div>
        <div className="popup-row">
          <span className="popup-label">NUTS3</span>
          <span className="popup-value">{escHtml(data.NUTS3) || '—'}</span>
        </div>
        {popup?.pinned && facilityHref ? (
          <div className="popup-actions">
            <UniversalLink className="popup-link" href={facilityHref}>
              View facility page
            </UniversalLink>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const View = (props) => {
  const { openlayers, location } = props;
  const history = useHistory();
  const { source, style, proj, format } = openlayers;
  const map = React.useRef(null);
  const overlayPopup = React.useRef(null);
  const suggestionTimeout = React.useRef(null);
  const mapElementId = React.useMemo(
    () => `facilities-map-${Math.random().toString(36).slice(2, 9)}`,
    [],
  );
  const [allGeoJSON, setAllGeoJSON] = React.useState(null);
  const [featureCount, setFeatureCount] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [draft, setDraft] = React.useState(() => readFilters(location.search));
  const [suggestions, setSuggestions] = React.useState([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const pinnedPopup = React.useRef(false);

  React.useEffect(() => {
    setDraft(readFilters(location.search));
  }, [location.search]);

  React.useEffect(() => {
    if (__SERVER__ || !source) return;
    let alive = true;
    setLoading(true);
    const params = new URLSearchParams({
      where: '1=1',
      outFields: '*',
      f: 'geojson',
      outSR: '4326',
    });
    fetch(`${FACILITIES_LAYER_URL}?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        if (alive) setAllGeoJSON(data);
      })
      .catch((err) => console.error('Failed to load facilities:', err))
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [source]);

  const baseSource = React.useMemo(
    () => (source ? new source.OSM() : null),
    [source],
  );
  const vectorSource = React.useMemo(
    () => (source ? new source.Vector() : null),
    [source],
  );
  const featureStyle = React.useMemo(
    () =>
      style
        ? new style.Style({
            image: new style.Circle({
              radius: 7,
              fill: new style.Fill({ color: '#004b7f' }),
              stroke: new style.Stroke({ color: '#ffffff', width: 2 }),
            }),
          })
        : null,
    [style],
  );
  const view = React.useMemo(
    () => (proj ? { center: proj.fromLonLat([10, 50]), zoom: 5 } : undefined),
    [proj],
  );

  React.useEffect(() => {
    if (!vectorSource || !format || !allGeoJSON) return;
    const filters = readFilters(location.search);
    const all = new format.GeoJSON().readFeatures(allGeoJSON, {
      featureProjection: 'EPSG:3857',
    });
    const nameQ = filters.name.trim().toLowerCase();
    const yearSet = filters.reportingYear?.length
      ? new Set(filters.reportingYear.map(String))
      : null;
    const filtered = all.filter((f) => {
      const p = f.getProperties();
      if (nameQ && !(p.city || '').toLowerCase().includes(nameQ)) return false;
      if (yearSet && !yearSet.has(String(p.reportingYear))) return false;
      if (filters.country?.length && !filters.country.includes(p.countryCode))
        return false;
      if (
        filters.industrialSector?.length &&
        !filters.industrialSector.includes(p.EPRTRAnnexIMainActivity)
      )
        return false;
      return true;
    });
    vectorSource.clear();
    vectorSource.addFeatures(filtered);
    setFeatureCount(filtered.length);
  }, [allGeoJSON, location.search, vectorSource, format]);

  const yearOptions = React.useMemo(() => {
    if (!allGeoJSON) return [];
    const set = new Set();
    allGeoJSON.features.forEach(({ properties: p }) => {
      if (p?.reportingYear) set.add(p.reportingYear);
    });
    return [...set].sort((a, b) => b - a);
  }, [allGeoJSON]);

  const countryOptions = React.useMemo(() => {
    if (!allGeoJSON) return [];
    const set = new Set();
    allGeoJSON.features.forEach(({ properties: p }) => {
      if (p?.countryCode) set.add(p.countryCode);
    });
    return [...set]
      .sort()
      .map((c) => ({ key: c, value: c, text: COUNTRY_NAMES[c] || c }));
  }, [allGeoJSON]);

  const sectorOptions = React.useMemo(() => {
    if (!allGeoJSON) return [];
    const set = new Set();
    allGeoJSON.features.forEach(({ properties: p }) => {
      if (p?.EPRTRAnnexIMainActivity) set.add(p.EPRTRAnnexIMainActivity);
    });
    return [...set].sort().map((s) => ({ key: s, value: s, text: s }));
  }, [allGeoJSON]);

  const reportingYearOptions = React.useMemo(
    () =>
      yearOptions.map((y) => ({ key: y, value: String(y), text: String(y) })),
    [yearOptions],
  );

  const onSearchChange = (value) => {
    setDraft((d) => ({ ...d, name: value }));
    if (suggestionTimeout.current) clearTimeout(suggestionTimeout.current);
    if (!value.trim() || !allGeoJSON) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    suggestionTimeout.current = setTimeout(() => {
      const q = value.trim().toLowerCase();
      const seen = new Set();
      const items = [];
      for (const { properties: p } of allGeoJSON.features) {
        const city = (p?.city || '').trim();
        if (!city) continue;
        const low = city.toLowerCase();
        if (low.includes(q) && !seen.has(city)) {
          seen.add(city);
          items.push(city);
          if (items.length >= 5) break;
        }
      }
      setSuggestions(items);
      setShowSuggestions(items.length > 0);
    }, 180);
  };

  const applyFilters = (next = draft) => {
    history.push({
      pathname: location.pathname,
      search: writeFilters(location.search, next),
    });
    setShowSuggestions(false);
  };
  const resetFilters = () => {
    const next = {
      name: '',
      reportingYear: [],
      country: [],
      industrialSector: [],
    };
    setDraft(next);
    history.push({
      pathname: location.pathname,
      search: writeFilters(location.search, next),
    });
    setShowSuggestions(false);
  };

  const showPopup = React.useCallback(
    (feature, pinned = false) => {
      if (!feature || !overlayPopup.current) return;
      const el = document.getElementById(mapElementId);
      const coord = feature.getGeometry().getCoordinates();
      pinnedPopup.current = pinned;
      overlayPopup.current.setPosition(coord);
      if (el) {
        el.dispatchEvent(
          new CustomEvent('facilitiesmap-popup', {
            detail: { properties: feature.getProperties(), pinned },
          }),
        );
      }
    },
    [mapElementId],
  );

  const hidePopup = React.useCallback(() => {
    pinnedPopup.current = false;
    overlayPopup.current?.setPosition(undefined);
    const el = document.getElementById(mapElementId);
    if (el) {
      el.dispatchEvent(
        new CustomEvent('facilitiesmap-popup', { detail: null }),
      );
    }
  }, [mapElementId]);

  React.useEffect(() => {
    if (__SERVER__) return undefined;
    const el = document.getElementById(mapElementId);
    if (!el) return undefined;
    el.addEventListener('facilitiesmap-popup-close', hidePopup);
    return () => el.removeEventListener('facilitiesmap-popup-close', hidePopup);
  }, [hidePopup, mapElementId]);

  const onPointermove = React.useCallback(
    (e) => {
      if (__SERVER__ || !overlayPopup.current || e.dragging) return;
      const feature = e.map.forEachFeatureAtPixel(e.pixel, (f) => f, {
        hitTolerance: 5,
      });
      e.map.getTargetElement().style.cursor = feature ? 'pointer' : '';
      if (pinnedPopup.current) return;
      if (feature) showPopup(feature, false);
      else hidePopup();
    },
    [hidePopup, showPopup],
  );

  const onMapClick = React.useCallback(
    (e) => {
      if (__SERVER__ || !overlayPopup.current) return;
      const feature = e.map.forEachFeatureAtPixel(e.pixel, (f) => f, {
        hitTolerance: 5,
      });
      if (feature) showPopup(feature, true);
      else hidePopup();
    },
    [hidePopup, showPopup],
  );

  if (__SERVER__ || !baseSource || !vectorSource) {
    return (
      <div className="facilities-map-wrapper">
        <div className="facilities-map-shell" />
      </div>
    );
  }

  return (
    <div className="facilities-map-wrapper full-width">
      <div className="ui container facilities-map-sidebar-aligner">
        <aside className="facilities-map-sidebar">
          <div className="sidebar-header">
            <span className="eea-badge">EEA</span>
            <div>
              <h1>Explore Facilities</h1>
              <p className="subtitle">IEPR Facility Map</p>
            </div>
          </div>
          <div className="filter-block">
            <h2 className="section-title">Filters</h2>
            <div className="field-group">
              <label htmlFor={`${mapElementId}-search`}>Facility / City</label>
              <div className="search-wrapper">
                <span className="search-icon" role="img" aria-label="search">
                  {'\u{1F50D}'}
                </span>
                <input
                  id={`${mapElementId}-search`}
                  type="text"
                  placeholder="Search by name…"
                  autoComplete="off"
                  value={draft.name}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setShowSuggestions(false);
                    if (e.key === 'Enter') applyFilters();
                  }}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 120)
                  }
                />
                {showSuggestions && suggestions.length > 0 ? (
                  <ul className="suggestions-dropdown" role="listbox">
                    {suggestions.map((s) => (
                      <li
                        key={s}
                        role="option"
                        onMouseDown={() => {
                          const next = { ...draft, name: s };
                          setDraft(next);
                          applyFilters(next);
                        }}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
            <div className="field-group">
              <label htmlFor={`${mapElementId}-year`}>Reporting Year</label>
              <Dropdown
                id={`${mapElementId}-year`}
                fluid
                multiple
                selection
                search
                placeholder="All years"
                renderLabel={NO_LABEL}
                options={reportingYearOptions}
                value={draft.reportingYear}
                onChange={(_, d) =>
                  setDraft((s) => ({ ...s, reportingYear: d.value || [] }))
                }
              />
              <AppliedChips
                values={draft.reportingYear}
                options={reportingYearOptions}
                onRemove={(value) =>
                  setDraft((s) => ({
                    ...s,
                    reportingYear: s.reportingYear.filter((v) => v !== value),
                  }))
                }
              />
            </div>
            <div className="field-group">
              <label htmlFor={`${mapElementId}-country`}>Country</label>
              <Dropdown
                id={`${mapElementId}-country`}
                fluid
                multiple
                selection
                search
                placeholder="All countries"
                renderLabel={NO_LABEL}
                options={countryOptions}
                value={draft.country}
                onChange={(_, d) =>
                  setDraft((s) => ({ ...s, country: d.value || [] }))
                }
              />
              <AppliedChips
                values={draft.country}
                options={countryOptions}
                onRemove={(value) =>
                  setDraft((s) => ({
                    ...s,
                    country: s.country.filter((v) => v !== value),
                  }))
                }
              />
            </div>
            <div className="field-group">
              <label htmlFor={`${mapElementId}-sector`}>
                Industrial Sector
              </label>
              <Dropdown
                id={`${mapElementId}-sector`}
                fluid
                multiple
                selection
                search
                upward
                placeholder="All sectors"
                renderLabel={NO_LABEL}
                options={sectorOptions}
                value={draft.industrialSector}
                onChange={(_, d) =>
                  setDraft((s) => ({ ...s, industrialSector: d.value || [] }))
                }
              />
              <AppliedChips
                values={draft.industrialSector}
                options={sectorOptions}
                onRemove={(value) =>
                  setDraft((s) => ({
                    ...s,
                    industrialSector: s.industrialSector.filter(
                      (v) => v !== value,
                    ),
                  }))
                }
              />
            </div>
          </div>
          <div className="filter-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => applyFilters()}
            >
              Apply filters
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={resetFilters}
            >
              Reset
            </button>
          </div>
          <div className="result-bar">
            {featureCount === null
              ? 'Loading…'
              : `${featureCount.toLocaleString()} ${
                  featureCount === 1 ? 'facility' : 'facilities'
                } shown`}
          </div>
          <div className="legend-block">
            <h2 className="section-title">Legend</h2>
            <div className="legend-item">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  fill="#004b7f"
                  stroke="#fff"
                  strokeWidth="2"
                />
              </svg>
              <span>Facility location</span>
            </div>
          </div>
        </aside>
      </div>
      <main className="facilities-map-main">
        <div id={mapElementId} className="facilities-map-shell">
          <Map
            ref={(data) => {
              map.current = data?.map;
            }}
            view={view}
            onClick={onMapClick}
            onPointermove={onPointermove}
          >
            <Controls attribution={true} zoom={true} />
            <Interactions
              doubleClickZoom={true}
              dragPan={true}
              keyboardZoom={true}
              mouseWheelZoom={true}
              pointer={true}
              select={false}
            />
            <Layers>
              <Layer.Tile source={baseSource} zIndex={0} />
              <Layer.Vector
                source={vectorSource}
                style={featureStyle}
                zIndex={1}
              />
            </Layers>
            <Overlays
              ref={(data) => {
                overlayPopup.current = data?.overlay;
              }}
              className="ol-popup-facility"
              positioning="bottom-center"
              stopEvent={false}
              offset={[0, -10]}
            >
              <FacilityPopup mapElementId={mapElementId} />
            </Overlays>
          </Map>
          {loading ? (
            <div className="loading-overlay">
              <div className="spinner" />
              <span>Loading facilities…</span>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default compose(
  withOpenLayers,
  connect((state, props) => ({
    location: state.router.location,
    openlayers: props.ol,
  })),
)(View);
