/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withOpenLayers } from '@eeacms/volto-openlayers-map';
import { Map } from '@eeacms/volto-openlayers-map/Map';
import { Controls } from '@eeacms/volto-openlayers-map/Controls';
import { Interactions } from '@eeacms/volto-openlayers-map/Interactions';
import { Overlays } from '@eeacms/volto-openlayers-map/Overlays';
import { Layers, Layer } from '@eeacms/volto-openlayers-map/Layers';
import {
  FACILITIES_INDEX_URL,
  INSTALLATIONS_URL,
  COUNTRY_NAMES,
} from './index';
import './style.less';

const escHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const getParamValue = (params = [], key) => {
  const item = params.find((p) => p?.i === key);
  const value = Array.isArray(item?.v) ? item.v[0] : item?.v;
  return value || '';
};

const getConnectedParamsForPath = (connectedDataParameters, location) => {
  const byContextPath = connectedDataParameters?.byContextPath || {};
  const pathname = location?.pathname?.replace(/\/edit$/, '') || '';
  return byContextPath[pathname] || [];
};

const spreadOverlappingFeatures = (features) => {
  const groups = new globalThis.Map();
  features.forEach((feature) => {
    const coord = feature.getGeometry()?.getCoordinates();
    if (!coord) return;
    const key = coord.map((n) => Math.round(n * 100) / 100).join(',');
    groups.set(key, [...(groups.get(key) || []), feature]);
  });

  groups.forEach((group) => {
    if (group.length < 2) return;
    const facilities = group.filter((f) => f.get('entityType') === 'facility');
    const installations = group.filter(
      (f) => f.get('entityType') === 'installation',
    );
    installations.forEach((feature, index) => {
      const radius = Math.min(34, 14 + installations.length * 3);
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / installations.length;
      feature
        .getGeometry()
        .translate(Math.cos(angle) * radius, Math.sin(angle) * radius);
      feature.set('overlapCount', group.length);
    });
    facilities.forEach((feature) => feature.set('overlapCount', group.length));
  });
};

