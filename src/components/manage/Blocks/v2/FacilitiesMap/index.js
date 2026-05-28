import codeSVG from '@plone/volto/icons/code.svg';
import Edit from './Edit';
import View from './View';

const BASE =
  'https://test.discomap.eea.europa.eu/arcgis/rest/services/IEPR/' +
  'IEPR_FacilityMap_Test/MapServer/';

export const FACILITIES_LAYER_URL = `${BASE}1/query`;

export const COUNTRY_NAMES = {
  BE: 'Belgium',
  CZ: 'Czechia',
  DE: 'Germany',
  PT: 'Portugal',
  SI: 'Slovenia',
};

const config = (config) => {
  config.blocks.blocksConfig.facilities_map = {
    id: 'facilities_map',
    title: 'Facilities map',
    icon: codeSVG,
    group: 'ied_addons',
    view: View,
    edit: Edit,
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

export default config;
