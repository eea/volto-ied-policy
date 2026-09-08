/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import jsonp from 'jsonp';
import qs from 'querystring';
import { toast } from 'react-toastify';
import { doesNodeContainClick } from 'semantic-ui-react/dist/commonjs/lib';
import { Icon, Toast } from '@plone/volto/components';
import { connectToMultipleProvidersUnfiltered } from '@eeacms/volto-datablocks/hocs';
import { withOpenLayers } from '@eeacms/volto-openlayers-map';
import { Map } from '@eeacms/volto-openlayers-map/Map';
import { Interactions } from '@eeacms/volto-openlayers-map/Interactions';
import { Overlays } from '@eeacms/volto-openlayers-map/Overlays';
import { Controls, Control } from '@eeacms/volto-openlayers-map/Controls';
import { Layers, Layer } from '@eeacms/volto-openlayers-map/Layers';
import { StyleWrapperView } from '@eeacms/volto-block-style/StyleWrapper';
import PrivacyProtection from '@eeacms/volto-ied-policy/components/manage/Blocks/PrivacyProtection';
import { setIndustryMapFilters } from '@eeacms/volto-ied-policy/actions';
import { emitEvent } from '@eeacms/volto-ied-policy/helpers.js';
import { searchParamsToFilters } from './urlFilters';

import {
  dataprotection,
  getLayerSitesURL,
  // getLayerRegionsURL,
  getLayerBaseURL,
  getLocationExtent,
  getSiteExtent,
  getFacilityExtent,
  getCountriesExtent,
  getWhereStatement,
} from './index';

import Sidebar from './Sidebar';
import Popup from './Popup';
import PopupDetailed from './PopupDetailed';

import navigationSVG from '@plone/volto/icons/navigation.svg';

import './styles.less';

// let _REQS = 0;
// const zoomSwitch = 6;
const HOVER_SITE_OUT_FIELDS = 'OBJECTID,siteName';
const CLICK_SITE_OUT_FIELDS = [
  'OBJECTID',
  'InspireSiteId',
  'siteName',
  'Site_reporting_year',
  'count_factype_EPRTR',
  'count_factype_NONEPRTR',
  'count_instype_IED',
  'count_instype_NONIED',
  'count_plantType_LCP',
  'count_plantType_WI',
  'count_plantType_coWI',
  'pollutants',
  'numInspections',
].join(',');

const debounce = (timerRef, func, timeout = 200) => {
  if (timerRef.current) clearTimeout(timerRef.current);
  timerRef.current = setTimeout(() => {
    timerRef.current = null;
    func();
  }, timeout);
};

// const getWhereStatementFromUrl = (params) => {
//   let query = '';
//   for (const [key, value] of params.entries()) {
//     if (key === 'siteName') {
//       query += `siteName LIKE '${value}%'`;
//     } else {
//       query += `(${key} = ${value})`;
//     }
//   }
// };

const getSitesSource = (query, openlayers) => {
  // return {};
  const { source } = openlayers;
  return new source.TileArcGISRest({
    params: {
      layerDefs: JSON.stringify({
        0: getWhereStatement(query),
      }),
    },
    url: 'https://air.discomap.eea.europa.eu/arcgis/rest/services/Air/IED_SiteMap/MapServer',
  });
};

const getClosestFeatureToCoordinate = (coordinate, features) => {
  if (!features.length) return null;
  const x = coordinate[0];
  const y = coordinate[1];
  let closestFeature = null;
  const closestPoint = [NaN, NaN];
  let minSquaredDistance = Infinity;
  features.forEach((feature) => {
    const geometry = feature.getGeometry();
    const previousMinSquaredDistance = minSquaredDistance;
    minSquaredDistance = geometry.closestPointXY(
      x,
      y,
      closestPoint,
      minSquaredDistance,
    );
    if (minSquaredDistance < previousMinSquaredDistance) {
      closestFeature = feature;
    }
  });

  return closestFeature;
};