function InstallationPopup({ mapElementId }) {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    const el = document.getElementById(mapElementId);
    if (!el) return undefined;
    const handler = (e) => setData(e.detail || null);
    el.addEventListener('installationmap-hover', handler);
    return () => el.removeEventListener('installationmap-hover', handler);
  }, [mapElementId]);

  if (!data) {
    return (
      <div
        id={`${mapElementId}-popup`}
        className="map-popup installation-map-popup"
        style={{ display: 'none' }}
      />
    );
  }
  const isFacility = data.entityType === 'facility';
  const id = isFacility
    ? data.facilityLocalId || data.facilityInspireID || '—'
    : data.instLocalId || data.installationInspireID || '—';
  const status = (
    isFacility ? data.facilityStatus : data.installationStatus || ''
  ).toLowerCase();
  const cc = COUNTRY_NAMES[data.countryCode] || data.countryCode || '—';
  const activity = isFacility
    ? data.EPRTRAnnexIMainActivity
    : data.IEDAnnexIMainActivity;
  return (
    <div
      id={`${mapElementId}-popup`}
      className={`map-popup installation-map-popup ${isFacility ? 'facility-popup' : 'installation-popup'}`}
    >
      <div className="popup-tip" />
      <div className="popup-header">
        {isFacility ? 'Facility' : 'Installation'}
      </div>
      <div className="popup-body">
        {isFacility && data.city ? (
          <div className="popup-row">
            <span className="popup-label">City</span>
            <span className="popup-value">{escHtml(data.city)}</span>
          </div>
        ) : null}
        <div className="popup-row">
          <span className="popup-label">ID</span>
          <span className="popup-value">{escHtml(id)}</span>
        </div>
        <div className="popup-row">
          <span className="popup-label">Country</span>
          <span className="popup-value">{escHtml(cc)}</span>
        </div>
        <div className="popup-row">
          <span className="popup-label">Year</span>
          <span className="popup-value">{data.reportingYear ?? '—'}</span>
        </div>
        <div className="popup-row">
          <span className="popup-label">Activity</span>
          <span className="popup-value">{escHtml(activity) || '—'}</span>
        </div>
        <div className="popup-row">
          <span className="popup-label">Status</span>
          <span className="popup-value">
            <span className={`badge badge-${status || 'unknown'}`}>
              {status || '—'}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

const View = (props) => {
  const { openlayers, location, connected_data_parameters } = props;
  const { source, style, proj, format } = openlayers;

  const connectedParams = React.useMemo(
    () => getConnectedParamsForPath(connected_data_parameters, location),
    [connected_data_parameters, location?.pathname],
  );

  const selectedFacilityLocalId = React.useMemo(() => {
    const fromRedux = getParamValue(connectedParams, 'facilityLocalId');
    if (fromRedux) return fromRedux;
    return decodeURIComponent(
      (location?.pathname || '').split('/').pop() || '',
    );
  }, [connectedParams, location?.pathname]);

  const siteInspireID = React.useMemo(
    () => getParamValue(connectedParams, 'siteInspireID'),
    [connectedParams],
  );

  const selectedInstallationInspireID = React.useMemo(() => {
    const p = new URLSearchParams(location?.search || '');
    return p.get('installationInspireID') || '';
  }, [location?.search]);

  const map = React.useRef(null);
  const layerSites = React.useRef(null);
  const overlayPopup = React.useRef(null);
  const selectedFeatureRef = React.useRef(null);
  const mapElementId = React.useMemo(
    () => `installation-map-${Math.random().toString(36).slice(2, 9)}`,
    [],
  );

  const [facilityInfo, setFacilityInfo] = React.useState(null);
  const [facilities, setFacilities] = React.useState([]); // raw feature props
  const [installations, setInstallations] = React.useState([]); // raw feature props
  const [loading, setLoading] = React.useState(false);
  const [loadingMsg, setLoadingMsg] = React.useState('Loading…');

  // Stable OL artefacts.
  const baseSource = React.useMemo(
    () => (source ? new source.OSM() : null),
    [source],
  );
  const vectorSource = React.useMemo(
    () => (source ? new source.Vector() : null),
    [source],
  );

  // Facility + installation styles. The styleFn reads selectedFeatureRef so a
  // selection change just needs `layerSites.current.changed()`.
  const styles = React.useMemo(() => {
    if (!style) return null;
    return {
      facilityStyle: new style.Style({
        image: new style.Circle({
          radius: 9,
          fill: new style.Fill({ color: '#004b7f' }),
          stroke: new style.Stroke({ color: '#ffffff', width: 2 }),
        }),
      }),
      currentFacilityHalo: new style.Style({
        image: new style.Circle({
          radius: 18,
          fill: new style.Fill({ color: 'rgba(13, 69, 104, 0.16)' }),
          stroke: new style.Stroke({
            color: 'rgba(13, 69, 104, 0.42)',
            width: 2,
          }),
        }),
        zIndex: 3,
      }),
      currentFacilityStyle: new style.Style({
        image: new style.Circle({
          radius: 10,
          fill: new style.Fill({ color: '#0d4568' }),
          stroke: new style.Stroke({ color: '#ffffff', width: 3 }),
        }),
        zIndex: 4,
      }),
      installationStyle: new style.Style({
        image: new style.Circle({
          radius: 7,
          fill: new style.Fill({ color: '#e8760a' }),
          stroke: new style.Stroke({ color: '#ffffff', width: 2 }),
        }),
      }),
      currentFacilityInstallationStyle: new style.Style({
        image: new style.Circle({
          radius: 8,
          fill: new style.Fill({ color: '#e8760a' }),
          stroke: new style.Stroke({ color: '#ffffff', width: 2 }),
        }),
        zIndex: 2,
      }),
      selectedHalo: new style.Style({
        image: new style.Circle({
          radius: 13,
          fill: new style.Fill({ color: 'rgba(232, 118, 10, 0.18)' }),
          stroke: new style.Stroke({
            color: 'rgba(232, 118, 10, 0.50)',
            width: 2,
          }),
        }),
        zIndex: 5,
      }),
      selectedCore: new style.Style({
        image: new style.Circle({
          radius: 7,
          fill: new style.Fill({ color: '#e8760a' }),
          stroke: new style.Stroke({ color: '#ffffff', width: 2 }),
        }),
        zIndex: 6,
      }),
    };
  }, [style]);

  const installationStyle = React.useCallback(
    (feature) => {
      if (!styles) return null;
      if (
        feature === selectedFeatureRef.current ||
        (selectedInstallationInspireID &&
          feature.get('installationInspireID') ===
            selectedInstallationInspireID)
      ) {
        return [styles.selectedHalo, styles.selectedCore];
      }
      if (feature.get('entityType') === 'facility') {
        return feature.get('facilityLocalId') === selectedFacilityLocalId
          ? [styles.currentFacilityHalo, styles.currentFacilityStyle]
          : styles.facilityStyle;
      }
      const belongsToSelectedFacility =
        feature.get('facilityLocalId') === selectedFacilityLocalId ||
        (facilityInfo?.facilityInspireID &&
          feature.get('facilityInspireID') === facilityInfo.facilityInspireID);
      return belongsToSelectedFacility
        ? styles.currentFacilityInstallationStyle
        : styles.installationStyle;
    },
    [
      facilityInfo,
      selectedFacilityLocalId,
      selectedInstallationInspireID,
      styles,
    ],
  );

  const view = React.useMemo(
    () => (proj ? { center: proj.fromLonLat([10, 50]), zoom: 5 } : undefined),
    [proj],
  );

  // Load all sibling facilities and installations for the current site.
  React.useEffect(() => {
    if (__SERVER__ || !source || !format || !vectorSource) return undefined;

    selectedFeatureRef.current = null;
    overlayPopup.current?.setPosition(undefined);

    if (!siteInspireID) {
      vectorSource.clear();
      setFacilities([]);
      setInstallations([]);
      setFacilityInfo(null);
      return undefined;
    }

    let alive = true;
    setLoading(true);
    setLoadingMsg('Loading site map…');

    (async () => {
      try {
        const escapedSite = siteInspireID.replace(/'/g, "''");
        const common = {
          where: `siteInspireID = '${escapedSite}'`,
          outFields: '*',
          f: 'geojson',
          outSR: '4326',
        };
        const [facilitiesRes, installationsRes] = await Promise.all([
          fetch(`${FACILITIES_INDEX_URL}?${new URLSearchParams(common)}`),
          fetch(`${INSTALLATIONS_URL}?${new URLSearchParams(common)}`),
        ]);
        if (!facilitiesRes.ok)
          throw new Error(`Facilities HTTP ${facilitiesRes.status}`);
        if (!installationsRes.ok)
          throw new Error(`Installations HTTP ${installationsRes.status}`);

        const [facilitiesGeojson, installationsGeojson] = await Promise.all([
          facilitiesRes.json(),
          installationsRes.json(),
        ]);
        if (!alive) return;

        const facilityFeatures = new format.GeoJSON().readFeatures(
          facilitiesGeojson,
          { featureProjection: 'EPSG:3857' },
        );
        facilityFeatures.forEach((feature) => {
          feature.set('entityType', 'facility');
          feature.setId(
            `facility-${
              feature.get('facilityInspireID') ||
              feature.get('facilityLocalId') ||
              feature.get('ESRI_OID')
            }`,
          );
        });
        const installationFeatures = new format.GeoJSON().readFeatures(
          installationsGeojson,
          { featureProjection: 'EPSG:3857' },
        );
        installationFeatures.forEach((feature) => {
          feature.set('entityType', 'installation');
          feature.setId(
            `installation-${
              feature.get('installationInspireID') ||
              feature.get('instLocalId') ||
              feature.get('ESRI_OID')
            }`,
          );
        });

        const currentFacility = facilityFeatures.find(
          (feature) =>
            feature.get('facilityLocalId') === selectedFacilityLocalId,
        );
        const selectedInstallation =
          installationFeatures.find(
            (feature) =>
              selectedInstallationInspireID &&
              feature.get('installationInspireID') ===
                selectedInstallationInspireID,
          ) ||
          installationFeatures.find(
            (feature) =>
              currentFacility?.get('facilityInspireID') &&
              feature.get('facilityInspireID') ===
                currentFacility.get('facilityInspireID'),
          );
        selectedFeatureRef.current = selectedInstallation || null;

        const allFeatures = [...facilityFeatures, ...installationFeatures];
        spreadOverlappingFeatures(allFeatures);

        vectorSource.clear();
        vectorSource.addFeatures(allFeatures);
        setFacilities(facilityFeatures.map((f) => f.getProperties()));
        setInstallations(installationFeatures.map((f) => f.getProperties()));
        setFacilityInfo(currentFacility?.getProperties() || null);

        if (allFeatures.length) {
          const extent = vectorSource.getExtent();
          map.current?.getView().fit(extent, {
            padding: [60, 60, 60, 60],
            maxZoom: 14,
            duration: 600,
          });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load site map:', err);
        vectorSource.clear();
        setFacilities([]);
        setInstallations([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [
    siteInspireID,
    selectedFacilityLocalId,
    selectedInstallationInspireID,
    source,
    format,
    vectorSource,
  ]);

  // Hover popup via the OL pointermove event.
  const onPointermove = React.useCallback(
    (e) => {
      if (__SERVER__ || !overlayPopup.current || e.dragging) return;
      const feature = e.map.forEachFeatureAtPixel(e.pixel, (f) => f, {
        hitTolerance: 5,
      });
      const el = document.getElementById(mapElementId);
      if (feature) {
        const coord = feature.getGeometry().getCoordinates();
        overlayPopup.current.setPosition(coord);
        e.map.getTargetElement().style.cursor = 'pointer';
        if (el) {
          el.dispatchEvent(
            new CustomEvent('installationmap-hover', {
              detail: feature.getProperties(),
            }),
          );
        }
      } else {
        overlayPopup.current.setPosition(undefined);
        e.map.getTargetElement().style.cursor = '';
        if (el) {
          el.dispatchEvent(
            new CustomEvent('installationmap-hover', { detail: null }),
          );
        }
      }
    },
    [mapElementId],
  );

  if (__SERVER__ || !baseSource || !vectorSource) {
    return (
      <div className="installation-map-wrapper">
        <div className="installation-map-shell" />
      </div>
    );
  }

  const hasSite = !!siteInspireID;
  const instCountText = hasSite
    ? `${facilities.length} facilit${facilities.length === 1 ? 'y' : 'ies'} · ${installations.length} installation${installations.length !== 1 ? 's' : ''}`
    : '';

  return (
    <div className="installation-map-wrapper">
      <header className="installation-map-header">
        <div className="header-brand">
          <div className="installation-map-legend" aria-label="Map legend">
            <span className="legend-item">
              <span className="legend-dot legend-dot--facility" />
              Facility
            </span>
            <span className="legend-item">
              <span className="legend-dot legend-dot--current-facility" />
              Selected facility
            </span>
            <span className="legend-item">
              <span className="legend-dot legend-dot--installation" />
              Installation
            </span>
            <span className="legend-item">
              <span className="legend-dot legend-dot--selected-installation" />
              Selected installation
            </span>
          </div>
        </div>
        <div className="inst-count" aria-live="polite">
          {instCountText}
        </div>
      </header>

      <div className="installation-map-body">
        <main className="installation-map-main">
          <div id={mapElementId} className="installation-map-shell">
            <Map
              ref={(data) => {
                map.current = data?.map;
              }}
              view={view}
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
                  ref={(data) => {
                    layerSites.current = data?.layer;
                  }}
                  source={vectorSource}
                  style={installationStyle}
                  zIndex={1}
                />
              </Layers>
              <Overlays
                ref={(data) => {
                  overlayPopup.current = data?.overlay;
                }}
                className="ol-popup-installation"
                positioning="bottom-center"
                stopEvent={false}
                offset={[0, -10]}
              >
                <InstallationPopup mapElementId={mapElementId} />
              </Overlays>
            </Map>

            {!hasSite ? (
              <div className="hint-overlay">
                <div className="hint-card">
                  <div className="hint-icon" aria-hidden>
                    {'\u{1F3ED}'}
                  </div>
                  <p>No site context found for this facility.</p>
                </div>
              </div>
            ) : null}

            {loading ? (
              <div className="loading-overlay">
                <div className="spinner" />
                <span>{loadingMsg}</span>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
};

export default compose(
  withOpenLayers,
  connect((state, props) => ({
    location: state.router.location,
    connected_data_parameters: state.connected_data_parameters,
    openlayers: props.ol,
  })),
)(View);
