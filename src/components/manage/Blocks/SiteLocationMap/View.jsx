import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import qs from 'querystring';
import { Loader } from 'semantic-ui-react';
import { withOpenLayers } from '@eeacms/volto-openlayers-map';
import { Map } from '@eeacms/volto-openlayers-map/Map';
import { Interactions } from '@eeacms/volto-openlayers-map/Interactions';
import { Controls } from '@eeacms/volto-openlayers-map/Controls';
import { Layers, Layer } from '@eeacms/volto-openlayers-map/Layers';
import PrivacyProtection from '@eeacms/volto-ied-policy/components/manage/Blocks/PrivacyProtection';
import mapPlaceholder from '@eeacms/volto-ied-policy/components/manage/Blocks/PrivacyProtection/map_placeholder_small.jpg';
import { getSiteLocationURL } from './index';
import './styles.less';

const dataprotection = {
  enabled: true,
  privacy_statement:
    'This map is hosted by a third party [Environmental Systems Research Institute, INC: "ESRI"]. By showing the external content you accept the terms and conditions of www.esri.com. This includes their cookie policies, which we have no control over.',
  privacy_cookie_key: 'site-location-map',
  placeholder_image: mapPlaceholder,
  type: 'small',
};

const View = (props) => {
  const { openlayers } = props;
  const map = React.useRef();
  const layerSites = React.useRef(null);
  const [options, setOptions] = React.useState({});
  const [vectorSource, setVectorSource] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const { format, proj, source, style, render } = openlayers;
  const { siteInspireId } = props.query;

  React.useEffect(() => {
    if (__SERVER__ || !source) return;
    const vs = vectorSource || new source.Vector();
    if (!vectorSource) {
      setVectorSource(vs);
    }
    if (!siteInspireId) return;
    const esrijsonFormat = new format.EsriJSON();
    // Get site feature
    const url = getSiteLocationURL(
      siteInspireId,
      props.query.siteReportingYear,
    );
    // Keep the current feature on the map while the new one loads; only swap
    // once the new data has arrived (avoids the map blanking on year change).
    setLoading(true);
    fetch(url).then(function (response) {
      if (response.status !== 200) {
        setLoading(false);
        return;
      }
      response.json().then(function (data) {
        const features = esrijsonFormat.readFeatures(data);
        setLoading(false);
        if (features.length > 0) {
          vs.clear();
          vs.addFeatures(features);
          setOptions((prev) => ({
            ...prev,
            extent: features[0]?.getGeometry()?.getExtent(),
          }));
        }
      });
    });
    /* eslint-disable-next-line */
  }, [siteInspireId, props.query.siteReportingYear, source]);

  React.useEffect(() => {
    if (map.current) {
      map.current.updateSize();
    }
  }, [props.screen]);

  // Infinite pulse ring around the selected site (drawn each frame via the
  // vector layer's postrender hook; map.render() keeps the loop alive). The
  // static green dot (siteStyle) remains the layer style underneath.
  React.useEffect(() => {
    const layer = layerSites.current;
    if (!layer || !render || !style || !map.current) return;
    const duration = 2000;
    const start = Date.now();
    const animate = (event) => {
      const features = vectorSource ? vectorSource.getFeatures() : [];
      const m = map.current;
      if (!m) return;
      if (!features.length) {
        m.render();
        return;
      }
      const elapsed = (event.frameState.time - start) % duration;
      const ratio = elapsed / duration;
      const easeOut = 1 - Math.pow(1 - ratio, 3);
      const radius = 8 + easeOut * 22; // 8 -> 30
      const opacity = 1 - ratio; // 1 -> 0
      const vectorContext = render.getVectorContext(event);
      vectorContext.setStyle(
        new style.Style({
          image: new style.Circle({
            radius,
            stroke: new style.Stroke({
              color: `rgba(33, 160, 71, ${opacity.toFixed(2)})`,
              width: 3,
            }),
          }),
        }),
      );
      features.forEach((f) => vectorContext.drawGeometry(f.getGeometry()));
      m.render();
    };
    layer.on('postrender', animate);
    map.current.render();
    return () => {
      layer.un('postrender', animate);
    };
    /* eslint-disable-next-line */
  }, [vectorSource, render, style]);

  // Stable OL instances: recreating them on every render makes the layer
  // components swap source/style -> tiles refetch (see IndustryMap).
  const baseSource = React.useMemo(
    () =>
      source
        ? new source.XYZ({
            url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
          })
        : null,
    [source],
  );
  const siteStyle = React.useMemo(
    () =>
      style
        ? [
            // soft outer halo for contrast on the light-gray basemap
            new style.Style({
              image: new style.Circle({
                radius: 12,
                fill: new style.Fill({ color: 'rgba(33, 160, 71, 0.18)' }),
              }),
            }),
            // green marker with a white ring
            new style.Style({
              image: new style.Circle({
                radius: 7,
                fill: new style.Fill({ color: '#21a047' }),
                stroke: new style.Stroke({ color: '#ffffff', width: 2 }),
              }),
            }),
          ]
        : null,
    [style],
  );
  const view = React.useMemo(
    () =>
      proj
        ? {
            center: proj.fromLonLat([20, 50]),
            showFullExtent: true,
            maxZoom: 12,
            minZoom: 12,
            zoom: 12,
          }
        : undefined,
    [proj],
  );

  if (__SERVER__ || !vectorSource) return '';

  return (
    <div className="site-location-map" id="site-location-map">
      <PrivacyProtection data={{ dataprotection }}>
        <Map
          // extent must live INSIDE view: the Map component fits the view to
          // view.extent (updateView), it does NOT handle a top-level extent prop.
          view={options.extent ? { ...view, extent: options.extent } : view}
          renderer="webgl"
          ref={(data) => {
            map.current = data?.map;
          }}
        >
          <Layers>
            <Layer.Tile source={baseSource} zIndex={0} />
            <Layer.VectorImage
              ref={(data) => {
                layerSites.current = data?.layer;
              }}
              source={vectorSource}
              style={siteStyle}
              title="1.Sites"
              zIndex={1}
            />
          </Layers>
          <Controls attribution={false} zoom={false} />
          <Interactions
            doubleClickZoom={false}
            dragAndDrop={false}
            dragPan={false}
            keyboardPan={false}
            keyboardZoom={false}
            mouseWheelZoom={false}
            pointer={false}
            select={false}
          />
          <Loader active={loading} />
        </Map>
      </PrivacyProtection>
    </div>
  );
};

export default compose(
  withOpenLayers,
  connect((state, props) => ({
    query: {
      ...qs.parse(state.router.location.search.replace('?', '')),
    },
    screen: state.screen,
    openlayers: props.ol,
  })),
)(View);
