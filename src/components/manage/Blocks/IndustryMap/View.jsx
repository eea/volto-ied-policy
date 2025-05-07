/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import jsonp from 'jsonp';
import qs from 'querystring';
import { toast } from 'react-toastify';
import { doesNodeContainClick } from 'semantic-ui-react/dist/commonjs/lib';
import { Icon, Toast } from '@plone/volto/components';
import { connectToMultipleProvidersUnfiltered } from '@eeacms/volto-datablocks/hocs';
import { Map } from '@eeacms/volto-openlayers-map/Map';
import { Interactions } from '@eeacms/volto-openlayers-map/Interactions';
import { Overlays } from '@eeacms/volto-openlayers-map/Overlays';
import { Controls, Control } from '@eeacms/volto-openlayers-map/Controls';
import { Layers, Layer } from '@eeacms/volto-openlayers-map/Layers';
import { openlayers } from '@eeacms/volto-openlayers-map';
import { StyleWrapperView } from '@eeacms/volto-block-style/StyleWrapper';
import PrivacyProtection from '@eeacms/volto-ied-policy/components/manage/Blocks/PrivacyProtection';
import { setQuery } from '@eeacms/volto-ied-policy/actions';
import { emitEvent } from '@eeacms/volto-ied-policy/helpers.js';

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
  mercatorToLatLon,
} from './index';

import Sidebar from './Sidebar';
import Popup from './Popup';
import PopupDetailed from './PopupDetailed';

import navigationSVG from '@plone/volto/icons/navigation.svg';

import './styles.less';

// let _REQS = 0;
// const zoomSwitch = 6;
let timer = [];