const View = (props) => {
  const [mapRendered, setMapRendered] = useState(false);
  const [loading] = useState(false);
  const map = useRef(null);
  const layerSites = useRef(null);
  const overlayPopup = useRef(null);
  const overlayPopupDetailed = useRef(null);
  const isMounted = useRef(true);
  const pointermoveTimer = useRef(null);
  const layerUpdateTimer = useRef(null);
  const pointermoveCancel = useRef(null);
  const clickCancel = useRef(null);
  const pointermoveRequestId = useRef(0);
  const clickRequestId = useRef(0);
  const { openlayers } = props;

  // Map registers event callbacks only once, so they must read changing filters
  // through a ref instead of their initial render's props.
  const currentWhere = getWhereStatement(props.query);
  const whereRef = useRef(currentWhere);
  whereRef.current = currentWhere;

  const olLoaded = !!(
    openlayers.proj &&
    openlayers.source &&
    openlayers.extent &&
    openlayers.coordinate &&
    openlayers.format
  );
  const { proj, source, extent } = openlayers;

  // Build the OL sources ONCE per loaded-lib reference. Recreating them on every
  // render makes Tile.componentDidUpdate swap the layer source -> tiles refetch
  // (base map + data reload on every zoom/pan/filter). The sites source is kept
  // stable and its filters are updated in place via updateParams (see effect).
  const baseSource = useMemo(
    () => (source ? new source.XYZ({ url: getLayerBaseURL() }) : null),
    [source],
  );
  const sitesSource = useMemo(
    () => (source ? getSitesSource(props.query, openlayers) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [source],
  );
  // Stable view options so Map.componentDidUpdate never resets the view.
  const view = useMemo(
    () =>
      proj
        ? {
            center: proj.fromLonLat([20, 50]),
            showFullExtent: true,
            minZoom: 1,
            zoom: 1,
          }
        : undefined,
    [proj],
  );
  // Stable callback ref: avoids null/re-attach churn on every render.
  const setSitesLayerRef = React.useCallback((data) => {
    layerSites.current = data?.layer;
  }, []);

  const centerToPosition = (position, zoom) => {
    const { proj } = openlayers;
    return map?.current?.getView().animate({
      center: proj.fromLonLat([
        position.coords?.longitude,
        position.coords?.latitude,
      ]),
      duration: 1000,
      zoom,
    });
  };

  const centerToUserLocation = (ignoreExtent = true) => {
    if (__SERVER__ || !map.current || !navigator?.geolocation) return;
    const extent = props.query.map_extent;

    if (!extent || ignoreExtent) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          return centerToPosition(position, 12);
        },
        // Errors
        () => {},
      );
    } else {
      map?.current
        ?.getView()
        .fit([extent[0], extent[1], extent[2], extent[3]], {
          maxZoom: 16,
          duration: 1000,
        });
    }
  };

  const onPointermove = (e) => {
    if (__SERVER__ || !overlayPopup.current || e.type !== 'pointermove') return;

    const requestId = ++pointermoveRequestId.current;
    if (pointermoveTimer.current) clearTimeout(pointermoveTimer.current);
    pointermoveCancel.current?.();
    pointermoveCancel.current = null;

    if (e.dragging) {
      // e.map.getTarget().style.cursor = 'grabbing';
      return;
    }
    if (
      doesNodeContainClick(
        document.querySelector('#map-sidebar'),
        e.originalEvent,
      )
    ) {
      overlayPopup?.current?.setPosition(undefined);
      e.map.getTarget().style.cursor = '';
      return;
    }
    const zoom = e.map.getView().getZoom();
    const { coordinate, proj } = openlayers;
    const mapElement = document.querySelector('#industry-map');
    const resolution = e.map.getView().getResolution();
    const pointerExtent = [
      e.coordinate[0] - (zoom >= 8 ? 8 : 6) * resolution,
      e.coordinate[1] - (zoom >= 8 ? 8 : 6) * resolution,
      e.coordinate[0] + (zoom >= 8 ? 8 : 6) * resolution,
      e.coordinate[1] + (zoom >= 8 ? 8 : 6) * resolution,
    ];
    if (!overlayPopup.current) return;

    const queryFeature = () => {
      const esrijsonFormat = new openlayers.format.EsriJSON();
      const where = whereRef.current;
      pointermoveCancel.current = jsonp(
        getLayerSitesURL(pointerExtent, HOVER_SITE_OUT_FIELDS),
        {
          prefix: '__jps',
          param:
            (where
              ? qs.stringify({
                  where,
                })
              : '') + '&callback',
        },
        (error, response) => {
          if (requestId === pointermoveRequestId.current) {
            pointermoveCancel.current = null;
          }
          if (
            !isMounted.current ||
            requestId !== pointermoveRequestId.current ||
            where !== whereRef.current
          ) {
            return;
          }
          if (!error) {
            let features = esrijsonFormat.readFeatures(response);
            const feature = getClosestFeatureToCoordinate(
              e.coordinate,
              features,
            );
            if (!feature) {
              if (typeof overlayPopup?.current?.setPosition == 'function') {
                overlayPopup.current?.setPosition(undefined);
                emitEvent(mapElement, 'ol-pointermove', {
                  bubbles: false,
                  detail: {},
                });
              }

              return;
            }
            let hdms = coordinate.toStringHDMS(
              proj.toLonLat(feature.getGeometry().flatCoordinates),
            );
            const featuresProperties = feature.getProperties();
            emitEvent(mapElement, 'ol-pointermove', {
              bubbles: false,
              detail: {
                ...featuresProperties,
                hdms,
                flatCoordinates: feature.getGeometry().flatCoordinates,
              },
            });
            overlayPopup.current?.setPosition(e.coordinate);
            e.map.getTarget().style.cursor = 'pointer';
          }
        },
      );
    };
    debounce(pointermoveTimer, queryFeature, 250);
    overlayPopup.current?.setPosition(undefined);
    e.map.getTarget().style.cursor = '';
  };

  const onClick = (e) => {
    const zoom = e.map.getView().getZoom();
    if (__SERVER__ || !overlayPopup.current || !overlayPopupDetailed.current) {
      return;
    }
    const requestId = ++clickRequestId.current;
    clickCancel.current?.();
    clickCancel.current = null;
    const { coordinate, proj, format } = openlayers;
    const esrijsonFormat = new format.EsriJSON();
    const where = whereRef.current;
    const mapElement = document.querySelector('#industry-map');
    const resolution = e.map.getView().getResolution();
    const pointerExtent = [
      e.coordinate[0] - (zoom >= 8 ? 8 : 6) * resolution,
      e.coordinate[1] - (zoom >= 8 ? 8 : 6) * resolution,
      e.coordinate[0] + (zoom >= 8 ? 8 : 6) * resolution,
      e.coordinate[1] + (zoom >= 8 ? 8 : 6) * resolution,
    ];
    clickCancel.current = jsonp(
      getLayerSitesURL(pointerExtent, CLICK_SITE_OUT_FIELDS),
      {
        prefix: '__jps',
        param:
          (where
            ? qs.stringify({
                where,
              })
            : '') + '&callback',
      },
      (error, response) => {
        if (requestId === clickRequestId.current) {
          clickCancel.current = null;
        }
        if (
          !isMounted.current ||
          requestId !== clickRequestId.current ||
          where !== whereRef.current
        ) {
          return;
        }
        if (!error) {
          let features = esrijsonFormat.readFeatures(response);
          const feature = getClosestFeatureToCoordinate(e.coordinate, features);

          if (!feature) {
            emitEvent(mapElement, 'ol-click', {
              bubbles: false,
              detail: {},
            });
            return;
          }
          let hdms = coordinate.toStringHDMS(
            proj.toLonLat(feature.getGeometry().flatCoordinates),
          );
          const featuresProperties = feature.getProperties();
          e.map.getTarget().style.cursor = '';
          overlayPopup?.current.setPosition(undefined);
          overlayPopupDetailed?.current.setPosition(e.coordinate);
          emitEvent(mapElement, 'ol-click', {
            bubbles: false,
            detail: {
              ...featuresProperties,
              hdms,
              flatCoordinates: feature.getGeometry().flatCoordinates,
            },
          });
        }
      },
    );
  };

  const onMoveend = (e) => {
    if (!e.map) return;
    const extent = e.map.getView().calculateExtent(e.map.getSize());
    props.setIndustryMapFilters({
      map_extent: extent,
    });
  };

  //fix bug where map was rendering only after scrolling
  useEffect(() => {
    //temporary fix
    if (__CLIENT__ && window) window.scrollBy(0, 200);
  }, []);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (pointermoveTimer.current) clearTimeout(pointermoveTimer.current);
      if (layerUpdateTimer.current) clearTimeout(layerUpdateTimer.current);
      pointermoveCancel.current?.();
      clickCancel.current?.();
      setMapRendered(false);
    };
  }, []);

  useEffect(() => {
    pointermoveRequestId.current += 1;
    clickRequestId.current += 1;
    if (pointermoveTimer.current) clearTimeout(pointermoveTimer.current);
    pointermoveCancel.current?.();
    clickCancel.current?.();
    pointermoveCancel.current = null;
    clickCancel.current = null;
  }, [currentWhere]);

  useEffect(() => {
    if (!mapRendered || !layerSites.current) return;
    const updateSitesLayer = () => {
      if (typeof layerSites.current?.getSource === 'function') {
        layerSites.current.getSource().updateParams({
          layerDefs: JSON.stringify({
            0: currentWhere,
          }),
        });
      }
    };
    debounce(layerUpdateTimer, updateSitesLayer, 500);

    return () => {
      if (layerUpdateTimer.current) clearTimeout(layerUpdateTimer.current);
      layerUpdateTimer.current = null;
    };
  }, [currentWhere, mapRendered]);

  useEffect(() => {
    if (!mapRendered || !map.current) return;
    centerToUserLocation();
  }, [mapRendered]);

  useEffect(() => {
    const { filter_change, filter_search } = props.query;
    if (!filter_change) return;
    const filter_countries = (props.query.filter_countries || []).filter(
      (value) => value,
    );

    /* Fit view if necessary */
    if (filter_change.type === 'search-location') {
      getLocationExtent(filter_search).then(({ data }) => {
        if (!isMounted.current || !map.current) return;
        if (data.candidates?.length > 0) {
          map.current
            .getView()
            .fit(
              [
                data.candidates[0].extent.xmin,
                data.candidates[0].extent.ymin,
                data.candidates[0].extent.xmax,
                data.candidates[0].extent.ymax,
              ],
              {
                maxZoom: 16,
                duration: 1000,
              },
            );
        }
      });
    } else if (filter_change.type === 'search-site') {
      getSiteExtent(filter_search).then(({ data }) => {
        if (!isMounted.current || !map.current) return;
        const extent = data?.results?.[0] || {};
        if (
          extent.MIN_X === null ||
          extent.MIN_Y === null ||
          extent.MAX_X === null ||
          extent.MAX_Y === null
        ) {
          toast.warn(
            <Toast
              warn
              title=""
              content={`No results for ${filter_search.text}`}
            />,
          );
        } else {
          map.current
            .getView()
            .fit([extent.MIN_X, extent.MIN_Y, extent.MAX_X, extent.MAX_Y], {
              maxZoom: 16,
              duration: 1000,
              padding: [100, 100, 100, 100],
            });
        }
      });
    } else if (filter_change.type === 'search-facility') {
      getFacilityExtent(filter_search).then(({ data }) => {
        if (!isMounted.current || !map.current) return;
        const extent = data?.results?.[0] || {};
        if (
          extent.MIN_X === null ||
          extent.MIN_Y === null ||
          extent.MAX_X === null ||
          extent.MAX_Y === null
        ) {
          toast.warn(
            <Toast
              warn
              title=""
              content={`No results for ${filter_search.text}`}
            />,
          );
        } else {
          map.current
            .getView()
            .fit([extent.MIN_X, extent.MIN_Y, extent.MAX_X, extent.MAX_Y], {
              maxZoom: 16,
              duration: 1000,
              padding: [100, 100, 100, 100],
            });
        }
      });
    } else if (
      (filter_change.type === 'advanced-filter' ||
        filter_change.type === 'simple-filter') &&
      filter_countries.length
    ) {
      const countriesOptions = props.providers_data.countries || {};
      const countries = [];
      (countriesOptions.opt_key || []).forEach((code, index) => {
        if ((filter_countries || []).includes(code)) {
          countries.push(countriesOptions.opt_text[index]);
        }
      });
      getCountriesExtent(countries).then((responses) => {
        if (!isMounted.current || !map.current) return;
        let _extent = extent.createEmpty();
        responses.forEach(({ data }) => {
          const reqExtent = data.candidates?.[0]?.extent || null;
          if (reqExtent) {
            extent.extend(
              _extent,
              proj.transformExtent(
                [
                  reqExtent.xmin,
                  reqExtent.ymin,
                  reqExtent.xmax,
                  reqExtent.ymax,
                ],
                'EPSG:4326',
                'EPSG:3857',
              ),
            );
          }
        });
        if (!extent.isEmpty(_extent)) {
          map.current.getView().fit(_extent, {
            maxZoom: 16,
            duration: 1000,
          });
        }
      });
    }
  }, [props.query?.filter_change?.counter]);

  if (__SERVER__ || !olLoaded)
    return (
      <StyleWrapperView
        {...props}
        styleData={props.data.styles || {}}
        styled={true}
      >
        <div
          className={`industry-map-wrapper${
            props.data?.navigation?.smallHeight ? ' small-height' : ''
          }`}
        >
          <div id="industry-map" className="industry-map"></div>
        </div>
      </StyleWrapperView>
    );

  return (
    <StyleWrapperView
      {...props}
      styleData={props.data.styles || {}}
      styled={true}
    >
      <div
        className={`industry-map-wrapper${
          props.data?.navigation?.smallHeight ? ' small-height' : ''
        }`}
      >
        <div id="industry-map" className="industry-map">
          <PrivacyProtection data={{ dataprotection }}>
            <Map
              ref={(data) => {
                map.current = data?.map;
                if (data?.mapRendered && !mapRendered) {
                  setMapRendered(true);
                }
              }}
              view={view}
              renderer="webgl"
              onPointermove={onPointermove}
              onClick={onClick}
              onMoveend={onMoveend}
            >
              <Controls attribution={false} zoom={true}>
                <Control className="ol-custom">
                  <button
                    className="navigation-button"
                    title="Center to user location"
                    onClick={() => {
                      centerToUserLocation(true);
                    }}
                  >
                    <Icon name={navigationSVG} size="1em" fill="white" />
                  </button>
                </Control>
              </Controls>
              <Interactions
                doubleClickZoom={true}
                keyboardZoom={true}
                mouseWheelZoom={true}
                pointer={true}
                select={false}
                pinchRotate={false}
                altShiftDragRotate={false}
              />
              <Layers>
                <Layer.Tile source={baseSource} zIndex={0} />
                {/* <Layer.VectorImage
                  className="ol-layer-regions"
                  ref={(data) => {
                    this.layerRegions.current = data?.layer;
                  }}
                  source={
                    new source.Vector({
                      loader: function (extent, _, projection) {
                        const esrijsonFormat = new format.EsriJSON();
                        let url = getLayerRegionsURL(extent);
                        jsonp(url, {}, (error, response) => {
                          if (!error) {
                            let features = esrijsonFormat.readFeatures(
                              response,
                              {
                                featureProjection: projection,
                              },
                            );
                            if (features?.length > 0) {
                              this.addFeatures(features);
                            }
                          }
                        });
                      },
                      strategy: loadingstrategy.tile(
                        tilegrid.createXYZ({
                          tileSize: 256,
                        }),
                      ),
                    })
                  }
                  style={() => {
                    if (!this.map.current) return;
                    const zoom = this.map.current.getView().getZoom();
                    if (zoom >= zoomSwitch || !!window['__where']) return;
                    return this.styles.regionCircle;
                  }}
                  title="1.Regions"
                  zIndex={1}
                /> */}
                <Layer.Tile
                  ref={setSitesLayerRef}
                  className="ol-layer-sites"
                  source={sitesSource}
                  title="2.Sites"
                  zIndex={1}
                />
              </Layers>
              <Overlays
                ref={(data) => {
                  overlayPopup.current = data?.overlay;
                }}
                className="ol-popup"
                positioning="center-center"
                stopEvent={true}
              >
                <Popup overlay={overlayPopup} />
              </Overlays>
              <Overlays
                ref={(data) => {
                  overlayPopupDetailed.current = data?.overlay;
                }}
                className="ol-popup-detailed"
                positioning="center-center"
                stopEvent={true}
              >
                <PopupDetailed overlay={overlayPopupDetailed} />
              </Overlays>
              {!props.data?.hideFilters && (
                <Overlays
                  className="ol-dynamic-filter"
                  positioning="center-center"
                  stopEvent={true}
                >
                  <Sidebar
                    data={props.data}
                    providers_data={props.providers_data}
                  />
                </Overlays>
              )}

              {loading ? <div className="loader">Loading...</div> : ''}
            </Map>
          </PrivacyProtection>
        </div>
      </div>
    </StyleWrapperView>
  );
};

export default compose(
  withOpenLayers,
  connect(
    (state, props) => ({
      query: {
        // raw URL params (lat / lng / siteName ...) read directly
        ...qs.parse(state.router.location.search.replace('?', '')),
        // user-facing filters decoded from the URL (source of truth)
        ...searchParamsToFilters(state.router.location.search),
        // cross-component coordination state (filter_change, map_extent, ...)
        ...state.industryMapFilters.search,
      },
      location: state.router.location,
      navigation: state.navigation.items,
      screen: state.screen,
      openlayers: props.ol,
    }),
    {
      setIndustryMapFilters,
    },
  ),
  connectToMultipleProvidersUnfiltered((props) => ({
    providers: props.data.providers,
  })),
)(View);
