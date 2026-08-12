import sliderSVG from '@plone/volto/icons/slider.svg';
import { getEncodedString } from '@eeacms/volto-ied-policy/helpers';
import SiteLocationMapEdit from './Edit';
import SiteLocationMapView from './View';

export const getSiteLocationURL = (siteInspireId, siteReportingYear) => {
  const condition = `(InspireSiteId LIKE '${getEncodedString(
    siteInspireId,
  )}') AND (Site_reporting_year = ${siteReportingYear})`;
  return `https://air.discomap.eea.europa.eu/arcgis/rest/services/Air/IED_SiteMap/MapServer/0/query?f=json&where=${condition}&returnGeometry=true&spatialRel=esriSpatialRelIntersects&outFields=InspireSiteId&outSR=102100`;
};

const applyConfig = (config) => {
  config.blocks.blocksConfig.site_location = {
    id: 'site_location',
    title: 'Site location',
    icon: sliderSVG,
    group: 'eprtr_blocks',
    edit: SiteLocationMapEdit,
    view: SiteLocationMapView,
    restricted: false,
    mostUsed: false,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
  };
  return config;
};

export default applyConfig;