const debounce = (func, index, timeout = 200, ...args) => {
  if (timer[index]) clearTimeout(timer[index]);
  timer[index] = setTimeout(func, timeout, ...args);
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

const getSitesSource = (query) => {
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
  const { proj, source, extent } = openlayers;

  const centerToQueryLocation = (position, zoom) => {
    const { proj } = openlayers;
    return map.current.getView().animate({
      center: proj.fromLonLat([
        position.coords.longitude,
        position.coords.latitude,
      ]),
      duration: 1000,
      zoom,
    });
  };

  const centerToPosition = (position, zoom) => {
    const { proj } = openlayers;
    return map.current.getView().animate({
      center: proj.fromLonLat([
        position.coords.longitude,
        position.coords.latitude,
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
      map.current.getView().fit([extent[0], extent[1], extent[2], extent[3]], {
        maxZoom: 16,
        duration: 1000,
      });
    }
  };

  const onPointermove = (e) => {
    if (__SERVER__ || !overlayPopup.current || e.type !== 'pointermove') return;

    // If the popup is currently locked, ignore pointermove events
    if (props.query?.siteName) return;

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
      overlayPopup.current?.setPosition(undefined);
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
    if (!overlayPopup?.current) return;

    debounce(
      () => {
        const esrijsonFormat = new openlayers.format.EsriJSON();
        const where = getWhereStatement(props.query);
        jsonp(
          getLayerSitesURL(pointerExtent),
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
            if (!error) {
              let features = esrijsonFormat.readFeatures(response);
              const feature = getClosestFeatureToCoordinate(
                e.coordinate,
                features,
              );
              if (!feature) {
                overlayPopup.current.setPosition(undefined);
                emitEvent(mapElement, 'ol-pointermove', {
                  bubbles: false,
                  detail: {},
                });
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
              overlayPopup.current.setPosition(e.coordinate);
              e.map.getTarget().style.cursor = 'pointer';
            }
          },
        );
      },
      0,
      250,
    );
    overlayPopup.current.setPosition(undefined);
    e.map.getTarget().style.cursor = '';
  };

  const onClick = (e) => {
    const zoom = e.map.getView().getZoom();
    if (__SERVER__ || !overlayPopup.current || !overlayPopupDetailed.current) {
      return;
    }
    const { coordinate, proj, format } = openlayers;
    const esrijsonFormat = new format.EsriJSON();
    const where = getWhereStatement(props.query);
    const mapElement = document.querySelector('#industry-map');
    const resolution = e.map.getView().getResolution();
    const pointerExtent = [
      e.coordinate[0] - (zoom >= 8 ? 8 : 6) * resolution,
      e.coordinate[1] - (zoom >= 8 ? 8 : 6) * resolution,
      e.coordinate[0] + (zoom >= 8 ? 8 : 6) * resolution,
      e.coordinate[1] + (zoom >= 8 ? 8 : 6) * resolution,
    ];
    jsonp(
      getLayerSitesURL(pointerExtent),
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
          overlayPopup.current.setPosition(undefined);
          overlayPopupDetailed.current.setPosition(e.coordinate);
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
    props.setQuery({
      map_extent: extent,
    });
  };

  useEffect(() => {
    return () => {
      setMapRendered(false);
    };
  }, []);

  useEffect(() => {
    if (!mapRendered || !map.current) return;

    const lat = props?.query?.lat;
    const lng = props?.query?.lng;

    if (lat && lng) {
      const formattedLatLng = mercatorToLatLon(lng, lat);
      const coords = proj.fromLonLat([
        formattedLatLng.lng,
        formattedLatLng.lat,
      ]);

      centerToQueryLocation(
        {
          coords: {
            latitude: formattedLatLng.lat,
            longitude: formattedLatLng.lng,
          },
        },
        12,
      );

      // Show persistent popup at selected location
      if (overlayPopup.current) {
        let hdms = openlayers.coordinate.toStringHDMS(
          proj.toLonLat([lng, lat]),
        );
        overlayPopup.current.setPosition(coords);
        emitEvent(document.querySelector('#industry-map'), 'ol-pointermove', {
          bubbles: false,
          detail: {
            siteName: props.query?.siteName || 'Selected site',
            hdms,
          },
        });
      }
    } else {
      centerToUserLocation();
    }
  }, [mapRendered, props?.query?.lat, props?.query?.lng]);

  useEffect(() => {
    const { filter_change, filter_search } = props.query;
    if (!filter_change) return;
    const filter_countries = (props.query.filter_countries || []).filter(
      (value) => value,
    );
    /* Trigger update of features style */
    if (layerSites.current) {
      debounce(
        () => {
          layerSites.current.getSource().updateParams({
            layerDefs: JSON.stringify({
              0: getWhereStatement(props.query),
            }),
          });
          // this.layerRegions.current.changed();
        },
        1,
        500,
      );
    }

    /* Fit view if necessary */
    if (filter_change.type === 'search-location') {
      getLocationExtent(filter_search).then(({ data }) => {
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
            });
        }
      });
    } else if (filter_change.type === 'search-facility') {
      getFacilityExtent(filter_search).then(({ data }) => {
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

  if (__SERVER__) return '';

  const lat = props?.query?.lat;
  const lng = props?.query?.lng;

  let hdms = null;
  if (lat && lng) {
    const { lat: latWGS84, lng: lngWGS84 } = mercatorToLatLon(lng, lat);
    hdms = openlayers.coordinate.toStringHDMS([lngWGS84, latWGS84]);
  }

  return (
    <>
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
                view={{
                  center: proj.fromLonLat([20, 50]),
                  showFullExtent: true,
                  // maxZoom: 1,
                  minZoom: 1,
                  zoom: 1,
                }}
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
                  <Layer.Tile
                    source={
                      new source.XYZ({
                        url: getLayerBaseURL(),
                      })
                    }
                    zIndex={0}
                  />
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
                    ref={(data) => {
                      layerSites.current = data?.layer;
                    }}
                    className="ol-layer-sites"
                    source={getSitesSource(props.query)}
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
                  <Popup
                    overlay={overlayPopup}
                    className={props.query?.siteName ? 'fixed-popup' : ''}
                    lock={!!props.query?.siteName}
                    staticData={{
                      siteName: props.query?.siteName || 'No site name',
                      hdms,
                    }}
                  />
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
    </>
  );
};

export default compose(
  connect(
    (state) => ({
      query: {
        ...qs.parse(state.router.location.search.replace('?', '')),
        ...state.query.search,
      },
      location: state.router.location,
      navigation: state.navigation.items,
      screen: state.screen,
    }),
    {
      setQuery,
    },
  ),
  connectToMultipleProvidersUnfiltered((props) => ({
    providers: props.data.providers,
  })),
)(View);
