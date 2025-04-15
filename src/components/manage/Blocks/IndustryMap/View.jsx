import React from 'react';
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
  getStyles,
  getLayerSitesURL,
  // getLayerRegionsURL,
  getLayerBaseURL,
  getLocationExtent,
  getSiteExtent,
  getFacilityExtent,
  getCountriesExtent,
  getWhereStatement,
} from './index';

import { Container, Grid } from 'semantic-ui-react';

import Sidebar from './Sidebar';
import Popup from './Popup';
import PopupDetailed from './PopupDetailed';

import navigationSVG from '@plone/volto/icons/navigation.svg';

import './styles.less';
import Filters from './Filters';
import NavigationBlock from './Navigation';
import IndustryDataTable from './IndustryDataTable';
// let _REQS = 0;
// const zoomSwitch = 6;
let timer = [];

const debounce = (func, index, timeout = 200, ...args) => {
  if (timer[index]) clearTimeout(timer[index]);
  timer[index] = setTimeout(func, timeout, ...args);
};

const getSitesSource = (self) => {
  const { source } = openlayers;
  return new source.TileArcGISRest({
    params: {
      layerDefs: JSON.stringify({
        0: getWhereStatement(self.props.query),
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
class View extends React.PureComponent {
  /**
   * Property types.
   * @property {Object} propTypes Property types.
   * @static
   */
  static propTypes = {};

  /**
   * Constructor
   * @method constructor
   * @param {Object} props Component properties
   * @constructs Navigation
   */
  constructor(props) {
    super(props);
    const { style } = openlayers;
    this.onFeatureLoad = this.onFeatureLoad.bind(this);
    this.centerToPosition = this.centerToPosition.bind(this);
    this.centerToUserLocation = this.centerToUserLocation.bind(this);
    this.getFeatureInRange = this.getFeatureInRange.bind(this);
    this.onPointermove = this.onPointermove.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onMoveend = this.onMoveend.bind(this);
    this.state = {
      mapRendered: false,
      loading: false,
    };
    this.styles = __CLIENT__ ? getStyles(style) : {};
    this.map = React.createRef();
    this.layerRegions = React.createRef();
    this.layerSites = React.createRef();
    this.overlayPopup = React.createRef();
    this.overlayPopupDetailed = React.createRef();
  }

  componentDidMount() {
    window['__where'] = getWhereStatement(this.props.query);
  }

  componentWillUnmount() {
    this.setState({ mapRendered: false });
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.state.mapRendered || !this.map.current) return;
    const { extent, proj } = openlayers;
    const { filter_change, filter_search } = this.props.query;
    window['__where'] = getWhereStatement(this.props.query);
    const filter_countries = (this.props.query.filter_countries || []).filter(
      (value) => value,
    );
    if (!prevState.mapRendered) {
      this.centerToUserLocation();
    }
    if (filter_change?.counter !== prevProps.query.filter_change?.counter) {
      /* Trigger update of features style */
      debounce(
        () => {
          this.layerSites.current.getSource().updateParams({
            layerDefs: JSON.stringify({
              0: getWhereStatement(this.props.query),
            }),
          });
          // this.layerRegions.current.changed();
        },
        1,
        500,
      );
      /* Fit view if necessary */
      if (filter_change.type === 'search-location') {
        getLocationExtent(filter_search).then(({ data }) => {
          if (data.candidates?.length > 0) {
            this.map.current
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
            this.map.current
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
            this.map.current
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
        const countriesOptions = this.props.providers_data.countries || {};
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
            this.map.current.getView().fit(_extent, {
              maxZoom: 16,
              duration: 1000,
            });
          }
        });
      }
    }
  }

  onFeatureLoad(e) {
    const { loaded } = e.detail;
    if (loaded && this.state.loading) {
      this.setState({ loading: false });
    } else if (!loaded && !this.state.loading) {
      this.setState({ loading: true });
    }
  }

  centerToPosition(position, zoom) {
    const { proj } = openlayers;
    return this.map.current.getView().animate({
      center: proj.fromLonLat([
        position.coords.longitude,
        position.coords.latitude,
      ]),
      duration: 1000,
      zoom,
    });
  }

  centerToUserLocation(ignoreExtent = false) {
    if (__SERVER__ || !this.map.current || !navigator?.geolocation) return;
    const extent = this.props.query.map_extent;
    if (!extent || ignoreExtent) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          return this.centerToPosition(position, 12);
        },
        // Errors
        () => {},
      );
    } else {
      this.map.current
        .getView()
        .fit([extent[0], extent[1], extent[2], extent[3]], {
          maxZoom: 16,
          duration: 1000,
        });
    }
  }

  getFeatureInRange(map, point, range = 3) {
    let x = 0;
    let y = 0;
    let dx = 0;
    let dy = -1;
    for (let i = 0; i <= range * range; i++) {
      const features =
        map.getFeaturesAtPixel([point[0] + x, point[1] + y]) || null;
      if (features?.length) {
        return features;
      }
      if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
        let temp = dx;
        dx = -dy;
        dy = temp;
      }
      x += dx;
      y += dy;
    }
    return null;
  }

  onPointermove(e) {
    if (__SERVER__ || !this.overlayPopup.current || e.type !== 'pointermove')
      return;
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
      this.overlayPopup.current?.setPosition(undefined);
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
    debounce(
      () => {
        const esrijsonFormat = new openlayers.format.EsriJSON();
        const where = getWhereStatement(this.props.query);
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
                this.overlayPopup.current.setPosition(undefined);
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
              this.overlayPopup.current.setPosition(e.coordinate);
              e.map.getTarget().style.cursor = 'pointer';
            }
          },
        );
      },
      0,
      250,
    );
    this.overlayPopup.current.setPosition(undefined);
    e.map.getTarget().style.cursor = '';
  }

  onClick(e) {
    const zoom = e.map.getView().getZoom();
    if (
      __SERVER__ ||
      !this.overlayPopup.current ||
      !this.overlayPopupDetailed.current
    ) {
      return;
    }
    const { coordinate, proj, format } = openlayers;
    const esrijsonFormat = new format.EsriJSON();
    const where = getWhereStatement(this.props.query);
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
          this.overlayPopup.current.setPosition(undefined);
          this.overlayPopupDetailed.current.setPosition(e.coordinate);
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
  }

  onMoveend(e) {
    if (!e.map) return;
    const extent = e.map.getView().calculateExtent(e.map.getSize());
    this.props.setQuery({
      map_extent: extent,
    });
  }
  render() {
    const { proj, source } = openlayers;
    if (__SERVER__) return '';
    return (
      <>
        <StyleWrapperView
          {...this.props}
          styleData={this.props.data.styles || {}}
          styled={true}
        >
          <div className="industry-map-wrapper">
            {!this.props.data?.hideFilters && (
              <Container>
                <Grid>
                  <Grid.Row>
                    <Grid.Column width={4}>
                      <div className="styled-navigationBlock type-1 has--style_name--type1 styled">
                        <NavigationBlock
                          data={this.props.data}
                          screen={this.props.screen}
                          navigation={this.props.navigation}
                        />
                      </div>
                    </Grid.Column>
                    <Grid.Column width={8}>
                      <div>
                        <Filters
                          data={this.props.data}
                          providers_data={this.props.providers_data}
                          query={this.props.query}
                          dispatch={this.props.dispatch}
                        />
                      </div>
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Container>
            )}
            <div id="industry-map" className="industry-map">
              <PrivacyProtection data={{ dataprotection }}>
                <Map
                  ref={(data) => {
                    this.map.current = data?.map;
                    if (data?.mapRendered && !this.state.mapRendered) {
                      this.setState({ mapRendered: true });
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
                  onPointermove={this.onPointermove}
                  onClick={this.onClick}
                  onMoveend={this.onMoveend}
                >
                  <Controls attribution={false} zoom={true}>
                    <Control className="ol-custom">
                      <button
                        className="navigation-button"
                        title="Center to user location"
                        onClick={() => {
                          this.centerToUserLocation(true);
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
                        this.layerSites.current = data?.layer;
                      }}
                      className="ol-layer-sites"
                      source={getSitesSource(this)}
                      title="2.Sites"
                      zIndex={1}
                    />
                  </Layers>
                  <Overlays
                    ref={(data) => {
                      this.overlayPopup.current = data?.overlay;
                    }}
                    className="ol-popup"
                    positioning="center-center"
                    stopEvent={true}
                  >
                    <Popup overlay={this.overlayPopup} />
                  </Overlays>
                  <Overlays
                    ref={(data) => {
                      this.overlayPopupDetailed.current = data?.overlay;
                    }}
                    className="ol-popup-detailed"
                    positioning="center-center"
                    stopEvent={true}
                  >
                    <PopupDetailed overlay={this.overlayPopupDetailed} />
                  </Overlays>
                  {!this.props.data?.hideFilters && (
                    <Overlays
                      className="ol-dynamic-filter"
                      positioning="center-center"
                      stopEvent={true}
                    >
                      <Sidebar
                        data={this.props.data}
                        providers_data={this.props.providers_data}
                      />
                    </Overlays>
                  )}

                  {this.state.loading ? (
                    <div className="loader">Loading...</div>
                  ) : (
                    ''
                  )}
                </Map>
              </PrivacyProtection>
            </div>
          </div>
        </StyleWrapperView>
      </>
    );
  }
}

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
