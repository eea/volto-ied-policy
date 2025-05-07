import jsonp from 'jsonp';
import qs from 'querystring';
import { getLayerSitesURL, getWhereStatement } from './index'; // adjust path if needed
import { openlayers } from '@eeacms/volto-openlayers-map';

export const fetchFeatureAtCoordinate = ({
  coordinate3857,
  query,
  resolution,
  onSuccess,
  onError = () => {},
}) => {
  const { proj, format } = openlayers;
  const esrijsonFormat = new format.EsriJSON();

  const pointerExtent = [
    coordinate3857[0] - 6 * resolution,
    coordinate3857[1] - 6 * resolution,
    coordinate3857[0] + 6 * resolution,
    coordinate3857[1] + 6 * resolution,
  ];

  const where = getWhereStatement(query);

  jsonp(
    getLayerSitesURL(pointerExtent),
    {
      prefix: '__jps',
      param: (where ? qs.stringify({ where }) : '') + '&callback',
    },
    (error, response) => {
      if (!error && response) {
        const features = esrijsonFormat.readFeatures(response);
        if (!features.length) return onSuccess(null);

        // Use your existing logic
        const feature = features.reduce((closest, current) => {
          const geometry = current.getGeometry();
          const dist = geometry.getClosestPoint(coordinate3857);
          const closestDist = closest
            ? closest.getGeometry().getClosestPoint(coordinate3857)
            : null;

          return !closestDist ||
            coordinateDistance(dist, coordinate3857) <
              coordinateDistance(closestDist, coordinate3857)
            ? current
            : closest;
        }, null);

        onSuccess(feature);
      } else {
        onError(error);
      }
    },
  );
};

const coordinateDistance = (a, b) =>
  Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2);
